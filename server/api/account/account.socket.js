/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Account = require('./account.model');

exports.register = function(socket) {
  //Account.schema.post('save', function (doc) {
  //  onSave(socket, doc);
  //});
  //Account.schema.post('remove', function (doc) {
  //  onRemove(socket, doc);
  //});
}

function onSave(socket, doc, cb) {
  socket.emit('account:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('account:remove', doc);
}
