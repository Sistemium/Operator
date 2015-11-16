/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var events = require('events');
var ee = new events.EventEmitter();
var socketStore = require('../../components/socket');
var _ = require('lodash');

ee.on('agent:save', function (agent) {
  var sockets = socketStore.sockets();
  _.each(sockets, function (socket) {
    onSave(socket, agent);
  });
});

ee.on('agent:update', function (agent) {
  var sockets = socketStore.sockets();
  _.each(sockets, function (socket) {
    onUpdate(socket, agent);
  })
});

exports.agentSave = function (agent) {
  ee.emit('agent:save', agent);
};

exports.agentUpdate = function (agent) {
  ee.emit('agent:update', agent);
};

function onSave(socket, agent) {
  // TODO: check if agent belongs to authorized socket
  if (agent.authId === socket.authData.id) {
    socket.emit('agent:save', agent);
  }
}

function onUpdate(socket, agent) {
  // TODO: check if agent belongs to authorized socket
  if (agent.authId === socket.authData.id) {
    socket.emit('agent:update', agent);
  }
}
