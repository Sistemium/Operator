/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Currency = require('./currency.model');

exports.register = function(socket) {
  //Currency.schema.post('save', function (doc) {
  //  onSave(socket, doc);
  //});
  //Currency.schema.post('remove', function (doc) {
  //  onRemove(socket, doc);
  //});
}

function onSave(socket, doc, cb) {
  socket.emit('currency:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('currency:remove', doc);
}
