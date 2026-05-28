import express from 'express';
import { Usuario } from '../modelos/Usuario.js';
const RegYLogin = express.Router();
import * as RYL from "../controller/RegistroYLoginControlador.js"

//login
RegYLogin.get("/login",RYL.LoguearseGet);
RegYLogin.post("/login",RYL.LoguearsePost);

// registrarse
RegYLogin.get("/signup",RYL.RegistrarseGet);
RegYLogin.post("/registro", RYL.RegistrarsePost);

//revisar 
RegYLogin.get("/revisarEmail", RYL.revisarMailGet);
RegYLogin.get("/revisarUsuario",RYL.revisarUsuarioGet);


export default RegYLogin;