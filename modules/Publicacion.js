import { Model,DataTypes } from "sequelize";
import {sequelize} from "../conexion.js";

export class Publicacion extends Model {}

Publicacion.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,

    },
    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    tittle: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    comments_allowed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
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