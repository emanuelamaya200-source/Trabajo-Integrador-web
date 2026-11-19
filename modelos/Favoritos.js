import { Model, DataTypes } from "sequelize";
import {sequelize} from "../conexion.js";

export class Favoritos extends Model {}

Favoritos.init(
  {
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "usuarios",
        key: "id",
      },
    },
    publicacion_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "publicaciones",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "favoritos",
    tableName: "favoritos",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["usuario_id", "publicacion_id"],
      },
    ],
  },
);