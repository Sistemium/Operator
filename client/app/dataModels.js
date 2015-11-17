'use strict';

angular.module('debtApp')
  .factory('CounterAgent', ['$resource', function ($resource) {
    return $resource('/api/counterAgents/:agent', {agent: '@id'});
  }])
  .factory('Invite', ['$resource', function ($resource) {
    return $resource('/api/invites/:id', {id: '@id'}, {
      getInviteByCode: {
        method: 'GET',
        params: {code: '@code'}
      },
      update: {
        method: 'PUT'
      },
      agentInvites: {
        url: '/api/invites/agentInvites/:agent',
        params: {agent: '@agent'},
        isArray: false,
        method: 'GET'
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
    return $resource('/api/operations', {}, {
      update: {
        url: '/api/operations/:id',
        params: {id: '@id'},
        method: 'PUT'
      }
    });
  }])
  .factory('AgentOperation', ['$resource', function ($resource) {
    return $resource('/api/operations/agentOperations/:agent');
  }]);
