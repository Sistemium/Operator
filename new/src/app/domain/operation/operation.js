'use strict';

(function () {
  angular.module('frontend.domain')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('domain.operation', {
          url: '/:agent/operation',
          views: {
            templateUrl: 'frontend/domain/operation/operation.html',
            controller: 'OperationCtrl',
            controllerAs: 'ctrl'
          }
        });
    }])
  ;
})();
