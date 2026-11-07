import { DataTypes, Model } from "sequelize";
import { sequelize } from "../conexion.js";
import { Imagen } from "./Imagen.js";
import Publicacion from "./Publicacion.js";

export class Denuncia_imagen extends Model {
  static async crearDenuncia(imagenId, usuarioId, descripcion, motivo, options = {}) {
    return Denuncia_imagen.create({
      imagen_id: imagenId,
      user_id: usuarioId,
      descripcion,
      motivo,
    }, options);
  }
  static async verSiTieneTresDenuncias(id_imagen, options = {}) {
    const cantidad = await Denuncia_imagen.count({
      where: { imagen_id: id_imagen },
      distinct: true,
      col: "user_id",
      transaction: options.transaction,
    });

    if (cantidad > 3) {
      const idPublicacion = await Imagen.retornarIDDeLaPublicacionDeUnaImagen(
        id_imagen,
        { transaction: options.transaction }
      );
      if (idPublicacion == null) {
        throw new Error(`No se encontró la imagen ${id_imagen}`);
      }

      const publicacion = await Publicacion.findByPk(idPublicacion, {
        transaction: options.transaction,
      });
      if (!publicacion) {
        throw new Error(`No se encontró la publicación ${idPublicacion}`);
      }

      publicacion.EnviarAValidar = true;
      await publicacion.save({ transaction: options.transaction });
    }

    return cantidad;
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
