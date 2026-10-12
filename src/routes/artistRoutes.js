const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();

//Añadimos Controlador artista
const ArtistController = require('../controllers/artistController');

//Añadimos Middleware
const { ensureAuth } = require('../middlewares/auth');
const { ensureAdmin } = require('../middlewares/authAdmin');

// Configuración de Multer
const storage = multer.diskStorage({
    destination: 'uploads/artists',

    filename: (req, file, cb) => {
        // Obtenemos la extensión original
        const extension = path.extname(file.originalname).toLowerCase();

        // Generamos un nombre único manteniendo la extensión
        const filename = `${crypto.randomUUID()}${extension}`;

        cb(null, filename);
    }
});

const upload = multer({
    storage
});

//Rutas de artista
router.post('/artist', ensureAuth, ensureAdmin, upload.single('image'), ArtistController.saveArtist);
router.get('/artist/:id', ensureAuth, ArtistController.getArtist);
router.get('/artists/:page', ensureAuth, ArtistController.getArtists);
router.put('/artist/:id', ensureAuth, ensureAdmin, upload.single('image'), ArtistController.updateArtist);
router.delete('/artist/:id', ensureAuth, ensureAdmin, ArtistController.deleteArtist);
//router.put('/update-image-artist/:id', ensureAuth, upload.single('image'), ArtistController.uploadImage);
router.get('/get-image-artist/:imageFile', ArtistController.getImageFile);

module.exports = router;