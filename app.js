import 'dotenv/config';
import express from 'express';
import pug from 'pug';
import { sequelize, conectar } from './conexion.js';
import { Sincronizar } from './sync.js';

//conectar
await conectar();
//sincronizar
await Sincronizar();

// CONSTANTES
const PORT = process.env.PORT;
const app = express();

//cargar pug
app.set("view engine", "pug");
app.set('views', './views');

// MIDDLEWARES
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// rutas
app.get("/",(req, res , next)=>{
    res.render("layout");
})

app.get("/login",(req, res , next)=>{
    res.render("login");
})

app.get("/signup",(req, res , next)=>{
    res.render("registrarse");
})

// lisener del servidor
app.listen(PORT, (err) => {
  if(err) {
    console.error('Error al iniciar el servidor:', err);
    return;
  }
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

