const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    // your schema definition
});

module.exports = mongoose.model('Report', reportSchema);