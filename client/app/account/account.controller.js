'use strict';

(function () {
  angular.module('debtApp')
    .controller('AccountCtrl', ['$state', '$stateParams', 'Account',
      function ($state, $stateParams, Account) {
        var me = this;
        me.accounts = [];
        me.currencies = [];
        var agentId = $stateParams.agent;
        var accountsPromise = Account.findAll({agent: agentId});

        angular.extend(me, {
          getData: function () {
            accountsPromise.then(function (res) {
              me.accounts = res;
            });
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
