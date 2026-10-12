const jwt = require('jsonwebtoken');

const ensureAuth = (req, res, next) => {
    try {
        // Comprobamos que existe la cabecera Authorization
        const authorization = req.headers.authorization;

        if (!authorization) {
            return res.status(401).json({
                message: 'No se ha proporcionado un token de autenticación'
            });
        }

        // Comprobamos que tenga el formato Bearer TOKEN
        const [type, token] = authorization.split(' ');

        if (type !== 'Bearer' || !token) {
            return res.status(401).json({
                message: 'Formato de token no válido'
            });
        }

        // Verificamos el token y su expiración
        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Guardamos los datos del usuario en la petición
        req.user = payload;

        // Continuamos con la siguiente función
        next();

    } catch (error) {
        console.error(error);

        // Token expirado
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'El token ha expirado'
            });
        }

        // Token inválido
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                message: 'Token no válido'
            });
        }

        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};

module.exports = {
    ensureAuth
};