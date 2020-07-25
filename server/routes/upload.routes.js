const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const fs = require('fs');//requerimos el modulo de fileSystem
const path = require('path');
const Usuario = require('../models/usuario.model');
const Producto = require('../models/producto');
const producto = require('../models/producto');

// esta ruta es solo para probar la subida de archivos, se subiran directamente en la carpeta uploads
app.post('/upload', (req, res) => {
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Ningun archivo seleccionado'
            }
        });
    }

    let filex = req.files.archivo;

    // verificar la extencion del archivo, para subir unicamente los archivos cuyas extensiones esten en el arreglo extensionesValidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    let extension = filex.mimetype.split('/')[1];

    console.log(`tipo archivo: ${filex.mimetype} \nExtension: ${extension}`);
    console.log(filex.name);
    if (extensionesValidas.indexOf(extension) == -1) {
        return res.status(400).json({
            ok: false,
            err: {
                message: `No se permiten subir archivos con extensión ${extension}`
            }
        });
    }

    console.log(filex);
    filex.mv(`uploads/${filex.name}`, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                //no hace falta personalizar el error, ya en el paramtro del callback esta la información, por ejemplo cuando no se coloco bien la ruta en donde se guardara el archivo
                err
            });
        }

        res.json({
            ok: true,
            message: 'Imagen subida correctamente',
            archivo: {
                name: filex.name,
                type: filex.mimetype
            }
        });
    });
});

// ======================================================================

/**
 * subir imagenes de los usuarios o de los productos dependiendo del valor que se le pase
 * al parametro id indica a que usuario o a que producto pertenece la imagen 
 */
app.put('/upload/:tipo/:id', (req, res) => {
    let tipo = req.params.tipo.toLowerCase();
    let id = req.params.id;

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Ningun archivo seleccionado'
            }
        });
    }

    // validar el tipo que me puede llegar
    let tiposValidos = ['usuarios', 'productos'];
    if(tiposValidos.indexOf(tipo) == -1){
        return res.status(400).json({
            ok:false,
            err:{
                message: `Solo se permite tipo usuarios o productos`
            }
        })
    }

    /**
     * validare la extension a apartir del nombre del archivo filex.name, no con la propiedad mimetype
     * porque esta me saca unas extensiones todas reras, en vez de jpg saca jpeg y asi con otras
     * a apartir del nombre es mas confiable
     */
    let filex = req.files.archivo;
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    let extension = filex.name.split('.')[1];
    console.log(extension);
    if (extensionesValidas.indexOf(extension) == -1) {
        return res.status(400).json({
            ok: false,
            err: {
                message: `No se permiten subir archivos con extensión ${extension}`
            }
        });
    }

    // cambiar el nombre del archivo, generaremos un nombre unico apartir del id del usaurio o producto,
    // la fecha en la que se subio el archivo y la extension de este
    // lo que obtendremos es algo asi: 654564asd-123.jpg este sera el nuevo nombre del archivo
    // donde 654564asd es un id del usuario o producto, 123 son los milisegundos que van de 0 a 999 y jpg es la extension 
    let nameFile = `${ id }-${ new Date().getMilliseconds() }.${ extension }`
    console.log(tipo);
    filex.mv(`uploads/${ tipo }/${ nameFile }`, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                //no hace falta personalizar el error, ya en el paramtro del callback esta la información, por ejemplo cuando no se coloco bien la ruta en donde se guardara el archivo
                err
            });
        }

        // Hasta este punto la imagen ya se cargo en el archivo usuario o productos dentro de uploads
        // lo que haremos ahora es actualizar el campo img del usuario o del producto
        // Nota: primero se sube la imagen en el directorio uploads/usuarios o uploads/productos y 
        // despues se actualiza el usuario o producto con esa imagen, por lo que hay que borrar 
        // la imagen si el usuario o producto con el id pasado a esta peticion no existe o ocurrio un error que no depende de nosotros
        if(tipo === 'usuarios'){
            imagenUsuario(id, res, nameFile);
        }else{
            imagenProducto(id, res, nameFile);
        }

    });
});

