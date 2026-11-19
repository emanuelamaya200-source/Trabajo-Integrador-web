import { Model, DataTypes } from "sequelize";
import { sequelize } from "../conexion.js";

export class ColeccionPublicacion extends Model {}

ColeccionPublicacion.init(
  {
    coleccion_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: "colecciones",
        key: "id",
      },
    },
    publicacion_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: "publicaciones",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "coleccion_publicacion",
    tableName: "colecciones_publicaciones",
    timestamps: true,
  },
);
