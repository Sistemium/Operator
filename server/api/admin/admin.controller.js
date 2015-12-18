'use strict';

let sockets = require('../../components/socket');

exports.index = function (req, res) {
  var socketsAuthData = sockets.sockets().map(function(s) {
    return s.authData;
  });
  return res.json(socketsAuthData);
};

