import { Usuario } from "../modelos/Usuario.js";

export const LoguearseGet = (req,res) => {
    res.render("RegistroYLogin/login");
};

export const LoguearsePost = (req, res) => {
    const { email } = req.body;
    //res.render("extra/welcome", { email });
};

// registrarse
export const RegistrarseGet = (req, res) => {
    res.render("RegistroYLogin/registrarse");
};

// recibir registro
export const RegistrarsePost =  async (req, res) => {
    try {
        const { usuario, contrasenia, email } = req.body;
        const ofertas = req.body.ofertas === 'on';
        const creado = await Usuario.crearUsuario(usuario, contrasenia, email, ofertas);
        if (creado) {
            res.render('extra/welcome', { nombre: usuario });
        } else {
            res.end(); 
        }
    } catch (error) {
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