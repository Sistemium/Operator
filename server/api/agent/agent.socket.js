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

ee.on('agent:remove', function (agent) {
  var sockets = socketStore.sockets();
  _.each(sockets, function (socket) {
    onRemove(socket, agent);
  })
});

exports.agentSave = function (agent) {
  ee.emit('agent:save', agent);
};

exports.agentRemove = function (agent) {
  ee.emit('agent:remove', agent);
};

function onSave(socket, agent) {
  // TODO: check if agent belongs to authorized socket
  if (agent.authId === socket.authData.id) {
    socket.emit('agent:save', agent);
  }
}

function onRemove(socket, agent) {
  // TODO: check if agent belongs to authorized socket
  if (agent.authId === socket.authData.id) {
    socket.emit('agent:remove', agent);
  }
}
