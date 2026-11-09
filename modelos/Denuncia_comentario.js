import { Model, DataTypes } from "sequelize";
import { sequelize } from "../conexion.js";

export class Denuncia_comentario extends Model {}

Denuncia_comentario.init(
  {
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
    comentario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "comment_id",
      references: {
        model: "comentarios",
        key: "id",
      },
    },
    contenido: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    motivo: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "denuncia_comentario",
    tableName: "denuncias_comentarios",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["comment_id", "user_id"],
      },
      {
        fields: ["post_id", "estado"],
      },
    ],
  },
);