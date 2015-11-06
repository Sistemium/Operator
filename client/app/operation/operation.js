'use strict';

angular.module('debtApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('operation', {
        url: '/:agent/:account/operation',
        templateUrl: 'app/operation/operation.html',
        controller: 'OperationCtrl',
        controllerAs: 'ctrl'
      });
  });
