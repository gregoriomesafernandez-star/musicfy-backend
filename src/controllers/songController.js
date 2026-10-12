const fs = require('fs');
const path = require('path');
const Artist = require('../models/Artist');
const Album = require('../models/Album');
const Song = require('../models/Song');

// Crear Cancion
const saveSong = async (req, res) => {
    try {
        // Extraemos únicamente los campos permitidos
        const { number, name, duration, album } = req.body;

        // Creamos la cancion
        const song = new Song({
            number,
            name,
            duration,
            file: req.file ? req.file.filename : null,
            album
        });

        // Guardamos el Cancion
        const songStored = await song.save();

        // Respuesta
        return res.status(201).json({
            message: 'Cancion creada correctamente',
            song: songStored
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
            message: 'Error al guardar la cancion'
        });
    }
};

// Mostrar cancion
const getSong = async (req, res) => {
    try {
        const songId = req.params.id;

        const song = await Song.findById(songId)
                               .populate('album');

        if (!song) {
            return res.status(404).json({
                message: 'La cancion no existe'
            });
        }

        return res.status(200).json({
            song
        });

    } catch (error) {
        console.error(error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'El ID de la cancion no es válido'
            });
        }

        return res.status(500).json({
            message: 'Error al obtener la cancion'
        });
    }
};

// Obtener todas las canciones o canciones de un album
const getSongs = async (req, res) => {
    try {
        const albumId = req.params.album;

        let songs;

        if (albumId) {
            songs = await Song.find({ album: albumId })
                                .sort({ year: 1 })
                                .populate('album');
        } else {
            songs = await Song.find()
                                .sort({ title: 1 })
                                .populate('album');
        }

        return res.status(200).json({
            songs
        });

    } catch (error) {
        console.error(error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'El ID de la cancion no es válido'
            });
        }

        return res.status(500).json({
            message: 'Error al obtener las canciones'
        });
    }
};

// Actualizar cancion
const updateSong = async (req, res) => {
    try {
        // ID del Album recibido por la URL
        const songId = req.params.id;

        // Extraemos solamente los campos que permitimos actualizar
        const { number, name, duration, album } = req.body;

        // Creamos el objeto con los datos a actualizar
        const updateData = {};

        if (number !== undefined) {
            updateData.number = number;
        }

        if (name !== undefined) {
            updateData.name = name;
        }

        if (duration !== undefined) {
            updateData.duration = duration;
        }

        if (album !== undefined) {
            updateData.album = album;
        }

        // Si viene una cancion nueva
        if (req.file) {
            updateData.file = req.file.filename;
        }

        // Actualizamos la cancion
        const songUpdated = await Song.findByIdAndUpdate(
            songId,
            updateData,
            {
                returnDocument: 'after',
                runValidators: true
            }
        );

        // Cancion no encontrada
        if (!songUpdated) {
            return res.status(404).json({
                message: 'La cancion no existe'
            });
        }

        return res.status(200).json({
            message: 'Cancion actualizada correctamente',
            song: songUpdated
        });

    } catch (error) {
        console.error(error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'El ID de la cancion no es válido'
            });
        }

        return res.status(500).json({
            message: 'Error al actualizar la cancion'
        });
    }
};

// Eliminar cancion
const deleteSong = async (req, res) => {
    try {
        const songId = req.params.id;

        // Comprobamos que la cancion existe
        const song = await Song.findById(songId);

        if (!song) {
            return res.status(404).json({
                message: 'La cancion no existe'
            });
        }

        // Eliminamos la cancion
        await Song.findByIdAndDelete(songId);

        return res.status(200).json({
            message: 'La cancion ha sido eliminada correctamente',
            song
        });

    } catch (error) {
        console.error(error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'El ID de la cancion no es válido'
            });
        }

        return res.status(500).json({
            message: 'Error al eliminar la cancion'
        });
    }
};

// Subir audio de cancion
const uploadAudio = async (req, res) => {
    try {
        // ID del cancion
        const songId = req.params.id;
        
        // Comprobamos que se haya enviado un audio
        if (!req.file) {
            return res.status(400).json({
                message: 'No se ha enviado ningun audio'
            });
        }

        // Obtenemos la extensión del archivo
        const fileExtension = req.file.originalname
            .split('.')
            .pop()
            .toLowerCase();

        // Extensiones permitidas
        const allowedExtensions = ['mp3'];

        // Comprobamos la extensión
        if (!allowedExtensions.includes(fileExtension)) {
            return res.status(400).json({
                message: 'La extensión del audio no es válida'
            });
        }

        // Actualizamos el audio de la cancion
        const songUpdated = await Song.findByIdAndUpdate(
            songId,
            {
                file: req.file.filename
            },
            {
                returnDocument: 'after',
                runValidators: true
            }
        );

        // Cancion no encontrada
        if (!songUpdated) {
            return res.status(404).json({
                message: 'Cancion no encontrada'
            });
        }

        // Respuesta
        return res.status(200).json({
            message: 'Cancion actualizada correctamente',
            song: songUpdated
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Error al subir el audio'
        });
    }
};

// Obtener audio de cancion
const getAudioFile = async (req, res) => {
    try {
        const audioFile = req.params.audioFile;

        // Construimos la ruta del audio
        const filePath = path.join(
            __dirname,
            '../../uploads/songs',
            audioFile
        );

        // Comprobamos si existe
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                message: 'No existe el audio'
            });
        }

        // Enviamos el audio
        return res.sendFile(filePath);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Error al obtener el audio'
        });
    }
};

module.exports = {
    saveSong,
    getSong,
    getSongs,
    updateSong,
    deleteSong,
    uploadAudio,
    getAudioFile
};