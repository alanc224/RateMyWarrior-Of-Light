const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewSchema = new Schema({
    hash_user: { type: String, required: true, unique: true },
    global_user_hash: { type: String, required: true, index: true },
    character_id: { type: String, required: true }, 
    character_name: { type: String, required: true }, 
    server: { type: String, required: true },   
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    date: { type: Date, default: Date.now, required: true },
    playAgain: { type: Boolean, required: true },
    recommend: { type: Boolean, required: true },
    contentType: { type: String, required: true, default: 'Other' },
});

module.exports = mongoose.model('Review', reviewSchema);