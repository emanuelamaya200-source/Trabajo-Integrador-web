import { UniqueConstraintError } from "sequelize";
import { Denuncia_imagen } from "../modelos/Denuncia_imagen.js";
import { Imagen } from "../modelos/Imagen.js";

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

        await Denuncia_imagen.crearDenuncia(
            imagen.id,
            usuario_id,
            descripcionNormalizada,
            motivo.trim()
        );

        return res.redirect(`/verPublicacion/${imagen.post_id}`);
    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            return res.status(409).send("Ya denunciaste esta imagen");
        }
        console.error("Error al crear la denuncia de imagen:", error);
        return res.status(500).send("No se pudo crear la denuncia");
    }
};