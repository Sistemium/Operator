'use strict';

(function () {
  angular.module('debtApp')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('main', {
          url: '/',
          templateUrl: 'app/main/main.html'
        });
    }]);
})();
