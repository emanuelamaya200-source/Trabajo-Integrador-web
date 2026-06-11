import { sequelize } from "../conexion.js";
import { requireAuth } from "../controller/autenticador.js";
import express from "express"
import * as per from "../controller/perfilcontrolador.js"

const router = express.Router();

router.get("/perfil/:id", requireAuth, per.mostrarPerfil)
router.post("/cambiarfotodeperfil", requireAuth, per.cambiarFotoDePerfil)
router.post("/seguirUsuario/:id", requireAuth, per.seguirUsuario)
router.get("/explorar", per.cargarExplorar)
router.post("/logout", per.eliminarSession)

export default router;