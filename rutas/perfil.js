import { sequelize } from "../conexion.js";
import { requireAuth } from "../controller/autenticador.js";
import express from "express"
import * as per from "../controller/perfilcontrolador.js"
import * as mensajes from "../controller/MensajesControlador.js"

const router = express.Router();

router.get("/perfil/:id", requireAuth, per.mostrarPerfil)
router.post("/cambiarfotodeperfil", requireAuth, per.cambiarFotoDePerfil)
router.post("/seguirUsuario/:id", requireAuth, per.seguirUsuario)
router.post("/dejarDeSeguirUsuario/:id", requireAuth, per.dejarDeSeguirUsuario)
router.get("/notificaciones", requireAuth, per.verNotificaciones)
router.post("/notificaciones/:id/leida", requireAuth, per.marcarNotificacionLeida)
router.get("/contenidoSeguidos", requireAuth, per.verContenidoSeguidos)
router.get("/mensajes", requireAuth, mensajes.verMensajes)
router.get("/mensajes/:id", requireAuth, mensajes.verConversacion)
router.post("/mensajes/:id", requireAuth, mensajes.enviarMensaje)
router.get("/explorar", per.cargarExplorar)
router.post("/logout", per.eliminarSession)

export default router;