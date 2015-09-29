'use strict';
var request = require('request');

module.exports = function () {
  return function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['authorization'];

    if (token) {
      var options = {
        url: 'https://api.sistemium.com/pha/roles',
        headers: {
          'Authorization': token
        }
      };
      request(options, function (err, response, body) {
        if (err) {
          return res.json({success: false, message: 'Failed to authenticate'});
        }
        if (!err && response.statusCode === 200) {
          console.log('Successful authorization');
          next();
        } else {
          res.status(response.statusCode).send({
            success: false,
            message: 'Could not get response.'
          });
        }
      });
    } else {
      return res.status(403).send({
        success: false,
        message: 'No token provided.'
      });
    }
  };
};
