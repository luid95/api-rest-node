'use strict'
const { Schema, model } = require('mongoose');
//extraemos una propiedad de mongoose
//model: nos sirve para interactuar con la base de datos

const userSchema = new Schema({
    name: String,
    surname: String,
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: String,
    role: String,
    image: String
    
});

// Para evitar enviar la password de un objeto de tipo password
userSchema.methods.toJSON = function(){

    var obj = this.toObject();
    delete obj.password;

    return obj;
}

module.exports = model('User', userSchema);