'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
const secret = 'clave_secreta';

//funcion crear token
exports.createToken = function(user){

    //almacenaremos datos que tengan que ver con el usuario
    var payload ={
        sub: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30, 'days').unix()

    };


    return jwt.encode(payload, secret);
};