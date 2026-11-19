import { Model, DataTypes } from "sequelize";
import { sequelize } from "../conexion.js";

export class Coleccion extends Model {}

Coleccion.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        titulo: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        categoria: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        usuario_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "usuarios",
                key: "id",
            },
        },
        publico: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        sequelize,
        modelName: 'Coleccion',
        tableName: 'colecciones',
    }
);