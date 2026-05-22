const express = require('express');
const router = express.Router();
const { Webhook } = require('svix');
const UserModel = require('../Models/users'); 
const crypto = require('crypto');
const ReviewModel = require('../Models/reviews');

router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        return res.status(500).json({ error: "Webhook configuration missing on server" });
    }

    const svix_id = req.headers["svix-id"];
    const svix_timestamp = req.headers["svix-timestamp"];
    const svix_signature = req.headers["svix-signature"];

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return res.status(400).json({ error: "Missing required svix verification headers" });
    }

    const payload = req.body.toString();
    const headers = {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
    };

    const wh = new Webhook(WEBHOOK_SECRET);
    let evt;

    try {
        evt = wh.verify(payload, headers);
    } catch (err) {
        return res.status(400).json({ error: "Invalid cryptographic signature" });
    }

    const { id, username, first_name } = evt.data;
    const eventType = evt.type;


    switch (eventType) {
        case 'user.created':
            try {
                const finalUsername = username || first_name || `warrior_${id.substring(5, 10)}`;
                
                await UserModel.findOneAndUpdate(
                    { clerkId: id },
                    { $setOnInsert: { clerkId: id, username: finalUsername } },
                    { upsert: true, new: true }
                );
            } catch (dbError) {
                return res.status(500).json({ error: "Database create failure" });
            }
            break;

        case 'user.deleted':
            try {
                const HASH_SALT = process.env.HASH_SALT;
                const allReviews = await ReviewModel.find({}, 'character_id hash_user').lean();
                
                const reviewIdsToDelete = [];
                for (const review of allReviews) {
                    const secretCombination = `${id}_${review.character_id}_${HASH_SALT}`;
                    const computedHash = crypto.createHash('sha256').update(secretCombination).digest('hex');
                    
                    if (review.hash_user === computedHash) {
                        reviewIdsToDelete.push(review._id);
                    }
                }
                if (reviewIdsToDelete.length > 0) {
                    await ReviewModel.deleteMany({ _id: { $in: reviewIdsToDelete } });
                    console.log(`[Webhook] Deleted ${reviewIdsToDelete.length} anonymous reviews for user: ${id}`);
                }
                await UserModel.findOneAndDelete({ clerkId: id });
                console.log(`[Webhook] Successfully removed user profile for user: ${id}`);

            } catch (dbError) {
                console.error("Error handling user deletion workflow:", dbError);
                return res.status(500).json({ error: "Database delete failure" });
            }
            break;

        default:
            break;
    }

    res.status(200).json({ success: true, message: "Webhook processed successfully" });
});

module.exports = router;