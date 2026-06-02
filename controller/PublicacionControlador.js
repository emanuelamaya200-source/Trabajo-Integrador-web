import Publicacion from '../modelos/Publicacion.js';
import { Imagen } from '../modelos/Imagen.js';
import { Comentario } from '../modelos/Comentario.js';

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

        const jsonFormateado = JSON.stringify(fila, null, 2)
        console.log(jsonFormateado)

        res.render("Publicaciones/busqueda", { busqueda, cantidad, publicaciones: fila });
    } catch (err) {
        console.error("error", err);
        res.status(500).send("error al buscar");
    }
};

export const verUnaPublicacion = async (req, res) => {
    try {
        const { id } = req.params;
        const objeto = await Publicacion.buscarUnaPublicacion(id);

        if (!objeto) {
            return res.status(404).send("Publicación no encontrada");
        }
        const objetoJSON = objeto.toJSON();
        console.log(objetoJSON);

        res.render("Publicaciones/publicacion", { objetoJSON });
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

        await Comentario.create({ 
            contenido, 
            post_id, 
            user_id 
        });

        return res.redirect(`/verPublicacion/${post_id}`);
    } catch (error) {
        console.error(error);
        if (post_id) {
            return res.redirect(`/verPublicacion/${post_id}`);
        }
        return res.redirect('back');
    }
};