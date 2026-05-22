const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true 
});

module.exports = mongoose.model('User', UserSchema);