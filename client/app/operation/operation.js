'use strict';

(function () {
  angular.module('debtApp')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('operation', {
          url: '/:agent/operation',
          templateUrl: 'app/operation/operation.html',
          controller: 'OperationCtrl',
          controllerAs: 'ctrl'
        });
    }])
  ;
})();
