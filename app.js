import 'dotenv/config';
import express from 'express';
import pug from 'pug';
import { sequelize, conectar } from './conexion.js';
import { Sincronizar } from './sync.js';
// routers
import RegYLogin from './controller/registroylogin.js';


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

// para usar las rutas en un router
app.use(RegYLogin);

// lisener del servidor
app.listen(PORT, (err) => {
  if(err) {
    console.error('Error al iniciar el servidor:', err);
    return;
  }
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

