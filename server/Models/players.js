import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    server: String,
    world: String,
    portrait: String,
}, { timestamps: true });

const Player = mongoose.model('Player', playerSchema);
export default Player;