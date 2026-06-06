const mongoose = require('mongoose');
const blockedEmailSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    reason: String,
    dateBlocked: { type: Date, default: Date.now }
});
module.exports = mongoose.model('BlockedEmail', blockedEmailSchema);