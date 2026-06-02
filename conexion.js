import 'dotenv/config.js';
import { Sequelize } from 'sequelize';
import pg from 'pg';

const ssl = process.env.DB_SSL === "true" ? {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    }
  } : undefined;

// En lugar de usar process.env.DB_HOST, usas el nombre real que tiene en Vercel:
const sequelize = new Sequelize(
  process.env.BaseDeDatosTPI_PGDATABASE, 
  process.env.BaseDeDatosTPI_PGUSER,     
  process.env.BaseDeDatosTPI_PGPASSWORD, 
  {
    host: process.env.BaseDeDatosTPI_PGHOST,
    port: 5432,
    dialect: 'postgres',
    dialectModule: pg,
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