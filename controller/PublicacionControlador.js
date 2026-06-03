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
        
        // CORREGIDO: Si tienes el ID del usuario en la sesión, pásalo aquí si tu método lo acepta
        // const usuario_id = req.session.usuario?.id;
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
        
        // 1. Traemos la publicación (con sus imágenes y etiquetas)
        const objeto = await Publicacion.buscarUnaPublicacion(id);

        if (!objeto) {
            return res.status(404).send("Publicación no encontrada");
        }
        
        // Convertimos la publicación a JSON limpio primero
        const objetoJSON = objeto.toJSON();

        // 2. REPARADO: Buscamos los comentarios usando el ID de la IMAGEN, no del POST
        let comentariosJSON = [];
        if (objetoJSON.imagenes && objetoJSON.imagenes.length > 0) {
            // Agarramos el id de la primera imagen vinculada a este post
            const imagenId = objetoJSON.imagenes[0].id; 
            const comentariosData = await Comentario.buscarComentarios(imagenId);
            
            // Nos aseguramos de mapearlo de forma segura
            comentariosJSON = comentariosData ? comentariosData.map(c => c.toJSON()) : [];
        }
        
        // Consolas de control para verificar en terminal
        console.log("--- PUBLICACION ---", JSON.stringify(objetoJSON, null, 2));
        console.log("--- COMENTARIOS DE LA IMAGEN ---", JSON.stringify(comentariosJSON, null, 2));

        // Enviamos los dos objetos limpios a la vista de Pug
        res.render("Publicaciones/publicacion", { 
            objetoJSON, 
            comentarios: comentariosJSON 
        });

    } catch (err) {
        console.error("Error al cargar la publicación:", err);
        res.status(500).send("Error interno del servidor");
    }
};

export const crearComentario = async (req, res) => {
    let post_id = req.body.post_id; 
    try {
        const { contenido } = req.body;
        const user_id = req.session.usuario.id;
        
        // NOTA: Asegúrate de que desde el formulario Pug estés mandando el ID de la IMAGEN 
        // en el campo req.body.post_id, o cámbiale el nombre a imagen_id para que sea claro.
        await Comentario.crearComentario(post_id, user_id, contenido);

        return res.redirect(`/verPublicacion/${post_id}`);
    } catch (error) {
        console.error("Error en el controlador crearComentario:", error);
        if (post_id) {
            return res.redirect(`/verPublicacion/${post_id}`);
        }
        return res.redirect('back');
    }
};