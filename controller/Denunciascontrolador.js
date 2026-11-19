import { UniqueConstraintError } from "sequelize";
import { sequelize } from "../conexion.js";
import { Denuncia_imagen } from "../modelos/Denuncia_imagen.js";
import { Denuncia_comentario } from "../modelos/Denuncia_comentario.js";
import { Denuncia_usuario } from "../modelos/Denuncia_usuario.js";
import { Imagen } from "../modelos/Imagen.js";
import { Publicacion } from "../modelos/Publicacion.js";
import { Comentario } from "../modelos/Comentario.js";
import { Usuario } from "../modelos/Usuario.js";

const motivosPermitidos = new Set(["Copyright", "Inapropiado"]);
const motivosDenunciaUsuario = ["Acoso", "Spam", "Suplantación", "Otro"];

export const agregarDenunciaUsuario = async (req, res) => {
    try {
        const usuarioDenunciadoId = Number(req.body.usuario_id);
        const usuarioDenuncianteId = req.session.usuario.id;
        const motivo = req.body.motivo;
        const descripcion = String(req.body.descripcion || "").trim();

        if (!Number.isInteger(usuarioDenunciadoId) || usuarioDenunciadoId <= 0 ||
            !motivosDenunciaUsuario.includes(motivo) || !descripcion || descripcion.length > 255) {
            return res.status(400).send("Completá los datos de la denuncia");
        }

        if (Number(usuarioDenunciadoId) === Number(usuarioDenuncianteId)) {
            return res.status(400).send("No podés denunciar tu propio usuario");
        }

        const usuarioDenunciado = await Usuario.findByPk(usuarioDenunciadoId);
        if (!usuarioDenunciado) {
            return res.status(404).send("Usuario no encontrado");
        }

        await Denuncia_usuario.create({
            user_id: usuarioDenunciadoId,
            denunciante_id: usuarioDenuncianteId,
            contenido: usuarioDenunciado.username,
            description: descripcion,
            motivo,
        });

        return res.redirect(`/perfil/${usuarioDenunciadoId}`);
    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            return res.status(409).send("Ya denunciaste a este usuario");
        }
        console.error("Error al denunciar usuario:", error);
        return res.status(500).send("No se pudo crear la denuncia");
    }
};

export const verDenunciasUsuarios = async (req, res) => {
    try {
        if (!req.session.usuario.validador) {
            return res.status(403).send("Solo un validador puede ver estas denuncias");
        }

        const denuncias = await Denuncia_usuario.findAll({
            where: { estado: true },
            include: [
                { model: Usuario, as: "denunciante", attributes: ["id", "username"] },
                { model: Usuario, as: "denunciado", attributes: ["id", "username"] },
            ],
            order: [["createdAt", "DESC"]],
        });

        return res.render("Publicaciones/denunciasUsuarios", { denuncias });
    } catch (error) {
        console.error("Error al cargar las denuncias de usuarios:", error);
        return res.status(500).send("No se pudieron cargar las denuncias");
    }
};

