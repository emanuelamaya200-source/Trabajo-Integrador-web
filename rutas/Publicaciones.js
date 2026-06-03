import express from 'express';
import * as controller from '../controller/PublicacionControlador.js';
import { requireAuth } from '../controller/autenticador.js';

const router = express.Router();

//crear publicacion
router.get("/CrearPublicacion", requireAuth, controller.mostrarFormulario);
router.post("/CrearPublicacion", requireAuth, controller.crearPublicacion);

//buscar publicacion
router.get("/Buscar/:busqueda", controller.buscarPublicaciones);

//ver una sola publicacion
router.get("/verPublicacion/:id", controller.verUnaPublicacion);

//crear comentario
router.post("/crearComentario", requireAuth, controller.crearComentario);

export default router;