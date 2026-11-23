import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import pug from 'pug';
import { randomBytes } from 'node:crypto';
import { sequelize, conectar } from './conexion.js';
import { Sincronizar } from './sync.js';
// routers
import Publicaciones from"./rutas/Publicaciones.js"
import RegYLogin from"./rutas/RegYLogin.js"
import { requireAuth } from './controller/autenticador.js';
import { mostrarInicio } from './controller/InicioControlador.js';
import perfil from './rutas/perfil.js';
import Denuncias from './rutas/Denuncias.js';

// CONSTANTES
const PORT = process.env.PORT || 3000;
const app = express();
const sessionSecret = process.env.SESSION_SECRET ||
    (process.env.NODE_ENV === 'production' ? null : randomBytes(32).toString('hex'));
if (!sessionSecret) {
  throw new Error("Falta configurar SESSION_SECRET en el archivo .env");
}

//conectar
await conectar();
//sincronizar
await Sincronizar();

// limite de tamaño
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use((req, res, next) => {
    res.locals.usuario = req.session.usuario || null;
    next();
});

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
app.use(perfil)
app.use(Denuncias)

// rutas
app.get("/", mostrarInicio);

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