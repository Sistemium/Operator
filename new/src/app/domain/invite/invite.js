'use strict';

(function () {
  angular.module('frontend.domain')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('domain.invite', {
          url: '/:agent/invite',
          views: {
            'content@': {
              templateUrl: 'frontend/domain/invite/invite.html',
              controller: 'InviteCtrl',
              controllerAs: 'ctrl'
            }
          }
        });
    }])
  ;
})();
