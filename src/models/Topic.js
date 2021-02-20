'use strict'
var { Schema, model } = require('mongoose');
//extraemos una propiedad de mongoose
//model: nos sirve para interactuar con la base de datos
var mongoosePaginate = require('mongoose-paginate-v2');//para poder realizar la paginacion

// Modelo de Comment
var commmentSchema = new Schema({
    content: String,
    date: {
        type: Date,
        default: new Date()
    },
    //campo especial que hara referencia a otro objeto(modelo)
    user: {type: Schema.ObjectId, ref: 'User'},
});

var Comment = model('Comment', commmentSchema);

// Modelo de topic
const topicSchema = new Schema({
    title: String,
    content: String,
    code: String,
    lang: String,
    date: {
        type: Date,
        default: new Date()
    },
    //campo especial que hara referencia a otro objeto(modelo)
    user: {type: Schema.ObjectId, ref: 'User'},
    comments: [commmentSchema]
    
});

// Cargar paginacion
topicSchema.plugin(mongoosePaginate);

module.exports = model('Topic', topicSchema);