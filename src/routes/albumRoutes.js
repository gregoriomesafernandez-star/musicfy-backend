const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();

//Añadimos Controlador album
const AlbumController = require('../controllers/albumController');

//Añadimos Middleware
const { ensureAuth } = require('../middlewares/auth');
const { ensureAdmin } = require('../middlewares/authAdmin');

// Configuración de Multer
const storage = multer.diskStorage({
    destination: 'uploads/albums',

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

//Rutas de album
router.post('/album', ensureAuth, ensureAdmin, upload.single('image'), AlbumController.saveAlbum);
router.get('/album/:id', ensureAuth, AlbumController.getAlbum);
router.get('/albums', ensureAuth, AlbumController.getAlbums);
router.get('/albums/:artist', ensureAuth, AlbumController.getAlbums);
router.put('/album/:id', ensureAuth, ensureAdmin, upload.single('image'), AlbumController.updateAlbum);
router.delete('/album/:id', ensureAuth, ensureAdmin, AlbumController.deleteAlbum);
//router.put('/update-image-album/:id', ensureAuth, upload.single('image'), AlbumController.uploadImage);
router.get('/get-image-album/:imageFile', AlbumController.getImageFile);

module.exports = router;