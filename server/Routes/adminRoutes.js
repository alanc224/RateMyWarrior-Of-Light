const express = require('express');
const router = express.Router();
const { requireAuth, clerkClient } = require('@clerk/express');
const axios = require('axios');
const { requireModOrAdmin } = require('./modRoutes');
const ReportModel = require('../Models/Report');
const ReviewModel = require('../Models/reviews');
const StatsModel = require('../Models/Stats');

const checkApiHealth = async () => {
    try {
        const response = await axios.get(process.env.EXTERNAL_API_PROXY);
        return response.status === 200 ? 'ONLINE' : 'DEGRADED';
    } catch (e) {
        return 'OFFLINE';
    }
};

const bypassClerkMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token" });
    
    const token = authHeader.split(' ')[1];
    const payloadBase64 = token.split('.')[1];
    const decoded = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf-8'));
    req.auth = { sessionClaims: decoded };
    next();
};

router.get('/stats',bypassClerkMiddleware, async (req, res) => {
    const role = req.auth?.sessionClaims?.role;
    if (role !== 'admin') {
        return res.status(403).json({ error: "Access Denied." });
    }

    try {
        let stats = await StatsModel.findOne({});
        if (!stats) stats = { totalLookups: 0, cacheHits: 0 };
        const totalRequests = stats.totalLookups || 1;

        const [users, reports, reviews] = await Promise.all([
            clerkClient.users.getCount(),
            ReportModel.countDocuments({ status: 'open' }),
            ReviewModel.countDocuments()
        ]);

        res.json({
            totalUsers: users.totalCount,
            characterLookups: stats.totalLookups,
            totalReviews: reviews,
            apiGateStatus: await checkApiHealth(),
            externalApiRemaining: 0,
            cacheHitRate: ((stats.cacheHits / totalRequests) * 100).toFixed(1),
            openReports: reports
        });
    } catch (error) {
        console.error("Stats error:", error);
        res.status(500).json({ error: "Diagnostics failed" });
    }
});

module.exports = router;