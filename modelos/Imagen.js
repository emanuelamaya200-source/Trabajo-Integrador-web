import { Model, DataTypes } from "sequelize";
import { sequelize } from "../conexion.js";

export class Imagen extends Model {
  static async crearImagen(post, purl, pcopyright, plicencia, pprecio) {
    try {
      const Ima = Imagen.build({            
        post_id: post,
        url: purl,
        licencia: plicencia,
        copyrigth: pcopyright,
        Precio: pprecio ?? null,
      });
      await Ima.save();
      return Ima;
    }
    catch (err) { console.log(err); }  
  }
  static async retornarIDDeLaPublicacionDeUnaImagen(id_imagen, options = {}) {
    const img = await Imagen.findByPk(id_imagen, options);
    if (img == null) {
      return null;
    }

    return img.post_id;
  }
}

Imagen.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  post_id: { 
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'publicaciones',
      key: 'id'
    }
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  promedio: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  copyrigth: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: true,
  },
  comentarios_permitidos: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  licencia: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: false,
  },
  Precio: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  marcaAgua: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  texto_personalizado: {
    type: DataTypes.STRING,
    allowNull: true,
  },
    EstadoBloqueado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
}, {
  sequelize,
  modelName: "Imagen",
  tableName: "imagenes",
  createdAt: true,
  deletedAt: true,
});