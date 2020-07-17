

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
 /**
  * process.env.MONGO_URI es una variable que creamos en la clase 113
  */
let urlDB;

if( process.env.NODE_ENV === 'dev'){
    urlDB = 'mongodb://localhost:27017/cafe';
}else{
    urlDB = process.env.MONGO_URI;
}

// nosotros creamos process.env.URLDB, 'URLDB' es una varable de entorno que acabamos de crear
//usando process.env
process.env.URLDB = urlDB;

/**
 * Vencimiento del token
 * 60 segundos
 * 60 minutos
 * 24 horas
 * 30 dias 
 */
process.env.CADUCIDAD_TOKEN = '48h';

 /**
  * SEED -- semilla de autenticación
  */
process.env.SEED =  process.env.SEED || 'este-es-el-seed-desarrollo';

// Google Client ID
process.env.CLIENT_ID = process.env.CLIENT_ID || '357525682081-73gnjtri0d4akuhbm3rnicbuplhemgjm.apps.googleusercontent.com';
