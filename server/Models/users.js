const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        minlength: 6,
        maxlength: 30,
    },
    user_salt:{
        type: String,
        unique: true,
        required: true,
        minlength: 64,
    },
    password: {
        type: String,
        required: true,
        minlength: 10,
    }
});

module.exports = mongoose.model('User', userSchema);