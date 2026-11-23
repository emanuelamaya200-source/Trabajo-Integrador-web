# Fotaza 2 - Web II

app para subir y compartir fotos, hecha con node, express, pug, postgresql y sequelize

Github: https://github.com/emanuelamaya200-source/Trabajo-Integrador-web

apps en la web
railway: https://trabajo-integrador-web-production.up.railway.app/ 
render:https://trabajo-integrador-web.onrender.com/

video con demostracion: https://www.youtube.com/watch?v=xBSixmAtIq4

---

## como correrlo local

1. clonar el repo
2. npm install
3. copiar `.env.example` a `.env` y completar los datos de PostgreSQL
4. npm run db:init
5. npm start

y entrar en http://localhost:3000. `db:init` crea o actualiza las tablas y agrega los usuarios de prueba.

---

## variables de entorno

copiar el .env.example y renombrarlo a .env, cambiar los valores:

```
PORT=3000
DB_NAME=nombre_de_tu_bd
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_HOST=localhost
DB_PORT=5432
DB_SSL=false  
SESSION_SECRET=una_clave_larga_y_unica
```

el DB_SSL depende de donde se corra, en local va false, en railway va true

---

## usuarios de prueba

`npm run db:init` crea estos usuarios de prueba:

| Rol | Usuario | Contraseña |
|---|---|---|
| Usuario | `usuario_prueba` | `Fotaza123!` |
| Validador | `validador_prueba` | `Validador123!` |

Son cuentas para probar la aplicación, no usar estas contraseñas en un entorno real.

---

## que tiene la app

- registro y login (se puede entrar con usuario o email)
- al registrarse chequea en tiempo real si el usuario o email ya existe
- crear publicaciones con titulo, descripcion, imagenes y etiquetas
- comentarios por imagen, el autor puede cerrarlos individualmente, revisar denuncias y eliminar comentarios denunciados
- los validadores pueden revisar denuncias, mantener o dar de baja publicaciones y moderar comentarios
- denunciar usuarios, guardar favoritos y organizar publicaciones en colecciones
- marcar interes en una imagen con precio y conversar por mensajes privados
- registrar compras de publicaciones que tienen imágenes con precio
- notificaciones de nuevos seguidores, comentarios, valoraciones, mensajes e interés, que se pueden marcar como leídas
- valorar imagenes (una vez por usuario, el autor no puede valorar la propia)
- buscador con filtros combinables por texto, titulo, descripcion y etiqueta
- seguir y dejar de seguir usuarios
- sección con publicaciones de usuarios seguidos

---

## problemas que tuve y como los resolvi

lo primero fue hacer el modelo relacional y los casos de uso con paginas online para diagramas

**base de datos**  
el primer problema fue que no me tomaba la contraseña del .env y habia diferencias en los nombres de las tablas al importarlas. lo resolvi revisando las importaciones una por una hasta que anduvo. para resetear rapido mientras probaba usaba:

```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

**modelos**  
tuve que corregir varios atributos que habia definido mal. tambien cambie que los comentarios en vez de ser de la publicacion sean de cada imagen por separado

**relaciones en sequelize**  
tuve que poner `as` en muchas relaciones para que los includes devuelvan objetos con nombres que tengan sentido. aprendi tambien a anidar includes para no tener que hacer queries de mas

**imagenes**  
use FileReader() para convertir las imagenes a base64 antes de mandarlas, lo envolvi en un objeto para acceder facil a cada parte

**consultas con Op.or**  
el login acepta usuario o email usando Op.or, y el buscador busca por titulo, descripcion y etiqueta al mismo tiempo con lo mismo

**registro**  
al escribir el usuario o email hace un fetch al servidor que devuelve si ya estan en uso, si es asi no deja mandar el formulario
