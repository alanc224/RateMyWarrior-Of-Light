const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewSchema = new Schema({
    hash_user: { type: String, required: true },
    character_id: { type: String, required: true }, 
    character_name: { type: String, required: true }, 
    server: { type: String, required: true },   
    rating: { type: Number },
    comment: { type: String },
    // Need created by date
    // need the boolean questions
});
reviewSchema.index({ hash_user: 1, character_id: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);