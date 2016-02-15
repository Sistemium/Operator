'use strict';

angular.module('debtApp', [
    'debtApp.constants',
    'ngResource',
    'js-data',
    'ngSanitize',
    'ui.router',
    'ui.bootstrap'
  ])
  .config(function ($urlRouterProvider) {
    $urlRouterProvider
      .otherwise('/');
  })

  .config(function (DSProvider, DSHttpAdapterProvider) {
    angular.extend(DSProvider.defaults, {});
    angular.extend(DSHttpAdapterProvider.defaults, {
      basePath: 'http://localhost:1337'
    });
  })
;

