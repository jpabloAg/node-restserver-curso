const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const Usuario = require('../models/usuario.model');
const jwt = require('jsonwebtoken');



app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({email:body.email}, (err, usuarioDB) => {
        
        if(err){
            // 500 es que ocurrio un error en el servidor o en la base de datos, algo ajeno a nosotros
            return res.status(500).json({
                ok:false,
                err
            });
        }

        // evaluamos el email
        if(!usuarioDB){
            // 400 es que la petición no se hizo correectamente, se violo alguna d e las reglas de valdiación o no se encontro el objeto esperado
            return res.status(400).json({
                ok:false,
                err:{
                    message:`Usuario con email ${body.email} no encontrado`
                }
            });
        }

        // evaluamos la contraseña
        if( !bcrypt.compareSync(body.password, usuarioDB.password) ){
            return res.status(400).json({
                ok:false,
                err:{
                    message:`Contraseña incorrecta`
                }
            });
        }
        /**
         * Generar el token:
         * 60 segundos * 60 minutos * 24 horas * 30 dias = el token expira en 30 dias
         */
        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN});

        res.json({
            ok:true,
            usuario:usuarioDB,
            token
        });
    });
});

module.exports = app;