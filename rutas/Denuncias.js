import { requireAuth } from "../controller/autenticador.js";
import express from "express";
import {
    agregarDenunciaComentario,
    agregarDenunciaImagen,
    eliminarComentarioDenunciado,
    verDenunciasComentarios,
    verDenunciasImagenes,
} from "../controller/Denunciascontrolador.js";

const router = express.Router();

router.post("/denunciarImagen", requireAuth, agregarDenunciaImagen);
router.post("/denunciarComentario", requireAuth, agregarDenunciaComentario);
router.get("/denunciasComentarios", requireAuth, verDenunciasComentarios);
router.get("/misDenunciasComentarios", requireAuth, verDenunciasComentarios);
router.get("/denunciasImagenes", requireAuth, verDenunciasImagenes);
router.post("/eliminarComentarioDenunciado", requireAuth, eliminarComentarioDenunciado);

export default router;