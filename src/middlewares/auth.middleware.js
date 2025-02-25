const User = require('../api/users/users.model');
const JwtUtils = require('../utils/jwt/jwt');


const isAuth = async (req, res, next) => {
    try {

        // El token se guarda en cabeceras y lo recuperamos de allí
        const token = req.headers.authorization;
        if (!token) {
            return 
        }
        // Asi nos llega de la cabecera 
        const parsedToken = token.replace('Bearer ', '');
        const validToken = JwtUtils.verifyToken(parsedToken, process.env.JWT_SECRET);
        const userLogued = await User.findById(validToken.id);
        req.user = userLogued;
        next();
    } catch (error) {
        return next(error)
    }
}

module.exports = { isAuth }