/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Operation = require('./operation.model');

exports.register = function(socket) {
  //Operation.schema.post('save', function (doc) {
  //  onSave(socket, doc);
  //});
  //Operation.schema.post('remove', function (doc) {
  //  onRemove(socket, doc);
  //});
}

function onSave(socket, doc, cb) {
  socket.emit('operation:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('operation:remove', doc);
}
