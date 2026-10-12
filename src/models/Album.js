const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
    title:  {
        type: String,
        required: true
    },
    description:  {
        type: String,
        required: true
    },
    year:  {
        type: String,
        required: true
    },
    image: String,
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artist'
    }
});

module.exports = mongoose.model('Album', albumSchema);