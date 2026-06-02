import express from 'express';
import { Usuario } from '../modelos/Usuario.js';
const RegYLogin = express.Router();
import * as RYL from "../controller/RegistroYLoginControlador.js"

//login
RegYLogin.get("/unirse",RYL.LoguearseGet);
RegYLogin.post("/unirse",RYL.LoguearsePost);

// registrarse
RegYLogin.get("/registro",RYL.RegistrarseGet);
RegYLogin.post("/registro", RYL.RegistrarsePost);

//revisar 
RegYLogin.get("/revisarEmail", RYL.revisarMailGet);
RegYLogin.get("/revisarUsuario",RYL.revisarUsuarioGet);


export default RegYLogin;