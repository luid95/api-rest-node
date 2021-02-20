'use strict'

var mongoose = require('mongoose'); 
var app = require('./app');

mongoose.set('useFindAndModify', false);
// Le indicamos a Mongoose que haremos la conexión con Promesas
mongoose.Promise = global.Promise;

//connecting to db
const uri = 'mongodb://127.0.0.1:27017/api_rest_node';

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})
        .then(() => {
            console.log('La conexion a la base de datos de mongo se ha realizado correctamente!!');

            // Crear el servidor
            app.listen(app.get('port'), ()=>{
                console.log("Server on port ", app.get('port'));
                
            })
        })
        .catch(err => console.log(err));