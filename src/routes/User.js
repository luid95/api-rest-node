'use strict'
var express = require('express');
var userController = require('../controllers/User');

//para crear una ruta con express
var router = express.Router();
var md_auth = require('../middlewares/authenticated');

//para poder trabajar con la carga de fichero (image for user)
var crypto = require('crypto');
var multer = require('multer');

const storage = multer.diskStorage({
    destination(req, file, cb) {
      cb(null, './src/uploads/users');
    },
    filename(req, file = {}, cb) {
      const { originalname } = file;
      
      const fileExtension = (originalname.match(/\.+[\S]+$/) || [])[0];
      // cb(null, `${file.fieldname}__${Date.now()}${fileExtension}`);
      crypto.pseudoRandomBytes(16, function (err, raw) {
        cb(null, raw.toString('hex') + Date.now() + fileExtension);
      });
    },
  });
var md_upload = multer({dest: './src/uploads/users',storage});

// Rutas de prueba
router.get('/probando', userController.probando);
router.post('/testeando', userController.testeando);

// Rutas de usuarios
router.post('/register', userController.save);
router.post('/login', userController.login);
router.put('/user/update', md_auth.authenticated, userController.update);
router.post('/upload-avatar', [md_auth.authenticated, md_upload.single('file0')], userController.uploadAvatar);
router.get('/avatar/:fileName', userController.avatar);
router.get('/users', userController.getUsers);
router.get('/user/:userId', userController.getUser);

module.exports = router;