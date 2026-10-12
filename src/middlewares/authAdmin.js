const ensureAdmin = (req, res, next) => {

    if (req.user.role !== 'ROLE_ADMIN') {
        return res.status(403).json({
            message: 'No tienes permisos de administrador'
        });
    }

    next();
};

module.exports = {
    ensureAdmin
};