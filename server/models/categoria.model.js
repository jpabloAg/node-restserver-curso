const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let categoriaSchema = new Schema({
    nombre:{
        type:String,
        required:[true, 'El nombre de la categoria es obligatorio'],
    },
    descripcion:{
        type:String,
        required:[true, 'La descripción es obligatoria']
    },
    usuario:{
        type:Schema.Types.ObjectId,
        ref: 'Usuario',
        required:true
    }
});

module.exports = mongoose.model( 'Categoria', categoriaSchema );