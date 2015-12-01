'use strict';

(function () {
  angular.module('debtApp')
    .factory('Account', ['$resource', function ($resource) {
      return $resource('/api/accounts/', {}, {
        getAgentAccounts: {
          method: 'GET',
          params: {agent: '@id'},
          isArray: true
        }
      });
    }]);
})();
