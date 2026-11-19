import express from 'express';
import * as controller from '../controller/PublicacionControlador.js';
import * as interacciones from '../controller/InteraccionesControlador.js';
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
router.post("/cambiarEstadoComentarios", requireAuth, controller.cambiarEstadoComentarios);

//crear valoracion
router.post("/crearValoracion",requireAuth,controller.crearValoracion)

router.post("/alternarFavorito/:id", requireAuth, interacciones.cambiarFavorito);
router.get("/misFavoritos", requireAuth, interacciones.verFavoritos);
router.post("/comprarPublicacion/:id", requireAuth, interacciones.comprarPublicacion);
router.get("/misCompras", requireAuth, interacciones.verCompras);

router.get("/misColecciones", requireAuth, interacciones.verColecciones);
router.post("/crearColeccion", requireAuth, interacciones.crearColeccion);
router.get("/coleccion/:id", interacciones.verColeccion);
router.post("/agregarPublicacionColeccion", requireAuth, interacciones.agregarPublicacionColeccion);
router.post("/quitarPublicacionColeccion", requireAuth, interacciones.quitarPublicacionColeccion);

export default router;