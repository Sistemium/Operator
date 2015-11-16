/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var events = require('events');
var ee = new events.EventEmitter();
var socketStore = require('../../components/socket');
var _ = require('lodash');

ee.on('invite:save', function (agent) {
  var sockets = socketStore.sockets();
  _.each(sockets, function (socket) {
    if(cb(socket)) {
      onSave(socket, agent);
    }
  });
});

ee.on('invite:update', function (agent) {
  var sockets = socketStore.sockets();
  _.each(sockets, function (socket, cb) {
    if (cb(socket)) {
      onUpdate(socket, agent);
    }
  });
});

exports.inviteSave = function (agent, cb) {
  ee.emit('invite:save', agent, cb);
};

exports.inviteUpdate = function (agent) {
  ee.emit('invite:update', agent);
};

function onSave(socket, agent) {
  socket.emit('invite:save', agent);
}

function onUpdate(socket, agent, cb) {
  socket.emit('invite:update', agent);
}
