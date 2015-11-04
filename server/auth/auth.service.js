'use strict';
var request = require('request');
var config = require('../config/environment');
var _ = require('lodash');

//in memory accounts
var inMemoryAccounts = [];

function isAuthenticated(req, res, next) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['authorization'];

  function requestAuthService(options) {
    request.get(options, function (err, response, body) {
      if (err) {
        return res.json({success: false, message: 'Failed to authenticate'});
      }
      if (!err && response.statusCode === 200) {
        console.log('Successful authorization');

        //save authorized account in memory
        if (typeof body === 'string') {
          body = JSON.parse(body);
        }
        var account = {
          token: token,
          body: body
        };
        req.authId = account.body.id;
        req.account = account;
        inMemoryAccounts.push(account);
        next();
      } else {
        res.status(response.statusCode).send({
          success: false,
          message: 'Could not get response.'
        });
      }
    });
  }

  if (token) {
    var inMemoryAccount = _.find(inMemoryAccounts, function (item) {
      return item.token === token;
    });
    //do not authorize if token already in memory and token not expired
    //TODO: check token expiration
    //if (inMemoryAccount) {
    //  var tokenExpiresIn = parseInt(inMemoryAccount.body.token.expiresIn);
    //  //remove account if token expired
    //  if (tokenExpiresIn < 1) {
    //    _.remove(inMemoryAccounts, inMemoryAccount);
    //  }
    //}

    //if (inMemoryAccount && !(tokenExpiresIn < 1)) {
    if (inMemoryAccount) {
      console.log('Already authorized');
      req.authId = inMemoryAccount.body.id;
      req.account = inMemoryAccount;
      next();
    }
    else if (!inMemoryAccount || tokenExpiresIn < 1) {
      var options = {
        url: config.auth,
        headers: {
          'Authorization': token
        }
      };
      requestAuthService(options);
    } else {
      return res.status(401).send({
        success: false,
        message: 'Unauthorized!.'
      });
    }
  } else {
    return res.status(401).send({
      success: false,
      message: 'Unauthorized!'
    });
  }
}

exports.isAuthenticated = isAuthenticated;
