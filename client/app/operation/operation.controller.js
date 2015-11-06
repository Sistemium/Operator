'use strict';

angular.module('debtApp')
  .controller('OperationCtrl', ['$stateParams', 'CounterAgent', 'Account', function ($stateParams, CounterAgent, Account) {
    var me = this;
    me.counterAgents = [];
    me.agentsAccounts = [];
    var agentId = $stateParams.agent;
    var accountId = $stateParams.account;

    me.init = function () {
      me.counterAgentsPromise = CounterAgent.query({agent: agentId});
      me.agentsAccountsPromise = Account.getAgentAccounts({agent: agentId});

      if (me.counterAgentsPromise.hasOwnProperty('$promise')) {
        me.counterAgentsPromise.$promise.then(function (res) {
          res = _.filter(res, function (i) {
            return i.id !== agentId;
          });
          me.counterAgents = res;
        });
      } else {
        me.counterAgents = counterAgentsPromise;
      }

      if (me.agentsAccountsPromise.hasOwnProperty('$promise')) {
        me.agentsAccountsPromise.$promise.then(function (res) {
          res = _.filter(res, function (i) {
            return i.id !== accountId;
          })
          me.agentsAccounts = res;
        })
      } else {
        me.agentsAccounts = me.agentsAccountsPromise;
      }
    };

    me.init();
  }]);
