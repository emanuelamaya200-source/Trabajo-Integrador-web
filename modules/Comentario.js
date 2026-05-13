import { Model,DataTypes } from "sequelize";
import {sequelize} from "../conexion.js";

export class Comentario extends Model {}

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