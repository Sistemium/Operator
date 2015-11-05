'use strict';

angular.module('debtApp')
  .factory('Account', function ($resource) {
    return $resource('/api/accounts');
  })
  .controller('AccountCtrl', function ($stateParams, Account) {
    var me = this;
    me.accounts = [];
    var agentId = $stateParams.agentId;
    var accountsPromise = Account.query();

    angular.extend(me, {
      getData: function () {
        if (accountsPromise.hasOwnProperty('$promise')) {
          accountsPromise.$promise.then(function (res) {
            me.accounts = res;
          })
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
