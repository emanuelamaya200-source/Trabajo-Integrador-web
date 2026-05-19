import { Model,DataTypes } from "sequelize";
import { sequelize } from "../conexion.js";
import { Etiqueta } from "./Etiqueta.js";

export class Publicacion extends Model {
      
  static async crearPublicacion(titulo, descripcion, etiquetas) {
    try {
      const publi = await Publicacion.create({
        title: titulo,
        description: descripcion,
      });
      
      for (const nombreEtiqueta of etiquetas) {
        const [etiqueta] = await Etiqueta.findOrCreate({
          where: { nombre: nombreEtiqueta }
        });

        await publi.addEtiqueta(etiqueta); 
      }
      
      return publi;
      
    } catch(err) {
      console.log("Error al crear publicacion:", err);
    }
  }
}

Publicacion.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    title: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    comments_allowed: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    cantidad_denuncias: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    cantidad_valoraciones: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    promedio_valoraciones: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    

  },
  {
    sequelize, 
    modelName: 'publicacion', 
    tableName: 'publicaciones',
    createdAt: true,
    deletedAt: true,
    updatedAt: true,
  },
);

export default Publicacion;