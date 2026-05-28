import express from 'express';
import * as controller from '../controller/PublicacionControlador.js';

const router = express.Router();

//crear publicacion
router.get("/CrearPublicacion", controller.mostrarFormulario);
router.post("/CrearPublicacion", controller.crearPublicacion);
//buscar publicacion
router.get("/Buscar/:busqueda", controller.buscarPublicaciones);
//ver una sola publicacion
router.get("/verPublicacion/:id",controller.verUnaPublicacion)


export default router;