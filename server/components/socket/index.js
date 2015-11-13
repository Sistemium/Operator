'use strict';
var authUrl = 'http://localhost:8999/api/auth';
var sockets = [];
var request = require('request');


var authByToken = function (token, cb) {
  if (token) {
    var options = {
      url: authUrl,
      headers: {
        authorization: token
      }
    };
    request.get(options, function (err, res, body) {
      cb(err ? false : JSON.parse(body));
    });
  }
};


var unRegister = function(socket) {
  var idx = sockets.indexOf(socket);
  if (idx>-1) {
    sockets.splice(idx,1);
  }
};

exports.sockets = function () {
  return sockets;
};

exports.registerSocket = function (socket, cb) {
  authByToken(socket.token, function (response) {
    if (!response) {
      console.info(
        'socket id:', socket.id,
        'not authorized'
      );
      cb(false);
    } else {
      socket.authId = response.body.id;
      sockets.push(socket);
      cb(true);
    }
  });
};

exports.unregisterSocket = function (socket) {
  unRegister(socket);
};
