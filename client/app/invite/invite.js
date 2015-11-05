'use strict';

angular.module('debtApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('invite', {
        url: '/:agentId/invite',
        templateUrl: 'app/invite/invite.html',
        controller: 'InviteCtrl',
        controllerAs: 'ctrl'
      });
  });
