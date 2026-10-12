const fs = require('fs');
const path = require('path');
const Artist = require('../models/Artist');
const Album = require('../models/Album');
const Song = require('../models/Song');

// Crear Album
const saveAlbum = async (req, res) => {
    try {
        // Extraemos únicamente los campos permitidos
        const { title, description, year, artist } = req.body;

        // Creamos el Album
        const album = new Album({
            title,
            description,
            year,
            image: req.file ? req.file.filename : null,
            artist
        });

        // Guardamos el Album
        const albumStored = await album.save();

        // Respuesta
        return res.status(201).json({
            message: 'Album creado correctamente',
            album: albumStored
        });

    } catch (error) {
        console.error(error);

        // Error de validación de Mongoose
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Faltan campos obligatorios'
            });
        }

        return res.status(500).json({
            message: 'Error al guardar el Album'
        });
    }
};

// Mostrar Album
const getAlbum = async (req, res) => {
    try {
        const albumId = req.params.id;

        const album = await Album.findById(albumId)
                                 .populate('artist');

        if (!album) {
            return res.status(404).json({
                message: 'El álbum no existe'
            });
        }

        return res.status(200).json({
            album
        });

    } catch (error) {
        console.error(error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'El ID del álbum no es válido'
            });
        }

        return res.status(500).json({
            message: 'Error al obtener el álbum'
        });
    }
};

// Obtener todos los Albums o Albums de un artita
const getAlbums = async (req, res) => {
    try {
        const artistId = req.params.artist;

        let albums;

        if (artistId) {
            albums = await Album.find({ artist: artistId })
                                .sort({ year: 1 })
                                .populate('artist');
        } else {
            albums = await Album.find()
                                .sort({ title: 1 })
                                .populate('artist');
        }

        return res.status(200).json({
            albums
        });

    } catch (error) {
        console.error(error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'El ID del artista no es válido'
            });
        }

        return res.status(500).json({
            message: 'Error al obtener los álbumes'
        });
    }
};

// Actualizar Album
const updateAlbum = async (req, res) => {
    try {
        // ID del Album recibido por la URL
        const albumId = req.params.id;

        // Extraemos solamente los campos que permitimos actualizar
        const { title, description, year, artist } = req.body;

        // Creamos el objeto con los datos a actualizar
        const updateData = {};

        if (title !== undefined) {
            updateData.title = title;
        }

        if (description !== undefined) {
            updateData.description = description;
        }

        if (year !== undefined) {
            updateData.year = year;
        }

        if (artist !== undefined) {
            updateData.artist = artist;
        }

        // Si viene una imagen nueva
        if (req.file) {
            updateData.image = req.file.filename;
        }

        // Actualizamos el Album
        const albumUpdated = await Album.findByIdAndUpdate(
            albumId,
            updateData,
            {
                returnDocument: 'after',
                runValidators: true
            }
        );

        // Album no encontrado
        if (!albumUpdated) {
            return res.status(404).json({
                message: 'El Album no existe'
            });
        }

        return res.status(200).json({
            message: 'Album actualizado correctamente',
            album: albumUpdated
        });

    } catch (error) {
        console.error(error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'El ID del Album no es válido'
            });
        }

        return res.status(500).json({
            message: 'Error al actualizar el Album'
        });
    }
};

// Eliminar Album
const deleteAlbum = async (req, res) => {
    try {
        const albumId = req.params.id;

        // Comprobamos que el Albuma existe
        const album = await Album.findById(albumId);

        if (!album) {
            return res.status(404).json({
                message: 'El Album no existe'
            });
        }

        // Eliminamos las canciones del álbum
        await Song.deleteMany({
            album: albumId
        });

        // Eliminamos el Album
        await Album.findByIdAndDelete(albumId);

        return res.status(200).json({
            message: 'Album y sus canciones eliminados correctamente',
            album
        });

    } catch (error) {
        console.error(error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'El ID del Album no es válido'
            });
        }

        return res.status(500).json({
            message: 'Error al eliminar el Album'
        });
    }
};

// Subir imagen de Albuma
const uploadImage = async (req, res) => {
    try {
        // ID del album
        const albumId = req.params.id;
        
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

        // Actualizamos la imagen del album
        const albumUpdated = await Album.findByIdAndUpdate(
            albumId,
            {
                image: req.file.filename
            },
            {
                returnDocument: 'after',
                runValidators: true
            }
        );

        // Album no encontrado
        if (!albumUpdated) {
            return res.status(404).json({
                message: 'Albuma no encontrado'
            });
        }

        // Respuesta
        return res.status(200).json({
            message: 'Imagen actualizada correctamente',
            album: albumUpdated
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Error al subir la imagen'
        });
    }
};

// Obtener imagen de Albuma
const getImageFile = async (req, res) => {
    try {
        const imageFile = req.params.imageFile;

        // Construimos la ruta de la imagen
        const filePath = path.join(
            __dirname,
            '../../uploads/albums',
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
    saveAlbum,
    getAlbum,
    getAlbums,
    updateAlbum,
    deleteAlbum,
    uploadImage,
    getImageFile
};