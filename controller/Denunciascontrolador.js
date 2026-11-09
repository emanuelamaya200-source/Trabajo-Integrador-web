import { UniqueConstraintError } from "sequelize";
import { sequelize } from "../conexion.js";
import { Denuncia_imagen } from "../modelos/Denuncia_imagen.js";
import { Denuncia_comentario } from "../modelos/Denuncia_comentario.js";
import { Imagen } from "../modelos/Imagen.js";
import { Publicacion } from "../modelos/Publicacion.js";
import { Comentario } from "../modelos/Comentario.js";
import { Usuario } from "../modelos/Usuario.js";

const motivosPermitidos = new Set(["Copyright", "Inapropiado"]);

export const agregarDenunciaImagen = async (req, res) => {
    try {
        const { imagen_id, descripcion, motivo } = req.body;
        const usuario_id = req.session.usuario.id;
        const imagenId = Number(imagen_id);
        const descripcionNormalizada = typeof descripcion === "string" ? descripcion.trim() : "";

        if (!Number.isInteger(imagenId) || imagenId <= 0 ||
            !descripcionNormalizada || !motivosPermitidos.has(motivo)) {
            return res.status(400).send("Faltan datos para realizar la denuncia");
        }

        const imagen = await Imagen.findByPk(imagenId);
        if (!imagen) {
            return res.status(404).send("Imagen no encontrada");
        }

        await sequelize.transaction(async (transaction) => {
            await Denuncia_imagen.crearDenuncia(
                imagen.id,
                usuario_id,
                descripcionNormalizada,
                motivo,
                { transaction }
            );
            // Bloquear la publicacion para que el autor no pueda modificarla.
            await Publicacion.bloquearPorDenuncia(imagen.post_id, { transaction });
            // Con mas de tres denuncias de usuarios distintos, se envia a validar la publicacion.
            await Denuncia_imagen.verSiTieneTresDenuncias(imagen.id, { transaction });
        });

        return res.redirect(`/verPublicacion/${imagen.post_id}`);
    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            return res.status(409).send("Ya denunciaste esta imagen");
        }
        console.error("Error al crear la denuncia de imagen:", error);
        return res.status(500).send("No se pudo crear la denuncia");
    }
};

const motivosDenunciaComentario = ["Inapropiado", "Spam", "Ofensivo", "Otro"];

export const agregarDenunciaComentario = async (req, res) => {
    try {
        const comentarioId = Number(req.body.comentario_id);
        const motivo = req.body.motivo;
        const descripcion = String(req.body.descripcion || "").trim();
        const usuarioId = req.session.usuario.id;

        if (!Number.isInteger(comentarioId) || comentarioId <= 0 ||
            !motivosDenunciaComentario.includes(motivo) || !descripcion || descripcion.length > 255) {
            return res.status(400).send("Completá un motivo y una descripción válida");
        }

        const comentario = await Comentario.findByPk(comentarioId, {
            include: [{
                model: Imagen,
                as: "imagen",
            }],
        });

        if (!comentario || !comentario.imagen) {
            return res.status(404).send("Comentario no encontrado");
        }

        if (Number(comentario.user_id) === Number(usuarioId)) {
            return res.status(403).send("No podés denunciar tu propio comentario");
        }

        await Denuncia_comentario.create({
            post_id: comentario.imagen.post_id,
            user_id: usuarioId,
            comentario_id: comentario.id,
            contenido: comentario.contenido,
            description: descripcion,
            motivo,
        });

        return res.redirect(`/verPublicacion/${comentario.imagen.post_id}`);
    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            return res.status(409).send("Ya denunciaste este comentario");
        }
        console.error("Error al denunciar comentario:", error);
        return res.status(500).send("No se pudo denunciar el comentario");
    }
};

export const verDenunciasComentarios = async (req, res) => {
    try {
        const denuncias = await Denuncia_comentario.findAll({
            where: { estado: true },
            include: [
                {
                    model: Comentario,
                    as: "comentario",
                    where: { user_id: req.session.usuario.id },
                    include: [{
                        model: Usuario,
                        as: "usuario",
                        attributes: ["id", "username"],
                    }],
                },
                {
                    model: Publicacion,
                    as: "publicacion",
                    attributes: ["id", "titulo"],
                },
                {
                    model: Usuario,
                    as: "denunciante",
                    attributes: ["id", "username"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        return res.render("Publicaciones/denunciasComentarios", { denuncias });
    } catch (error) {
        console.error("Error al cargar las denuncias de comentarios:", error);
        return res.status(500).send("No se pudieron cargar las denuncias");
    }
};

export const eliminarComentarioDenunciado = async (req, res) => {
    try {
        const denunciaId = Number(req.body.denuncia_id);
        if (!Number.isInteger(denunciaId) || denunciaId <= 0) {
            return res.status(400).send("Denuncia no válida");
        }

        const denuncia = await Denuncia_comentario.findByPk(denunciaId);

        if (!denuncia) {
            return res.status(404).send("Denuncia no encontrada");
        }

        const comentario = await Comentario.findByPk(denuncia.comentario_id);
        if (!comentario) {
            return res.status(404).send("Comentario no encontrado");
        }

        if (Number(comentario.user_id) !== Number(req.session.usuario.id)) {
            return res.status(403).send("Solo el autor del comentario puede borrarlo");
        }

        await Denuncia_comentario.destroy({
            where: { comentario_id: denuncia.comentario_id },
        });
        await comentario.destroy();

        return res.redirect("/misDenunciasComentarios");
    } catch (error) {
        console.error("Error al eliminar comentario denunciado:", error);
        return res.status(500).send("No se pudo eliminar el comentario");
    }
};
