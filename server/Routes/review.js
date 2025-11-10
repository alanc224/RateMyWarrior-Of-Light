require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Review = require('../Models/reviews')

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}
connectDB()
router.get('/character/:id', async (req, res) => {
  try {
    const reviews = await Review.find({ character_id: req.params.id });
    const counts = [0, 0, 0, 0, 0];
    let total = 0;
    let count = 0;

    for (const review of reviews) {
      if (review.rating >= 1 && review.rating <= 5) {
        counts[5 - review.rating]++;
        total += review.rating;
        count++;
      }
    }
    const avg = count > 0 ? total / count : 0;
    res.json({
      average: avg,
      ratings: counts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error processing ratings" });
  }
});
module.exports = router;