import 'dotenv/config';
import { Sequelize } from 'sequelize';
import pg from 'pg';

const sslOptions = process.env.DB_SSL === "true" ? {
  ssl: {
    require: true,
    rejectUnauthorized: false,
  }
} : false;

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    dialectModule: pg,
    logging: false,
    dialectOptions: sslOptions ? { ssl: sslOptions.ssl } : {}
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