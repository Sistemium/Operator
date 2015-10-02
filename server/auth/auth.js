'use strict';

var express = require('express');
var router = express.Router();
var auth = require('./auth.service');

router.get('/', auth.isAuthenticated(), function(req,res) {
  return res.json(req.account);
});
router.post('/', auth.isAuthenticated(), function (req, res) {
  return res.json(req.account);
});

module.exports = router;
