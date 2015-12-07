'use strict';

(function () {
  angular.module('debtApp')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('account', {
          url: '/:agent/accounts',
          templateUrl: 'app/account/account.html',
          controller: 'AccountCtrl',
          controllerAs: 'ctrl',
          authorize: true
        })
      .state('accountOperations', {
        url: '/:agent/:account/operations',
        templateUrl: 'app/account/accountOperations.html',
        controller: 'AccountOperationsCtrl',
        controllerAs: 'ctrl',
        authorize: true,
        resolve:  {
          accountOperations: function ($stateParams, Account) {
            return Account.find($stateParams.account).then(function (res) {
              return res.debtorAccountOperations.concat(res.lenderAccountOperations);
            });
          }
        }
      })
    }])
  ;
})();
