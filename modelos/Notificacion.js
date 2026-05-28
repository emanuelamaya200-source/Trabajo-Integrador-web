import { Model, DataTypes } from "sequelize";
import { sequelize } from "../conexion.js";

export class Notificacion extends Model {}

Notificacion.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    fecha: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    leida: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    sequelize,
    modelName: "Notificacion",
    tableName: "notificaciones",
});