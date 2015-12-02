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
    .run(['$rootScope', 'Agent', 'Currency', 'Invite', 'Auth', 'messageBus',
      function ($rootScope, Agent, Currency, Invite, Auth, messageBus) {
        Auth.isLoggedInAsync(function (isLoggedIn) {
          if (isLoggedIn) {
            //register socket events
            messageBus.initSocket();
            Agent.findAll();
            Currency.findAll();
            Invite.findAll();
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
    }])
    .service('Invite', ['DS', function (DS) {
      return DS.defineResource({
        name: 'invites'
      });
    }])
    .service('AgentInvite', ['DS', function (DS) {
      return DS.defineResource({
        name: 'agentInvites',
        endpoint: '/invites/agentInvites'
      });
    }])
    .service('AgentOperation', ['DS', function (DS) {
      return DS.defineResource({
        name: 'agentOperations',
        endpoint: '/operations/agentOperations'
      });
    }])
    .service('Operation', ['DS', function (DS) {
      return DS.defineResource({
        name: 'operations'
      });
    }])
    .service('CounterAgent', ['DS', function (DS) {
      return DS.defineResource({
        name: 'counterAgents'
      });
    }])
    .service('Account', ['DS', function (DS) {
      return DS.defineResource({
        name: 'accounts'
      })
    }]);
})();
