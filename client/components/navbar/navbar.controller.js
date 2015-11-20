'use strict';

angular.module('debtApp')
  .controller('NavbarCtrl', function ($state, $location, Auth) {
    var me = this;
    me.menu = [];

    me.isCollapsed = true;
    me.isLoggedIn = Auth.isLoggedIn;
    me.getCurrentUser = Auth.getCurrentUser;

    me.logout = function() {
      Auth.logout();
      $state.go('signup');
    };

    me.isActive = function(route) {
      return route === $location.path();
    };
  });
