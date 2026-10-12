const mongoose = require('mongoose');

//Paginación
const mongoosePaginate = require('mongoose-paginate-v2');

const artistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: String
});

//Añadimos plugin de paginación
artistSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Artist', artistSchema);