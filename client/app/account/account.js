'use strict';

angular.module('debtApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('account', {
        url: '/:agentId/accounts',
        templateUrl: 'app/account/account.html',
        controller: 'AccountCtrl',
        authorize: true
      });
  });
