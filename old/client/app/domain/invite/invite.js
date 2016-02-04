'use strict';

(function () {
  angular.module('frontend.domain')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('invite', {
          url: '/:agent/invite',
          templateUrl: 'app/domain/invite/invite.html',
          controller: 'InviteCtrl',
          controllerAs: 'ctrl'
        });
    }])
  ;
})();
