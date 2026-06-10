const express = require('express');
const router = express.Router();
const { requireAuth, clerkClient } = require('@clerk/express');
const ReportModel = require('../Models/Report');
const ReviewModel = require('../Models/reviews');
const BlockedEmail = require('../Models/BlockedEmail');

const requireModOrAdmin = (req, res, next) => {
    const role = req.auth?.sessionClaims?.metadata?.role || req.auth?.sessionClaims?.role;
    if (role !== 'mod' && role !== 'admin') {
        return res.status(403).json({ error: "Access Denied." });
    }
    req.userRole = role;
    next();
};

router.get('/users', [requireAuth(), requireModOrAdmin], async (req, res) => {
    try {
        const users = await clerkClient.users.getUserList();
        const sanitized = users.data.map(u => ({
            id: u.id,
            username: u.username || 'Unknown',
            email: u.emailAddresses[0]?.emailAddress || 'N/A',
            role: u.publicMetadata?.role || 'user',
            status: u.banned ? 'banned' : 'active' 
        }));
        
        res.status(200).json(sanitized);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Failed to fetch users." });
    }
});
router.patch('/users/:id/toggle-ban', [requireAuth(), requireModOrAdmin], async (req, res) => {
    const { id } = req.params;
    const { currentStatus } = req.body;
    const requesterRole = req.userRole; 
    
    try {
        const targetUser = await clerkClient.users.getUser(id);
        const targetRole = targetUser.publicMetadata?.role || 'user';

        if (targetRole === 'admin') {
            return res.status(403).json({ error: "Hierarchy Violation: Administrators cannot be banned." });
        }

        if (requesterRole === 'mod' && targetRole === 'mod') {
            return res.status(403).json({ error: "Hierarchy Violation: Moderators cannot ban other staff members." });
        }

        if (currentStatus === 'active') {
            await clerkClient.users.banUser(id);
            res.json({ message: "User successfully banned." });
        } else {
            await clerkClient.users.unbanUser(id);
            res.json({ message: "User successfully unbanned." });
        }
    } catch (error) {
        console.error('Error modifying ban status:', error.message);
        res.status(500).json({ error: "Failed to alter account status." });
    }
});

router.patch('/users/:id/change-role', [requireAuth(), requireModOrAdmin], async (req, res) => {
    const { id } = req.params;
    const { newRole } = req.body;
    const requesterRole = req.userRole;

    if (requesterRole !== 'admin') {
        return res.status(403).json({ error: "Unauthorized: Only administrators can adjust user groups." });
    }

    try {
        const targetUser = await clerkClient.users.getUser(id);

        if (targetUser.banned) {
            return res.status(400).json({ error: "Action Denied: You cannot adjust the privileges of a banned account. Unban them first." });
        }
        await clerkClient.users.updateUserMetadata(id, {
            publicMetadata: { role: newRole }
        });
        res.json({ message: `Role successfully set to ${newRole}.` });
    } catch (error) {
        console.error('Error changing user role:', error.message);
        res.status(500).json({ error: "Failed to update target authorization tier." });
    }
});

router.delete('/users/:id', [requireAuth(), requireModOrAdmin], async (req, res) => {
    const { id } = req.params;
    const requesterRole = req.userRole;

    if (requesterRole !== 'admin') {
        return res.status(403).json({ error: "Unauthorized: Only administrators can permanently delete accounts." });
    }

    try {
        const targetUser = await clerkClient.users.getUser(id);
        const targetRole = targetUser.publicMetadata?.role || 'user';
        const secretCombination = `${id}_${process.env.SALT}`;
        const globalHashedUser = crypto.createHash('sha256').update(secretCombination).digest('hex');
        const email = targetUser.emailAddresses[0]?.emailAddress;

        if (email) {
            await BlockedEmail.create({ email, reason: "Account terminated by admin" });
        }
        

        if (targetRole === 'admin') {
            return res.status(403).json({ error: "Hierarchy Violation: Safeguard active. Administrators cannot delete fellow administrators." });
        }
        await ReviewModel.deleteMany({ global_user_hash: globalHashedUser });
        await clerkClient.users.deleteUser(id);
        res.json({ message: "Account completely terminated." });
    } catch (error) {
        console.error('Error deleting user:', error.message);
        res.status(500).json({ error: "Failed to completely delete user." });
    }
});

router.get('/reports', [requireAuth(), requireModOrAdmin], async (req, res) => {
    try {
        const reports = await ReportModel.find().lean();
        res.json(reports);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Database failed" });
    }
});

router.post('/reports/:reportId', [requireAuth(), requireModOrAdmin], async (req, res) => {
    const { reportId } = req.params;
    const { action, reviewId } = req.body;

    try {
        if (action === 'delete') {
            await ReviewModel.findByIdAndDelete(reviewId);
        }
        await ReportModel.findByIdAndDelete(reportId);
        
        res.status(200).json({ message: "Action processed successfully" });
    } catch (error) {
        console.error("Error processing report action:", error);
        res.status(500).json({ error: "Failed to process report action" });
    }
});

module.exports = router;