const express = require('express');
const router = express.Router();
const ReviewModel = require('../Models/reviews'); 
require('dotenv').config();
const crypto = require('crypto');
const { requireAuth, authenticateRequest } = require('@clerk/express');
const SALT = process.env.SALT;

const getUserIdFromHeaders = (req) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const parts = token.split('.');
            if (parts.length === 3) {
                const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
                const payload = JSON.parse(payloadJson);
                if (payload && payload.sub) {
                    return payload.sub;
                }
            }
        }
    } catch (err) {
        console.error("Error parsing JWT from headers:", err.message);
    }
    return null;
};

const submitReview = async (req, res) => {
    try {
        const { characterId, rating, reviewText, characterName, server, playAgain, recommend, contentType } = req.body;
        const parsedRating = parseInt(rating, 10);
        const authenticatedUserId = req.auth?.userId || getUserIdFromHeaders(req); 
        
        if (!authenticatedUserId) {
            return res.status(401).json({ error: 'Unauthorized: Could not verify user identity.' });
        } 
        
        if (!characterId || !rating || !reviewText || !characterName || !server || playAgain === undefined || recommend === undefined || !contentType) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        if (parsedRating < 1 || parsedRating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        const cleanCharacterId = String(characterId).trim();
        const secretCombination = `${authenticatedUserId}_${cleanCharacterId}_${SALT}`;
        const hashedUser = crypto.createHash('sha256').update(secretCombination).digest('hex');

        const newReview = new ReviewModel({
            hash_user: hashedUser,
            character_id: cleanCharacterId,
            character_name: characterName,
            server: server,
            rating: parsedRating,
            comment: reviewText,
            playAgain: playAgain,
            recommend: recommend,
            contentType: contentType
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
    try {
        const userId = getUserIdFromHeaders(req);

        if (userId) {
            console.log("=== SUCCESS: Manually decoded token user ID ===", userId);
        } else {
            console.log("=== NOTICE: No Bearer token found or user is guest ===");
        }
        const { characterId } = req.params;
        const reviews = await ReviewModel.find({ character_id: characterId }).lean();

        if (reviews && reviews.length > 0) {
            const formattedReviews = reviews.map(review => {
                let currentUserHash = null;
                const cleanDocCharacterId = String(review.character_id).trim();
                let secretCombination = "";
                
                if (userId) {
                    const cleanDocCharacterId = String(review.character_id).trim();
                    const secretCombination = `${userId}_${cleanDocCharacterId}_${SALT}`;
                    currentUserHash = crypto.createHash('sha256').update(secretCombination).digest('hex');
                }

                const storedHash = String(review.hash_user).trim();
                const currentHash = currentUserHash ? String(currentUserHash).trim() : null;
                const isMatch = currentHash ? (storedHash === currentHash) : false;

                return {
                    id: review._id.toString(),
                    character_id: review.character_id,
                    character_name: review.character_name,
                    comment: review.comment,
                    date: review.date ? new Date(review.date).toISOString() : null,
                    rating: review.rating,
                    server: review.server,
                    playAgain: review.playAgain, 
                    recommend: review.recommend,
                    contentType: review.contentType,
                    isOwner: isMatch
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

router.post('/', requireAuth(), submitReview);

router.get('/character/:id', async (req, res) => {
  try {
    const reviews = await ReviewModel.find({ character_id: req.params.id });
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

router.delete('/:reviewId', requireAuth(), async (req, res) => {
    try {
        const { reviewId } = req.params;
        const authenticatedUserId = req.auth?.userId || getUserIdFromHeaders(req);

        if (!authenticatedUserId) {
            return res.status(401).json({ error: 'Unauthorized: Could not confirm active session identity.' });
        }

        const review = await ReviewModel.findById(reviewId);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        const secretCombination = `${authenticatedUserId}_${review.character_id}_${SALT}`;
        const hashedUser = crypto.createHash('sha256').update(secretCombination).digest('hex');

        if (review.hash_user !== hashedUser) {
            return res.status(403).json({ error: 'Unauthorized: You do not own this review document.' });
        }

        await ReviewModel.findByIdAndDelete(reviewId);
        res.json({ message: 'Review successfully removed from database.' });

    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/:reviewId', requireAuth(), async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, reviewText, playAgain, recommend, contentType } = req.body;
        const authenticatedUserId = req.auth?.userId || getUserIdFromHeaders(req);
        if (!authenticatedUserId) return res.status(401).json({ error: 'Unauthorized' });

        const review = await ReviewModel.findById(reviewId);
        if (!review) return res.status(404).json({ error: 'Review not found' });

        const secretCombination = `${authenticatedUserId}_${review.character_id}_${SALT}`;
        const hashedUser = crypto.createHash('sha256').update(secretCombination).digest('hex');
        if (review.hash_user !== hashedUser) {
            return res.status(403).json({ error: 'Unauthorized ownership mismatch.' });
        }

        review.rating = parseInt(rating, 10);
        review.comment = reviewText;
        review.playAgain = playAgain;
        review.recommend = recommend;
        review.contentType = contentType;
        review.date = new Date();

        await review.save();
        res.json({ message: 'Review updated successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;