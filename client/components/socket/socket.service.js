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
    .service('messageBus', ['$rootScope', 'DS', 'Auth', function ($rootScope, DS, Auth) {
      var ioSocket = io('', {
        // Send auth token on connection, you will need to DI the Auth service above
        // 'query': 'token=' + Auth.getToken()
        'query': {
          token: Auth.getToken()
        },
        path: '/socket.io-client'
      });

      function initSocket() {
        ioSocket.emit('authorize', Auth.getToken(), function (cb) {
          console.log('Socket authorization:', cb);

          if (cb.isAuthorized) {
            console.log('authorized');
          } else {
            console.log('not authorized');
          }
        });

        ioSocket.on('save', function (data) {
          $rootScope.$broadcast('save', data);
        });

        ioSocket.on('remove', function (data) {
          DS.eject(data.resource, data.id);
          $rootScope.$broadcast('remove', data);
        });

        ioSocket.on('disconnect', function () {
          ioSocket.removeAllListeners();
        });

        ioSocket.on('reconnect', function () {
          ioSocket.removeAllListeners();
          initSocket();
        })
      }

      return {
        initSocket: initSocket
      };
    }])
  ;
})();
