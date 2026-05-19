import 'dotenv/config';
import express from 'express';
import pug from 'pug';
import { sequelize, conectar } from './conexion.js';
import { Sincronizar } from './sync.js';
// routers
import RegYLogin from './controller/RegYLogin.js';
import Publis from './controller/Publicaciones.js';



// CONSTANTES
const PORT = process.env.PORT;
const app = express();

//conectar
await conectar();
//sincronizar
await Sincronizar();

// limite de tamaño
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));



//cargar pug
app.set("view engine", "pug");
app.set('views', './views');

// MIDDLEWARES
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// para usar las rutas en un router
app.use(RegYLogin);
app.use(Publis)

// rutas
app.get("/",(req, res , next)=>{
    res.render("layout");  
})

// lisener del servidor
app.listen(PORT, (err) => {
  if(err) {
    console.error('Error al iniciar el servidor:', err);
    return;
  }
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

