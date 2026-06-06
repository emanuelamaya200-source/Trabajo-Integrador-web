import { DataTypes, Model } from "sequelize"
import { sequelize } from "../conexion.js" // Acordate del .js si usás ESM
import { Usuario } from "./Usuario.js"

class Seguidor extends Model {}

Seguidor.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    seguidor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        //deja usuario para despues
        model: () => Usuario, 
        key: "id"
      }
    },
    seguido_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: () => Usuario, 
        key: "id"
      }
    },
    fecha_inicio: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "seguidos",
    sequelize
  }
)

export { Seguidor }