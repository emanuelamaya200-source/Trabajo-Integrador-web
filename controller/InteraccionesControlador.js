import { UniqueConstraintError } from "sequelize";
import { Favoritos } from "../modelos/Favoritos.js";
import { Compra } from "../modelos/Compra.js";
import { Coleccion } from "../modelos/Coleccion.js";
import { Publicacion } from "../modelos/Publicacion.js";
import { Imagen } from "../modelos/Imagen.js";
import { Notificacion } from "../modelos/Notificacion.js";
import { Usuario } from "../modelos/Usuario.js";

export const meInteresa = async (req, res) => {
    try {
        const imagenId = Number(req.body.imagen_id);
        const usuarioId = Number(req.session.usuario.id);
        if (!Number.isInteger(imagenId) || imagenId <= 0) {
            return res.status(400).send("Imagen no válida");
        }

        const imagen = await Imagen.findByPk(imagenId);
        if (!imagen) {
            return res.status(404).send("Imagen no encontrada");
        }

        const publicacion = await Publicacion.findByPk(imagen.post_id);
        if (!publicacion || !publicacion.estado || publicacion.bloqueada_por_denuncia) {
            return res.status(404).send("Publicación no disponible");
        }
        if (Number(publicacion.usuario_id) === usuarioId) {
            return res.status(403).send("No podés mostrar interés en tu propia imagen");
        }
        if (Number(imagen.Precio) <= 0) {
            return res.status(400).send("Esta imagen no está a la venta");
        }

        const interesado = await Usuario.findByPk(usuarioId);
        if (!interesado) {
            return res.status(404).send("Usuario no encontrado");
        }

        await Notificacion.create({
            usuario_id: publicacion.usuario_id,
            texto: `${interesado.username} está interesado en tu publicación "${publicacion.titulo}"`,
            enlace: `/perfil/${interesado.id}`,
        });

        return res.redirect(`/verPublicacion/${publicacion.id}`);
    } catch (error) {
        console.error("Error al avisar que te interesa una imagen:", error);
        return res.status(500).send("No se pudo enviar el aviso");
    }
};

export const cambiarFavorito = async (req, res) => {
    try {
        const publicacionId = Number(req.params.id);
        const usuarioId = req.session.usuario.id;
        const publicacion = await Publicacion.findByPk(publicacionId);

        if (!publicacion || !publicacion.estado || publicacion.bloqueada_por_denuncia) {
            return res.status(404).send("Publicación no encontrada");
        }

        const favorito = await Favoritos.findOne({
            where: { usuario_id: usuarioId, publicacion_id: publicacionId },
        });

        if (favorito) {
            await favorito.destroy();
        } else {
            await Favoritos.create({
                usuario_id: usuarioId,
                publicacion_id: publicacionId,
            });
        }

        return res.redirect(`/verPublicacion/${publicacionId}`);
    } catch (error) {
        console.error("Error al cambiar favorito:", error);
        return res.status(500).send("No se pudo cambiar el favorito");
    }
};

export const verFavoritos = async (req, res) => {
    try {
        const favoritos = await Favoritos.findAll({
            where: { usuario_id: req.session.usuario.id },
            include: [{
                model: Publicacion,
                as: "publicacion",
                where: { estado: true, bloqueada_por_denuncia: false },
                include: [{ model: Imagen, as: "imagenes" }],
            }],
        });

        return res.render("Publicaciones/favoritos", { favoritos });
    } catch (error) {
        console.error("Error al cargar favoritos:", error);
        return res.status(500).send("No se pudieron cargar los favoritos");
    }
};

export const comprarPublicacion = async (req, res) => {
    try {
        const publicacionId = Number(req.params.id);
        const usuarioId = req.session.usuario.id;
        const publicacion = await Publicacion.findByPk(publicacionId, {
            include: [{ model: Imagen, as: "imagenes" }],
        });

        if (!publicacion || !publicacion.estado || publicacion.bloqueada_por_denuncia) {
            return res.status(404).send("Publicación no encontrada");
        }

        if (Number(publicacion.usuario_id) === Number(usuarioId)) {
            return res.status(403).send("No podés comprar tu propia publicación");
        }

        let tienePrecio = false;
        for (const imagen of publicacion.imagenes) {
            if (Number(imagen.Precio) > 0) {
                tienePrecio = true;
            }
        }
        if (!tienePrecio) {
            return res.status(400).send("Esta publicación no está a la venta");
        }

        const compraExistente = await Compra.findOne({
            where: { post_id: publicacionId, user_id: usuarioId },
        });
        if (compraExistente) {
            return res.status(409).send("Ya compraste esta publicación");
        }

        await Compra.create({
            post_id: publicacionId,
            user_id: usuarioId,
        });

        return res.redirect("/misCompras");
    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            return res.status(409).send("Ya compraste esta publicación");
        }
        console.error("Error al comprar publicación:", error);
        return res.status(500).send("No se pudo registrar la compra");
    }
};

