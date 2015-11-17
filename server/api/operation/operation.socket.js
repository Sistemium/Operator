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

ee.on('operation:remove', function (operation) {
  var sockets = socketStore.sockets();
  _.each(sockets, function (socket, cb) {
    if (cb(socket)) {
      onRemove(socket, operation);
    }
  });
});

exports.operationSave = function (operation, cb) {
  ee.emit('operation:save', operation, cb);
};

exports.operationRemove = function (operation, cb) {
  ee.emit('operation:remove', operation);
};

function onSave(socket, operation) {
  socket.emit('operation:save', operation);
}

function onRemove(socket, operation) {
  socket.emit('operation:remove', operation);
}
