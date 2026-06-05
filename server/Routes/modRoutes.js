const express = require('express');
const router = express.Router();
const { clerkClient } = require('@clerk/express'); 

const requireModOrAdmin = (req, res, next) => {
    const role = req.auth?.sessionClaims?.publicMetadata?.role;
    console.log("Session Claims:", req.auth?.sessionClaims);
    if (role !== 'mod' && role !== 'admin') {
        return res.status(403).json({ error: "Access Denied. Moderation credentials required." });
    }
    next();
};

router.get('/users', requireModOrAdmin, async (req, res) => {
    try {
        const response = await clerkClient.users.getUserList();
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ error: "Failed to retrieve user directory." });
    }
});

router.post('/users/:id/toggle-ban', requireModOrAdmin, async (req, res) => {
    const { id } = req.params;
    const { currentStatus } = req.body;
    const requesterRole = req.auth?.sessionClaims?.publicMetadata?.role;
    
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

router.post('/users/:id/change-role', requireModOrAdmin, async (req, res) => {
    const { id } = req.params;
    const { newRole } = req.body;
    const requesterRole = req.auth?.sessionClaims?.publicMetadata?.role;

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

router.delete('/users/:id', requireModOrAdmin, async (req, res) => {
    const { id } = req.params;
    const requesterRole = req.auth?.sessionClaims?.publicMetadata?.role;

    if (requesterRole !== 'admin') {
        return res.status(403).json({ error: "Unauthorized: Only administrators can permanently delete accounts." });
    }

    try {
        const targetUser = await clerkClient.users.getUser(id);
        const targetRole = targetUser.publicMetadata?.role || 'user';

        if (targetRole === 'admin') {
            return res.status(403).json({ error: "Hierarchy Violation: Safeguard active. Administrators cannot delete fellow administrators." });
        }

        await clerkClient.users.deleteUser(id);
        res.json({ message: "Account completely terminated." });
    } catch (error) {
        console.error('Error deleting user:', error.message);
        res.status(500).json({ error: "Failed to completely delete user." });
    }
});

router.get('/reports', requireModOrAdmin, async (req, res) => {
    try {
        const reports = await ReportModel.find(); 
        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve reports." });
    }
});

module.exports = router;