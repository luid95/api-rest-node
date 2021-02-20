'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
const secret = 'clave_secreta';

//funcion comprobar los datos del token
exports.authenticated = function (req, res, next) {
    
    // Comprobar si llega autorizacion
    if(!req.headers.authorization){
        
        return res.status(403).send({
            message: "La peticion no tiene la cabecera de authorization."
        });
    }

    // Limpiar token y quitar comillas
    var token = req.headers.authorization.replace(/['"]+/g, '');

    try {
        // Decodificar token
        var payload = jwt.decode(token, secret);

        // Comprobar si el token ha expirado
        if(payload.exp <= moment().unix()){

            return res.status(401).send({
                message: 'El token ha expirado'
            });
        }

    } catch (ex) {
        
        res.status(404).send({
            message: 'El token no es valido'
        });
    }

    // Adjuntar usuario identificado a la request
    req.user = payload;

    // Pasar la accion
    next();
}