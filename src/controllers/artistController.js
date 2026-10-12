const fs = require('fs');
const path = require('path');
const Artist = require('../models/Artist');
const Album = require('../models/Album');
const Song = require('../models/Song');

// Crear artista
const saveArtist = async (req, res) => {
    try {
        // Extraemos únicamente los campos permitidos
        const { name, description } = req.body;

        // Creamos el artista
        const artist = new Artist({
            name,
            description,
            image: req.file ? req.file.filename : null
        });

        // Guardamos el artista
        const artistStored = await artist.save();

        // Respuesta
        return res.status(201).json({
            message: 'Artista creado correctamente',
            artist: artistStored
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
            message: 'Error al guardar el artista'
        });
    }
};

// Mostrar artista
const getArtist = async (req, res) => {
    try {
        // ID del artista que viene de la URL
        const artistId = req.params.id;

        // Buscamos el artista
        const artist = await Artist.findById(artistId);

        if (!artist) {
            return res.status(404).json({
                message: 'El artista no existe'
            });
        }

        return res.status(200).json({
            artist
        });

    } catch (error) {
        console.error(error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'El ID del artista no es válido'
            });
        }

        return res.status(500).json({
            message: 'Error al obtener el artista'
        });
    }
};

// Obtener todos los artistas
const getArtists = async (req, res) => {
    try {
        // Página recibida por la URL
        const page = parseInt(req.params.page) || 1;

        // Artistas por página
        const limit = 10;

        // Realizamos la consulta paginada
        const result = await Artist.paginate(
            {},
            {
                page,
                limit,
                sort: { name: 1 }
            }
        );

        // No hay artistas
        if (result.totalDocs === 0) {
            return res.status(404).json({
                message: 'No hay artistas'
            });
        }

        return res.status(200).json({
            page: result.page,
            totalPages: result.totalPages,
            totalArtists: result.totalDocs,
            artists: result.docs
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Error al obtener los artistas'
        });
    }
};

// Actualizar artista
const updateArtist = async (req, res) => {

    try {
        // ID del artista recibido por la URL
        const artistId = req.params.id;

        // Extraemos solamente los campos que permitimos actualizar
        const { name, description } = req.body;

        // Creamos el objeto con los datos a actualizar
        const updateData = {};

        if (name !== undefined) {
            updateData.name = name;
        }

        if (description !== undefined) {
            updateData.description = description;
        }

        // Si viene una imagen nueva
        if (req.file) {
            updateData.image = req.file.filename;
        }

        // Actualizamos el artista
        const artistUpdated = await Artist.findByIdAndUpdate(
            artistId,
            updateData,
            {
                returnDocument: 'after',
                runValidators: true
            }
        );

        // Artista no encontrado
        if (!artistUpdated) {
            return res.status(404).json({
                message: 'El artista no existe'
            });
        }

        return res.status(200).json({
            message: 'Artista actualizado correctamente',
            artist: artistUpdated
        });

    } catch (error) {
        console.error(error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'El ID del artista no es válido'
            });
        }

        return res.status(500).json({
            message: 'Error al actualizar el artista'
        });
    }
};

// Eliminar artista
const deleteArtist = async (req, res) => {
    try {
        const artistId = req.params.id;

        // Comprobamos que el artista existe
        const artist = await Artist.findById(artistId);

        if (!artist) {
            return res.status(404).json({
                message: 'El artista no existe'
            });
        }

        // Buscamos los álbumes del artista
        const albums = await Album.find({
            artist: artistId
        });

        // Eliminamos las canciones de cada álbum
        for (const album of albums) {
            await Song.deleteMany({
                album: album._id
            });
        }

        // Eliminamos los álbumes
        await Album.deleteMany({
            artist: artistId
        });

        // Eliminamos el artista
        await Artist.findByIdAndDelete(artistId);

        return res.status(200).json({
            message: 'Artista, álbumes y canciones eliminados correctamente'
        });

    } catch (error) {
        console.error(error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'El ID del artista no es válido'
            });
        }

        return res.status(500).json({
            message: 'Error al eliminar el artista'
        });
    }
};

// Subir imagen de artista
const uploadImage = async (req, res) => {
    try {
        // ID del artista
        const artistId = req.params.id;
        
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

        // Actualizamos la imagen del artista
        const artistUpdated = await Artist.findByIdAndUpdate(
            artistId,
            {
                image: req.file.filename
            },
            {
                returnDocument: 'after',
                runValidators: true
            }
        );

        // Artista no encontrado
        if (!artistUpdated) {
            return res.status(404).json({
                message: 'Artista no encontrado'
            });
        }

        // Respuesta
        return res.status(200).json({
            message: 'Imagen actualizada correctamente',
            artist: artistUpdated
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Error al subir la imagen'
        });
    }
};

// Obtener imagen de artista
const getImageFile = async (req, res) => {
    try {
        const imageFile = req.params.imageFile;

        // Construimos la ruta de la imagen
        const filePath = path.join(
            __dirname,
            '../../uploads/artists',
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
    saveArtist,
    getArtist,
    getArtists,
    updateArtist,
    deleteArtist,
    uploadImage,
    getImageFile
};