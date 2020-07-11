require('./config/config');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

// Middlewares

// parse application/x-www/form-urlencoded
app.use(bodyParser.urlencoded({ extended:false }));

// parse application/json
app.use(bodyParser.json());

// habilitar la carpeta public
/**
 * el metodo resolve entiende que el .. significa ir a la carpeta anterior,
 * si no lo usamos y en vez de eso ponemos __dirname+'../public' tendriamos algo como esto: 
 * server/../public
 * usandolo nos saldria lo que queremos: restserver/public
 */
app.use(express.static(path.resolve(__dirname, '../public')))

// Configuración global de las rutas
app.use( require('./routes/index') );

// conección a la base de datos
mongoose.connect(process.env.URLDB, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex:true
},  (err, res) => {
        if(err) throw err;
        console.log(`Base de datos online`);
    }
);

app.listen( process.env.PORT, () => console.log(`Escuchando en el puerto ${ process.env.PORT }`));