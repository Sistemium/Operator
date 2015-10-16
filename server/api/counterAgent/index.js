'use strict';

var express = require('express');
var controller = require('./counterAgent.controller');

var router = express.Router();

router.get('/:agentId', controller.index);

module.exports = router;
