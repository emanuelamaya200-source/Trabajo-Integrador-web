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
import {PublicacionEtiqueta}  from "./modelos/PublicacionEtiqueta.js"

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
    
    Publicacion.hasMany(Imagen, { as: "imagenes", foreignKey: "publicacion_id" });
    Imagen.hasMany(Comentario, { as: "comentarios", foreignKey: "imagen_id" });
    
    
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
      
    Publicacion.hasOne(Validador);
    Validador.belongsTo(Publicacion);
  
    Comentario.hasMany(Denuncia_comentario);
    Denuncia_comentario.belongsTo(Comentario);

    Imagen.hasMany(Valoracion);
    Valoracion.belongsTo(Imagen);

    Imagen.hasMany(Comentario);
    Comentario.belongsTo(Imagen);
    
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