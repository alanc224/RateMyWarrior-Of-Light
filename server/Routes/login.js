const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../Models/users');
const SECRET_KEY = process.env.SECRET_KEY;

router.post("/login", async(req,res) => {

    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "Both fields are required"})
        }
        const user = await User.findOnew({ username });

        if (!user) {
            return res.send(400).json({ error: "Invalid username or password." })
        }

        let userFound;
        try {
            userFound = await bcrypt.compare(password,user.password);       
        } catch (bcryptError) {
            return res.status(500).json({ error: "Server error during login"})
        }
        if (!userFound) {
            return res.status(400).json({ error: "Invalid username or password." });
        }
        if (userFound) {
            const payload = {
                userId: user._id,
                username: user.username,
            };
            let token;
            try {
                // We will be using jwt, signs out in 2 hours we can change if need be
                token = jwt.sign(payload, SECRET_KEY, { expiresIn: "2h" })
            } catch (jwtError) {
                return res.status(500).json({ error: "Server error" })
            }
            try {
                res.cookie('authToken', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production', 
                    sameSite: 'Lax',
                    maxAge: 2 * 60 * 60 * 1000,
                    path: '/',
                }); 
            } catch (cookieError) {
                return res.status(500).json({ error: "Server Error"})
            }
            res.json({
                message: "Login successful",
                user: {
                    username: user.username,
                }
            });
        }
    } catch (err) {
        res.status(500).json({ error: "Server Error."});
    }
});

module.exports = router;