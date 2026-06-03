import Publicacion from '../modelos/Publicacion.js';
import { Imagen } from '../modelos/Imagen.js';
import { Comentario } from '../modelos/Comentario.js';
import { Usuario } from '../modelos/Usuario.js';

export const mostrarFormulario = (req, res) => {
    res.render("Publicaciones/crearPubli");
};

export const crearPublicacion = async (req, res) => {
    try {
        const { imagenes, titulo, descripcion, etiquetas } = req.body;
        const publicacion = await Publicacion.crearPublicacion(titulo, descripcion, etiquetas);
        
        if (imagenes) {
            for (const element of imagenes) {
                await Imagen.crearImagen(publicacion.id, element.base64, element.copyright, element.licencia);
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
        const { cantidad, fila } = await Publicacion.buscarPublicacionesTodo(busqueda);

        const jsonFormateado = JSON.stringify(fila, null, 2);
        console.log(jsonFormateado);

        res.render("Publicaciones/busqueda", { busqueda, cantidad, publicaciones: fila });
    } catch (err) {
        console.error("error", err);
        res.status(500).send("error al buscar");
    }
};

export const verUnaPublicacion = async (req, res) => {
    try {
        const { id } = req.params;
        const publicacion = await Publicacion.buscarUnaPublicacion(id);

        if (!publicacion) {
            return res.status(404).send("Publicación no encontrada");
        }
        const prettyString = JSON.stringify(publicacion, null, 2);
        const publicacionJSON = publicacion.toJSON();
        if (!publicacionJSON.imagenes || publicacionJSON.imagenes.length === 0) {
            return res.render("Publicaciones/publicacion", {publicacionJSON});
        }
        console.log(prettyString);
        return res.render("Publicaciones/publicacion", {   
            objetoJSON: publicacionJSON
        });

    } catch (err) {
        console.error("Error crítico al cargar la publicación completa:", err);
        return res.status(500).send("Error interno del servidor");
    }
};

export const crearComentario = async (req, res) => {
    const { post_id, imagen_id, contenido } = req.body; 

    try {
        if (!req.session || !req.session.usuario) {
            return res.status(401).send("Debes iniciar sesión para comentar");
        }
        const usuarioId = req.session.usuario.id;
        await Comentario.crearComentario(imagen_id, usuarioId, contenido);
        return res.redirect(`/verPublicacion/${post_id}`);
    } catch (error) {
        console.error("Error crítico en el controlador crearComentario:", error);
        if (post_id) {
            return res.redirect(`/verPublicacion/${post_id}`);
        }      
        return res.redirect("/");
    }
};