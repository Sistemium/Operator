'use strict';

let express = require('express');
let auth = require('../../auth/auth.service');
let controller = require('./admin.controller');

let router = express.Router();

router.get('/', controller.index);
//router.get('/:id', auth.isAuthenticated, controller.show);
//router.post('/', auth.isAuthenticated, controller.create);
//router.put('/:id', auth.isAuthenticated, controller.update);
//router.patch('/:id', auth.isAuthenticated, controller.update);
//router.delete('/:id', auth.isAuthenticated, controller.destroy);

module.exports = router;
