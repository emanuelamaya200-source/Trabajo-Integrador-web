import { DataTypes, Model } from "sequelize";
import { sequelize } from "../conexion.js";

export class Denuncia_imagen extends Model {
  static async crearDenuncia(imagenId, usuarioId, descripcion, motivo) {
    return Denuncia_imagen.create({
      imagen_id: imagenId,
      user_id: usuarioId,
      descripcion,
      motivo,
    });
  }
}

Denuncia_imagen.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    imagen_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "imagenes",
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
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    motivo: {
      type: DataTypes.STRING(60),
      allowNull: false,
      validate: {
        notEmpty: true,
        isIn: [["Copyright", "Inapropiado"]],
      },
    },
    estado: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "pendiente",
    },
  },
  {
    sequelize,
    modelName: "denuncia_imagen",
    tableName: "denuncias_imagenes",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["imagen_id", "user_id"],
      },
      {
        fields: ["imagen_id"],
      },
    ],
  },
);
