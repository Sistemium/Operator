'use strict';

var express = require('express');
var controller = require('./counterAgent.controller.js');
var auth = require('../../auth/auth.service.js');

var router = express.Router();

router.get('/:owner', auth.isAuthenticated, controller.index);

module.exports = router;
