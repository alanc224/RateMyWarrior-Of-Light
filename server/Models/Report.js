const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reviewId: { type: mongoose.Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, default: 'pending' }
});

module.exports = mongoose.model('Report', reportSchema);