import { Model, DataTypes } from "sequelize";
import { sequelize } from "../conexion.js";
import { Usuario } from "./Usuario.js"; 

export class Comentario extends Model {
  
static async crearComentario(imagenId, usuarioId, contenidoTexto) {
    try {
        const nuevoComentario = await Comentario.create({
            imagen_id: imagenId,
            user_id: usuarioId,
            contenido: contenidoTexto
        });
        return nuevoComentario;
    } catch (err) {
        console.error("Error de inserción en la base de datos (Comentario):", err);
        throw err; 
    }
}

  static async buscarComentarios(idImagen) {
    try {
      const comentarios = await Comentario.findAll({
        where: {
          imagen_id: idImagen
        },
        include: [{ 
          model: Usuario, 
          as: "usuario" 
        }]
      });
      return comentarios;
    } catch (error) {
      console.error("Error crítico al buscar comentarios en el modelo:", error);
      throw error; 
    }
  }
}

Comentario.init(
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
      field: 'imagen_id',
      references: {    
        model: 'imagenes', 
        key: 'id'         
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id', 
      references: {
        model: 'usuarios', 
        key: 'id'
      }
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    contenido: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'comentario',
    tableName: 'comentarios',
    timestamps: true,
  }
);

export default Comentario;