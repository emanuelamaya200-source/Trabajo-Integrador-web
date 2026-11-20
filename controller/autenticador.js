import { Usuario } from "../modelos/Usuario.js";

export async function requireAuth(req, res, next) {
  if (!req.session.usuario) {
    return res.redirect('/unirse');
  }

  try {
    const usuario = await Usuario.findByPk(req.session.usuario.id);
    if (!usuario || usuario.Nro_publicaciones_bajadas >= 3) {
      return req.session.destroy((error) => {
        if (error) {
          console.error("Error al cerrar la sesión de una cuenta inactiva:", error);
          return res.status(500).send("No se pudo cerrar la sesión");
        }
        return res.redirect('/unirse');
      });
    }

    if (!usuario.estado) {
      usuario.estado = true;
      await usuario.save();
    }

    next();
  } catch (error) {
    console.error("Error al revisar el estado de la cuenta:", error);
    res.status(500).send("No se pudo revisar el estado de la cuenta");
  }
}