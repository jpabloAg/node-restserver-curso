

/**
 * Puerto
 */
process.env.PORT = process.env.PORT || 3000;

/**
 * Entorno
 * process.env.NODE_ENV es una varaible que establece heroku, si existe  significa que estamos en 
 * producción, por lo que usaremos la cadena de conección que nos conecte a la base de datps que
 * tenemos en la nube gracias a mongo Atlas, si no existe significa que estamos en desarrollo 'dev',
 * en este caso usaremos la cadena de conección local
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

/**
 * Base de datos
 */
// cadena de conección local: mongodb://localhost:27017/cafe

/**
 * cadena de conección remota(se encuentra en el archivo userMongoAtlas-admin.txt):
 * mongodb+srv://jpablo:XyjAzBJwXxZVTPG0@cluster0-hdflp.mongodb.net/cafe 
 */

let urlDB;

if( process.env.NODE_ENV === 'dev'){
    urlDB = 'mongodb://localhost:27017/cafe';
}else{
    urlDB = 'mongodb+srv://jpablo:XyjAzBJwXxZVTPG0@cluster0-hdflp.mongodb.net/cafe';
}

// nosotros creamos process.env.URLDB, 'URLDB' es una varable de entorno que acabamos de crear
//usando process.env
process.env.URLDB = urlDB;