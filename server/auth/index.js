'use strict';
var request = require('request');
var config = require('../config/environment');
var _ = require('lodash');

//in memory accounts
var inMemoryAccounts = [];


module.exports = function () {
  return function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['authorization'];

    if (token) {
      var inMemoryAccount = _.find(inMemoryAccounts, function (item) {
        return item.token === token;
      });
      //do not authorize if token already in memory
      if (inMemoryAccount) {
        console.log('Already authorized');
        next();
      }

      else if (!inMemoryAccount) {

        var options = {
          url: config.auth,
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
            //attach account to request
            req.account = body;
            //save authorized account in memory
            var account = {
              token: token,
              body: body
            };
            inMemoryAccounts.push(account);
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
    }
    ;
  }
};
