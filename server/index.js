require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const axios = require('axios');
app.set('trust proxy', 1);
const { clerkMiddleware } = require('@clerk/express');
const clerkWebhookRoute = require('./Routes/clerkWebhook');
const reviewRoute = require('./Routes/review');
const mongoURI = process.env.MONGO_URI;
const playerRoutes = require('./Routes/playerRoutes');
const modRoutes = require('./Routes/modRoutes');


const corsOptions = {
    origin: [
        // 'http://localhost:5173', 
        'https://ratemywarrioroflight.onrender.com'
    ],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'] 
};

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
app.use('/api/mod', modRoutes);

const requireAdmin = (req, res, next) => {
    const role = req.auth?.sessionClaims?.metadata?.role;

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
    limit: 20,
    message: { error: "Too many search requests, please try again later." }
});

const EXTERNAL_API_PROXY = 'https://ffxivapi-proxy.onrender.com';
const searchCache = new Map(); // search cache

// API for webscraping
app.get('/api/characters', /*searchLimiter,*/ async (req, res) => {
    const characterName = req.query.name;
    const worldName = req.query.world || 'Faerie'; // default to faerie if the request was sent without a world
    const cacheKey = `${worldName}-${characterName}`.toLowerCase();

    if (searchCache.has(cacheKey)) {
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

        searchCache.set(cacheKey, response.data);
        return res.json(response.data);

    } catch (error) {
        console.error('Error fetching from ffxivapi:', error.message);
        const status = error.response ? error.response.status : 500;
        const message = error.response ? error.response.data : 'An Error Occured with ffxivapi';
        res.status(status).json({ error: message });
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