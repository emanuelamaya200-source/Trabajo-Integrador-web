import { Model, DataTypes } from "sequelize";
import { sequelize } from "../conexion.js";
import { Imagen } from "./Imagen.js";
import { Usuario } from "./Usuario.js";
import Publicacion from "./Publicacion.js";

export class Valoracion extends Model {

static async crearValoracion(idimagen, userid, ppuntaje) {
  const imagen = await Imagen.findByPk(idimagen);
  if (!imagen) {
    const error = new Error("Imagen no encontrada");
    error.code = "IMAGEN_NO_ENCONTRADA";
    throw error;
  }

  const publicacion = await Publicacion.findByPk(imagen.post_id);
  if (!publicacion) {
    const error = new Error("Publicación no encontrada");
    error.code = "PUBLICACION_NO_ENCONTRADA";
    throw error;
  }

  if (Number(publicacion.usuario_id) === Number(userid)) {
    const error = new Error("No podés valorar tu propia imagen");
    error.code = "AUTOR_NO_PUEDE_VALORAR";
    throw error;
  }

  if (!Number.isInteger(Number(ppuntaje)) || Number(ppuntaje) < 1 || Number(ppuntaje) > 10) {
    const error = new Error("La valoración debe ser un número entero entre 1 y 10");
    error.code = "VALORACION_INVALIDA";
    throw error;
  }

  const valoracionExistente = await Valoracion.findOne({
    where: {
      imagen_id: idimagen,
      user_id: userid
    }
  });

  if (valoracionExistente) {
    const error = new Error("Ya valoraste esta imagen");
    error.code = "VALORACION_DUPLICADA";
    throw error;
  }

  return Valoracion.create({
    imagen_id: idimagen,
    user_id: userid,
    puntaje: Number(ppuntaje)
  });
}
static async buscarValorisaciones(idimagen) {
  try {   
    const resultado = await Valoracion.findAll({
      where: {
        imagen_id: idimagen
      },
      include: [
        {
          model: Usuario,
          as: "usuario"
        }
      ]
    });
    return resultado;
  } catch (error) {
    console.error("Error al buscar valoraciones:", error);
    throw error; 
  }
}
}

Valoracion.init(
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
        model: Imagen,
        key: "id",
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references:{
        model: Usuario,
        key: "id"
      }
    },
    puntaje: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 10,
        isInt: true,
      },
    },
  },
  {
    sequelize,
    modelName: "Valoracion",
    tableName: "valoraciones",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["imagen_id", "user_id"],
      },
    ],
  },
);