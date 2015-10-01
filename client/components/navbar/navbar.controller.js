'use strict';

angular.module('debtApp')
  .controller('NavbarCtrl', function ($scope, $location) {
    $scope.menu = [{
      'title': 'Главная',
      'link': '/'
    }];

    $scope.isCollapsed = true;
    $scope.logout = function() {
      $location.path('/login');
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });
