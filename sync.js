import { sequelize } from "./conexion.js"
import { Coleccion } from "./modules/Coleccion.js"
import { Comentario } from "./modules/Comentario.js"
import { Compra } from "./modules/Compra.js"
import { Denuncia_comentario } from "./modules/Denuncia_comentario.js"
import { Denuncia_publicacion } from "./modules/Denuncia_publicacion.js"
import { Denuncia_usuario } from "./modules/Denuncia_usuario.js"
import { Etiquetas } from "./modules/Etiquetas.js"
import { Favoritos } from "./modules/Favoritos.js"
import { Imagen } from "./modules/Imagen.js"
import { Notificacion } from "./modules/Notificacion.js"
import { Publicacion } from "./modules/Publicacion.js"
import { Seguidor } from "./modules/Seguidor.js"
import { Usuario } from "./modules/Usuario.js"
import { Validador } from "./modules/valida.js"
import { Valoracion } from "./modules/Valoracion.js"

async function RelacionarTablas() {
  try {
    // Usuario y publicacion
    Usuario.hasMany(Publicacion);
    Publicacion.belongsTo(Usuario);

    
    Usuario.belongsToMany(Usuario, {
      as: "Seguidores",  // Usuarios que me siguen
      through: Seguidor,  // Modelo de tabla de unión
      foreignKey: "seguido_id",  // ID del usuario seguido
      otherKey: "seguidor_id"   // ID del usuario seguidor
    });
    Usuario.belongsToMany(Usuario, {
      as: "Seguidos",  
      through: Seguidor,
      foreignKey: "seguidor_id",
      otherKey: "seguido_id"
    });
    
    Usuario.hasMany(Coleccion);
    Coleccion.belongsTo(Usuario);
    
    Usuario.hasMany(Denuncia_usuario);
    Denuncia_usuario.belongsTo(Usuario);
   
    Usuario.belongsToMany(Publicacion, { through: Favoritos, as: "Favoritos" });
    Publicacion.belongsToMany(Usuario, { through: Favoritos, as: "Favoritos" });
    
    Usuario.belongsToMany(Publicacion, { through: Compra, as: "Compras" });
    Publicacion.belongsToMany(Usuario, { through: Compra, as: "Compras" });

    Publicacion.hasMany(Denuncia_publicacion);
    Denuncia_publicacion.belongsTo(Publicacion);
   
    Publicacion.hasMany(Imagen);
    Imagen.belongsTo(Publicacion);
    
    Publicacion.hasMany(Comentario);
    Comentario.belongsTo(Publicacion);
    
    Publicacion.hasMany(Etiquetas);
    Etiquetas.belongsTo(Publicacion);
    
    Publicacion.hasOne(Validador);
    Validador.belongsTo(Publicacion);
  
    Comentario.hasMany(Denuncia_comentario);
    Denuncia_comentario.belongsTo(Comentario);

    Imagen.hasMany(Valoracion);
    Valoracion.belongsTo(Imagen);

    
    Usuario.hasMany(Notificacion);
    Notificacion.belongsTo(Usuario);

    Denuncia_usuario.hasMany(Notificacion);
    Notificacion.belongsTo(Denuncia_usuario);

    Denuncia_publicacion.hasMany(Notificacion);
    Notificacion.belongsTo(Denuncia_publicacion);

    Denuncia_comentario.hasMany(Notificacion);
    Notificacion.belongsTo(Denuncia_comentario);

    Valoracion.hasMany(Notificacion);
    Notificacion.belongsTo(Valoracion);

    Comentario.hasMany(Notificacion);
    Notificacion.belongsTo(Comentario);

  } catch (err) {
    console.log(err);
  }
}

async function Sincronizar() {
  try {
    await RelacionarTablas();
    await sequelize.sync({ alter: true });
    console.log('Tablas sincronizadas');
  } catch (err) {
    console.error('error al conectarse:', err);
  }
}

export { Sincronizar };