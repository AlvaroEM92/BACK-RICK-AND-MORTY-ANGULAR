const User = require('./users.model');
const bcrypt = require('bcrypt');
const {generateToken} = require('../../utils/jwt/jwt.js');
const {generateID} = require("../../utils/generateID/generateID.js")
const JwtUtils = require('../../utils/jwt/jwt.js');
const { transporter } = require('../../utils/nodemailer-config');



const register = async (req, res, next) => {

    try {
       
        const regexp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,12}$/;

        const {name, email, surname, password} = req.body
        if(name === ""|| email === "" || surname === ""){
            return res.json("¡No puedes dejar campos vacios!")
        }
        if(password.length < 8){
            return res.json("¡La contraseña es demasiado corta!")
        }
        if(!regexp.test(password)){
            return res.json("¡El password no cumple con los requisitos minimos de seguridad!. Recuerda que debe tener de 8 a 12 caracteres y que debe incluir minimo: Un caracter en mayúscula, uno en minúscula, un número y un carácter especial")
        }
        

        const user = new User();
        user.name = name;
        user.email = email;
        user.surname = surname;
        user.password = password;
        user.token = generateID();
        const userExist = await User.findOne({ email: user.email })
        if (userExist) {
            const error = new Error("¡El correo ya existe, puedes solicitar crear una nueva contraseña si la has olvidado!");
            return res.status(401).json({msg: error.message})
        }
        const userDB = await user.save();

         //               await transporter.sendMail({
         //                   from: '"Alvaro Escribano " <//emisor>', // sender address
          //                  to: `${req.body.email}`, // list of receivers
          //                  subject: "Enviado desde nodemailer ✔", // Subject line
           //                 text: "Hello world?", // plain text body
          //                  html: `<b>Bienvenido a la aplicacion! ${req.body.name}, solo te queda un paso por realizar, pincha en el siguiente enláce para completar tu registro: http://localhost:8084/user-confirm/${user.token} </b>`, // html body
          //              });
        return res.status(201).json(userDB)

    } catch (error) {
        const err = new Error("Ha ocurrido un error con el registro.");
        return res.status(404).json({msg: err.message})
    }
}

const confirm = async (req, res, next) => {
    const {token} = req.params;
    const userConfirm = await User.findOne({token})
    if (!userConfirm){
        const error = new Error("Token no valido")
        return res.status(403).json({msg: error.message})
    }

    try {
        userConfirm.confirmed = true;
        userConfirm.token = "";
        await userConfirm.save()
        return res.status(200).json({msg: "¡Usuario Confirmado!"})
    } catch (error) {
        console.log(error)
    }
}

const login = async (req, res, next) => {

    try {
        // Comprobamos que existe el email para logarse
        const user = await User.findOne({ email: req.body.email });

        if(!await user.passwordCheck(req.body.password)){
            const error = new Error("El correo electronico o la contraseña no son correctos, revisalos e intenta nuevamente");
            return res.json({msg: error.message})
        }

        //if (!user.confirmed){
         //   const error = new Error("¡Aun no has confirmado tu cuenta!");
          //  return res.json({msg: error.message})
      //  }
        if (await user.passwordCheck(req.body.password)) {
                 // Generamos el Token
            const token = generateToken(user._id, user.email);
            if (!token) {
                return res.status(500).json({ msg: "Error al generar el token" });
            }
            user.token = token;
            await user.save()
            return res.json({
                user: {
                    name: user.name,
                    email: user.email,
                    token: user.token 
                }
            });
        } else {
            const error = new Error("El correo electronico o la contraseña no son correctos, revisalos e intenta nuevamente");
            return res.json({msg: error.message})
        }
           

    } catch (error) {
        const err = new Error("Ha ocurrido un error con el inicio de sesión.");
        return res.json({msg: err.message})
    }
}

const logout = async (req, res, next) => {
    try {
        // Te elimina el token -> Es decir te lo devuelve en null
        const token = null;
        return res.status(201).json(token)
    } catch (error) {
        return next(error)
    }
}


const newPassword = async (req, res, next) => {

    const {token} = req.params;
    const {password} = req.body;
    
    const user = await User.findOne({token})
    
    if (user){
        user.password = password;
        user.token = "";
        await user.save();
        res.json({msg: "Contraseña actualizada correctamente"})
    }else {
        const error = new Error("El Token no es valido");
        return res.status(404).json({msg: error.message})
    }

    try {
        
    } catch (error) {
        
    }
}


module.exports = { register, login, logout, confirm,  newPassword}