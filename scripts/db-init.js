import bcrypt from "bcrypt";
import { sequelize } from "../conexion.js";
import { Sincronizar } from "../sync.js";
import { Imagen } from "../modelos/Imagen.js";
import { Etiqueta } from "../modelos/Etiqueta.js";
import { Publicacion } from "../modelos/Publicacion.js";
import { Usuario } from "../modelos/Usuario.js";

const usuariosDePrueba = [
    {
        username: "usuario_prueba",
        email: "usuario.prueba@fotaza.test",
        password: "Fotaza123!",
        validador: false,
    },
    {
        username: "validador_prueba",
        email: "validador.prueba@fotaza.test",
        password: "Validador123!",
        validador: true,
    },
];

try {
    await sequelize.authenticate();
    await Sincronizar();

    for (const usuario of usuariosDePrueba) {
        const password = await bcrypt.hash(usuario.password, 10);
        const [usuarioGuardado] = await Usuario.findOrCreate({
            where: { username: usuario.username },
            defaults: {
                username: usuario.username,
                email: usuario.email,
                password,
                validador: usuario.validador,
                estado: true,
                ofertas: false,
            },
        });
        usuarioGuardado.email = usuario.email;
        usuarioGuardado.password = password;
        usuarioGuardado.validador = usuario.validador;
        usuarioGuardado.estado = true;
        usuarioGuardado.Nro_publicaciones_bajadas = 0;
        await usuarioGuardado.save();
    }

    const usuarioPrueba = await Usuario.findOne({
        where: { username: "usuario_prueba" },
    });
    let publicacion = await Publicacion.findOne({
        where: { usuario_id: usuarioPrueba.id, titulo: "Publicación de prueba" },
    });

    if (!publicacion) {
        publicacion = await Publicacion.create({
            usuario_id: usuarioPrueba.id,
            titulo: "Publicación de prueba",
            descripcion: "Contenido de ejemplo para probar la aplicación.",
        });

        const [etiqueta] = await Etiqueta.findOrCreate({
            where: { nombre: "prueba" },
        });
        await publicacion.addEtiqueta(etiqueta);
        await Imagen.create({
            post_id: publicacion.id,
            url: "data:image/svg+xml," + encodeURIComponent(
                '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="100%" height="100%" fill="#d9e8f5"/><text x="50%" y="50%" text-anchor="middle" font-size="32">Imagen de prueba</text></svg>'
            ),
            copyrigth: false,
            licencia: "Sin copyright",
            Precio: 100,
        });
    }

    console.log("Base de datos lista con usuarios y contenido de prueba.");
} catch (error) {
    console.error("No se pudo inicializar la base de datos:", error);
    process.exitCode = 1;
} finally {
    await sequelize.close();
}
