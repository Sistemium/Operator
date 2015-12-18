'use strict';
let _ = require('lodash')
  , authUrl = 'http://localhost:8999/api/auth'
  , sockets = []
  , request = require('request');


let authByToken = function (token, cb) {
  if (token) {
    let options = {
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

let unRegister = function (socket) {
  let idx = sockets.indexOf(socket);
  console.log(sockets.length);
  if (idx > -1) {
    sockets.splice(idx, 1);
  }
  console.log(sockets.length);
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
      //maybe only add authId to the socket instead of body object
      console.log(sockets.length);
      socket.authData = response.body;
      sockets.push(socket);
      console.log(sockets.length);
      cb(true);
    }
  });
};

exports.unregisterSocket = function (socket) {
  unRegister(socket);
};
