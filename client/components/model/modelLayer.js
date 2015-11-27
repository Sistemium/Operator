(function () { 'use strict';
  angular.module('debtApp')
    .config(['DSProvider', 'DSHttpAdapterProvider',
      function (DSProvider, DSHttpAdapterProvider) {
        angular.extend(DSProvider.defaults, {});
        angular.extend(DSHttpAdapterProvider.defaults, {
          basePath: '/api'
        });
      }])
    .factory('Currency', ['DS', function (DS) {
      return DS.defineResource('currencies');
    }])
    .factory('Agent', ['DS', function (DS) {
      return DS.defineResource('agents');
    }]);
})();
