import Publicacion from '../modelos/Publicacion.js';
import { Imagen } from '../modelos/Imagen.js';
import { Comentario } from '../modelos/Comentario.js';
import { Usuario } from '../modelos/Usuario.js';
import { Valoracion } from '../modelos/Valoracion.js';
import { UniqueConstraintError } from 'sequelize';

export const mostrarFormulario = (req, res) => {
    res.render("Publicaciones/crearPubli");
};

export const crearPublicacion = async (req, res) => {
    try {
        const { imagenes, titulo, descripcion, etiquetas } = req.body;
        for (const imagen of imagenes || []) {
            if (imagen.precio !== null && imagen.precio !== undefined &&
                (!Number.isInteger(imagen.precio) || imagen.precio < 0)) {
                return res.status(400).json({ ok: false, error: "El precio debe ser un mayor a 0" });
            }
        }
        const user_id = req.session.usuario.id
        const publicacion = await Publicacion.crearPublicacion(titulo, descripcion, etiquetas,user_id);
        
        if (imagenes) {
            for (const element of imagenes) {
                await Imagen.crearImagen(publicacion.id, element.base64, element.copyright, element.licencia, element.precio);
            }
        }
        return res.status(200).json({ ok: true });
        
    } catch (err) {
        console.log(err);
        res.status(500).send("Error en el lado del servidor");
    }
};

export const buscarPublicaciones = async (req, res) => {
    try {
        const { busqueda } = req.params;
        const usuarioLogueado = Boolean(req.session && req.session.usuario);
        const { cantidad, fila } = await Publicacion.buscarPublicacionesTodo(busqueda, usuarioLogueado);

        res.render("Publicaciones/busqueda", { busqueda, cantidad, publicaciones: fila });
    } catch (err) {
        console.error("error", err);
        res.status(500).send("error al buscar");
    }
};

export const verUnaPublicacion = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioLogueado = Boolean(req.session && req.session.usuario);
        const publicacion = await Publicacion.buscarUnaPublicacion(id, usuarioLogueado);

        if (!publicacion) {
            return res.status(404).send("Publicación no encontrada");
        }

        const publicacionJSON = publicacion.toJSON();

        if (!usuarioLogueado) {
            publicacionJSON.imagenes = (publicacionJSON.imagenes || []).filter((imagen) => imagen.copyrigth === false);
        }

        const valorizaciones = publicacionJSON.imagenes 
            ? publicacionJSON.imagenes.map(img => img.valoraciones || [])
            : [];

        return res.render("Publicaciones/publicacion", {   
            objetoJSON: publicacionJSON, 
            valorizacionesArreglo: valorizaciones
        });

    } catch (err) {
        console.error("Error crítico al cargar la publicación completa:", err);
        return res.status(500).send("Error interno del servidor");
    }
};

export const crearComentario = async (req, res) => {
    try {
        const { post_id, imagen_id, contenido } = req.body;
        const usuarioId = req.session.usuario.id;
        const publicacionId = Number(post_id);
        const imagenId = Number(imagen_id);
        const contenidoNormalizado = typeof contenido === "string" ? contenido.trim() : "";

        if (!Number.isInteger(publicacionId) || publicacionId <= 0 ||
            !Number.isInteger(imagenId) || imagenId <= 0 ||
            !contenidoNormalizado || contenidoNormalizado.length > 255) {
            return res.status(400).send("El comentario no es válido");
        }

        const imagen = await Imagen.findByPk(imagenId);
        if (!imagen) {
            return res.status(404).send("Imagen no encontrada");
        }
        if (Number(imagen.post_id) !== publicacionId) {
            return res.status(400).send("La imagen no pertenece a esta publicación");
        }

        if (!imagen.comentarios_permitidos) {
            return res.status(403).send("El autor cerró los comentarios de esta imagen");
        }

        await Comentario.crearComentario(imagenId, usuarioId, contenidoNormalizado);
        return res.redirect(`/verPublicacion/${publicacionId}`);
    } catch (error) {
        console.error("Error al crearComentario:", error);
        return res.status(500).send("No se pudo crear el comentario");
    }
};

export const cambiarEstadoComentarios = async (req, res) => {
    try {
        const publicacionId = Number(req.body.post_id);
        const imagenId = Number(req.body.imagen_id);
        if (!Number.isInteger(publicacionId) || publicacionId <= 0 ||
            !Number.isInteger(imagenId) || imagenId <= 0) {
            return res.status(400).send("Publicación o imagen no válida");
        }

        const publicacion = await Publicacion.findByPk(publicacionId);
        if (!publicacion) {
            return res.status(404).send("Publicación no encontrada");
        }

        if (Number(publicacion.usuario_id) !== Number(req.session.usuario.id)) {
            return res.status(403).send("Solo el autor puede cambiar los comentarios");
        }

        const imagen = await Imagen.findByPk(imagenId);
        if (!imagen || Number(imagen.post_id) !== publicacionId) {
            return res.status(400).send("La imagen no pertenece a esta publicación");
        }

        imagen.comentarios_permitidos = !imagen.comentarios_permitidos;
        await imagen.save();
        return res.redirect(`/verPublicacion/${publicacion.id}`);
    } catch (error) {
        console.error("Error al cambiar el estado de los comentarios:", error);
        return res.status(500).send("No se pudo actualizar el estado de los comentarios");
    }
};

export const crearValoracion = async (req, res) => {
  try {
    const { valor, imagen_id, post_id } = req.body;
    const usuarioId = req.session.usuario.id;
    const imagenId = Number(imagen_id);
    const puntaje = Number(valor);
    const publicacionId = Number(post_id);

    if (!Number.isInteger(imagenId) || imagenId <= 0 ||
        !Number.isInteger(puntaje) || puntaje < 1 || puntaje > 10 ||
        !Number.isInteger(publicacionId) || publicacionId <= 0) {
      return res.status(400).send("Datos de valoración inválidos");
    }

    const imagen = await Imagen.findByPk(imagenId);
    if (!imagen || Number(imagen.post_id) !== publicacionId) {
      return res.status(400).send("La imagen no pertenece a esta publicación");
    }

    await Valoracion.crearValoracion(imagenId, usuarioId, puntaje);
    return res.redirect(`/verPublicacion/${post_id}`);

  } catch (error) {
    if (error.code === "AUTOR_NO_PUEDE_VALORAR") {
      return res.status(403).send(error.message);
    }
    if (error.code === "VALORACION_DUPLICADA" || error instanceof UniqueConstraintError) {
      return res.status(409).send("Ya valoraste esta imagen");
    }
    if (error.code === "IMAGEN_NO_ENCONTRADA" || error.code === "PUBLICACION_NO_ENCONTRADA") {
      return res.status(404).send(error.message);
    }
    if (error.code === "VALORACION_INVALIDA") {
      return res.status(400).send(error.message);
    }
    console.error("Error en el controlador crearValoracion:", error);
    return res.status(500).send("Error interno al procesar la valoración");
  }
};