/* global io */
'use strict';

(function () {
  angular.module('debtApp')
    .run(['$rootScope', function ($rootScope) {
      $rootScope.$on('save', function (event, data) {
        event.preventDefault();
        switch (data.resource) {
          case 'invites':
          {
            $rootScope.$emit('invite:save', data);
            break;
          }
          case 'agents':
          {
            $rootScope.$emit('agent:save', data);
            break;
          }
          case 'operations':
          {
            $rootScope.$emit('operation:save', data);
            break;
          }
          case 'contacts':
          {
            $rootScope.$emit('contact:save', data);
            break;
          }
          case 'accounts':
          {
            $rootScope.$emit('account:save', data);
            break;
          }
        }
      });

      $rootScope.$on('remove', function (event, data) {
        event.preventDefault();
        switch (data.resource) {
          case 'invites':
          {
            $rootScope.$emit('invite:remove', data);
            break;
          }
        }
      });
    }])
    .service('messageBus', ['$rootScope', '$window', 'DS', 'Auth', function ($rootScope, $window, DS, Auth) {
      var ioSocket = io('', {
        path: '/socket.io-client',
        'sync disconnect on unload': true
      });
      var socketConnected = false;

      function initSocket() {
        var socketConnected = 'socketConnected';

        ioSocket.on('save', function (data) {
          $rootScope.$broadcast('save', data);
        });

        ioSocket.on('remove', function (data) {
          DS.eject(data.resource, data.id);
          $rootScope.$broadcast('remove', data);
        });

        ioSocket.on('disconnect', function () {
          $rootScope.$broadcast(socketConnected, false);
          ioSocket.removeAllListeners();
        });

        ioSocket.on('connect', function () {
          ioSocket.emit('authorize', Auth.getToken(), function (cb) {
            console.log('Socket authorization:', cb);

            if (cb.isAuthorized) {
              $rootScope.$broadcast(socketConnected, true);
              console.log('authorized');
            } else {
              $rootScope.$broadcast(socketConnected, false);
              console.log('not authorized');
            }
          });
        });
      }

      return {
        initSocket: initSocket
      };
    }])
  ;
})();
