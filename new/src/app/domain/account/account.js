'use strict';

(function () {
  angular.module('frontend.domain')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('domain.account', {
          url: '/:agent/accounts',
          data: {
            access: 0
          },
          views: {
            'content@': {
              templateUrl: '/frontend/domain/account/account.html',
              controller: 'AccountCtrl',
              controllerAs: 'ctrl'
            }
          }
        })
      .state('domain.accountOperations', {
        url: '/:agent/:account/operations',
        data: {
          access: 0
        },
        views: {
          'content@': {
            templateUrl: '/frontend/domain/account/accountOperations.html',
            controller: 'AccountOperationsCtrl',
            controllerAs: 'ctrl'
          }
        }
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
