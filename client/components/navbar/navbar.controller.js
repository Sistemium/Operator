'use strict';

angular.module('debtApp')
  .controller('NavbarCtrl', function ($scope, $state, $location, Auth) {
    $scope.menu = [{
      'title': 'Главная',
      'link': '/'
    }];

    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.logout = function() {
      Auth.logout();
      $state.go('login');
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });
