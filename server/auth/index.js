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
      //do not authorize if token already in memory and token not expired
      if (inMemoryAccount) {
        var tokenExpiresIn = parseInt(inMemoryAccount.body.token.expiresIn);
        //remove account if token expired
        if (tokenExpiresIn < 1) {
          _.remove(inMemoryAccounts, inMemoryAccount);
        }
      }

      if (inMemoryAccount && !(tokenExpiresIn < 1)) {
        console.log('Already authorized');
        next();
      }
      else if (!inMemoryAccount || tokenExpiresIn < 1) {

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

            //save authorized account in memory
            var account = {
              token: token,
              body: JSON.parse(body)
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
  }
};
