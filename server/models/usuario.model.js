const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
let Schema = mongoose.Schema;

let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol válido'
}; 

let usuarioSchema = new Schema({
    nombre:{
        type:String,
        required:[true, 'El nombre es un campo obligatorio']
    },
    email:{
        type:String,
        unique:true,
        required:[true, 'El correo es necesario']
    },
    password:{
        type:String,
        required: true
    },
    img:{
        type:String,
        required: false
    },
    role:{
        type:String,
        default:'USER_ROLE',
        enum: rolesValidos
    },
    estado:{
        type:Boolean,
        default: true
    },
    google:{
        type:Boolean, 
        default: false
    }
});

/*el metodo toJSON se ejecuta cuando se imprime un objeto json de un esquema, lo que hacemos aca 
es evitar que se imprima la propiedad password del objeo que me llega de la base de datos, no
usamos funcion de flecha porque nos impediria usar el this*/
usuarioSchema.methods.toJSON = function(){
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;

    return userObject;
}

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser unico'});
module.exports = mongoose.model( 'Usuario', usuarioSchema );