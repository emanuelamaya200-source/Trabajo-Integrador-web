import 'dotenv/config';
import express from 'express';
import pug from 'pug';
import { sequelize, conectar } from './conexion.js';
import { Sincronizar } from './sync.js';
// routers
import Publicaciones from"./rutas/Publicaciones.js"
import RegYLogin from"./rutas/RegYLogin.js"



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
app.use(Publicaciones)

// rutas
app.get("/",(req, res , next)=>{
    res.render("layout");  
})

// welcome sirve para mostrar un solo mensaje
Publicaciones.get('/welcome', (req, res) => {
  try{
    res.render('./extra/welcome', { nombre: "Publicación Creada" });
}catch(err){
  console.log(err)
  res.status(500).send("error en el servidor")
  }
});

// lisener del servidor
app.listen(PORT, (err) => {
  if(err) {
    console.error('Error al iniciar el servidor:', err);
    return;
  }
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

 export default app