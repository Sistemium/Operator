/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var events = require('events');
var ee = new events.EventEmitter();
var socketStore = require('../../components/socket');
var _ = require('lodash');

ee.on('invite:save', function (invite) {
  var sockets = socketStore.sockets();
  _.each(sockets, function (socket) {
    if(cb(socket)) {
      onSave(socket, invite);
    }
  });
});

ee.on('invite:remove', function (invite) {
  var sockets = socketStore.sockets();
  _.each(sockets, function (socket, cb) {
    if (cb(socket)) {
      onRemove(socket, invite);
    }
  });
});

exports.inviteSave = function (invite, cb) {
  ee.emit('invite:save', invite, cb);
};

exports.inviteRemove = function (invite) {
  ee.emit('invite:remove', invite);
};

function onSave(socket, invite) {
  socket.emit('invite:save', invite);
}

function onRemove(socket, invite) {
  socket.emit('invite:remove', invite);
}
