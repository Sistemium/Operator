'use strict';

(function () {
  angular.module('frontend.domain')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('signup', {
          url: '/signup',
          templateUrl: 'app/domain/signup/signup.html',
          controller: 'SignupCtrl',
          controllerAs: 'ctrl'
        });
    }])
  ;
})();
