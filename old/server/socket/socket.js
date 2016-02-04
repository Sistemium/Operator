/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var events = require('events');
var ee = new events.EventEmitter();
var socketStore = require('../components/socket/index');
var _ = require('lodash');

ee.on('save', function (data, cb) {
  var sockets = socketStore.sockets();
  _.each(sockets, function (socket) {
    if(cb(socket)) {
      onSave(socket, data);
    }
  });
});

ee.on('remove', function (data, cb) {
  var sockets = socketStore.sockets();
  _.each(sockets, function (socket) {
    if (cb(socket)) {
      onRemove(socket, data);
    }
  });
});

exports.save = function (data, cb) {
  ee.emit('save', data, cb);
};

exports.remove = function (data, cb) {
  ee.emit('remove', data, cb);
};

function onSave(socket, data) {
  socket.emit('save', data);
  console.log('save emitted with ' + JSON.stringify(data));
}

function onRemove(socket, data) {
  socket.emit('remove', data);
  console.log('remove emitted with ' + JSON.stringify(data));
}
