import { requireAuth } from "../controller/autenticador.js";
import express from "express";
import {
    agregarDenunciaComentario,
    agregarDenunciaImagen,
    eliminarComentarioDenunciado,
    resolverDenunciaComentario,
    resolverDenunciaImagen,
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
router.post("/resolverDenunciaComentario", requireAuth, resolverDenunciaComentario);
router.post("/resolverDenunciaImagen", requireAuth, resolverDenunciaImagen);

export default router;