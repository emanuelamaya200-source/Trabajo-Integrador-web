import { Model, DataTypes } from "sequelize";
import { sequelize } from "../conexion.js";
import { Publicacion } from "./Publicacion.js";

export class Etiqueta extends Model { 

}


Etiqueta.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    }
  },
  {
    sequelize,
    modelName: "Etiqueta",
    tableName: "etiquetas",
    timestamps: true,
  },
    {
        sequelize,
        modelName: "Etiquetas",
        tableName: "etiquetas",
        timestamps: true, 
        paranoid: true,
    }
);
