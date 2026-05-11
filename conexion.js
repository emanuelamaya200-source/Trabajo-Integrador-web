import 'dotenv/config.js';
import { Sequelize } from 'sequelize';



const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
  }
);

// Envolver la autenticación en una función async
async function conectar() {
  try {
    await sequelize.authenticate();
    console.log('la conexion se estableio');
  } catch (err) {
    console.error('error al conectarse:', err);
   
  }
}

export { sequelize, conectar };