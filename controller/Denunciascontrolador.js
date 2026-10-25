import { Denuncia_publicacion } from "../modelos/Denuncia_publicacion.js";
import { Publicacion } from "../modelos/Publicacion.js";

export const agregarDenunciaPublicacion = async (req, res) => {
    try {
        const { publicacion_id, descripcion, motivo } = req.body;
        const usuario_id = req.session.usuario.id;

        if (!publicacion_id || !descripcion || !motivo) {
            return res.status(400).send("Faltan datos para realizar la denuncia");
        }

        const publicacion = await Publicacion.findByPk(publicacion_id);
        if (!publicacion) {
            return res.status(404).send("Publicación no encontrada");
        }

        await Denuncia_publicacion.creardenuncia(
            publicacion.id,
            usuario_id,
            descripcion,
            motivo
        );

        return res.redirect(`/verPublicacion/${publicacion.id}`);
    } catch (error) {
        console.error("Error al crear la denuncia de publicación:", error);
        return res.status(500).send("No se pudo crear la denuncia");
    }
};