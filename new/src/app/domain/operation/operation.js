'use strict';

(function () {
  angular.module('frontend.domain')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('operation', {
          url: '/:agent/operation',
          templateUrl: 'app/domain/operation/operation.html',
          controller: 'OperationCtrl',
          controllerAs: 'ctrl'
        });
    }])
  ;
})();
