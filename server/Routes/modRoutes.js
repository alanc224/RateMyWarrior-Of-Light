const express = require('express');
const router = express.Router();
const { requireAuth } = require('@clerk/express');
// const { clerkClient } = require('@clerk/express'); 
// const ReportModel = require('../Models/Report'); 

const requireModOrAdmin = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: "Missing or invalid token." });
        }
        
        const token = authHeader.split(' ')[1];
        const payloadBase64 = token.split('.')[1];
        const decodedPayload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf-8'));
        
        const role = decodedPayload.role;
        
        if (role !== 'mod' && role !== 'admin') {
            return res.status(403).json({ error: "Access Denied. Moderation credentials required." });
        }
        
        req.userRole = role; 
        next();

    } catch (error) {
        console.error("Token decoding error:", error);
        return res.status(500).json({ error: "Server error processing token." });
    }
};

router.get('/users', [requireAuth(), requireModOrAdmin], (req, res) => {
    res.status(200).json({ message: "Admin access granted!" });
});

router.post('/users/:id/toggle-ban', [requireAuth(), requireModOrAdmin], async (req, res) => {
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

router.post('/users/:id/change-role', [requireAuth(), requireModOrAdmin], async (req, res) => {
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

router.get('/reports', [requireAuth(), requireModOrAdmin], async (req, res) => {
    try {
        const reports = await ReportModel.find(); 
        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve reports." });
    }
});

module.exports = router;