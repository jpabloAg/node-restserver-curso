const express = require('express');
const app = express();
const Usuario = require('../models/usuario.model');
const bcrypt = require('bcrypt');
const _ = require('underscore');

//requirimos mi middleware
const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

app.get('/', (req,res) => {
    res.send('Welcome to my first restServer');
})

/**
 * Consultamos todos los registros que esten activos, que su propiedad 'estado' este a true
 * y mostramos todos los campos de estos registros
 * unicamente mostramos los registros con estado en true, porque los registros cuyo estado sean
 * false estan eliminados logicamente
 * Usamos el middleware merificaToken
 * 
 * Al usar el middleware verificaToken estamos en laobligación de pasarle un header a esta ruta,
 * para poder acceder a su contenido, en concreto a pasarle un token
 */
app.get('/usuarios', verificaToken, (req,res)=>{
    // req.usuario es una nueva propiedad que creamos en el middleware, la cual almacena el 
    // payload que se uso para crear el token (decoded.usuario) en el archivo login.routes.js
    console.log(`usuario: ${ req.usuario } 
    nombre: ${ req.usuario.nombre }
    email: ${ req.usuario.email }`); 
    
    Usuario.find({ estado:true }).exec((err, usuariosDB) => {
        if(err){
            return res.status(400).json({
                ok:false,
                err
            });
        }
        Usuario.count({ estado:true }, (err, conteo) => {
            res.json({
                ok:true,
                usuarios:usuariosDB,
                cuantos:conteo
            });
        })
    });
});

/**
 * Consultamos solamente los registros que en el campo 'role' sean 'ADMIN_ROLE' y unicamente
 * mostramos las propiedaddes 'nombre', 'email' y 'google'
 */
app.get('/usuarios-filtrados', (req,res)=>{
    Usuario.find({ role:'ADMIN_ROLE' }, 'nombre email google').exec((err, usuariosDB) => {
        if(err){
            return res.status(400).json({
                ok:false,
                err
            });
        }
        Usuario.count({ role: 'ADMIN_ROLE' }, (err, conteo) => {
            res.json({
                ok:true,
                usuarios:usuariosDB,
                cuantos:conteo
            });
        })
    });
});

app.get('/usuarios/:cantidad', (req,res)=>{
    let cantidadUsuarios = +req.params.cantidad;
    Usuario.find({ }).limit(cantidadUsuarios).exec((err, usuariosDB) => {
        if(err){
            return res.status(400).json({
                ok:false,
                err
            });
        }
        Usuario.count({}, (err, conteo) => {
            res.json({
                ok:true,
                usuarios:usuariosDB,
                cuantos:conteo
            });
        })
    });
});

/**
 * Consultamos la cantidad de datos que queremos e indicamos desde donde los queremos consultar
 * Nota: si en la condición del find hubieramos puesto find({ role:'ADMIN_ROLE'})
 * el valor de 'desde' y 'cantidad' repercutiran sobre los registros que fueron traidos de la base de datos
 * y que cumplieron la condición, si fuesen cuatro registos por ejemplo el registro 1,3,5 y 8
 * y ponemos 'desde' igual a 2 y 'cantidad' igual a 2, entonces obtendremos los registros 5 y 8
 */
app.get('/usuarios-algunos', (req,res)=>{
    //parametros opcionales
    let desde = +req.query.desde || 0;
    let cantidadUsuarios = +req.query.cantidad || 16;
    Usuario.find({}).skip(desde).limit(cantidadUsuarios).exec((err, usuariosDB) => {
        if(err){
            return res.status(400).json({
                ok:false,
                err
            });
        }

        Usuario.count({}, (err, conteo) => {
            res.json({
                ok:true,
                usuarios:usuariosDB,
                cuantos:conteo
            });
        });
    });
});

app.post('/usuario', [verificaToken, verificaAdmin_Role], (req, res) =>{
    let body = req.body;
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password:  bcrypt.hashSync( body.password, 10),
        role: body.role
    }); 

    usuario.save( (err, usuarioDB) => {
        if(err){
            return res.status(400).json({
                ok:false,//ok:false significa que no se hizo la peticion correctamente, es lo que significa 400
                err
            });
        }
        res.json({
            ok:true, //ok:true todo se hizo correctamente
            usuario: usuarioDB
        });
    });
});

app.put('/usuario/:id', [verificaToken, verificaAdmin_Role], (req ,res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre','email','img','role','estado']);

    Usuario.findByIdAndUpdate(id, body, { new:true, runValidators:true }, (err, usuarioDB) => {
        if(err){
            return res.status(400).json({
                ok:false,
                err
            });
        }
        res.json({
            ok:true,
            usuario:usuarioDB
        });
    });
});

/* Borrado fisico*/
app.delete('/usuario/:id', [verificaToken, verificaAdmin_Role   ], (req ,res) => {
    let id = req.params.id;
    Usuario.findByIdAndRemove(id, ( err, usuarioBorrado) => {
        if(err){
            return res.status(400).json({
                ok:false,
                err
            });
        }

        /**
         * Usamos este if porque si intentamos borrar un registro que no existe el programa no
         * lo interpreta como un error, osea que no pasa por el primer if, lo que significa que 'err'
         * no contiene nada y ademas 'usuarioBorrado' es igual a null, pasando
         * al ultimo res.json retornandonos {ok:true, usaurio:null}, con este if verificamos ese
         * error, comprobando si usaurioBorrado contiene algo, en caso de que no contenga nada, osea
         * que es null, signicia que estamos intentando borrar un registro que no existe, en ese caso
         * respondemos con un {ok:false, message:'usuario no encontrado'}
         */
        if(!usuarioBorrado){
            return res.status(400).json({
                ok:false,
                err:{
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok:true,
            usuario:usuarioBorrado
        });
    });
});

/* Borrado logico: cambiamos el valor de la propiedad 'estado' a false*/
app.put('/usuario-delete/:id', verificaToken,(req, res) => {
    let id = req.params.id;
    let cambiaEstado = {
        estado:false
    }
    Usuario.findByIdAndUpdate(id, cambiaEstado, { new:true }, (err, usuarioBorrado) => {
        if(err){
            return res.status(400).json({
                ok:false,
                err
            });
        }
        res.json({
            ok:true,
            usuario:usuarioBorrado
        });
    });
});

module.exports = app;