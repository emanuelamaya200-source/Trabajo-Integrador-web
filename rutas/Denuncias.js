import { requireAuth } from "../controller/autenticador.js";
import express from "express";
import {
    agregarDenunciaComentario,
    agregarDenunciaImagen,
    agregarDenunciaUsuario,
    eliminarComentarioDenunciado,
    resolverDenunciaComentario,
    resolverDenunciaImagen,
    resolverDenunciaUsuario,
    verDenunciasComentarios,
    verDenunciasImagenes,
    verDenunciasUsuarios,
} from "../controller/Denunciascontrolador.js";

const router = express.Router();

router.post("/denunciarImagen", requireAuth, agregarDenunciaImagen);
router.post("/denunciarComentario", requireAuth, agregarDenunciaComentario);
router.post("/denunciarUsuario", requireAuth, agregarDenunciaUsuario);
router.get("/denunciasComentarios", requireAuth, verDenunciasComentarios);
router.get("/misDenunciasComentarios", requireAuth, verDenunciasComentarios);
router.get("/denunciasImagenes", requireAuth, verDenunciasImagenes);
router.get("/denunciasUsuarios", requireAuth, verDenunciasUsuarios);
router.post("/eliminarComentarioDenunciado", requireAuth, eliminarComentarioDenunciado);
router.post("/resolverDenunciaComentario", requireAuth, resolverDenunciaComentario);
router.post("/resolverDenunciaImagen", requireAuth, resolverDenunciaImagen);
router.post("/resolverDenunciaUsuario", requireAuth, resolverDenunciaUsuario);

export default router;