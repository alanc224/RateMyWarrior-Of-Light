const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reviewId: { type: mongoose.Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true },
    characterName: { type: String, required: true },
    server: { type: String, required: true },
    reviewContent: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, default: 'pending' },
    reporterUserId: { type: String, required: true }, 
    reporterUsername: { type: String, required: true },
    reviewOwnerUsername: { type: String, required: true },
});

reportSchema.index({ reviewId: 1, reporterUserId: 1 }, { unique: true });

module.exports = mongoose.model('Report', reportSchema);