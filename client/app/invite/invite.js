'use strict';

angular.module('debtApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('invite', {
        url: '/invite',
        templateUrl: 'app/invite/invite.html',
        controller: 'InviteCtrl'
      });
  });