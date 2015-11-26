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
        });
    }])
  ;
})();
