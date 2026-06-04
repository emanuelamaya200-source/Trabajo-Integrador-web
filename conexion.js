import 'dotenv/config';
import { Sequelize } from 'sequelize';
import pg from 'pg';

const useSSL = process.env.DB_SSL?.trim().toLowerCase() === "true";

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    dialectModule: pg,
    logging: false,
    dialectOptions: useSSL 
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          }
        }
      : {}
  }
);

async function conectar() {
  try {
    await sequelize.authenticate();
    console.log('la conexion se establecio');
  } catch (err) {
    console.error('error al conectarse:', err);
  }
}

export { conectar, sequelize };