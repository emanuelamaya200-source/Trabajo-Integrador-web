import session from 'express-session';
import { Usuario } from '../modelos/Usuario.js';
import {Publicacion} from "../modelos/Publicacion.js"
import e from 'express';

export const mostrarPerfil = async (req, res) => {
    try {
        const idPerfil = req.params.id;
        const data = await Usuario.devolverPerfil(idPerfil);
        
        if (!data) {
            return res.status(404).send("Usuario no encontrado");
        }
        const esMiPerfil = req.session.usuario && req.session.usuario.id == idPerfil;

        console.log(JSON.stringify(data, null, 2));
        res.render("perfil", { 
            usuario: data, 
            esMiPerfil: esMiPerfil 
        }); 
        
    } catch (error) {
        console.log("Error al cargar perfil:", error);
        res.status(500).send("Error interno del servidor");
    }
};

export const cambiarFotoDePerfil = async (req, res) => {
    try {
        const { imagen } = req.body; 
        const id = req.session.usuario.id;
        let usuario = await Usuario.findByPk(id);

        if (!usuario) {
            return res.status(404).send("Usuario no encontrado");
        }
        usuario.foto_de_perfil = imagen; 
        await usuario.save();
        res.sendStatus(200);

    } catch (error) {
        console.log("error al cambiar la foto de perfil", error);
        res.status(500).send("Error interno del servidor");
    }
};

export const seguirUsuario = async (req, res) => {
    try {
        const { id } = req.params; 
        const miId = req.session.usuario.id; 

        const userAAgregar = await Usuario.findByPk(id);
        
        if (!userAAgregar) {
            return res.status(404).send("Usuario no encontrado");
        }
        await userAAgregar.addSeguidores(miId); 
        res.sendStatus(200); 
    } catch (error) {
        console.log("error al seguir usuario", error);
        res.status(500).send("Error interno");
    }
};

export const cargarExplorar = async (req, res) => {
    try {
        const publicaciones = await Publicacion.findAll({
            include: [
                {
                    model: Usuario,
                    as: 'creador',
                    attributes: ['username', 'foto_de_perfil']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        const json = JSON.stringify(publicaciones,null,2)
        console.log(json)
        res.render("explorar", {
            publicaciones: publicaciones
        });

    } catch (error) {
        console.log("error al cargar el explorador", error);
        res.status(500).send("Error interno");
    }
};