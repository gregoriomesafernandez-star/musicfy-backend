//Importar dependencias
const express = require("express");
const cors = require("cors");       //Quita errores y el acesso cruzado a dominios

//Crear el servidor
const app = express();

//Configurar el cors
app.use(cors());        //Evitamos maximos errores en local

//Convertir los datos del body a objetos
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use((req, res, next) => {
    console.log('🔥 PETICIÓN:', req.method, req.url);
    next();
});
//Rutas de usuarios
const userRoutes = require('./routes/userRoutes');

//Rutas de artistas
const artistRoutes = require('./routes/artistRoutes');

//Rutas de albums
const albumRoutes = require('./routes/albumRoutes');

//Rutas de canciones
const songRoutes = require('./routes/songRoutes');

//Ruta principal
app.use('/api', userRoutes);
app.use('/api', artistRoutes);
app.use('/api', albumRoutes);
app.use('/api', songRoutes);

module.exports = app;