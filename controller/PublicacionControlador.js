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

        const publicacionJSON = publicacion.toJSON();
        let listaComentarios = [];

        if (publicacionJSON.imagenes && publicacionJSON.imagenes.length > 0) {
            
            const promesasComentarios = publicacionJSON.imagenes.map(imagen => 
                Comentario.buscarComentarios(imagen.id)
            );

            const resultadosMetodo = await Promise.all(promesasComentarios);
            listaComentarios = resultadosMetodo
                .filter(resultado => resultado && resultado.length > 0) 
                .flatMap(comentariosPorImagen => 
                    comentariosPorImagen.map(comentario => comentario.toJSON())
                );
        }

        console.log(`--- COMENTARIOS TOTALES CARGADOS (${listaComentarios.length}) ---`);

        return res.render("Publicaciones/publicacion", { 
            objetoJSON: publicacionJSON, 
            comentarios: listaComentarios 
        });

    } catch (err) {
        console.error("Error crítico al cargar la publicación completa:", err);
        return res.status(500).send("Error interno del servidor");
    }
};

export const crearComentario = async (req, res) => {
    let {post_id, imagen_id }= req.body; 
    try {
        const { contenido } = req.body;
        const user_id = req.session.usuario.id;
        
        await Comentario.crearComentario(imagen_id, user_id, contenido);

        return res.redirect(`/verPublicacion/${post_id}`);
    } catch (error) {
        console.error("Error en el controlador crearComentario:", error);
        if (post_id) {
            return res.redirect(`/verPublicacion/${post_id}`);
        }
        return res.redirect('back');
    }
};