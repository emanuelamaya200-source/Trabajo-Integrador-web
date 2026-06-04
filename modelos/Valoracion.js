import { Model, DataTypes } from "sequelize";
import { sequelize } from "../conexion.js";
import { Imagen } from "./Imagen.js";

export class Valoracion extends Model {

static async crearValoracion(idimagen, userid, ppuntaje) {
  try {
    const [resultado, creado] = await Valoracion.findOrCreate({
      where: {
        imagen_id: idimagen,
        user_id: userid
      },
      defaults: {
        puntaje: ppuntaje
      }
    });

    if (!creado) {
      resultado.puntaje = ppuntaje;
      await resultado.save(); 
    }
    return creado;
  } catch (err) {
    console.error("Error en el modelo Valoracion:", err);
    throw err;
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
    },
    puntaje: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Valoracion",
    tableName: "valoraciones",
    timestamps: true,
  },
);