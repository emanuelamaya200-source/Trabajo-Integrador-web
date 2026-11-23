import { Model, DataTypes } from "sequelize";
import { sequelize } from "../conexion.js";
import { Etiqueta } from "./Etiqueta.js";
import { Op } from "sequelize";
import { Imagen } from "./Imagen.js";
import { Comentario } from "./Comentario.js";
import { Usuario } from "./Usuario.js";
import { Valoracion } from "./Valoracion.js";
 
export class Publicacion extends Model {
      
static async crearPublicacion(ptitulo, pdescripcion, etiquetas, idUsuario) {
  try {
    const publi = await Publicacion.create({
      titulo: ptitulo,
      descripcion: pdescripcion,
      usuario_id: idUsuario 
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

  static async buscarPublicacionesTodo(todo, logueado = false) {
    return Publicacion.buscarPublicacionesConFiltros({ texto: todo }, logueado);
  }

  static async buscarPublicacionesConFiltros(filtros, logueado = false) {
    try {
      const condiciones = [];

      if (filtros.texto) {
        condiciones.push({
          [Op.or]: [
            { titulo: { [Op.like]: `%${filtros.texto}%` } },
            { descripcion: { [Op.like]: `%${filtros.texto}%` } },
            { '$etiquetas.nombre$': { [Op.like]: `%${filtros.texto}%` } }
          ]
        });
      }
      if (filtros.titulo) {
        condiciones.push({ titulo: { [Op.like]: `%${filtros.titulo}%` } });
      }
      if (filtros.descripcion) {
        condiciones.push({ descripcion: { [Op.like]: `%${filtros.descripcion}%` } });
      }
      if (filtros.etiqueta) {
        condiciones.push({ '$etiquetas.nombre$': { [Op.like]: `%${filtros.etiqueta}%` } });
      }

      if (condiciones.length === 0) {
        return { cantidad: 0, fila: [] };
      }

      const publicacionesCoincidentes = await Publicacion.findAll({
        attributes: ['id'],
        where: {
          estado: true,
          bloqueada_por_denuncia: false,
          [Op.and]: condiciones
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
          id: { [Op.in]: ids },
          estado: true,
          bloqueada_por_denuncia: false
        },
        include: [
          {
            model: Imagen,
            as: 'imagenes',
            where: logueado ? undefined : { copyrigth: false }
          },
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

  static async buscarUnaPublicacion(id, logueado = false, esValidador = false) {
    try {
      const publicacion = await Publicacion.findOne({
        where: esValidador
          ? { id }
          : { id, estado: true, bloqueada_por_denuncia: false },
        include: [
          {
            model: Imagen,
            as: "imagenes",
            where: logueado ? undefined : { copyrigth: false },
            required: false,
            include: [
              {
                model: Comentario,
                as: "comentarios",
                include: [{ model: Usuario, as: "usuario" }]
              },
              {
                model: Valoracion,
                as: "valoraciones"
              }
            ]
          },
          {
            model: Etiqueta,
            as: "etiquetas"
          },
          {
            model: Usuario,
            as: "creador"
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
    bloqueada_por_denuncia: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
      EnviarAValidar: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
