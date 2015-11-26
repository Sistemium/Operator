'use strict';

(function () {
  angular.module('debtApp')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('agent', {
          url: '/agent',
          templateUrl: 'app/agent/agent.html',
          controller: 'AgentCtrl',
          controllerAs: 'ctrl',
          authenticate: true
        });
    }])
  ;
})();
