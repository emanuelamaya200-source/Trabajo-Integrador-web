import { DataTypes } from 'sequelize';
import { sequelize } from "../conexion.js";

export const PublicacionEtiqueta = sequelize.define('PublicacionEtiqueta', {
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    publicacionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true, 
        references: {
            model: 'publicaciones', 
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    etiquetaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true, 
        references: {
            model: 'etiquetas', 
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    }
}, {
    tableName: 'PublicacionEtiqueta',
    timestamps: true, 
});

export default PublicacionEtiqueta;