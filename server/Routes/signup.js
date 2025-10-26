const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../Models/users');

router.post("/", async (req, res) => {
    try {
        // Need to make sure fields are filled and correct, can edit the usernmae and password requirements another time
        const { username, password, confirm_password } = req.body;
        if ( !username || !password ){
            return res.status(400).json({ error: "All fields are required."});
        }
        
        if (username.length < 6) {
            return res.status(400).json({ error: "Username must at least be of length 6"});

        }
        if (password.length < 10 ) {   
            return res.status(400).json({ error: "Password is too weak."});
        }
        if (password != confirm_password) {
            return res.status(400).json({ error: "Passwords do not match."});
        }
        // Need to see if we have someone with the same username in our db
        // Does it matter? we can discuss this
        const existing_username = await User.findOne({ username });
        if (existing_username) {
            return res.status(409).json({ error: "Username is already in use."});
        }
        // Salt the password to store
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
        username,
        password: hashedPassword
        });

        if (newUser){
            await newUser.save();
            res.status(201).json({ message: "Signup successful!"});
        } else {
            res.status(500).json({ error: "Signup failed. Please try again." });
        }
        

    } catch (err) {
        if (err.code === 11000) {
                return res.status(409).json({ error: "Username is already taken." });
            }
        res.status(500).json({ error: "Server error during signup." });
    }
});

module.exports = router;