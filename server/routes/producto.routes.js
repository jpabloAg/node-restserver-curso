const express = require('express');
const app = express();
const { verificaToken } = require('../middlewares/autenticacion');
const Producto = require('../models/producto');
let _ = require('underscore');

// Obtener todos los productos 
app.get('/producto', verificaToken, (req, res) => {
    Producto.find({ disponible: true})
    .populate('usuario', 'nombre email')
    .populate('categoria', 'nombre descripcion')
    .limit(5)
    .sort('nombre')
    .exec((err, productosDB) => {
        if(err){
            return res.status(500).json({
                ok:false,
                err
            });
        }

        Producto.count({}, (err, cantidad) => {
            res.json({
                ok:true,
                productos:productosDB,
                cantidad
            });
        });
    });
});

// Obtener un producto por id
app.get('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    Producto.findById(id)
    .populate('usuario', 'nombre email')
    .populate('categoria', 'nombre descripcion')
    .exec((err, productoDB) => {
        if(err){
            return res.status(500).json({
                ok:false,
                err
            });
        }

        if(!productoDB){
            return res.status(404).json({
                ok:false,
                err:{
                    message: 'Ningun producto encontrado'
                }
            });
        }

        res.json({
            ok:true,
            producto:productoDB
        });
    })
})

// Buscar productos
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {
    let termino = req.params.termino;
    /**
     * traeremos todos los registros que coincidan con el termino de busqueda, para esto usaremos
     * expresiones regulares (regex)
     * RegExp(termino, 'i') es una calse de javascript normal
     * el primer argumento es lo que me llega de los parametros, el termino el cual usaremos para filtrar
     * la busquedad y crear la expresión regular, la 'i' del segundo parametro indica que la expresion
     * regular que creamos no sea sensible a las mayusculas y minisculas.
     * 
     * Antes al pasar un termino que no coincida con ninguna valor de la propiedad nombre 
     * de la base de datos de la coleccion Producto
     * nos devuelveria un array vacio, ahora con solo poner algo, lo que sea
     * nos traera todas las coincidencias
     */
    let regex = new RegExp(termino, 'i');
    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productosDB) => {
            if(err){
                return res.status(500).json({
                    ok:false,
                    err
                });
            }

            res.json({
                ok:true,
                productos:productosDB
            });
        });
});


// Crear un nuevo producto
app.post('/producto', verificaToken, (req, res) => {
    let body = req.body;
    let producto = new Producto({
        nombre:body.nombre,
        precioUni:body.precioUni,
        descripcion:body.descripcion,
        categoria:body.categoria,
        usuario: req.usuario._id
    });
    producto.save((err, productoDB) => {
        if(err){
            return res.status(500).json({
                ok:false,
                err
            });
        }

        if(!productoDB){
            return res.status(400).json({
                ok:false,
                err
            });
        }
        res.status(201).json({
            ok:true,
            producto:productoDB
        });
    });
});

// Actualizar un producto
app.put('/producto/:id', (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre','precioUni','descripcion', 'disponible']);
    Producto.findByIdAndUpdate(id, body, { new:true }, (err, productoDB) => {
        if(err){
            return res.status(500).json({
                ok:false,
                err
            });
        }
        if(!productoDB){
            return res.status(400).json({
                ok:falase,
                err:{
                    message:`No se encontro el objeto con id ${ id }`
                }
            });
        }
        res.json({
            ok:true,
            producto:productoDB
        });
    });
});

// Borrar un producto
app.put('/producto-delete/:id', (req, res) => {
    let id = req.params.id;
    Producto.findByIdAndUpdate(id, { disponible: false }, { new:true }, (err, productoDB) => {
        if(err){
            return res.status(500).json({
                ok:false,
                err
            });
        }
        if(!productoDB){
            return res.status(400).json({
                ok:falase,
                err:{
                    message:`No se encontro el objeto con id ${ id }`
                }
            });
        }
        res.json({
            ok:true,
            producto:productoDB
        });
    });
});

module.exports = app;