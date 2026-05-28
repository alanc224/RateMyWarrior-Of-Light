require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
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


const corsOptions = {
    origin: [
        'http://localhost:5173', 
        'https://ratemywarrioroflight.onrender.com'
    ],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'] 
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(clerkMiddleware());


app.use('/api/webhooks/clerk', clerkWebhookRoute);
app.use('/api/players', playerRoutes);
app.use('/api/reviews', reviewRoute);

const EXTERNAL_API_PROXY = 'https://ffxivapi-proxy.onrender.com';

// API for webscraping
app.get('/api/characters', async (req, res) => {
    const characterName = req.query.name;
    const worldName = req.query.world || 'Faerie';

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
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));