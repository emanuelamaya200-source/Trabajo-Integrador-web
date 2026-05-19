import { Usuario } from '../modules/Usuario.js';
import { Imagen } from '../modules/Imagen.js';
import { Publicacion } from '../modules/Publicacion.js';
import express from 'express';

const Publis = express.Router();

//crear publicacion
Publis.get("/CrearPublicacion",async(req,res)=>{
    res.render("Publicaciones/crearPubli");
})

Publis.post("/CrearPublicacion", async (req, res) => { 
  try{
    //crear publicacion
    const { imagenes, titulo, descripcion, etiquetas } = req.body;
    console.log(etiquetas);
    const publicacion = await Publicacion.crearPublicacion(titulo, descripcion, etiquetas);
   //crear imagenes
    if (publicacion) {
      for (const element of imagenes) {
        await Imagen.crearImagen(publicacion.id, element.base64, element.copyrigth, element.licencia);
      }
    }
  }catch(err){
    console.log(err)
  }
  res.json({ ok: true });
});


export default Publis;