import { Model,  DataTypes } from "sequelize";
import {sequelize} from "../conexion.js";

export class Denuncia_publicacion extends Model {

static async creardenuncia(publicacionId, usuarioId, descripcion, motivo){
  return Denuncia_publicacion.create({
    publicacion_id: publicacionId,
    user_id: usuarioId,
    contenido: descripcion,
    motivo,
  });
}

}

Denuncia_publicacion.init({
  
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  publicacion_id: {
    type: DataTypes.INTEGER,
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
  modelName: "denuncia_publicacion",
  tableName: "denuncias_publicaciones",
  createdAt: true,
  deletedAt: true,
});