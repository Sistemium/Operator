'use strict';

(function () {
  angular.module('frontend.domain')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('agent', {
          url: '/agent',
          templateUrl: 'app/domain/agent/agent.html',
          controller: 'AgentCtrl',
          controllerAs: 'ctrl',
          authenticate: true
        });
    }])
  ;
})();
