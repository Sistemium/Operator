'use strict';

(function () {
  angular.module('debtApp', [
      'ngCookies',
      'ngSanitize',
      'btford.socket-io',
      'ui.router',
      'ui.bootstrap',
      'gettext',
      'ngMaterial',
      'ui.select',
      'ngSanitize',
      'angularSpinner',
      'LocalStorageModule',
      'js-data',
      'ngAnimate',
      'toastr',
      'ngTable'
    ])
    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider',
      function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
        $urlRouterProvider
          .otherwise('/');

        //$locationProvider.html5Mode(true);
        $httpProvider.interceptors.push('authInterceptor');
      }])
    .config(['localStorageServiceProvider', function (localStorageServiceProvider) {
      localStorageServiceProvider.setPrefix('ls');
    }])

    .factory('authInterceptor', ['$rootScope', '$q', '$cookieStore', '$location', function ($rootScope, $q, $cookieStore, $location) {
      return {
        // Add authorization token to headers
        request: function (config) {
          config.headers = config.headers || {};
          if ($cookieStore.get('token')) {
            config.headers.Authorization = $cookieStore.get('token');
          }
          return config;
        },

        // Intercept 401s and redirect you to login
        responseError: function (response) {
          if (response.status === 401) {
            $location.path('/login');
            // remove any stale tokens
            $cookieStore.remove('token');
            return $q.reject(response);
          }
          else {
            return $q.reject(response);
          }
        }
      };
    }])
    .value('authDomain', 'http://localhost:9000/')

    .run(['$rootScope', '$state', 'Auth', function ($rootScope, $state, Auth) {
      // Redirect to login if route requires auth and you're not logged in
      $rootScope.$on('$stateChangeStart', function (event, next) {
        Auth.isLoggedInAsync(function (loggedIn) {
          if (next.authenticate && !loggedIn) {
            event.preventDefault();
            $state.go('signup');
          }
        });
      });
      $rootScope.$on('$locationChangeStart', function (event, next) {
        Auth.isLoggedInAsync(function (loggedIn) {
          if (next.authenticate && !loggedIn) {
            event.preventDefault();
            $state.go('signup');
          }
        });
      });
    }])
    .run(['gettextCatalog', 'localStorageService', function (gettextCatalog, localStorageService) {
      // enable debugging mode to show untranslated strings
      gettextCatalog.debug = true;
      var lang = localStorageService.get('chosen_language');
      if (lang) {
        gettextCatalog.setCurrentLanguage(lang);
      } else {
        gettextCatalog.setCurrentLanguage('en');
      }
    }])
  ;

})();
