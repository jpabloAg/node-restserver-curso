require('./config/config');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


// Middlewares
app.use(bodyParser.urlencoded({ extended:false }));
app.use(bodyParser.json());

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