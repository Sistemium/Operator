'use strict';

(function () {
  angular.module('frontend.domain')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('domain.main', {
          url: '/main',
          views: {
            'content@': {
              templateUrl: '/frontend/domain/main/main.html'
            },
            'pageNavigation@': false
          }
        });
    }]);
})();
