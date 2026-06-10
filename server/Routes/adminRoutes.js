const express = require('express');
const router = express.Router();
const { requireAuth, clerkClient } = require('@clerk/express');
const axios = require('axios');
const { requireModOrAdmin } = require('./modRoutes');
const ReportModel = require('../Models/Report');
const ReviewModel = require('../Models/reviews');
const StatsModel = require('../Models/Stats');

let cachedStats = null;
let lastFetchTime = 0;
const STATS_CACHE_DURATION = 60000;

let cachedApiStatus = 'ONLINE';
let lastHealthCheckTime = 0;
const HEALTH_CACHE_DURATION = 600000; 

const checkApiHealth = async () => {
    const now = Date.now();
        if (now - lastHealthCheckTime < HEALTH_CACHE_DURATION) {
        return cachedApiStatus;
    }

    try {
        lastHealthCheckTime = now;
        const response = await axios.get(process.env.EXTERNAL_API_PROXY, { timeout: 3000 });
        
        cachedApiStatus = response.status === 200 ? 'ONLINE' : 'DEGRADED';
        return cachedApiStatus;
    } catch (e) {
        console.error(`Proxy Health Check Status: ${e.response?.status || e.message}`);
        
        if (e.response?.status === 429) {
            cachedApiStatus = 'RATE_LIMITED'; 
            return cachedApiStatus;
        }
        
        cachedApiStatus = 'OFFLINE';
        return cachedApiStatus;
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

        const [userCount, reports, reviews] = await Promise.all([
            clerkClient.users.getCount(), 
            ReportModel.countDocuments({ status: 'open' }),
            ReviewModel.countDocuments()
        ]);

        res.json({
            totalUsers: userCount,
            characterLookups: stats.totalLookups,
            totalReviews: reviews,
            apiGateStatus: await checkApiHealth(),
            cacheHitRate: ((stats.cacheHits / totalRequests) * 100).toFixed(1),
            openReports: reports
        });
    } catch (error) {
        console.error("Stats error:", error);
        res.status(500).json({ error: "Diagnostics failed" });
    }
});

module.exports = router;