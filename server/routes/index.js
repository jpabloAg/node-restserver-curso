const express = require('express');
const app = express();

app.use( require('./usuario.routes') );
app.use( require('./login.routes') );
app.use( require('./categoria.routes') );
app.use( require('./producto.routes') );
app.use( require('./upload.routes') );
app.use( require('./imagenes.routes') );
module.exports = app;