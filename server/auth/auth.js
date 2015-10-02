'use strict';

var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
  return res.json(req.account);
});

module.exports = router;
