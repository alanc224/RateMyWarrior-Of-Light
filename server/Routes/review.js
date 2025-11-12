const express = require('express');
const router = express.Router();
const ReviewModel = require('../Models/reviews'); 
const authenticateToken = require('../middleware/authMiddleware'); 
require('dotenv').config();
const crypto = require('crypto');

const submitReview = async (req, res) => {
    try {
        const { characterId, rating, reviewText, characterName, server } = req.body;
        const parsedRating = parseInt(rating, 10);

        // authmiddleware should catch this but I was having some issues
        if (!req.user || !req.user.username) {
            return res.status(401).json({ error: 'Unauthorized: Missing user' });
        }
        
        const authenticatedUser = req.user.username; 
        
        if (!authenticatedUser) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        if (!characterId || !rating || !reviewText || !characterName || !server) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        if (parsedRating < 1 || parsedRating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }
        const hashedUser = crypto.createHash('sha256').update(authenticatedUser).digest('hex');

        const newReview = new ReviewModel({
            hash_user: hashedUser,
            character_id: characterId,
            character_name: characterName,
            server: server,
            rating: parsedRating,
            comment: reviewText,
        });

        await newReview.save();
        res.status(201).json({ message: 'Review submitted successfully' }); 

    } catch (error) {
        console.error('Error submitting review:', error);
        if (!res.headersSent) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({ 
                    error: 'Validation failed. Check required fields or data types.',
                    details: error.message 
                });
            }
            if (error.code === 11000) { 
                return res.status(409).json({ error: 'You have already reviewed this character' });
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

router.get('/:characterId/reviews', async (req, res) => {
    const { characterId } = req.params;

    try {
        const reviews = await ReviewModel.find({ character_id: characterId }).lean();

        if (reviews && reviews.length > 0) {
            const formattedReviews = reviews.map(review => {
                return {
                    id: review._id.toString(),
                    character_id: review.character_id,
                    character_name: review.character_name,
                    comment: review.comment,
                    date: review.date ? review.date.toISOString() : null, 
                    rating: review.rating,
                    server: review.server,
                };
            });
            res.json({ reviews: formattedReviews });
        } else {
            res.json({ reviews: []});
        }
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Failed to fetch reviews' });
    }
});

router.post('/', authenticateToken, submitReview);

const mongoose = require('mongoose');

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