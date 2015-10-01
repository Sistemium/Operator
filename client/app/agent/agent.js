'use strict';

angular.module('debtApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('agent', {
        url: '/agent',
        templateUrl: 'app/agent/agent.html',
        controller: 'AgentCtrl'
      });
  });
