'use strict';

(function () {
  angular.module('frontend.domain')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('main', {
          url: '/',
          templateUrl: 'app/domain/main/main.html'
        });
    }]);
})();
