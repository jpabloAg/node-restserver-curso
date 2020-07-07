const express = require('express');
const app = express();

app.use( require('./usuario.routes') );
app.use( require('./login.routes') );

module.exports = app;