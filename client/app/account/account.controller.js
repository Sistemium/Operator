'use strict';

angular.module('debtApp')
  .factory('Account', function ($resource) {
    return $resource('/api/accounts');
  })
  .factory('Currency', function ($resource) {
    return $resource('/api/currencies')
  })
  .controller('AccountCtrl', function ($stateParams, Account, Currency) {
    var me = this;
    me.accounts = [];
    me.currencies = [];
    var agentId = $stateParams.agentId;
    var accountsPromise = Account.query();
    var currenciesPromise = Currency.query();

    angular.extend(me, {
      getData: function () {
        if (currenciesPromise.hasOwnProperty('$promise')) {
          currenciesPromise.$promise.then(function (res) {
            me.currencies = res;
          });
        } else {
          me.currencies = currenciesPromise;
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
            agentId: agentId,
            currency: me.currency
          });
          newAccount.$save(function (u) {
            me.account.push(u);
            me.currency = '';
            form.$setPristine();
          })
        }
      },

      cancel: function (form) {
        me.currency = '';
        form.$setPristine();
      },

      refresh: function () {
        me.getData();
      }
    });

    me.refresh();
  })
;