export const resolverDenunciaUsuario = async (req, res) => {
    try {
        if (!req.session.usuario.validador) {
            return res.status(403).send("Solo un validador puede resolver denuncias");
        }

        const denunciaId = Number(req.body.denuncia_id);
        if (!Number.isInteger(denunciaId) || denunciaId <= 0) {
            return res.status(400).send("Denuncia no válida");
        }

        const denuncia = await Denuncia_usuario.findByPk(denunciaId);
        if (!denuncia) {
            return res.status(404).send("Denuncia no encontrada");
        }

        denuncia.estado = false;
        await denuncia.save();
        return res.redirect("/denunciasUsuarios");
    } catch (error) {
        console.error("Error al resolver la denuncia de usuario:", error);
        return res.status(500).send("No se pudo resolver la denuncia");
    }
};

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
            // Con tres denuncias de usuarios distintos, se bloquea para revisar.
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
        const esValidador = req.session.usuario.validador;
        const denuncias = await Denuncia_comentario.findAll({
            where: { estado: true },
            include: [
                {
                    model: Comentario,
                    as: "comentario",
                    where: esValidador ? undefined : { user_id: req.session.usuario.id },
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

export const resolverDenunciaComentario = async (req, res) => {
    try {
        if (!req.session.usuario.validador) {
            return res.status(403).send("Solo un validador puede resolver denuncias");
        }

        const denunciaId = Number(req.body.denuncia_id);
        if (!Number.isInteger(denunciaId) || denunciaId <= 0) {
            return res.status(400).send("Denuncia no válida");
        }

        const denuncia = await Denuncia_comentario.findByPk(denunciaId);
        if (!denuncia) {
            return res.status(404).send("Denuncia no encontrada");
        }

        denuncia.estado = false;
        await denuncia.save();
        return res.redirect("/denunciasComentarios");
    } catch (error) {
        console.error("Error al resolver la denuncia del comentario:", error);
        return res.status(500).send("No se pudo resolver la denuncia");
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

        const esAutor = Number(comentario.user_id) === Number(req.session.usuario.id);
        const esValidador = req.session.usuario.validador;
        if (!esAutor && !esValidador) {
            return res.status(403).send("No tenés permiso para borrar este comentario");
        }

        await sequelize.transaction(async (transaction) => {
            await Denuncia_comentario.destroy({
                where: { comentario_id: denuncia.comentario_id },
                transaction,
            });
            await comentario.destroy({ transaction });
        });

        return res.redirect("/misDenunciasComentarios");
    } catch (error) {
        console.error("Error al eliminar comentario denunciado:", error);
        return res.status(500).send("No se pudo eliminar el comentario");
    }
};

export const verDenunciasImagenes = async (req, res) => {   
    try {
        if (!req.session.usuario.validador) {
            return res.status(403).send("No tenés permiso para ver estas denuncias");
        }

        const denuncias = await Denuncia_imagen.findAll({
            where: { estado: "pendiente" },
            include: [
                {
                    model: Imagen,
                    as: "imagen",
                    attributes: ["id", "url"],
                    include: [{
                        model: Publicacion,
                        as: "publicacion",
                        attributes: ["id", "titulo"],
                    }],
                },
                {
                    model: Usuario,
                    as: "denunciante",
                    attributes: ["id", "username"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });
        return res.render("Publicaciones/denunciasImagenes", { denuncias });
    } catch (error) {
        console.error("Error al cargar las denuncias de imagenes:", error);
        return res.status(500).send("No se pudieron cargar las denuncias de imagenes");
    }
};

export const resolverDenunciaImagen = async (req, res) => {
    try {
        if (!req.session.usuario.validador) {
            return res.status(403).send("Solo un validador puede resolver denuncias");
        }

        const denunciaId = Number(req.body.denuncia_id);
        const accion = req.body.accion;
        if (!Number.isInteger(denunciaId) || denunciaId <= 0 ||
            (accion !== "mantener" && accion !== "bajar")) {
            return res.status(400).send("Datos de resolución no válidos");
        }

        const denuncia = await Denuncia_imagen.findByPk(denunciaId, {
            include: [{ model: Imagen, as: "imagen" }],
        });
        if (!denuncia || !denuncia.imagen) {
            return res.status(404).send("Denuncia no encontrada");
        }

        const publicacion = await Publicacion.findByPk(denuncia.imagen.post_id);
        if (!publicacion) {
            return res.status(404).send("Publicación no encontrada");
        }

        const imagenes = await Imagen.findAll({
            where: { post_id: publicacion.id },
            attributes: ["id"],
        });
        const idsImagenes = imagenes.map((imagen) => imagen.id);

        await sequelize.transaction(async (transaction) => {
            await Denuncia_imagen.update(
                { estado: accion === "bajar" ? "resuelta" : "rechazada" },
                { where: { imagen_id: idsImagenes }, transaction }
            );

            publicacion.estado = accion === "mantener";
            publicacion.bloqueada_por_denuncia = false;
            publicacion.EnviarAValidar = false;
            await publicacion.save({ transaction });
        });

        return res.redirect("/denunciasImagenes");
    } catch (error) {
        console.error("Error al resolver la denuncia de imagen:", error);
        return res.status(500).send("No se pudo resolver la denuncia");
    }
};
