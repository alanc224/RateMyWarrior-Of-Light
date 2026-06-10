require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const axios = require('axios');
app.set('trust proxy', 1);
const { clerkMiddleware, requireAuth, clerkClient } = require('@clerk/express');
const clerkWebhookRoute = require('./Routes/clerkWebhook');
const reviewRoute = require('./Routes/review');
const mongoURI = process.env.MONGO_URI;
const playerRoutes = require('./Routes/playerRoutes');
const modRoutes = require('./Routes/modRoutes');
const adminRoutes = require('./Routes/adminRoutes');
const StatsModel = require('./Models/Stats');
const Report = require('./Models/Report');
const ReviewModel = require('./Models/reviews');


const corsOptions = {
    origin: [
        // 'http://localhost:5173', 
        'https://ratemywarrioroflight.onrender.com'
    ],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'] 
};

if (!global.proxyHealth) {
    global.proxyHealth = { status: 'ONLINE', lastChecked: new Date() };
}

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(clerkMiddleware());

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});
app.use('/api/webhooks/clerk', clerkWebhookRoute);
app.use('/api/players', playerRoutes);
app.use('/api/reviews', reviewRoute);
app.use('/api/mod', requireAuth(), modRoutes);
app.use('/api/admin', requireAuth(), adminRoutes);

const requireAdmin = (req, res, next) => {
    const role = req.auth?.sessionClaims?.role; 

    if (role !== 'admin') {
        return res.status(403).json({ error: "Unauthorized. Admin privileges required." });
    }
    next();
};


app.delete('/api/reviews/:id', requireAdmin, async (req, res) => {
    res.send("Review deleted successfully by Admin.");
});


const searchLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 45,
    message: { error: "Too many search requests, please try again later." }
});

const EXTERNAL_API_PROXY = 'https://ffxivapi-proxy.onrender.com';
const searchCache = new Map(); // search cache
let totalLookups = 0;
let cacheHits = 0;

async function incrementStats(isCacheHit) {
    try {
        await StatsModel.findOneAndUpdate(
            {}, 
            { $inc: { totalLookups: 1, cacheHits: isCacheHit ? 1 : 0 } }, 
            { upsert: true, new: true }
        );
    } catch (err) {
        console.error("Failed to persist stats:", err);
    }
}

// API for webscraping
app.get('/api/characters', searchLimiter, async (req, res) => {
    const characterName = req.query.name;
    const worldName = req.query.world || 'Faerie'; // default to faerie if the request was sent without a world
    const cacheKey = `${worldName}-${characterName}`.toLowerCase();

    if (searchCache.has(cacheKey)) {
        incrementStats(true);
        return res.json(searchCache.get(cacheKey));
    }

    if (!characterName || !worldName) {
        return res.status(400).send('Missing a field.');
    }

    try {
        const proxyUrl = `${EXTERNAL_API_PROXY}/character/search`;
        
        const response = await axios.get(proxyUrl, {
            params: { 
                name: characterName, 
                world: worldName 
            }
        });

        global.proxyHealth = { status: 'ONLINE', lastChecked: new Date() };

        searchCache.set(cacheKey, response.data);
        incrementStats(false);
        return res.json(response.data);

    } catch (error) {
        console.error('Error fetching from ffxivapi:', error.message);
        const status = error.response ? error.response.status : 500;
        const message = error.response ? error.response.data : 'An Error Occured with ffxivapi';
        if (status === 429) {
            global.proxyHealth = { status: 'RATE_LIMITED', lastChecked: new Date() };
        } else if (!error.response) {
            global.proxyHealth = { status: 'OFFLINE', lastChecked: new Date() };
        } else {
            global.proxyHealth = { status: 'DEGRADED', lastChecked: new Date() };
        }

        res.status(status).json({ error: message });
    }
});

const getUserIdFromHeaders = (req) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const parts = token.split('.');
            if (parts.length === 3) {
                const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
                const payload = JSON.parse(payloadJson);
                if (payload && payload.sub) return payload.sub;
            }
        }
    } catch (err) {
        console.error("Error parsing JWT from headers:", err.message);
    }
    return null;
};

app.post('/api/reports', async (req, res) => {
    try {
        const { reviewId, reason } = req.body;

        if (!reviewId || !reason) {
            return res.status(400).json({ error: "Missing required fields: reviewId and reason." });
        }
        const reporterUserId = req.auth?.userId || getUserIdFromHeaders(req); 
        if (!reporterUserId) {
            return res.status(401).json({ error: 'Unauthorized: Could not verify user identity.' });
        }

        const reporterUser = await clerkClient.users.getUser(reporterUserId);
        const reporterUsername = reporterUser.username || reporterUser.primaryEmailAddress?.emailAddress || "Anonymous Reporter";

        const originalReview = await ReviewModel.findById(reviewId);
        if (!originalReview) {
            return res.status(404).json({ error: "Review not found." });
        }

        let reviewOwnerUsername = `Hash: ${originalReview.global_user_hash}`; 

        if (originalReview.user_id) {
            try {
                const ownerUser = await clerkClient.users.getUser(originalReview.user_id);
                reviewOwnerUsername = ownerUser.username || ownerUser.primaryEmailAddress?.emailAddress || "Anonymous Reviewer";
            } catch (clerkErr) {
                console.error("Failed to look up review author in Clerk:", clerkErr.message);
            }
        }

        const newReport = new Report({
            reviewId,
            reason,
            characterName: originalReview.character_name,
            server: originalReview.server,
            reviewContent: originalReview.comment,
            reviewOwnerUsername: reviewOwnerUsername,
            reporterUsername: reporterUsername, 
            timestamp: new Date()
        });

        await newReport.save();
        res.status(201).json({ message: "Report submitted successfully." });

    } catch (error) {
        console.error("CRITICAL: Report Submission Failed ->", error); 
        res.status(500).json({ error: "Internal server error processing report." });
    }
});

mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log('MongoDB connection error:', err));

const PORT = process.env.PORT || 5001;

setInterval(async () => {
    try {
        await axios.get('https://ffxivapi-proxy.onrender.com');
    } catch (error) {
        if (error.response) {
            console.log(`Proxy responded with status ${error.response.status}`);
        } else {
            console.error('Error keeping proxy awake:', error.message);
        }
    }
}, 10 * 60 * 1000);


app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));