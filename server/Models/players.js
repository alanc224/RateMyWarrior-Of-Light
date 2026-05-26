const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    name: String,
    server: String,
    world: String,
    portrait: String
}, { timestamps: true });

const Character = mongoose.model('Character', playerSchema);

module.exports = Character;