'use strict';

angular.module('debtApp')
  .controller('NavbarCtrl', function ($scope, $state, $location, Auth) {
    $scope.menu = [];

    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.logout = function() {
      Auth.logout();
      $state.go('signup');
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });
