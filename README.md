# Fotaza 2 - Web II

app para subir y compartir fotos, hecha con node, express, pug, postgresql y sequelize

repo: https://github.com/emanuelamaya200-source/Trabajo-Integrador-web  
produccion: https://trabajo-integrador-web-production.up.railway.app/
produccion2 :https://dashboard.render.com/web/srv-d8jj77mrnols7384qeeg

---

## como correrlo local

por ahora para probarlo usen el servidor de arriba, el script de sql para crear la base de datos lo voy a tener para el final

cuando este listo los pasos son:

1. clonar el repo
2. npm install
3. configurar el .env (abajo esta como)
4. npm run db:init
5. npm start

y entra en http://localhost:3000

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
```

el DB_SSL depende de donde se corra, en local va false, en railway va true

---

## usuarios de prueba

cualquiera puede registrarse desde la app directamente, no hay usuarios cargados de antes

---

## que tiene la app

- registro y login (se puede entrar con usuario o email)
- al registrarse chequea en tiempo real si el usuario o email ya existe
- crear publicaciones con titulo, descripcion, imagenes y etiquetas
- comentarios por imagen, el autor puede cerrarlos cuando quiera
- valorar imagenes (una vez por usuario, el autor no puede valorar la propia)
- buscador por titulo, descripcion y etiqueta
- seguir y dejar de seguir usuarios

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
