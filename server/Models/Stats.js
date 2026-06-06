const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema({
    totalLookups: { type: Number, default: 0 },
    cacheHits: { type: Number, default: 0 }
});

module.exports = mongoose.model('Stats', statsSchema);