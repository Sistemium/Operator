'use strict';

angular.module('debtApp')
  .controller('AccountCtrl', ['$state', '$stateParams', 'Account', 'Currency',
    function ($state, $stateParams, Account, Currency) {
      var me = this;
      me.accounts = [];
      me.currencies = [];
      var agentId = $stateParams.agent;
      var accountsPromise = Account.getAgentAccounts({agent: agentId});
      var currenciesPromise = Currency.query();

      angular.extend(me, {
        getData: function () {
          if (currenciesPromise.hasOwnProperty('$promise')) {
            currenciesPromise.$promise.then(function (res) {
              me.currencies = res;
              me.selectedItem = res[0];
            });
          } else {
            me.currencies = currenciesPromise;
            me.selectedItem = currenciesPromise[0];
          }
          if (accountsPromise.hasOwnProperty('$promise')) {
            accountsPromise.$promise.then(function (res) {
              me.accounts = res;
            });
          } else {
            me.accounts = accountsPromise;
          }
        },

        save: function (form) {
          if (me.currency) {
            var newAccount = new Account({
              id: uuid.v4(),
              agent: agentId,
              currency: me.currency
            });
            newAccount.$save(function (u) {
              me.accounts.push(u);
              me.currency = '';
              form.$setPristine();
            })
          }
        },

        cancel: function (form) {
          me.currency = '';
          form.$setPristine();
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
