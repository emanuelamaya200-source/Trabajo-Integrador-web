import 'dotenv/config.js';
import { Sequelize } from 'sequelize';
import pg from 'pg';

const ssl = process.env.DB_SSL === "true" ? {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    }
  } : undefined;

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    dialectModule: 'pg',
    logging: false,
    dialectOptions: ssl
  }
);

// Envolver la autenticación en una función async
async function conectar() {
  try {
    await sequelize.authenticate();
    console.log('la conexion se establecio');

  } catch (err) {
    console.error('error al conectarse:', err);
   
  }
}
export { conectar, sequelize};