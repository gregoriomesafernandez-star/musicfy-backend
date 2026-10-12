const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { generateToken } = require('../services/jwt');

// Crear usuario
const saveUser = async (req, res) => {
    try {
        
        // Extraemos únicamente los campos que permitimos recibir
        const { name, surname, email, password } = req.body;

        //Validamos contraseña
        if (!password) {
            return res.status(400).json({
                message: 'Introduce la contraseña'
            });
        }
        
        // Ciframos la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        //Creamos usuario con datos recibidos
        const user = new User({
            name,
            surname,
            email,
            password: hashedPassword
        });

        user.role = "ROLE_USER";
        user.image = null;

        //Guardamos usuario
        const savedUser = await user.save();

        //Respuesta
        res.status(201).json(savedUser);

    } catch (error) {
        console.error(error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Faltan campos obligatorios'
            });
        }

        return res.status(500).json({
            message: 'No se ha podido guardar el usuario'
        });
    }
};

// Login de usuario
const loginUser = async (req, res) => {
    try {
        // Extraemos únicamente los campos que necesitamos
        const { email, password } = req.body;

        // Comprobamos que se hayan enviado los datos
        if (!email || !password) {
            return res.status(400).json({
                message: 'Email y contraseña son obligatorios'
            });
        }

        // Buscamos el usuario por email
        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        // Usuario no encontrado
        if (!user) {
            return res.status(401).json({
                message: 'Email o contraseña incorrectos'
            });
        }

        // Comprobamos la contraseña
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        // Contraseña incorrecta
        if (!passwordMatch) {
            return res.status(401).json({
                message: 'Email o contraseña incorrectos'
            });
        }

        // Token JWT
        const token = generateToken(user);

        // Login correcto
        return res.status(200).json({
            message: 'Login correcto',
            user,
            token: token
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};

// Actualizar usuario
const updateUser = async (req, res) => {
    try {
        //const userId = req.user.sub; --- ID on Middlaware
        const userId = req.user.sub;

        const { name, surname, email, password } = req.body;

        // Creamos el objeto con los datos a actualizar
        const updateData = {};

        if (name !== undefined) {
            updateData.name = name;
        }

        if (surname !== undefined) {
            updateData.surname = surname;
        }

        if (email !== undefined) {
            updateData.email = email.trim().toLowerCase();
        }

        // Si se proporciona una nueva contraseña, la ciframos
        if (password !== undefined) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        // Si se ha enviado una imagen
        if (req.file) {
            updateData.image = req.file.filename;
        }

        const userUpdated = await User.findByIdAndUpdate(
            userId,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        if (!userUpdated) {
            return res.status(404).json({
                message: 'No se ha podido encontrar el usuario'
            });
        }

        return res.status(200).json({
            user: userUpdated
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Error al actualizar el usuario'
        });
    }
};

// Subir imagen de usuario
const uploadImage = async (req, res) => {
    try {
        // ID del usuario obtenido del JWT
        const userId = req.user.sub;
        
        // Comprobamos que se haya enviado una imagen
        if (!req.file) {
            return res.status(400).json({
                message: 'No se ha enviado ninguna imagen'
            });
        }

        // Obtenemos la extensión del archivo
        const fileExtension = req.file.originalname
            .split('.')
            .pop()
            .toLowerCase();

        // Extensiones permitidas
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

        // Comprobamos la extensión
        if (!allowedExtensions.includes(fileExtension)) {
            return res.status(400).json({
                message: 'La extensión de la imagen no es válida'
            });
        }

        // Actualizamos la imagen del usuario
        const userUpdated = await User.findByIdAndUpdate(
            userId,
            {
                image: req.file.filename
            },
            {
                returnDocument: 'after',
                runValidators: true
            }
        );

        // Usuario no encontrado
        if (!userUpdated) {
            return res.status(404).json({
                message: 'Usuario no encontrado'
            });
        }

        // Respuesta
        return res.status(200).json({
            message: 'Imagen actualizada correctamente',
            user: userUpdated,
            image: req.file.filename
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Error al subir la imagen'
        });
    }
};

// Obtener imagen de usuario
const getImageFile = async (req, res) => {
    try {
        const imageFile = req.params.imageFile;

        // Construimos la ruta de la imagen
        const filePath = path.join(
            __dirname,
            '../../uploads/users',
            imageFile
        );

        // Comprobamos si existe
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                message: 'No existe la imagen'
            });
        }

        // Enviamos la imagen
        return res.sendFile(filePath);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Error al obtener la imagen'
        });
    }
};

module.exports = {
    saveUser,
    loginUser,
    updateUser,
    uploadImage,
    getImageFile
};