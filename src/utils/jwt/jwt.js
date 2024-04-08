
const jwt = require('jsonwebtoken');

require('dotenv').config(); 

const userLogin = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(401).send('Credenciales incorrectas');
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token });
};

const generateToken = (id, email) => {
    const token = jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return token
}

const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET)
}


module.exports = {
    generateToken,
    verifyToken
};