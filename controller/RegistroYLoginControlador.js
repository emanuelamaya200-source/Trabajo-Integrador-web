import { Usuario } from "../modelos/Usuario.js";
import bcrypt, { hash } from 'bcrypt';

export const LoguearseGet = (req,res) => {
    res.render("RegistroYLogin/login");
};

export const LoguearsePost = async (req, res) => {
    try {
        const { campo, contrasenia } = req.body;
        const usuario = await Usuario.buscarPorNombreOEmail(campo);
        
        if (!usuario) {
            return res.status(401).render('RegistroYLogin/login', { mensajes: "Usuario no encontrado" });
        }
        const contraseniaCorrecta = await bcrypt.compare(contrasenia, usuario.password);
        
        if (contraseniaCorrecta) {
            req.session.usuario = {
                id: usuario.id,
                username: usuario.username,
                email: usuario.email
            };

            return res.render('extra/welcome', { nombre: usuario.username }); 
        } else {
            return res.status(401).render('RegistroYLogin/login', { mensajes: "Contraseña incorrecta" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).render('RegistroYLogin/login', { mensajes: "Error interno del servidor" });
    }
};

// registrarse
export const RegistrarseGet = (req, res) => {
    res.render("RegistroYLogin/registrarse");
};

// recibir registro
export const RegistrarsePost = async (req, res) => {
    try {
        const { usuario, contrasenia, email } = req.body;
        const saltos = 10;
        const contraseniaCifrada = await bcrypt.hash(contrasenia, saltos);
        const ofertas = req.body.ofertas === 'on';
        const creado = await Usuario.crearUsuario(usuario, contraseniaCifrada, email, ofertas);
        if (creado) {
            res.render('extra/welcome', { nombre: usuario });
        } else {
            res.status(400).send("No se pudo crear el usuario"); 
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error interno del servidor");
    }
};


//revisar 
export const revisarMailGet = async (req, res) => {
    const { email } = req.query;
    const respuesta = await Usuario.revisarEmail(email);
    res.json({ respuesta });
};


export const revisarUsuarioGet = async (req, res) => {
    const { usuario } = req.query;
    const respuesta = await Usuario.revisarUsuario(usuario);
    res.json({ respuesta });
};