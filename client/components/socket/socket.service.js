/* global io */
'use strict';

(function () {
  angular.module('debtApp')
    .factory('Socket', ['$rootScope', function ($rootScope) {
      let socket = null;

      function listenerExists(eventName) {
        return socket.hasOwnProperty("$events") && socket.$events.hasOwnProperty(eventName);
      }

      return {
        //on: function (eventName, callback) {
        //  if (!listenerExists(eventName)) {
        //    socket.on(eventName, function () {
        //      let args = arguments;
        //      $rootScope.$apply(function () {
        //        callback.apply(socket, args);
        //      });
        //    });
        //  }
        //},
        //emit: function (eventName, data, callback) {
        //  socket.emit(eventName, data, function () {
        //    let args = arguments;
        //    $rootScope.$apply(function () {
        //      if (callback) {
        //        callback.apply(socket, args);
        //      }
        //    });
        //  })
        //},
        removeAllListeners: function () {
          socket.removeAllListeners();
        },
        connected: function () {
          return socket !== null;
        },
        connect: function () {
          socket = io.sails.connect('http://localhost:1337');
          console.log(socket);
        },
        disconnect: function () {
          socket.io.disconnect();
        }
      };
    }])
    .factory('messageBus', ['$rootScope', 'DS', 'Auth', 'Socket', function ($rootScope, DS, Auth, ioSocket) {

      let socketConnected = 'socketConnected';

      function connect() {
        console.log('connecting to socket...');
        ioSocket.connect();
        ioSocket.on('connect', function () {
          //TODO authorization for the socket
          ioSocket.emit('authorize', Auth.getToken(), function (cb) {
            console.log(`Socket authorization: ${cb}`);

            if (cb.isAuthorized) {
              $rootScope.$broadcast(socketConnected, true);
              console.log('authorized');
              ioSocket.on('save', function (data) {
                $rootScope.$broadcast('save', data);
              });

              ioSocket.on('remove', function (data) {
                DS.eject(data.resource, data.id);
                $rootScope.$broadcast('remove', data);
              });
            } else {
              $rootScope.$broadcast(socketConnected, false);
              console.log('not authorized');
            }
          });
        });
      }

      function disconnect() {
        ioSocket.removeAllListeners();
        ioSocket.disconnect();
        $rootScope.$broadcast(socketConnected, false);
      }

      return {
        connect: connect,
        disconnect: disconnect
      };
    }])
  ;
})();
