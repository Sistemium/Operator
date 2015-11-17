/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var events = require('events');
var ee = new events.EventEmitter();
var socketStore = require('../../components/socket');
var _ = require('lodash');

ee.on('operation:save', function (operation, cb) {
  var sockets = socketStore.sockets();
  _.each(sockets, function (socket) {
    if(cb(socket)) {
      // agentOperation
      onSave(socket, operation);
    }
  });
});

ee.on('operation:remove', function (operation, cb) {
  var sockets = socketStore.sockets();
  _.each(sockets, function (socket) {
    if (cb(socket)) {
      onRemove(socket, operation);
    }
  });
});

exports.operationSave = function (operation, cb) {
  ee.emit('operation:save', operation, cb);
};

exports.operationRemove = function (operation, cb) {
  ee.emit('operation:remove', operation, cb);
};

function onSave(socket, operation) {
  socket.emit('agentOperation:save', operation);
  socket.emit('operation:save', operation);
  console.info('operation:save emitted with ' + JSON.stringify(operation));
}

function onRemove(socket, operation) {
  socket.emit('operation:remove', operation);
  socket.emit('operation:remove', operation);
  console.info('operation:remove emitted with ' + JSON.stringify(operation));
}
