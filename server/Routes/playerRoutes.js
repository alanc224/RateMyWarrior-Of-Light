const express = require('express');
const Character = require('../Models/players'); 

const router = express.Router();

router.post('/sync', async (req, res) => {
    const { id, name, server, world, portrait } = req.body;

    try {
        const updatedCharacter = await Character.findOneAndUpdate(
            { _id: id },
            { 
                name, 
                server, 
                world, 
                portrait 
            }, 
            { 
                new: true,
                upsert: true
            }
        );
        res.status(200).json(updatedCharacter);
    } catch (error) {
        console.error("Sync Error:", error);
        res.status(500).json({ error: "Failed to sync player" });
    }
});

export default router;