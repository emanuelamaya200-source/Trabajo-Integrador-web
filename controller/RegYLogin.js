import express from 'express';
import { Usuario } from '../modules/Usuario.js';
const RegYLogin = express.Router();

RegYLogin.get("/login", (req, res) => {
    // se escribe sin ./
    res.render("RegistroYLogin/login");
});

RegYLogin.post("/login", (req, res) => {
    const { email } = req.body;
    //res.render("extra/welcome", { email });
});

// registrarse
RegYLogin.get("/signup", (req, res) => {
    res.render("RegistroYLogin/registrarse");
});

// recibir registro
RegYLogin.post("/registro", async (req, res) => {
    try {
        const { usuario, contrasenia, email } = req.body;
        const ofertas = req.body.ofertas === 'on';
        const creado = await Usuario.crearUsuario(usuario, contrasenia, email, ofertas);
        if (creado) {
            res.render('extra/welcome', { nombre: usuario });
        } else {
            res.end()
        }
    } catch (error) {
        res.status(500).send("Error interno del servidor");
    }
});

RegYLogin.get("/welcome",(req,res)=>{
    res.render("welcome")
})

//revisar 
RegYLogin.get("/revisarEmail", async (req, res) => {
    const { email } = req.query;
    const respuesta = await Usuario.revisarEmail(email);
    res.json({ respuesta });
});

RegYLogin.get("/revisarUsuario", async (req, res) => {
    const { usuario } = req.query;
    const respuesta = await Usuario.revisarUsuario(usuario);
    res.json({ respuesta });
});


export default RegYLogin;