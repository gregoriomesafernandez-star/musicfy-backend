const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    number: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    file: String,
    album: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Album'
    }
});

module.exports = mongoose.model('Song', songSchema);