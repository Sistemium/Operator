'use strict';

(function () {
  angular.module('frontend.domain')
    .controller('AccountCtrl', [ function () {}
      //  '$rootScope'
      //  , '$state'
      //  , '$stateParams'
      //  , 'Account'
      //  , 'NgTableOptions'
      //  , function ($rootScope
      //    , $state
      //    , $stateParams
      //    , Account
      //    , NgTableOptions) {
      //
      //    var me = this;
      //    var agentId = $stateParams.agent;
      //    var accountsPromise = Account.findAll({agent: agentId});
      //
      //    angular.extend(me, {
      //      getData: function () {
      //        accountsPromise.then(function (res) {
      //          me.accounts = res;
      //          _.forEach(me.accounts, function (item) {
      //            item.accountOperations = item.debtorAccountOperations.concat(item.lenderAccountOperations);
      //          });
      //          me.debtorOperations = _.map(me.accounts, function (a) {
      //            return a.debtorAccountOperations;
      //          });
      //          me.lenderOperations = _.map(me.accounts, function (a) {
      //            return a.lenderAccountOperations;
      //          });
      //          me.accountsTableParams = NgTableOptions.setTable(me, me.accounts);
      //          me.showSpinner = false;
      //        });
      //      },
      //
      //      goToOperations: function () {
      //        $state.go('operation', {agent: agentId});
      //      },
      //
      //      refresh: function () {
      //        me.showSpinner = true;
      //        me.getData();
      //      },
      //
      //      showAccountOperations: function (accountId) {
      //        $state.go('accountOperations', {account: accountId, agent: agentId});
      //      }
      //    });
      //
      //    me.refresh();
      //
      //    $rootScope.$on('account:save', function (event) {
      //      event.preventDefault();
      //
      //      me.refresh();
      //    });
      //
      //    $rootScope.$on('account:remove', function (e) {
      //      e.preventDefault();
      //
      //      me.refresh();
      //    })
      //  }]
      //)
      //.controller('AccountOperationsCtrl', [
      //  '$state',
      //  '$stateParams',
      //  'accountOperations',
      //  'NgTableOptions',
      //  function ($state, $stateParams, accountOperations, NgTableOptions) {
      //    var me = this;
      //
      //    angular.extend(me, {
      //      accountOperations: accountOperations,
      //      setTableParams: function () {
      //        me.accountOperationsTableParams = NgTableOptions.setTable(me, me.accountOperations);
      //      },
      //      goBack: function () {
      //        $state.go('account', {agent: $stateParams.agent});
      //      }
      //    });
      //
      //    me.setTableParams();
      //  }
    ]);
})();
