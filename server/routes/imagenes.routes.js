const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const { verificaTokenImg } = require('../middlewares/autenticacion');

/**
 * sendFile envia el contenido de un archivo, en este caso estamos enviando una imagen
 * al pasarle el path absoluto en donde se encuentra
 */
/**
 * este es un ejemplo de como recuperamos una imagen usando este servicio por medio de postman
 * {{url}}/imagen/usuarios/5ef179b2b272601efc71f275-212.jpg?token={{token}}
 * donde en ?token={{token}} le estamos pasando el token por la url para luego validarlo
 * con el middleware que creamos exclusivamente para verificar tokens por url y no 
 * por los headers de la peticion, ese middleware se llama verificaTokenImg,
 * el cual es lo mismo que el middleware que verifica token por los headers, osea verificToken
 * salvo que ahora nosotros como estamos pasando el token por la url lo tenemos que recoger
 * con req.query.token y no con req.get('token').
 * 
 * para mostrar esto en la pagina web, en la url ponemos
 * http://localhost:3000/imagen/usuarios/5ef179b2b272601efc71f275-212.jpg?token=eyJhbGciOiJIUzI1NiI
 * sInR5cCI6IkpXVCJ9.eyJ1c3VhcmlvIjp7InJvbGUiOiJBRE1JTl9ST0xFIiwiZXN0YWRvIjp0cnVlLCJnb29nbGUiOmZh
 * bHNlLCJfaWQiOiI1ZWYxNzlkNGIyNzI2MDFlZmM3MWYyNzgiLCJub21icmUiOiJMaW5rIiwiZW1haWwiOiJ0ZXN0NEB1ZGV
 * hLmVkdS5jbyIsIl9fdiI6MH0sImlhdCI6MTU5NTU3Mjg2MSwiZXhwIjoxNTk1NzQ1NjYxfQ.ZulcndjPDjPiOHD2CDCHDR
 * B6qhH1FnW3DAL03m-vpKU 
 * 
 * y para mostrarlo con una etiqueta <img> hacemos:
 * <img src="http://localhost:3000/imagen/usuarios/5ef179b2b272601efc71f275-212.jpg?token=http://localhost:3000/imagen/usuarios/5ef179b2b272601efc71f275-212.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3VhcmlvIjp7InJvbGUiOiJBRE1JTl9ST0xFIiwiZXN0YWRvIjp0cnVlLCJnb29nbGUiOmZhbHNlLCJfaWQiOiI1ZWYxNzlkNGIyNzI2MDFlZmM3MWYyNzgiLCJub21icmUiOiJMaW5rIiwiZW1haWwiOiJ0ZXN0NEB1ZGVhLmVkdS5jbyIsIl9fdiI6MH0sImlhdCI6MTU5NTU3Mjg2MSwiZXhwIjoxNTk1NzQ1NjYxfQ.ZulcndjPDjPiOHD2CDCHDRB6qhH1FnW3DAL03m-vpKU" alt="">
 * 
 * ==================== OJO ========================
 * El token expira en 48 horas, por lo que esta url que estoy usando en postman, desde internet y
 * en el html en la etiqueta img no va a servir, debo generar un nuevo token 
 * */
app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) => {
    let tipo = req.params.tipo;
    let img = req.params.img;

    let pathImg = path.resolve(__dirname, `../../uploads/${ tipo }/${ img }`);
    let noImagePath = path.resolve(__dirname, `../assets/no-image.jpg`); 
    

    if(fs.existsSync(pathImg)){
        res.sendFile(pathImg);
        /**
         * Para renderizar vistas html por lo que veo solo se puede hacer con 
         * sendFile y especificando la ruta absoluta, no se puede usar res.render, ni
         * tampoco poner directamente en el parametro de sendFile el nombre
         * del arhcivo .html a renderizar a pesar de que este en la carpeta que especificamos
         * que iba a ser publica 'public', cosa que si se podia cuando usabamos motores
         * de plantillas
         */
        //res.sendFile(path.resolve(__dirname, '../../public/showimg.html'));
    }else{
        res.sendFile(noImagePath);
    }    
});

module.exports = app;