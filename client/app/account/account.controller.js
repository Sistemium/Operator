'use strict';

(function () {
  angular.module('debtApp')
    .controller('AccountCtrl', ['$state', '$stateParams', 'Account',
      function ($state, $stateParams, Account) {
        var me = this;
        me.accounts = [];
        me.currencies = [];
        var agentId = $stateParams.agent;
        var accountsPromise = Account.getAgentAccounts({agent: agentId});

        angular.extend(me, {
          getData: function () {
            if (accountsPromise.hasOwnProperty('$promise')) {
              accountsPromise.$promise.then(function (res) {
                me.accounts = res;
              });
            } else {
              me.accounts = accountsPromise;
            }
          },

          goToOperations: function () {
            $state.go('operation', {agent: agentId});
          },

          refresh: function () {
            me.getData();
          }
        });

        me.refresh();
      }]
    )
  ;
})();
