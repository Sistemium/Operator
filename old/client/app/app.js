/**
 * Frontend application definition.
 *
 * This is the main file for the 'frontend' application.
 */
(function() {
  'use strict';

  // Create frontend module and specify dependencies for that
  angular.module('frontend', [
    //'frontend-templates',
    'frontend.core',
    'frontend.domain'
    //'frontend.admin'
  ]);

  /**
   * Configuration for frontend application, this contains following main sections:
   *
   *  1) Configure $httpProvider and $sailsSocketProvider
   *  2) Set necessary HTTP and Socket interceptor(s)
   *  3) Turn on HTML5 mode on application routes
   *  4) Set up application routes
   */
  angular.module('frontend')
    .config([
      '$stateProvider', '$locationProvider', '$urlRouterProvider', '$httpProvider', '$sailsSocketProvider',
      '$tooltipProvider', 'cfpLoadingBarProvider',
      'toastrConfig',
      'AccessLevels',
      function config($stateProvider, $locationProvider, $urlRouterProvider, $httpProvider, $sailsSocketProvider,
                      $tooltipProvider, cfpLoadingBarProvider,
                      toastrConfig,
                      AccessLevels) {
        $httpProvider.defaults.useXDomain = true;

        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        // Add interceptors for $httpProvider and $sailsSocketProvider
        $httpProvider.interceptors.push('AuthInterceptor');
        $httpProvider.interceptors.push('ErrorInterceptor');

        // Iterate $httpProvider interceptors and add those to $sailsSocketProvider
        angular.forEach($httpProvider.interceptors, function iterator(interceptor) {
          $sailsSocketProvider.interceptors.push(interceptor);
        });

        // Set tooltip options
        $tooltipProvider.options({
          appendToBody: true
        });

        // Disable spinner from cfpLoadingBar
        cfpLoadingBarProvider.includeSpinner = false;
        cfpLoadingBarProvider.latencyThreshold = 200;

        // Extend default toastr configuration with application specified configuration
        angular.extend(
          toastrConfig,
          {
            allowHtml: true,
            closeButton: true,
            extendedTimeOut: 3000
          }
        );

        // Yeah we wanna to use HTML5 urls!
        $locationProvider
          .html5Mode({
            enabled: true,
            requireBase: false
          })
          .hashPrefix('!')
        ;

        //// Routes that needs authenticated user
        //$stateProvider
        //  .state('profile', {
        //    abstract: true,
        //    template: '<ui-view/>',
        //    data: {
        //      access: AccessLevels.user
        //    }
        //  })
        //  .state('profile.edit', {
        //    url: '/profile',
        //    templateUrl: '/frontend/profile/profile.html',
        //    controller: 'ProfileController'
        //  })
        //;
        //
        //// Main state provider for frontend application
        //$stateProvider
        //  .state('frontend', {
        //    abstract: true,
        //    views: {
        //      header: {
        //        templateUrl: '/frontend/core/layout/partials/header.html',
        //        controller: 'HeaderController'
        //      },
        //      footer: {
        //        templateUrl: '/frontend/core/layout/partials/footer.html',
        //        controller: 'FooterController'
        //      }
        //    }
        //  })
        //;

        //// For any unmatched url, redirect to /about
        //$urlRouterProvider.otherwise('/about');
      }
    ])
  ;

  /**
   * Frontend application run hook configuration. This will attach auth status
   * check whenever application changes URL states.
   */
  angular.module('frontend')
    .run([
      '$rootScope', '$state', '$injector',
      'editableOptions',
      'AuthService',
      function run($rootScope, $state, $injector,
                   editableOptions,
                   AuthService) {
        // Set usage of Bootstrap 3 CSS with angular-xeditable
        editableOptions.theme = 'bs3';

        /**
         * Route state change start event, this is needed for following:
         *  1) Check if user is authenticated to access page, and if not redirect user back to login page
         */
        $rootScope.$on('$stateChangeStart', function stateChangeStart(event, toState) {
          if (!AuthService.authorize(toState.data.access)) {
            event.preventDefault();

            $state.go('auth.login');
          }
        });

        // Check for state change errors.
        $rootScope.$on('$stateChangeError', function stateChangeError(event, toState, toParams, fromState, fromParams, error) {
          event.preventDefault();

          $injector.get('MessageService')
            .error('Error loading the page');

          $state.get('error').error = {
            event: event,
            toState: toState,
            toParams: toParams,
            fromState: fromState,
            fromParams: fromParams,
            error: error
          };

          return $state.go('error');
        })
      }
    ]);
    //.run(['gettextCatalog', function (gettextCatalog) {
    //  // enable debugging mode to show untranslated strings
    //  console.log('iasm');
    //  gettextCatalog.debug = true;
    //  if (lang) {
    //    gettextCatalog.setCurrentLanguage(lang);
    //  } else {
    //    gettextCatalog.setCurrentLanguage('en');
    //  }
    //}])
}());

  //angular.module('frontend')
    //.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider',
    //  function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
    //    $urlRouterProvider
    //      .otherwise('/');
    //
    //    //$locationProvider.html5Mode(true);
    //    $httpProvider.interceptors.push('authInterceptor');
    //  }])
    //
    //.factory('authInterceptor', ['$rootScope', '$q', '$cookieStore', '$location', function ($rootScope, $q, $cookieStore, $location) {
    //  return {
    //    // Add authorization token to headers
    //    request: function (config) {
    //      config.headers = config.headers || {};
    //      if ($cookieStore.get('token')) {
    //        config.headers.Authorization = $cookieStore.get('token');
    //      }
    //      return config;
    //    },
    //
    //    // Intercept 401s and redirect you to login
    //    responseError: function (response) {
    //      if (response.status === 401) {
    //        $location.path('/login');
    //        // remove any stale tokens
    //        $cookieStore.remove('token');
    //        return $q.reject(response);
    //      }
    //      else {
    //        return $q.reject(response);
    //      }
    //    }
    //  };
    //}])
    //.value('authDomain', 'http://localhost:9000/')
    //
    //.run(['$rootScope', '$state', 'Auth', function ($rootScope, $state, Auth) {
    //  // Redirect to login if route requires auth and you're not logged in
    //  $rootScope.$on('$stateChangeStart', function (event, next) {
    //    Auth.isLoggedInAsync(function (loggedIn) {
    //      if (next.authenticate && !loggedIn) {
    //        event.preventDefault();
    //        $state.go('signup');
    //      }
    //    });
    //  });
    //  $rootScope.$on('$locationChangeStart', function (event, next) {
    //    Auth.isLoggedInAsync(function (loggedIn) {
    //      if (next.authenticate && !loggedIn) {
    //        event.preventDefault();
    //        $state.go('signup');
    //      }
    //    });
    //  });
    //}])
    //.run(['gettextCatalog', 'localStorageService', function (gettextCatalog, localStorageService) {
    //  // enable debugging mode to show untranslated strings
    //  gettextCatalog.debug = true;
    //  var lang = localStorageService.get('chosen_language');
    //  if (lang) {
    //    gettextCatalog.setCurrentLanguage(lang);
    //  } else {
    //    gettextCatalog.setCurrentLanguage('en');
    //  }
    //}])
    //;
//}());


//(function () {
//  angular.module('debtApp', [
//      'ngCookies',
//      'ngSanitize',
//      'btford.socket-io',
//      'ui.router',
//      'ui.bootstrap',
//      'gettext',
//      'ngMaterial',
//      'ui.select',
//      'ngSanitize',
//      'angularSpinner',
//      'LocalStorageModule',
//      'js-data',
//      'ngAnimate',
//      'toastr',
//      'ngTable',
//      'formly',
//      'formlyBootstrap'
//    ])
//
//})();
