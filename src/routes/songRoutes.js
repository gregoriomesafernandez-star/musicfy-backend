const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();

//Añadimos Controlador artista
const SongController = require('../controllers/songController');

//Añadimos Middleware
const { ensureAuth } = require('../middlewares/auth');
const { ensureAdmin } = require('../middlewares/authAdmin');

// Configuración de Multer
const storage = multer.diskStorage({
    destination: 'uploads/songs',

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

//Rutas de cancion
router.post('/song', ensureAuth, ensureAdmin, upload.single('file'), SongController.saveSong);
router.get('/song/:id', ensureAuth, SongController.getSong);
router.get('/songs', ensureAuth, SongController.getSongs);
router.get('/songs/:album', ensureAuth, SongController.getSongs);
router.put('/song/:id', ensureAuth, ensureAdmin, upload.single('file'), SongController.updateSong);
router.delete('/song/:id', ensureAuth, ensureAdmin, SongController.deleteSong);
//router.put('/update-audio-song/:id', ensureAuth, upload.single('file'), SongController.uploadAudio);
router.get('/get-audio-song/:audioFile', SongController.getAudioFile);

module.exports = router;