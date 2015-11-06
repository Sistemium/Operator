'use strict';

angular.module('debtApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('account', {
        url: '/:agent/accounts',
        templateUrl: 'app/account/account.html',
        controller: 'AccountCtrl',
        controllerAs: 'ctrl',
        authorize: true
      });
  });
