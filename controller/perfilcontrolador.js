import session from 'express-session';
import { Usuario } from '../modelos/Usuario.js';
import {Publicacion} from "../modelos/Publicacion.js"
import { Imagen } from '../modelos/Imagen.js';
import { Etiqueta } from '../modelos/Etiqueta.js';
import { Seguidor } from '../modelos/Seguidor.js';
import { Notificacion } from '../modelos/Notificacion.js';
import e from 'express';

export const mostrarPerfil = async (req, res) => {
    try {
        const idPerfil = req.params.id;
        const data = await Usuario.devolverPerfil(idPerfil);
        
        if (!data) {
            return res.status(404).send("Usuario no encontrado");
        }
        const esMiPerfil = req.session.usuario && req.session.usuario.id == idPerfil;
        const yaSigue = req.session.usuario && (data.seguidores || []).some(
            (seguidor) => Number(seguidor.id) === Number(req.session.usuario.id)
        );

        console.log(JSON.stringify(data, null, 2));
        res.render("perfil", { 
            usuario: data, 
            esMiPerfil: esMiPerfil,
            yaSigue,
        }); 
        
    } catch (error) {
        console.log("Error al cargar perfil:", error);
        res.status(500).send("Error interno del servidor");
    }
};

export const cambiarFotoDePerfil = async (req, res) => {
    try {
        const { imagen } = req.body; 
        const id = req.session.usuario.id;
        let usuario = await Usuario.findByPk(id);

        if (!usuario) {
            return res.status(404).send("Usuario no encontrado");
        }
        usuario.foto_de_perfil = imagen; 
        await usuario.save();
        res.sendStatus(200);

    } catch (error) {
        console.log("error al cambiar la foto de perfil", error);
        res.status(500).send("Error interno del servidor");
    }
};

export const seguirUsuario = async (req, res) => {
    try {
        const { id } = req.params; 
        const miId = req.session.usuario.id; 

        const userAAgregar = await Usuario.findByPk(id);
        const miUsuario = await Usuario.findByPk(miId);
        
        if (!userAAgregar || !miUsuario) {
            return res.status(404).send("Usuario no encontrado");
        }
        if (Number(id) === Number(miId)) {
            return res.status(400).send("No podés seguirte a vos mismo");
        }

        const yaSigue = await Seguidor.findOne({
            where: { seguidor_id: miId, seguido_id: id },
        });
        if (yaSigue) {
            return res.redirect(`/perfil/${id}`);
        }

        await userAAgregar.addSeguidores(miId);
        await Notificacion.create({
            usuario_id: id,
            texto: `${miUsuario.username} empezó a seguirte`,
            enlace: `/perfil/${miId}`,
        });
        res.sendStatus(200); 
    } catch (error) {
        console.log("error al seguir usuario", error);
        res.status(500).send("Error interno");
    }
};

export const dejarDeSeguirUsuario = async (req, res) => {
    try {
        const seguidoId = Number(req.params.id);
        const usuarioId = req.session.usuario.id;

        if (!Number.isInteger(seguidoId) || seguidoId <= 0 ||
            seguidoId === Number(usuarioId)) {
            return res.status(400).send("Usuario no válido");
        }

        await Seguidor.destroy({
            where: { seguidor_id: usuarioId, seguido_id: seguidoId },
        });

        return res.redirect(`/perfil/${seguidoId}`);
    } catch (error) {
        console.error("Error al dejar de seguir usuario:", error);
        return res.status(500).send("No se pudo dejar de seguir al usuario");
    }
};

export const verNotificaciones = async (req, res) => {
    try {
        const notificaciones = await Notificacion.findAll({
            where: { usuario_id: req.session.usuario.id },
            order: [["createdAt", "DESC"]],
        });

        return res.render("notificaciones", { notificaciones });
    } catch (error) {
        console.error("Error al cargar las notificaciones:", error);
        return res.status(500).send("No se pudieron cargar las notificaciones");
    }
};

export const marcarNotificacionLeida = async (req, res) => {
    try {
        const notificacion = await Notificacion.findOne({
            where: {
                id: req.params.id,
                usuario_id: req.session.usuario.id,
            },
        });

        if (!notificacion) {
            return res.status(404).send("Notificación no encontrada");
        }

        notificacion.leida = true;
        await notificacion.save();
        return res.redirect("/notificaciones");
    } catch (error) {
        console.error("Error al marcar notificación como leída:", error);
        return res.status(500).send("No se pudo actualizar la notificación");
    }
};

export const verContenidoSeguidos = async (req, res) => {
    try {
        const seguidos = await Seguidor.findAll({
            where: { seguidor_id: req.session.usuario.id },
            attributes: ["seguido_id"],
        });
        const idsSeguidos = seguidos.map((seguidor) => seguidor.seguido_id);

        let publicaciones = [];
        if (idsSeguidos.length > 0) {
            publicaciones = await Publicacion.findAll({
                where: {
                    usuario_id: idsSeguidos,
                    estado: true,
                    bloqueada_por_denuncia: false,
                },
                include: [
                    { model: Imagen, as: "imagenes" },
                    {
                        model: Etiqueta,
                        as: "etiquetas",
                        through: { attributes: [] },
                    },
                    {
                        model: Usuario,
                        as: "creador",
                        attributes: ["id", "username", "foto_de_perfil"],
                    },
                ],
                order: [["createdAt", "DESC"]],
            });
        }

        return res.render("contenidoSeguidos", { publicaciones });
    } catch (error) {
        console.error("Error al cargar el contenido de seguidos:", error);
        return res.status(500).send("No se pudo cargar el contenido de seguidos");
    }
};

export const cargarExplorar = async (req, res) => {
    try {
        const usuarioLogueado = Boolean(req.session && req.session.usuario);
        const publicaciones = await Publicacion.findAll({
            where: { estado: true, bloqueada_por_denuncia: false },
            include: [
                {
                    model: Imagen,
                    as: 'imagenes',
                    attributes: ['Precio'],
                    where: usuarioLogueado ? undefined : { copyrigth: false },
                    required: !usuarioLogueado,
                },
                {
                    model: Usuario,
                    as: 'creador',
                    attributes: ['username', 'foto_de_perfil']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.render("explorar", {
            publicaciones: publicaciones
        });

    } catch (error) {
        console.log("error al cargar el explorador", error);
        res.status(500).send("Error interno");
    }
};

export const eliminarSession = (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.log("Error al destruir la sesión:", error);
            return res.status(500).json({ error: "No se pudo cerrar la sesión" });
        }  
        res.clearCookie('connect.sid');
        return res.json({ mensaje: 'Sesión destruida con éxito' });
    });
}