require('./config/config');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');


// Middeleware para la configuracion de la informacion que me llegue via post

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended:false }));

// parse application/json
app.use(bodyParser.json());

app.get('/', (req,res) => {
    res.send('Welcome to my restServer');
});

app.get('/usuario', (req,res)=>{
    res.json('get Usuario');
});

app.post('/usuario', (req, res) =>{
    let body = req.body;
    console.log(body);
    // tiene que ser con === con el doble igual == no funciona
    if( body.nombre === undefined ){
        
        res.status(400).json({
            ok:false,
            mensaje: 'El nombre es necesario'
        });

    }else{
        res.json({
            persona: body
        });
    }
});

app.put('/usuario', (req ,res) => {
    res.json('put Usuario');
});

app.put('/usuario/:id', (req ,res) => {
    console.log(req.params);
    let id = req.params.id;
    res.json({
        id
    });
});


app.delete('/usuario', (req ,res) => {
    res.json('delete Usuario');
});

app.listen( process.env.PORT, () => console.log(`Escuchando en el puerto ${ process.env.PORT }`));