'use strict';

angular.module('debtApp')
  .controller('NavbarCtrl', ['$state', '$location', 'gettextCatalog', 'Auth', 'localStorageService',
    function ($state, $location, gettextCatalog, Auth, localStorageService) {
      var me = this;
      me.menu = [];

      me.isCollapsed = true;
      me.isLoggedIn = Auth.isLoggedIn;
      me.getCurrentUser = Auth.getCurrentUser;

      me.changeLanguage = function (lang) {
        gettextCatalog.setCurrentLanguage(lang);
        localStorageService.set('chosen_language', lang);
      };

      me.logout = function () {
        Auth.logout();
        $state.go('signup');
      };

      me.isActive = function (route) {
        return route === $location.path();
      };
    }]);
