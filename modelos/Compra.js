import { Model, DataTypes } from "sequelize";
import {sequelize} from "../conexion.js";

export class Compra extends Model {}

Compra.init(
  {
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "publicaciones",
        key: "id",
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "usuarios",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "compra",
    tableName: "compras",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["post_id", "user_id"],
      },
    ],
  },
);