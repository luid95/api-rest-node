'use strict'
var validator = require('validator');// Validar los datos
var bcrypt = require('bcrypt-nodejs');// Cifrar la password
var fs = require('fs');
var path = require('path');
var User = require('../models/User');
var jwt = require('../services/jwt');

var ctrlu = {

    probando: function (req, res) {
    
        res.status(200).send({ message: 'Probando una accion del controlador de user.js'});
    },

    testeando: function (req, res) {
    
        res.status(200).send({ message: 'Soy el metodo testeando!!'});
    },

    save: function (req, res) {
        // Recoger los parametros de la peticion
        var params = req.body;

        // Validar los datos
        try{
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        }catch (error) {
                    
            return res.status(200).send({
                message: "Fatan datos por enviar"
            });

        }

        //console.log(validate_name, validate_surname, validate_email, validate_password, validate_role);
        if(validate_name && validate_surname && validate_email && validate_password){

            // Crear el objeto del usuario
            var user = new User();

            // Asignar valores al usuario
            user.name = params.name;
            user.surname = params.surname;
            user.email = params.email.toLowerCase();
            user.role = 'ROLE_USER';
            user.image = null;

            // Comprobar si el usuario existe
            User.findOne({email: user.email}, (err, issetUser) => {

                if(err){
                    return res.status(500).send({
                        message: "Error al comprobar duplicidad del usuario"
                    });
                }

                if(!issetUser){
                    // Si no existe, 
            
                    // Cifrar la password 
                    bcrypt.hash(params.password, null, null, (err, hash) => {
                        user.password= hash;

                        // Y guardar usuario
                        user.save((err, userStored) => {
                            if(err){
                                return res.status(500).send({
                                    message: "Error al guardar el usuario"
                                });
                            }

                            if(!userStored){
                                return res.status(500).send({
                                    message: "El usuario no se ha guardado"
                                });
                            }

                            // Devolver respuesta
                            return res.status(200).send({
                                status: 'success',
                                user: userStored
                            });
                        });// Close save

                    });// Close bcrypt

                }else{
                    return res.status(200).send({
                        message: "El usuario ya esta registrado"
                    });
                }
            });

            
        }else{
            return res.status(200).send({
                message: "Validacion de los datos del usuario incorrecta, intentalo de nuevo"
            });
        }

    },

    login: function (req, res) {
        // Recoger los parametros de la peticion
        var params = req.body;

        // Validar los datos
        try{
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        }catch (error) {
                
            return res.status(200).send({
                message: "Fatan datos por enviar"
            });

        }

        if(!validate_email || !validate_password){
            return res.status(200).send({
                message: "Los datos son incorrectos, envialos bien."
            });
        }
        
        // Buscar usuarios que coincidan con el email
        User.findOne({email: params.email.toLowerCase()}, (err, user) => {

            if(err) {
                return res.status(500).send({
                    message: "Error al tratar de identificarse"
                });
            }

            if(!user){
                return res.status(404).send({
                    message: "El usuario no existe"
                });
            }

            // Si lo encuentra,
            // Comprobar la password (coincidencia de email y password / bcrypt)
            bcrypt.compare(params.password, user.password, (err, check) =>{

                // Si es correcto,
                if(check){

                    // Generar un token de jwt y devolverlo
                    if(params.gettoken){

                        return res.status(200).send({

                            token: jwt.createToken(user)
                        });

                    }else{

                        // Limpiar el objeto
                        user.password = undefined;

                        // Devolver los datos
                        return res.status(200).send({
                            status: "success",
                            user: user
                        });

                    }

                }else{

                    return res.status(200).send({
                        message: "Las credenciales no son correctas"
                    });

                }

            });

        });
        
    },

    update: function(req, res) {

        // Recoger los datos del usuario
        var params = req.body;

        // Validar datos
        try {
            
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            
        } catch (error) {
            
            return res.status(200).send({
                message: "Fatan datos por enviar"
            });

        }

        // Eliminar propiedades innecesarias
        delete params.password;

        // Buscar y actualizar documento
        var userId =  req.user.sub;

        // Comprobar si el email es unico
        if(req.user.email != params.email){

            // Buscar usuarios que coincidan con el email
            User.findOne({email: params.email.toLowerCase()}, (err, user) => {

                if(err) {
                    return res.status(500).send({
                        message: "Error al tratar de identificarse"
                    });
                }

                if(user && user.email == params.email){
                    return res.status(200).send({
                        message: "El email no puede ser modificado"
                    });
                }else{

                    User.findOneAndUpdate({_id : userId}, params, {new: true}, (err, userUpdated) => {

                        if(err) {
                            return res.status(500).send({
                                status: 'error',
                                message: 'Error al actualizar usuario'
                            });
                        }
            
                        if(!userUpdated) {
                            return res.status(500).send({
                                status: 'error',
                                message: 'Error al actualizar usuario'
                            });
                        }
            
                        // Devolver respuesta
                        return res.status(200).send({
                            status: 'success',
                            user: userUpdated
                        });
                        
                    });
                }
            });

        }else{

            User.findOneAndUpdate({_id : userId}, params, {new: true}, (err, userUpdated) => {

                if(err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar usuario'
                    });
                }
    
                if(!userUpdated) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar usuario'
                    });
                }
    
                // Devolver respuesta
                return res.status(200).send({
                    status: 'success',
                    user: userUpdated
                });
                
            });

        }
        
        
    },

    uploadAvatar: function(req, res) {

        // Configurar el modulo multiparty en routes/users.js

        // Recoger el fichero de la peticion
        var file_name = 'Avatar no subido';
        
        //comprobamos si nuestra variable global files esta vacia
        if(!req.file){

            res.status(404).send({ 
                status: 'error',
                message: file_name
            });
    
        }

        // Conseguir el nombre y la extension del archivo subido
        var file_path = req.file.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[3]; // para obtener el nombre de la imagen
        

        //si requerimos el obtener la extension de la imagen 
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        // Comprobar extension (solo imagenes), si no es valida borrar fichero subido
        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif' || file_ext == 'jfif'){

            // Sacar el id del usuario identificado
            var userId = req.user.sub;

            // Buscar y actualizar documento bd
            User.findByIdAndUpdate({_id: userId}, { image: file_name }, {new: true}, (err, userUpdated) => {

                if(err){
            
                    res.status(500).send({ 
                        message: 'Error al guardar el usuario'
                    });
                }
        
                if(!userUpdated){
    
                    res.status(500).send({ 
                        message: 'Error al guardar el usuario'
                    });
                }
                
                // Devolver respuesta
                return res.status(200).send({
                    status: 'success',
                    user: userUpdated
                });
                
            });

        }else {
        
            fs.unlink(file_path, (err) => {

                return res.status(200).send({
                    status: 'error',
                    message: 'La extension del archivo no es valida.'
                });
            });

        }

        
    },

    avatar: function(req, res) {

        var fileNmae = req.params.fileName;
        var pathFile = './src/uploads/users/'+ fileNmae;

        fs.exists(pathFile, (exists) => {

            if(exists){
                
                res.sendFile(
                    path.resolve(pathFile)
                );
            }else{
                
                res.status(404).send({ 
                    message: 'La imagen no existe...'
                });
            }
        });

    },

    getUsers: function(req, res) {

        User.find().exec((err,users) => {

            if(err){
            
                res.status(404).send({ 
                    status: 'error',
                    message: 'No hay usuarios que mostrar'
                });
            }
    
            if(!users){

                res.status(404).send({ 
                    status: 'error',
                    message: 'No hay usuarios que mostrar'
                });
            }

            res.status(200).send({ 
                status: 'success',
                users: users
            });

        });
    },

    getUser: function(req, res) {
        
        var userId = req.params.userId;

        User.findById(userId).exec((err,user) => {

            if(err){
            
                res.status(404).send({ 
                    status: 'error',
                    message: 'No existe el usuario'
                });
            }
    
            if(!user){

                res.status(404).send({ 
                    status: 'error',
                    message: 'No existe el usuario'
                });
            }

            res.status(200).send({ 
                status: 'success',
                user: user
            });

        });
    }

};

module.exports = ctrlu; 