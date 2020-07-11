const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const Usuario = require('../models/usuario.model');
const jwt = require('jsonwebtoken');
/**
 * usamos la libreria google-auth-library que nos ofrece google para validar el token, para eso tuvimos
 * que instalarla en nuestra aplicacion: npm install google-auth-library --save
 */
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            // 500 es que ocurrio un error en el servidor o en la base de datos, algo ajeno a nosotros
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // evaluamos el email
        if (!usuarioDB) {
            // 400 es que la petición no se hizo correectamente, se violo alguna d e las reglas de valdiación o no se encontro el objeto esperado
            return res.status(400).json({
                ok: false,
                err: {
                    message: `Usuario con email ${body.email} no encontrado`
                }
            });
        }

        // evaluamos la contraseña
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: `Contraseña incorrecta`
                }
            });
        }
        /**
         * Generar el token:
         * 60 segundos * 60 minutos * 24 horas * 30 dias = el token expira en 30 dias
         */
        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });
    });
});

// podemos generar funciones normalitas de javascript vanilla en node js
// Configuraciones de Google
/**
 * usamos el token que genera google para construir el usuario 
 */
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  
    });
    /**
     * recogemos el payload del token que genera google, ese payload contiene 
     * la informacion del usario que ingreso usando el boton de google
     * en la constante payload almacenamos toda la informacion del usaurio: el nombre, el email la imagen y mas cosas
     * payload es como el objeto profile que este ne el index.html
     */
    const payload = ticket.getPayload();
    console.log('nombre del usaurio: ',payload.name);
    console.log('email del usuario: ', payload.email);
    console.log('imagen del usuario: ', payload.picture);
    /*Las propiedades del objeto json que estamos retornando concuerdan en nombre con las propiedades
    que definimos en el esquema del modelo de Usuarios*/
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

// ruta para loguearse en mi app por medio de google
app.post('/google', async (req, res) => {
    let token = req.body.idtoken;//recogemos el token que genera google desde el lado del servidor mediante una peticion http usando post por medio del cliente
    let googleUser = await verify(token)
                        .catch( err => {//recogemos el error por si el token es invalido, no es correcto
                            return res.status(403).json({
                                ok:false,
                                err
                            });
                        });
    /**
     * Lo que haremos con esto es verificar si la persona que se logueo con el boton de google existe 
     * en mi base de datos en mongoDB
     */
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        if(err){
            return res.status(500).json({
                ok:false,
                err
            });
        }
        /**
         * 
         * Cuando yo creo un usario con la ruta que cree para eso, le defino por defecto a propiedad
         * google en false, cuando esta se autentica con mi ruta de /login esta propiedad sigue en false;
         * la propiedad google me sirve para saber si alguien se ha autenticado en mi apicacion por medio
         * de google, esto lo se porque la funcion verify consiste en recoger el token que genera google
         * con los datos del usario que ingreso a mi app por medio de google y tomar ese token para obtener
         * el payload, luego en esa funcion retornar la informacion del usario junto con un agregado mas
         * que sera la bandera con la que podre saber como se ha autenticado mi usuario, este agregado
         * es la propiedad google la cual la pongo en true cuando se pasa por el metodo verify, y para
         * pasar por este metodo una persona debe de ingresar a mi app por medio de google. 
         * 
         * Con el if verificamos si realmente existe el usario en mi base de datos de mongodb, en caso
         * de que exista verificamos si este se autentico por medeio de /login (google = false) o lo
         * hizo por medio de google (google = true ) 
         */
        if( usuarioDB ){
            if( usuarioDB.google === false ){
                return res.status(400).json({
                    ok:false,
                    err: {
                        message: 'Debe de usar su autenticación normal'
                    }
                });
            }else{ // usuario autenticado por google
                let token = jwt.sign({
                    Usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
    
                return res.json({
                    ok:true,
                    usuario:usuarioDB,
                    token
                });
            }
        }else{
            // si el usario no existe en la base de datos de mongodb, en este caso lo crearemos
            let usuario = new Usuario({
                nombre: googleUser.nombre,
                email: googleUser.email,
                img: googleUser.img,
                google: true,
                password: ':)'
            });

            usuario.save((err, usuarioSaveDB) => {
                if(err){
                    return res.status(400).json({
                        ok:false,
                        err
                    });
                }

                let token = jwt.sign({
                    Usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
                //esta respuesta la recogeremos en el objeto xhr.responseText
                return res.json({
                    ok:true,
                    usuario:usuarioSaveDB,
                    token
                });
            });
        }
    });
});

module.exports = app;