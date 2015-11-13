/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Agent = require('./agent.model');
var events = require('events');
var ee = new events.EventEmitter();


exports.register = function (socket) {
  //TODO: investigate hooks, is it possible to call after models callback
  ee.on('agent:save', function (agent) {
    onSave(socket, agent);
  });
  ee.on('agent:update', function (agent) {
    onUpdate(socket, agent);
  });
};

exports.agentSave = function (agent) {
  ee.emit('agent:save', agent);
};

exports.agentUpdate = function (agent) {
  ee.emit('agent:update', agent);
};

function onSave(socket, agent, cb) {
  // TODO: check if agent belongs to authorized socket
  if (agent.authId === socket.authId) {
    socket.emit('agent:save', agent);
  }
}

function onUpdate(socket, agent, cb) {
  // TODO: check if agent belongs to authorized socket
  socket.emit('agent:update', agent);
}
