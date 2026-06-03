import { Model, DataTypes } from "sequelize";
import { sequelize } from "../conexion.js";

export class Imagen extends Model {
  static async crearImagen(post, purl, pcopyright, plicencia) {
    try {
      const Ima = Imagen.build({            
        post_id: post, // Modificado
        url: purl,
        licencia: plicencia,
        copyrigth: pcopyright,
      });
      await Ima.save();
      return Ima;
    }
    catch (err) { console.log(err); }  
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
  licencia: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: false,
  },
  marcaAgua: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  texto_personalizado: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: "Imagen",
  tableName: "imagenes",
  createdAt: true,
  deletedAt: true,
});