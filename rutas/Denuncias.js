import { sequelize } from "../conexion.js";
import { requireAuth } from "../controller/autenticador.js";
import express from "express"
import * as Den from "../controller/Denunciascontrolador.js"

const router = express.Router();

router.get("/DenunciarImagen/:id", requireAuth, Den.agregarDenunciaImagen)
router.post("/DenunciarComentario/:id", requireAuth, Den.agregarDenunciaComentario)
router.get("/DenunciasComentarios", requireAuth, Den.verDenunciasComentarios)
router.post("/eliminarComentarioDenunciado/:id", requireAuth, Den.eliminarComentarioDenunciado)
router.get("/VerDenunciasComentarios", requireAuth, Den.verDenunciasComentarios)
router.get("/DenunciasImagenes", requireAuth, Den.verDenunciasImagenes)


export default router;