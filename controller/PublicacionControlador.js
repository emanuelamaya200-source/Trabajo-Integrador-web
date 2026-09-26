import Publicacion from '../modelos/Publicacion.js';
import { Imagen } from '../modelos/Imagen.js';
import { Comentario } from '../modelos/Comentario.js';
import { Usuario } from '../modelos/Usuario.js';
import { Valoracion } from '../modelos/Valoracion.js';
import session from 'express-session';

export const mostrarFormulario = (req, res) => {
    res.render("Publicaciones/crearPubli");
};

export const crearPublicacion = async (req, res) => {
    try {
        const { imagenes, titulo, descripcion, etiquetas } = req.body;
        for (const imagen of imagenes || []) {
            if (imagen.precio !== null && imagen.precio !== undefined &&
                (!Number.isInteger(imagen.precio) || imagen.precio < 0)) {
                return res.status(400).json({ ok: false, error: "El precio debe ser un entero no negativo" });
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

        const objetostring = JSON.stringify(publicacionJSON,null,2)
        console.log(publicacionJSON);

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
    const { post_id, imagen_id, contenido } = req.body; 

    try {
        const usuarioId = req.session.usuario.id;
        const Publicacion = Publicacion.findByPk(post_id);
        if(publicacion.comentarios_permitidos){
            await Comentario.crearComentario(imagen_id, usuarioId, contenido);
            return res.redirect(`/verPublicacion/${post_id}`);
        }else{
            if (post_id) {
                console.error("Comentarios Desactivados", error);
                return res.redirect(`/verPublicacion/${post_id}`);               
            }
            //por si acaso no hay id
            return res.redirect("/");
        }
    } catch (error) {
        console.error("Error al crearComentario:", error);
        if (post_id) {
            return res.redirect(`/verPublicacion/${post_id}`);
        }
        //por si acaso no hay id      
        return res.redirect("/");
    }
};

export const desactivarComentarios = async (req,res) =>{
    try{
    const {post_id} = req.body;
    const PublicacionACambiar = Publicacion.findByPk(post_id);
    await PublicacionACambiar.reload();
    PublicacionACambiar.comentariosPermitidos = false;
    PublicacionACambiar.save();
    }catch(error){

    }
    
}

export const crearValoracion = async (req, res) => {
  try {
    const { valor, imagen_id, post_id } = req.body;
    const usuarioId = req.session.usuario.id;
    await Valoracion.crearValoracion(imagen_id, usuarioId, valor);
    return res.redirect(`/verPublicacion/${post_id}`);

  } catch (error) {
    console.error("Error en el controlador crearValoracion:", error);
    return res.status(500).send("Error interno al procesar la valoración");
  }
};