// crearemos funciones para actualizar el registro de usuario o producto al subir una imagen, porque la peticion anterior ya esta muy cargada
// a diferencia del esquema Usuario que es de ambito global que lo podemos usar aca, el objeto res
// no es global, solo existe en la peticio /upload/:tipo:id por lo que se debe de pasar como parametro
function imagenUsuario(id, res, nameFile){
    // otra forma de actualizar un registro: primero verificamos si existe con el findById y luego lo guardamos como si fuera un nuevo registro con el metodo save
    Usuario.findById(id, (err, usuarioDB) => {
        // error en el sistema
        if(err){
            // si ocurre un error que es ageno a nosotros no se acutalizara el objeto con la imagen que pasemos
            // pero esta imagen si que se subira al directorio uploads/usuarios o uploads/productos
            // en ese caso borramos la imagen que se acaba de subir a ese directorio
            borraArchivo('usuarios', nameFile);
            return res.status(500).json({
                ok:false,
                err
            });
        }
        //no encontro el usuario
        if(!usuarioDB){
            // si el usuario no existe porque el id que se mando es incorrecto 
            // entonces debemos de borrar la imagen que se guardo en 
            // el directorio uploads/ususarios o uploads/productos
            borraArchivo('usuarios', nameFile);
            return res.status(404).json({
                ok:false,
                err:{
                    message: `No se encontro el usuario con id ${ id }`
                }
            });
        }

        /**
         * si llegamos aca es porque el usuario existe, entonces lo actualizaremos 
         * como si lo fueramos a guardar, pero primero debemos de verificar si este usuario 
         * ya tiene una imagen guardada en la base de datos, si eso es cierto entonces debemos de
         * borrar la imagen que esta en la carpeta uploads/usuarios porque si no tendremos
         * archivos basura, esto es porque si ya tiene una imagen y desea actualizarla esta se
         * actualizara en la base de datos, pero en la carpeta uploads/usurios quedara el nombre
         * de la imagen anterior, esto lo vemos al subir varias imagenes con el id del mismo usuario
         * ovbiamente haciendo varias peticiones, porque no podemos subir mas de un archivo.
         * usuarioDB.img es el nombre de la imagen vieja, la que se quiere cambiar por la nueva
         */ 

        borraArchivo('usuarios', usuarioDB.img);

        // lo que subimos a la base de datos es el nombre de la imagen, no la direccion de esta en mi servidor
        usuarioDB.img = nameFile;
        usuarioDB.save((err, usuarioUpdatedDB) => {
            if(err){
                return res.status(500).json({
                    ok:false,
                    err
                });
            }

            res.json({
                ok:true,
                usuario:usuarioUpdatedDB,
                message:`Se ha actualizado el usuario con la imagen: ${ nameFile }`
            })
        });
    });
}   

function imagenProducto(id, res, nameFile){
    Producto.findById(id, (err, productoDB) => {
        if(err){
            borraArchivo('productos', nameFile);
            return res.status(500).json({
                ok:false,
                err
            });
        }

        if(!productoDB){
            borraArchivo('productos', nameFile);
            return res.status(404).json({
                ok:false,
                err:{
                    message:`No se encontro ningun producto con el id ${ id }`
                }
            });
        }

        borraArchivo('productos', productoDB.img);

        productoDB.img = nameFile;
        productoDB.save((err, productoUpdateDB) => {
            if(err){
                return res.status(500).json({
                    ok:false,
                    err
                });
            }

            res.json({
                ok:true,
                producto:productoUpdateDB,
                message:`Se ha actualizado el usuario con la imagen: ${ nameFile }`
            });
        });

    });

}

function borraArchivo(tipo,oldImg){
    //oldImg es el nombre de la imagen hipotetica que tiene el usuarioDB
    //ruta hipotetica donde el objeto usuarioDB tiene almacenado su imagen
    let pathImagen =  path.resolve(__dirname, `../../uploads/${ tipo }/${ oldImg }`);
    console.log(pathImagen);
    /**
     * Ahora confirmaremos con el modulo fileSystem si el path, la ruta que esta en la variable
     * pathImage existe, si existe es porque el usuario tiene una imagen guardada en el directorio
     * uploads/usuarios con ruta igual a lo que tiene almacenado pathImagen, entonces procederemos a borrar dicha imagen,
     * la funcion existsSync es sincrona, no funciona con callbacks ni promesas
     * fs.existsSync( path del archivo que queremos verificar su existencia ) 
     * regresa un true si el archivo existe o false si no existe
     * fs.unlinkSync( path del arhivo a borrar )
     */
    if( fs.existsSync( pathImagen ) ){
        fs.unlinkSync( pathImagen );//si intentamos borrar una archivo con unlinkSync y el archivo no existe nos dara un error, por eso primero verificamos su existencia con existsSync
        console.log(`imagen antigua eliminada del directorio uploads/${ tipo }`);
    }
}   


module.exports = app;