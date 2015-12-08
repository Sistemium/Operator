/**
 * Socket.io configuration
 */

'use strict';

var socketStore = require('../components/socket');

// When the user disconnects.. perform this
function onDisconnect(socket) {
  socketStore.unregisterSocket(socket);
}

// When the user connects.. perform this
function onConnect(socket) {
  // When the client emits 'authorize', this listens and executes
  socket.on('authorize', function (token, cb) {
    //make request to auth service
    socket.token = token;
    socketStore.registerSocket(socket, function (res) {
      cb({isAuthorized: res});
    });
  });
}

module.exports = function (socketio) {

  socketio.on('connection', function (socket) {

    socket.address = socket.handshake.address !== null ?
    socket.handshake.address :
      process.env.DOMAIN;

    socket.connectedAt = new Date();

    // Call onDisconnect.
    socket.on('disconnect', function () {
      onDisconnect(socket);
      console.info('[%s] DISCONNECTED', socket.address);
    });

    // Call onConnect.
    onConnect(socket);
    console.info('[%s] CONNECTED', socket.address);
  });
};
