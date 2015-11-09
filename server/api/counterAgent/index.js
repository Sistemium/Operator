'use strict';

var express = require('express');
var controller = require('./counterAgent.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/:owner', auth.isAuthenticated, controller.index);

module.exports = router;
