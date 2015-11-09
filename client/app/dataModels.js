'use strict';

angular.module('debtApp')
  .factory('CounterAgent', ['$resource', function ($resource) {
    return $resource('/api/counterAgents/:agent', {agent: '@id'});
  }])
  .factory('Invite', ['$resource', function ($resource) {
    return $resource('/api/invites/', {}, {
      getInviteByCode: {
        method: 'GET',
        params: {code: '@code'}
      },
      update: {
        url: '/api/invites/:id',
        params: {id: '@id'},
        method: 'PUT'
      }
    });
  }])
  .factory('Agent', ['$resource', function ($resource) {
    return $resource('/api/agents', {}, {
      query: {method: 'GET', isArray: true}
    });
  }])
  .factory('Account', ['$resource', function ($resource) {
    return $resource('/api/accounts/', {}, {
      getAgentAccounts: {
        method: 'GET',
        params: {agent: '@id'},
        isArray: true
      }
    });
  }])
  .factory('Currency', ['$resource', function ($resource) {
    return $resource('/api/currencies');
  }])
  .factory('Operation', ['$resource', function ($resource) {
    return $resource('/api/operations');
  }]);
