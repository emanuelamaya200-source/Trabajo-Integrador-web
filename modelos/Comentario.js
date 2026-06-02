import { Model,DataTypes } from "sequelize";
import {sequelize} from "../conexion.js";

export class Comentario extends Model {
  export const crearComentario = async (req, res) => {
    try {
        const { contenido } = req.body;
        await Comentario.create({ contenido });

        return res.reload(); 

    } catch (error) {
        console.error(error);
        return res.status(500).send("Error al crear el comentario");
    }
};
}

Comentario.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    // Model attributes are defined here
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    contenido: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'comentario', // We need to choose the model name
    tableName: 'comentarios',
    createdAt: true,
    deletedAt: true,
    updatedAt: true,
  },
);