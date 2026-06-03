import { sequelize } from "./conexion.js"
import { Coleccion } from "./modelos/Coleccion.js"
import { Comentario } from "./modelos/Comentario.js"
import { Compra } from "./modelos/Compra.js"
import { Denuncia_comentario } from "./modelos/Denuncia_comentario.js"
import { Denuncia_publicacion } from "./modelos/Denuncia_publicacion.js"
import { Denuncia_usuario } from "./modelos/Denuncia_usuario.js"
import { Etiqueta } from "./modelos/Etiqueta.js"
import { Favoritos } from "./modelos/Favoritos.js"
import { Imagen } from "./modelos/Imagen.js"
import { Notificacion } from "./modelos/Notificacion.js"
import { Publicacion } from "./modelos/Publicacion.js"
import { Seguidor } from "./modelos/Seguidor.js"
import { Usuario } from "./modelos/Usuario.js"
import { Validador } from "./modelos/valida.js"
import { Valoracion } from "./modelos/Valoracion.js"
import { PublicacionEtiqueta } from "./modelos/PublicacionEtiqueta.js"

async function RelacionarTablas() {
  try {
    // Usuario y publicacion
    Usuario.hasMany(Publicacion, { foreignKey: "usuario_id" });
    Publicacion.belongsTo(Usuario, { foreignKey: "usuario_id" });

    // Seguidores
    Usuario.belongsToMany(Usuario, {
      as: "Seguidores",
      through: Seguidor,
      foreignKey: "seguido_id",
      otherKey: "seguidor_id"
    });
    Usuario.belongsToMany(Usuario, {
      as: "Seguidos",  
      through: Seguidor,
      foreignKey: "seguidor_id",
      otherKey: "seguido_id"
    });
    
    // Colecciones y Denuncias de Usuario
    Usuario.hasMany(Coleccion, { foreignKey: "usuario_id" });
    Coleccion.belongsTo(Usuario, { foreignKey: "usuario_id" });
    
    Usuario.hasMany(Denuncia_usuario, { foreignKey: "usuario_id" });
    Denuncia_usuario.belongsTo(Usuario, { foreignKey: "usuario_id" });
   
    // Favoritos y Compras
    Usuario.belongsToMany(Publicacion, { through: Favoritos, as: "Favoritos", foreignKey: "usuario_id", otherKey: "publicacion_id" });
    Publicacion.belongsToMany(Usuario, { through: Favoritos, as: "Favoritos", foreignKey: "publicacion_id", otherKey: "usuario_id" });
    
    Usuario.belongsToMany(Publicacion, { through: Compra, as: "Compras", foreignKey: "usuario_id", otherKey: "publicacion_id" });
    Publicacion.belongsToMany(Usuario, { through: Compra, as: "Compras", foreignKey: "publicacion_id", otherKey: "usuario_id" });

    // Denuncias de Publicación
    Publicacion.hasMany(Denuncia_publicacion, { foreignKey: "publicacion_id" });
    Denuncia_publicacion.belongsTo(Publicacion, { foreignKey: "publicacion_id" });
    
    // Publicacion y imagen
    Publicacion.hasMany(Imagen, { as: "imagenes", foreignKey: "post_id" });
    Imagen.belongsTo(Publicacion, { foreignKey: "post_id" });

    // Imagen y Comentario
    Imagen.hasMany(Comentario, { as: "comentarios", foreignKey: "imagen_id" });
    Comentario.belongsTo(Imagen,{as: "imagen", foreignKey: "imagen_id" });

    // Comentario y usuario
    Usuario.hasMany(Comentario, { as: "comentarios", foreignKey: "user_id" });
    Comentario.belongsTo(Usuario, { as: "usuario", foreignKey: "user_id" });
    
    // Etiquetas
    Publicacion.belongsToMany(Etiqueta, { 
        through: PublicacionEtiqueta, 
        foreignKey: 'publicacionId',
        otherKey: 'etiquetaId',
        as: 'etiquetas'
    });
    Etiqueta.belongsToMany(Publicacion, { 
        through: PublicacionEtiqueta, 
        foreignKey: 'etiquetaId',
        otherKey: 'publicacionId',
        as: 'publicaciones'
    });
      
    // Validador
    Publicacion.hasOne(Validador, { foreignKey: "publicacion_id" });
    Validador.belongsTo(Publicacion, { foreignKey: "publicacion_id" });
  
    // Denuncias de comentarios y Valoraciones
    Comentario.hasMany(Denuncia_comentario, { foreignKey: "comentario_id" });
    Denuncia_comentario.belongsTo(Comentario, { foreignKey: "comentario_id" });

    Imagen.hasMany(Valoracion, { foreignKey: "imagen_id" });
    Valoracion.belongsTo(Imagen, { foreignKey: "imagen_id" });
    
    // Notificaciones
    Usuario.hasMany(Notificacion, { foreignKey: "usuario_id" });
    Notificacion.belongsTo(Usuario, { foreignKey: "usuario_id" });

    Denuncia_usuario.hasMany(Notificacion, { foreignKey: "denuncia_usuario_id" });
    Notificacion.belongsTo(Denuncia_usuario, { foreignKey: "denuncia_usuario_id" });

    Denuncia_publicacion.hasMany(Notificacion, { foreignKey: "denuncia_publicacion_id" });
    Notificacion.belongsTo(Denuncia_publicacion, { foreignKey: "denuncia_publicacion_id" });

    Denuncia_comentario.hasMany(Notificacion, { foreignKey: "denuncia_comentario_id" });
    Notificacion.belongsTo(Denuncia_comentario, { foreignKey: "denuncia_comentario_id" });

    Valoracion.hasMany(Notificacion, { foreignKey: "valoracion_id" });
    Notificacion.belongsTo(Valoracion, { foreignKey: "valoracion_id" });

    Comentario.hasMany(Notificacion, { foreignKey: "comentario_id" });
    Notificacion.belongsTo(Comentario, { foreignKey: "comentario_id" });

  } catch (err) {
    console.log(err);
  }
}

async function Sincronizar() {
  try {
    await RelacionarTablas();
    await sequelize.sync({ alter: true });
    console.log('Tablas sincronizadas con éxito');
  } catch (err) {
    console.error('error al conectarse:', err);
  }
}

export { Sincronizar };