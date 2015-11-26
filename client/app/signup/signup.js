'use strict';

(function () {
  angular.module('debtApp')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('signup', {
          url: '/signup',
          templateUrl: 'app/signup/signup.html',
          controller: 'SignupCtrl',
          controllerAs: 'ctrl'
        });
    }])
  ;
})();
