'use strict';

(function () {
  angular.module('frontend.domain')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('account', {
          url: '/:agent/accounts',
          templateUrl: 'app/domain/account/account.html',
          controller: 'AccountCtrl',
          controllerAs: 'ctrl',
          authorize: true
        })
      .state('accountOperations', {
        url: '/:agent/:account/operations',
        templateUrl: 'app/domain/domain/account/accountOperations.html',
        controller: 'AccountOperationsCtrl',
        controllerAs: 'ctrl',
        authorize: true,
        //resolve:  {
        //  //accountOperations: function ($stateParams, Account) {
        //  //  return Account.find($stateParams.account).then(function (res) {
        //  //    return Account.loadRelations($stateParams.account).then(function () {
        //  //      return res.debtorAccountOperations.concat(res.lenderAccountOperations);
        //  //    });
        //  //  });
        //  //}
        //}
      })
    }])
  ;
})();
