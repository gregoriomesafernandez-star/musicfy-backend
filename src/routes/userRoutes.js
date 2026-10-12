const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();

//Añadimos Controlador usuario
const UserController = require('../controllers/userController');

//Añadimos Middleware
const { ensureAuth } = require('../middlewares/auth');

// Configuración de Multer
const storage = multer.diskStorage({
    destination: 'uploads/users',

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

//Rutas de usuario
router.post('/register', UserController.saveUser);
router.post('/login', UserController.loginUser);
router.put('/update-user', ensureAuth, upload.single('image'), UserController.updateUser);
//router.put('/update-image-user', ensureAuth, upload.single('image'), UserController.uploadImage);
router.get('/get-image-user/:imageFile', UserController.getImageFile);

module.exports = router;