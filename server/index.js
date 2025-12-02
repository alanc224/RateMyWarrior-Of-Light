require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const signupRoutes = require('./Routes/signup');
const loginRoutes = require('./Routes/login');
const reviewRoute = require('./Routes/review');
const authenticateToken = require('./middleware/authMiddleware');
const redirectIfLoggedIn = require('./middleware/redirectIfLoggedIn');
const cookieParser = require('cookie-parser');


const mongoURI = process.env.MONGO_URI;

const corsOptions = {
    origin: [
        'http://localhost:5173', 
        'https://ratemywarrioroflight.onrender.com'
    ],
    credentials: true,
};
app.options(/.*/, cors(corsOptions), (req, res) => res.sendStatus(200));
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());


mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log('MongoDB connection error:', err));
// app.use(authenticateToken);
app.use('/signup', signupRoutes);
app.use('/login', loginRoutes);
app.use('/api/reviews', reviewRoute);

const EXTERNAL_API_PROXY = 'https://ffxivapi-proxy.onrender.com';

// API for webscraping
app.get('/api/characters', async (req, res) => {
    const characterName = req.query.name;
    const worldName = req.query.world || 'Faerie'; // Faerie for testing, remove when frontend is implemented

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

        console.log('Raw FFXIV API Response Data:', response.data);

        return res.json(response.data);

    } catch (error) {
        console.error('Error fetching from ffxivapi:', error.message);
        const status = error.response ? error.response.status : 500;
        const message = error.response ? error.response.data : 'An Error Occured with ffxivapi';
        res.status(status).json({ error: message });
    }
});
/*
app.get('/login', redirectIfLoggedIn, (req, res) => {
    if (req.user) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public/html', 'login.html'));
});

app.get('/signup', redirectIfLoggedIn, (req, res) => {

    if (req.user) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public/html', 'signup.html'));
});*/

app.post('/api/auth/logout', authenticateToken,  (req, res) => {
    res.clearCookie('authToken', { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        path: '/',
        expires: new Date(0), 
    });
    res.json({ message: 'Logout successful' });
});
app.get('/api/auth/check', authenticateToken, (req, res) => {
  res.json({
    isAuthenticated: true,
    username: req.user.username,
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));