export const verCompras = async (req, res) => {
    try {
        const compras = await Compra.findAll({
            where: { user_id: req.session.usuario.id },
            include: [{
                model: Publicacion,
                as: "publicacion",
                include: [{ model: Imagen, as: "imagenes" }],
            }],
            order: [["createdAt", "DESC"]],
        });

        return res.render("Publicaciones/compras", { compras });
    } catch (error) {
        console.error("Error al cargar las compras:", error);
        return res.status(500).send("No se pudieron cargar las compras");
    }
};

export const verColecciones = async (req, res) => {
    try {
        const colecciones = await Coleccion.findAll({
            where: { usuario_id: req.session.usuario.id },
            order: [["createdAt", "DESC"]],
        });

        return res.render("Publicaciones/colecciones", { colecciones });
    } catch (error) {
        console.error("Error al cargar las colecciones:", error);
        return res.status(500).send("No se pudieron cargar las colecciones");
    }
};

export const crearColeccion = async (req, res) => {
    try {
        const titulo = String(req.body.titulo || "").trim();
        const categoria = String(req.body.categoria || "").trim();

        if (!titulo || !categoria) {
            return res.status(400).send("Completá el título y la categoría");
        }

        const coleccion = await Coleccion.create({
            titulo,
            categoria,
            usuario_id: req.session.usuario.id,
            publico: req.body.publico === "on",
        });

        return res.redirect(`/coleccion/${coleccion.id}`);
    } catch (error) {
        console.error("Error al crear la colección:", error);
        return res.status(500).send("No se pudo crear la colección");
    }
};

export const verColeccion = async (req, res) => {
    try {
        const coleccion = await Coleccion.findByPk(req.params.id, {
            include: [{
                model: Publicacion,
                as: "publicaciones",
                where: { estado: true, bloqueada_por_denuncia: false },
                required: false,
                include: [{ model: Imagen, as: "imagenes" }],
            }],
        });

        if (!coleccion) {
            return res.status(404).send("Colección no encontrada");
        }

        const usuarioId = req.session.usuario ? req.session.usuario.id : null;
        const esPropietario = Number(coleccion.usuario_id) === Number(usuarioId);
        if (!coleccion.publico && !esPropietario) {
            return res.status(403).send("Esta colección es privada");
        }

        const publicacionesDisponibles = await Publicacion.findAll({
            where: { estado: true, bloqueada_por_denuncia: false },
            attributes: ["id", "titulo"],
        });

        return res.render("Publicaciones/coleccion", {
            coleccion,
            esPropietario,
            publicacionesDisponibles,
        });
    } catch (error) {
        console.error("Error al cargar la colección:", error);
        return res.status(500).send("No se pudo cargar la colección");
    }
};

export const agregarPublicacionColeccion = async (req, res) => {
    try {
        const coleccion = await Coleccion.findByPk(req.body.coleccion_id);
        const publicacion = await Publicacion.findByPk(req.body.publicacion_id);

        if (!coleccion || Number(coleccion.usuario_id) !== Number(req.session.usuario.id)) {
            return res.status(404).send("Colección no encontrada");
        }
        if (!publicacion || !publicacion.estado || publicacion.bloqueada_por_denuncia) {
            return res.status(404).send("Publicación no encontrada");
        }

        await coleccion.addPublicacion(publicacion);
        return res.redirect(`/coleccion/${coleccion.id}`);
    } catch (error) {
        console.error("Error al agregar a la colección:", error);
        return res.status(500).send("No se pudo agregar la publicación");
    }
};

export const quitarPublicacionColeccion = async (req, res) => {
    try {
        const coleccion = await Coleccion.findByPk(req.body.coleccion_id);
        const publicacion = await Publicacion.findByPk(req.body.publicacion_id);

        if (!coleccion || Number(coleccion.usuario_id) !== Number(req.session.usuario.id)) {
            return res.status(404).send("Colección no encontrada");
        }
        if (!publicacion) {
            return res.status(404).send("Publicación no encontrada");
        }

        await coleccion.removePublicacion(publicacion);
        return res.redirect(`/coleccion/${coleccion.id}`);
    } catch (error) {
        console.error("Error al quitar de la colección:", error);
        return res.status(500).send("No se pudo quitar la publicación");
    }
};
