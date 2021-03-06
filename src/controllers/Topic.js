'use strict'
var validator = require('validator');// Validar los datos
var Topic = require('../models/Topic');

var ctrlt = {

    test: function (req, res){

        res.status(200).send({
            message: "Hola que tal!!"
        });
    },

    save: function (req, res){

        // Recoger parametros por post
        var params= req.body;

        // Validar datos
        try{
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
            var validate_lang = !validator.isEmpty(params.lang);
        }catch (error) {
                    
            return res.status(200).send({
                message: "Fatan datos por enviar"
            });

        }
        if(validate_title && validate_content && validate_lang){

            // Crear objeto a guardar
            var topic = new Topic();

            // Asignar valores
            topic.title = params.title;
            topic.content = params.content;
            topic.code = params.code;
            topic.lang = params.lang;
            topic.user = req.user.sub;

            // Gardar el Topic
            topic.save((err, topicStored) => {

                if(err){
                    return res.status(500).send({
                        status: "error",
                        message: "El tema no se ha guardado"
                    });
                }

                if(!topicStored){
                    return res.status(500).send({
                        status: "error",
                        message: "El tema no se ha guardado"
                    });
                }

                // Devolver una respuesta
                res.status(200).send({
                    status: "success",
                    topic: topicStored
                });

            });


        }else{
         
            res.status(200).send({
                message: "Los datos no son validos"
            });

        }

        

    },

    getTopics: function (req, res) {

        // Cargar la libreria de paginacion en la clase(Models)
        // Recoger la pagina actual
        if(!req.params.page || req.params.page == 0 || req.params.page == "0" || req.params.page == null || req.params.page == undefined){

            var page = 1;
        }else{

            var page = parseInt(req.params.page);
        }        

        // Indicar las opciones de paginacion
        var options = {
            sort: {
                date: -1 // Orden descendente
            },
            populate: 'user',
            limit: 5,
            page: page
        }

        // Find paginado
        Topic.paginate({}, options, (err, topics) => {

            if(err){

                return res.status(500).send({
                    status: "error",
                    message: "Error al hacer la consulta"
                });
            }

            if(!topics){

                return res.status(404).send({
                    status: "error",
                    message: "No hay topics"
                });
            }

            // Devolver resultado (topics, total de topics, total de paginas)
            res.status(200).send({
                status: 'success',
                topics: topics.docs,
                totalDocs: topics.totalDocs,
                totalPages: topics.totalPages,
                message: "Esta es la accion de getTopics"
            });
            
        });

    },

    getTopicsByUser: function (req, res) {

        // Conseguir el id del usuario
        var userId = req.params.user;

        // Find con una condicion de usuario
        Topic.find({
            user: userId
        })
        .sort([['date', 'descending']])
        .exec((err, topics) => {

            if(err){

                return res.status(500).send({
                    status: "error",
                    message: "Error en la peticion"
                });
            }

            if(!topics){

                return res.status(404).send({
                    status: "error",
                    message: "No hay temas para mostrar"
                });
            }

            // Devolver resultado
            res.status(200).send({
                status: "success",
                topics: topics
            });
        });

    },

    getTopic: function (req, res) {

        // Sacar el id del Topic de la url
        var topicId = req.params.id;

        // Find por id del topic
        Topic.findById(topicId)
             .populate('user')
             .populate('comments.user')
             .exec((err, topic) => {

                if(err){

                    return res.status(500).send({
                        status: "error",
                        message: "Error en la peticion"
                    });
                }
    
                if(!topic){
    
                    return res.status(404).send({
                        status: "error",
                        message: "No existe el tema"
                    });
                }

                return res.status(200).send({
                    status: "success",
                    topic: topic
                });

             });

    },

    update: function (req, res) {
        // Recoger el id del Topic de la url
        var topicId = req.params.id;

        // Recoger los datos que llegan desde post
        var params = req.body;

        // Validar datos
        try{
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
            var validate_lang = !validator.isEmpty(params.lang);
        }catch (error) {
                    
            return res.status(200).send({
                message: "Fatan datos por enviar"
            });

        }

        if(validate_title && validate_content && validate_lang){

            // Montar un json con los datos modificables
            var update = {
                title: params.title,
                content: params.content,
                code: params.code,
                lang: params.lang
            };
            
            // Find and update del topic por id y po id de usuario
            Topic.findOneAndUpdate({_id: topicId, user: req.user.sub}, update, {new: true}, (err, topicUpdated) => {


                if(err){

                    return res.status(500).send({
                        status: "error",
                        message: "Error en la peticion"
                    });
                }
    
                if(!topicUpdated){
    
                    return res.status(404).send({
                        status: "error",
                        message: "No se ha actualizado el tema"
                    });
                }

                // Devolver una respuesta
                return res.status(200).send({
                    status: "success",
                    topic: topicUpdated
                });

            });

        }else{

            return res.status(200).send({
                message: "La validacion de los datos no es correcta"
            });

        }

        

    },

    delete: function (req, res) {

        // Sacar el id del topic de la url
        var topicId = req.params.id;

        // Find and delete por topicID y por userID
        Topic.findOneAndDelete({_id: topicId, user: req.user.sub}, (err, topicRemoved) => {

            if(err){

                return res.status(500).send({
                    status: "error",
                    message: "Error en la peticion"
                });
            }

            if(!topicRemoved){

                return res.status(404).send({
                    status: "error",
                    message: "No se ha borrado  el tema"
                });
            }

            // Devolver respuesta
            return res.status(200).send({
                status: 'success',
                topic: topicRemoved
            });
        });
        
    },

    search: function (req, res) {

        // Sacar el String a buscar de la url
        var searchString = req.params.search;

        // Find or 
        Topic.find({
            "$or": [
                {"title": {"$regex": searchString, "$options": "i"} },
                {"content": {"$regex": searchString, "$options": "i"} },
                {"code": {"$regex": searchString, "$options": "i"} },
                {"lang": {"$regex": searchString, "$options": "i"} }
            ]
        })
        .populate('user')
        .sort([['date', 'descending']])
        .exec((err, topics) => {

            if(err){
                
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la peticion'
                });
            }

            if(!topics){
                
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay temas disponibles'
                });
            }

            // Devolver respuesta
            return res.status(200).send({
                status: 'success',
                topics: topics
            });
        });

    }
};

module.exports = ctrlt; 