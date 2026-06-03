const express = require('express');
const Character = require('../Models/players');
const Review = require('../Models/reviews');


const router = express.Router();

router.get('/ratings/bulk', async (req, res) => {
    const idsString = req.query.ids;
    if (!idsString) return res.json([]);
    const ids = idsString.split(',');
    
    try {
        const ratings = await Review.find({ characterId: { $in: ids } });
        res.json(ratings);
    } catch (err) {
        res.status(500).json({ error: "Bulk fetch failed" });
    }
});

router.post('/sync', async (req, res) => {
    const { id, name, server, world, portrait } = req.body;

    try {
        const updatedCharacter = await Character.findOneAndUpdate(
            { _id: id },
            { name, server, world, portrait }, 
            { new: true, upsert: true }
        );
        res.status(200).json(updatedCharacter);
    } catch (error) {
        console.error("Sync Error:", error);
        res.status(500).json({ error: "Failed to sync player" });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const character = await Character.findOne({ _id: id }); 
        if (!character) {
            return res.status(404).json({ error: "Character not found" });
        }
        res.json(character);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;