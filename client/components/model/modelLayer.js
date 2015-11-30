(function () {
  'use strict';
  angular.module('debtApp')
    .config(['DSProvider', 'DSHttpAdapterProvider',
      function (DSProvider, DSHttpAdapterProvider) {
        angular.extend(DSProvider.defaults, {});
        angular.extend(DSHttpAdapterProvider.defaults, {
          basePath: '/api'
        });
      }])
    .run(['$rootScope', 'Agent', 'Currency', 'Auth', 'socket', 'toastr',
      function ($rootScope, Agent, Currency, Auth, socket, toastr) {
        Auth.isLoggedInAsync(function (isLoggedIn) {
          if (isLoggedIn) {
            Agent.findAll().then(function (res) {
              socket.syncUpdates('agent', res, function () {
                toastr.success('New agent was added');
              });
            });
            Currency.findAll().then(function (res) {
              socket.syncUpdates('currency', res);
            });
          }
        });
      }])
    .service('Currency', ['DS', function (DS) {
      return DS.defineResource({
        name: 'currencies'
      });
    }])
    .service('Agent', ['DS', function (DS) {
      return DS.defineResource({
        name: 'agents'
      });
    }]);
})();
