import { Model, DataTypes } from "sequelize";
import {sequelize} from "../conexion.js";

export class Favoritos extends Model {}

Favoritos.init(
  {
  },
  {
    sequelize,
    modelName: "favoritos",
    tableName: "favoritos",
    createdAt: true,
    deletedAt: true,
  },
);