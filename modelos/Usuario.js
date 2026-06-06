import { DataTypes, Model } from "sequelize";
import { sequelize } from "../conexion.js";
import { Op } from "sequelize";
import { Seguidor } from "./Seguidor.js";

export class Usuario extends Model {
  //static por que permite usar sin especificar una instancia
  static async revisarEmail(pemail) {
    const res = await Usuario.findOne({ where: { email: pemail } });
    if (res) {
      return true;
    } else {
      return false;
    }
  }
  static async revisarUsuario(usuario) {
    const res = await Usuario.findOne({ where: { username: usuario } });
    if (res) {
      return true;
    } else {
      return false;
    }
  }

  static async crearUsuario(usuario, contrasenia, email, ofertas) {
    try {
      const user = Usuario.build({
        username: usuario,
        password: contrasenia,
        email: email,
        ofertas: ofertas,
      });
      await user.save();
      return user;
    } catch (err) {
      console.log(err);
    }
  }
  static async buscarPorNombreOEmail(contenido) {
    try {
      return await Usuario.findOne({
        where: {
          [Op.or]: [
            { username: { [Op.like]: contenido } },
            { email: { [Op.like]: contenido } },
          ],
        },
      });
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  static async devolverPerfil(idusuario) {
    try {
      const perfil = await Usuario.findByPk(idusuario, {
        include: [
          {
            model: Usuario,
            as: "seguidores",
          },
          {
            model: Usuario,
            as: "seguidos",
          },
        ],
      });
      if (!perfil) return null;
      return perfil.toJSON();
    } catch (error) {
      console.error("Error al devolver el perfil completo:", error);
      throw error;
    }
  }
}

Usuario.init(
  {
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    foto_de_perfil: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    Nro_publicaciones_bajadas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    ofertas: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "Usuario",
    tableName: "usuarios",
  },
);
