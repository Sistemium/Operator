'use strict';

(function () {
  angular.module('debtApp')
    .controller('NavbarCtrl'
      , ['$rootScope'
        , '$state'
        , '$location'
        , 'gettextCatalog'
        , 'Auth'
        , 'localStorageService'
        , 'messageBus'
        , function ($rootScope
          , $state
          , $location
          , gettextCatalog
          , Auth
          , localStorageService
          , messageBus) {

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

          me.disconnect = function () {
            messageBus.disconnect();
          };

          me.connect = function () {
            messageBus.connect();
          };

          me.isActive = function (route) {
            return route === $location.path();
          };

          $rootScope.$on('socketConnected', function (e, state) {
            e.preventDefault();
            me.socketConnected = state;
          });
        }]
    )
  ;
})();
