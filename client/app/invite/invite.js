'use strict';

(function () {
  angular.module('debtApp')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('invite', {
          url: '/:agent/invite',
          templateUrl: 'app/invite/invite.html',
          controller: 'InviteCtrl',
          controllerAs: 'ctrl'
        });
    }])
  ;
})();
