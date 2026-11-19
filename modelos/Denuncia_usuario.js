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
    references: {
      model: "usuarios",
      key: "id",
    },
  },
  denunciante_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "usuarios",
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
}, {
  sequelize,
  modelName: "denuncia_usuario",
  tableName: "denuncias_usuarios",
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ["user_id", "denunciante_id"],
    },
  ],
});