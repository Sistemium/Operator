/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var events = require('events');
var ee = new events.EventEmitter();
var socketStore = require('../../components/socket');
var _ = require('lodash');

ee.on('operation:save', function (operation) {
  var sockets = socketStore.sockets();
  _.each(sockets, function (socket) {
    if(cb(socket)) {
      onSave(socket, operation);
    }
  });
});

ee.on('operation:update', function (operation) {
  var sockets = socketStore.sockets();
  _.each(sockets, function (socket, cb) {
    if (cb(socket)) {
      onUpdate(socket, operation);
    }
  });
});

exports.operationSave = function (operation, cb) {
  ee.emit('operation:save', operation, cb);
};

exports.operationUpdate = function (operation, cb) {
  ee.emit('operation:update', operation);
};

function onSave(socket, operation) {
  socket.emit('operation:save', operation);
}

function onUpdate(socket, operation, cb) {
  socket.emit('operation:update', operation);
}
