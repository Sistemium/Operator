'use strict';

(function () {
  angular.module('frontend.domain')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('domain.invite', {
          url: '/:agent/invite',
          views: {
            'content@': {
              templateUrl: '/frontend/domain/invite/invite.html',
              controller: 'InviteCtrl',
              controllerAs: 'ctrl',
              resolve: {
                _invites: [
                  'InviteModel',
                  function resolve(InviteModel) {
                    return InviteModel.load();
                  }
                ],
                _agent: [
                  '$stateParams',
                  'AgentModel',
                  function resolve(
                    $stateParams,
                    AgentModel
                  ) {
                    return AgentModel.fetch($stateParams.agent)
                  }
                ]
              }
            }
          }
        });
    }])
  ;
})();
