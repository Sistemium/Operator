'use strict';

(function () {
  angular.module('frontend.domain')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('domain.agent', {
          url: '/agent',
          data: {
            access: 0
          },
          views: {
            'content@': {
              templateUrl: '/frontend/domain/agent/agent.html',
              controller: 'AgentCtrl',
              controllerAs: 'ctrl'
            }
          }
        });
    }])
  ;
})();
