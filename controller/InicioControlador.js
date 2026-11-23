import { Imagen } from "../modelos/Imagen.js";
import { Publicacion } from "../modelos/Publicacion.js";
import { Usuario } from "../modelos/Usuario.js";
import { Valoracion } from "../modelos/Valoracion.js";

export const mostrarInicio = async (req, res) => {
    try {
        const usuarioLogueado = Boolean(req.session && req.session.usuario);
        const publicaciones = await Publicacion.findAll({
            where: {
                estado: true,
                bloqueada_por_denuncia: false,
            },
            include: [
                {
                    model: Imagen,
                    as: "imagenes",
                    where: usuarioLogueado ? undefined : { copyrigth: false },
                    required: !usuarioLogueado,
                    include: [{ model: Valoracion, as: "valoraciones" }],
                },
                {
                    model: Usuario,
                    as: "creador",
                    attributes: ["id", "username"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        const imagenes = [];
        for (const publicacion of publicaciones) {
            for (const imagen of publicacion.imagenes) {
                const votos = imagen.valoraciones || [];
                let suma = 0;
                for (const voto of votos) {
                    suma += Number(voto.puntaje);
                }

                const promedio = votos.length > 0 ? suma / votos.length : 0;
                imagenes.push({
                    publicacion_id: publicacion.id,
                    titulo: publicacion.titulo,
                    creador: publicacion.creador,
                    url: imagen.url,
                    imagen_id: imagen.id,
                    promedio,
                    cantidad: votos.length,
                    fecha: imagen.createdAt,
                    destacada: votos.length >= 3 && promedio >= 7,
                });
            }
        }

        const mejorValoradas = imagenes
            .filter((imagen) => imagen.destacada)
            .sort((a, b) => b.promedio - a.promedio || b.cantidad - a.cantidad);
        const otrasImagenes = imagenes
            .filter((imagen) => !imagen.destacada)
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        const destacadas = mejorValoradas.slice(0, 4);
        const otras = otrasImagenes.slice(0, 2);
        const elegidas = [...destacadas, ...otras];

        if (elegidas.length < 6) {
            const idsElegidos = elegidas.map((imagen) => imagen.imagen_id);
            const restantes = imagenes
                .filter((imagen) => !idsElegidos.includes(imagen.imagen_id))
                .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            elegidas.push(...restantes.slice(0, 6 - elegidas.length));
        }

        return res.render("home", {
            destacadas: elegidas.filter((imagen) => imagen.destacada),
            otras: elegidas.filter((imagen) => !imagen.destacada),
        });
    } catch (error) {
        console.error("Error al cargar la página de inicio:", error);
        return res.status(500).send("No se pudo cargar la página de inicio");
    }
};
