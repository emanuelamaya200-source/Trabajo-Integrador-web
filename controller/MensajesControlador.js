import { Op } from "sequelize";
import { Mensaje } from "../modelos/Mensaje.js";
import { Notificacion } from "../modelos/Notificacion.js";
import { Usuario } from "../modelos/Usuario.js";

export const verMensajes = async (req, res) => {
    try {
        const usuarioId = req.session.usuario.id;
        const mensajes = await Mensaje.findAll({
            where: {
                [Op.or]: [
                    { emisor_id: usuarioId },
                    { receptor_id: usuarioId },
                ],
            },
            order: [["createdAt", "DESC"]],
        });

        const idsContactos = [];
        for (const mensaje of mensajes) {
            const contactoId = Number(mensaje.emisor_id) === Number(usuarioId)
                ? mensaje.receptor_id
                : mensaje.emisor_id;
            if (!idsContactos.includes(Number(contactoId))) {
                idsContactos.push(Number(contactoId));
            }
        }

        const contactos = idsContactos.length
            ? await Usuario.findAll({
                where: { id: idsContactos },
                attributes: ["id", "username", "foto_de_perfil"],
            })
            : [];

        return res.render("mensajes", { contactos });
    } catch (error) {
        console.error("Error al cargar los mensajes:", error);
        return res.status(500).send("No se pudieron cargar los mensajes");
    }
};

export const verConversacion = async (req, res) => {
    try {
        const contactoId = Number(req.params.id);
        const usuarioId = Number(req.session.usuario.id);
        if (!Number.isInteger(contactoId) || contactoId <= 0 || contactoId === usuarioId) {
            return res.status(400).send("Usuario no válido");
        }

        const contacto = await Usuario.findByPk(contactoId, {
            attributes: ["id", "username"],
        });
        if (!contacto) {
            return res.status(404).send("Usuario no encontrado");
        }

        const mensajes = await Mensaje.findAll({
            where: {
                [Op.or]: [
                    { emisor_id: usuarioId, receptor_id: contactoId },
                    { emisor_id: contactoId, receptor_id: usuarioId },
                ],
            },
            order: [["createdAt", "ASC"]],
        });

        return res.render("conversacion", { contacto, mensajes });
    } catch (error) {
        console.error("Error al cargar la conversación:", error);
        return res.status(500).send("No se pudo cargar la conversación");
    }
};

export const enviarMensaje = async (req, res) => {
    try {
        const contactoId = Number(req.params.id);
        const usuarioId = Number(req.session.usuario.id);
        const texto = typeof req.body.texto === "string" ? req.body.texto.trim() : "";

        if (!Number.isInteger(contactoId) || contactoId <= 0 ||
            contactoId === usuarioId || !texto || texto.length > 1000) {
            return res.status(400).send("El mensaje no es válido");
        }

        const contacto = await Usuario.findByPk(contactoId);
        if (!contacto) {
            return res.status(404).send("Usuario no encontrado");
        }

        await Mensaje.create({
            emisor_id: usuarioId,
            receptor_id: contactoId,
            texto,
        });
        await Notificacion.create({
            usuario_id: contactoId,
            texto: `Tenés un mensaje nuevo de ${req.session.usuario.username}`,
            enlace: `/mensajes/${usuarioId}`,
        });

        return res.redirect(`/mensajes/${contactoId}`);
    } catch (error) {
        console.error("Error al enviar el mensaje:", error);
        return res.status(500).send("No se pudo enviar el mensaje");
    }
};
