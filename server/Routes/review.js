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

        const globalCombination = `${authenticatedUserId}_${SALT}`;
        const globalHashedUser = crypto.createHash('sha256').update(globalCombination).digest('hex');

        const newReview = new ReviewModel({
            hash_user: hashedUser,
            global_user_hash: globalHashedUser,
            user_id: authenticatedUserId,
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
        const { characterId } = req.params;
        const reviews = await ReviewModel.find({ character_id: characterId }).lean();

        if (reviews && reviews.length > 0) {
            const formattedReviews = reviews.map(review => {
                let currentUserHash = null;
                const cleanDocCharacterId = String(review.character_id).trim();
                let secretCombination = "";
                
                if (userId) {
                    const secretCombination = `${userId}_${cleanDocCharacterId}_${SALT}`;
                    currentUserHash = crypto.createHash('sha256').update(secretCombination).digest('hex');
                }

                const storedHash = String(review.hash_user).trim();
                const currentHash = currentUserHash ? String(currentUserHash).trim() : null;
                const isMatch = currentHash ? (storedHash === currentHash) : false;

                const upvotesCount = Array.isArray(review.upvotedBy) ? review.upvotedBy.length : 0;
                const downvotesCount = Array.isArray(review.downvotedBy) ? review.downvotedBy.length : 0;
                
                let userVote = null;
                if (userId) {
                    if (Array.isArray(review.upvotedBy) && review.upvotedBy.includes(userId)) {
                        userVote = 'up';
                    } else if (Array.isArray(review.downvotedBy) && review.downvotedBy.includes(userId)) {
                        userVote = 'down';
                    }
                }

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
                    isOwner: isMatch,
                    upvotes: upvotesCount,
                    downvotes: downvotesCount,
                    userVote: userVote
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

router.get('/user', async (req, res) => {
    const authenticatedUserId = req.auth?.userId || getUserIdFromHeaders(req); 

    if (!authenticatedUserId) {
        return res.status(401).json({ error: "Unauthorized access." });
    }

    try {
        const globalCombination = `${authenticatedUserId}_${SALT}`;
        const globalHashedUser = crypto.createHash('sha256').update(globalCombination).digest('hex');
        const userReviews = await ReviewModel.find({ global_user_hash: globalHashedUser })
                                             .sort({ _id: -1 })
                                             .lean();
        
        res.json(userReviews);
    } catch (error) {
        console.error('Error pulling user ledger data:', error.message);
        res.status(500).json({ error: "Failed to collect account review logs." });
    }
});

router.patch('/:reviewId/vote', async (req, res) => {
    const { reviewId } = req.params;
    const { voteType } = req.body;

    try {
        const userId = getUserIdFromHeaders(req);
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized. You must be signed in to vote." });
        }

        const review = await ReviewModel.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        const cleanDocCharacterId = String(review.character_id).trim();
        const secretCombination = `${userId}_${cleanDocCharacterId}_${SALT}`;
        const currentUserHash = crypto.createHash('sha256').update(secretCombination).digest('hex');

        if (String(review.hash_user).trim() === currentUserHash.trim()) {
            return res.status(403).json({ message: "You cannot vote on your own review." });
        }
        let updateQuery = {};
        if (voteType === 'up') {
            updateQuery = {
                $addToSet: { upvotedBy: userId },
                $pull: { downvotedBy: userId }
            };
        } else if (voteType === 'down') {
            updateQuery = {
                $addToSet: { downvotedBy: userId },
                $pull: { upvotedBy: userId }
            };
        } else {
            updateQuery = {
                $pull: { upvotedBy: userId, downvotedBy: userId }
            };
        }

        const updatedReview = await ReviewModel.findByIdAndUpdate(
            reviewId, 
            updateQuery, 
            { new: true } 
        );

        res.status(200).json({ 
            message: "Vote updated successfully",
            upvotes: Array.isArray(updatedReview.upvotedBy) ? updatedReview.upvotedBy.length : 0,
            downvotes: Array.isArray(updatedReview.downvotedBy) ? updatedReview.downvotedBy.length : 0
        });

    } catch (error) {
        console.error("Backend voting error:", error);
        res.status(500).json({ message: "Internal server error during voting execution", error: error.message });
    }
});

module.exports = router;