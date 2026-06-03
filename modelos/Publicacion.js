import { Model, DataTypes } from "sequelize";
import { sequelize } from "../conexion.js";
import { Etiqueta } from "./Etiqueta.js";
import { Op } from "sequelize";
import { Imagen } from "./Imagen.js";
import { Comentario } from "./Comentario.js";
import { Usuario } from "./Usuario.js";
 
export class Publicacion extends Model {
      
  static async crearPublicacion(ptitulo, pdescripcion, etiquetas) {
    try {
      const publi = await Publicacion.create({
        titulo: ptitulo,
        descripcion: pdescripcion,
      });
      
      if (etiquetas && etiquetas.length > 0) {
        for (const nombreEtiqueta of etiquetas) {
          const [etiqueta] = await Etiqueta.findOrCreate({
            where: { nombre: nombreEtiqueta }
          });

          await publi.addEtiqueta(etiqueta); 
        }
      }
      
      return publi;
      
    } catch(err) {
      console.log("Error al crear publicacion:", err);
    }
  }

  static async buscarPublicacionesTodo(todo) {
    try {
      const publicacionesCoincidentes = await Publicacion.findAll({
        attributes: ['id'], 
        where: {
          [Op.or]: [
            { titulo: { [Op.like]: `%${todo}%` } },
            { descripcion: { [Op.like]: `%${todo}%` } },
            { '$etiquetas.nombre$': { [Op.like]: `%${todo}%` } } 
          ]
        },
        include: [
          { 
            model: Etiqueta, 
            as: 'etiquetas', 
            attributes: [], 
            through: { attributes: [] } 
          }
        ],
        subQuery: false,
        raw: true 
      });

      const ids = publicacionesCoincidentes.map(p => p.id);

      if (ids.length === 0) {
        return { cantidad: 0, fila: [] };
      }

      const { count, rows } = await Publicacion.findAndCountAll({
        where: {
          id: { [Op.in]: ids } 
        },
        include: [
          { model: Imagen, as: 'imagenes' },
          { model: Etiqueta, as: 'etiquetas' }
        ],
        distinct: true
      });

      return { cantidad: count, fila: rows };
    } catch (err) {
      console.error("Error en el motor de búsqueda de 2 pasos:", err);
      throw err;
    }
  }

static async buscarUnaPublicacion(id) {
  try {
    const publicacion = await Publicacion.findByPk(id, {
      include: [
        {
          model: Imagen,
          as: "imagenes",
          include: [
            {
              model: Comentario,
              as: "comentarios", 
              include: [
                {
                  model: Usuario,
                  as: "usuario" 
                }
              ]
            }
          ]
        },
        {
          model: Etiqueta,
          as: "etiquetas"
        }
      ]
    });
    return publicacion;
  } catch (err) {
    console.error("Error al buscar la publicación por PK:", err);
    throw err;
  }
}
}

Publicacion.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    usuario_id: { 
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    titulo: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    comentarios_permitidos: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
    cantidad_denuncias: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    cantidad_valoraciones: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    promedio_valoraciones: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0.0,
    },
  },
  {
    sequelize, 
    modelName: 'publicacion', 
    tableName: 'publicaciones',
    createdAt: true,
    deletedAt: true,
    updatedAt: true,
  },
);

export default Publicacion;
