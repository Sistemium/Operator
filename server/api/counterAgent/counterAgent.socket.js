'use strict';

var events = require('events');
var ee = new events.EventEmitter();
var socketStore = require('../../components/socket');
var _ = require('lodash');

ee.on('counterAgent:save', function (counterAgent, cb) {
  var sockets = socketStore.sockets();
  _.each(sockets, function (socket) {
    if (cb(socket)) {
      onSave(socket, counterAgent);
    }
  })
});

exports.counterAgentSave = function (counterAgent, cb) {
  ee.emit('counterAgent:save', counterAgent, cb);
};

function onSave(socket, invite) {
  socket.emit('counterAgent:save', invite);
  console.log('counterAgent:save emitted with ' + JSON.stringify(invite));
}
