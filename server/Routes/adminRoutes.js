const express = require('express');
const router = express.Router();
const { requireAuth, clerkClient } = require('@clerk/express');
const axios = require('axios');
const { requireModOrAdmin } = require('./modRoutes');
const ReportModel = require('../Models/Report');
const ReviewModel = require('../Models/reviews');
const StatsModel = require('../Models/Stats');

console.log("Authorization Header:", req.headers.authorization);

const checkApiHealth = async () => {
    try {
        const response = await axios.get(process.env.EXTERNAL_API_PROXY);
        return response.status === 200 ? 'ONLINE' : 'DEGRADED';
    } catch (e) {
        return 'OFFLINE';
    }
};

router.get('/stats', async (req, res) => {
    console.log("FULL SESSION CLAIMS:", JSON.stringify(req.auth?.sessionClaims, null, 2));
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