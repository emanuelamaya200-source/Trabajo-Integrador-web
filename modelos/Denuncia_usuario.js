import { Model,  DataTypes } from "sequelize";
import {sequelize} from "../conexion.js";

export class Denuncia_usuario extends Model {}

Denuncia_usuario.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
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
    allowNull: true,
  },
}, {
  sequelize,
  modelName: "denuncia_usuario",
  tableName: "denuncias_usuarios",
  createdAt: true,
  deletedAt: true,
});