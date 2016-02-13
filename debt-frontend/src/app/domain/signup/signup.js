'use strict';

(function () {
  angular.module('frontend.domain')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('domain.signup', {
          url: '/signup',
          views: {
            'content@': {
              templateUrl: 'frontend/domain/signup/signup.html',
              controller: 'SignupCtrl',
              controllerAs: 'ctrl'
            }
          }
        });
    }])
  ;
})();
