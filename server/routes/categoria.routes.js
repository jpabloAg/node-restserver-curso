const express = require('express');
let app = express();
let { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');
let Categoria = require('../models/categoria.model');

// todas las categorias
app.get('/categoria', verificaToken, (req, res) => {
    Categoria.find({})
            .sort('nombre')
            .populate('usuario', 'nombre email')
            .exec((err, categoriasDB) => {
        if(err){
            return res.status(500).json({
                ok:false,
                err
            });
        }
        
        if(!categoriasDB){
            return res.status(404).json({
                ok:false,
                err:{
                    message: 'Ninguna categoria existente'
                }
            })
        }

        Categoria.count({}, (err, cantidad) => {
            res.json({
                ok:true,
                categorias:categoriasDB,
                cantidad
            });
        });
    });
});

// mostrar una categoria por id
app.get('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    Categoria.findById( id ).exec((err, categoriaDB) => {
        if(err){
            return res.status(500).json({
                ok:false,
                err
            });
        }
        if(!categoriaDB){
            return res.status(404).json({
                ok:false,
                err:{
                    message:`Ninguna categoria encontrada con id ${ id }`
                }
            });
        }

        res.json({
            ok:true,
            categoria:categoriaDB
        });
    });
});

// crear nueva categoria
app.post('/categoria', verificaToken, (req, res) => {
    let body = req.body;
    let categoria = new Categoria({
        nombre: body.nombre,
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });
    categoria.save( (err, categoriaDB) => {
        //error del sistema de base de datos
        if(err){
            return res.status(500).json({
                ok:false,
                err
            });
        }
        //cuuando no se creo la categoria, porque falto informacion obligatoria o inrespeto los 
        //requerimientos impuestos en la creacion del modelo para las categorias
        if(!categoriaDB){
            return res.status(400).json({
                ok:false,
                err//el mensaje que dice el porque no se creo la categoria
            });
        }
        
        res.json({
            ok:true,
            categoria:categoriaDB
        });
    });
});

// Actualizar categorias, el nombre
app.put('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    let id = req.params.id;
    Categoria.findByIdAndUpdate(id, { nombre: req.body.nombre }, { new:true, runValidators:true}, (err, categoriaDB) => {
        if(err){
            return res.status(500).json({
                ok:false,
                err
            });
        }
        if(!categoriaDB){
            return res.status(400).json({
                ok:false,
                err:{
                    message:`No se pudo actualizar la categoria con id ${ id }`   
                }
            });
        }
        res.json({
            ok:true,
            categoria:categoriaDB
        });
    });
});

// Borrar categoria, solo un administrador puede borrar categorias
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    let id = req.params.id;
    Categoria.findByIdAndRemove(id, (err, categoriaDelete) => {
        if(err){
            return res.status(500).json({
                ok:false,
                err
            });
        }
        if(!categoriaDelete){
            return res.status(400).json({
                ok:false,
                err:{
                    message: `No existe categoria con id ${ id }`
                }
            });
        }
        res.json({
            ok:true,
            message:'Categoria borrada',
            categoria:categoriaDelete
        });
    });
});


module.exports = app;