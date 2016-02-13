'use strict';

angular.module('debtApp', [
  'debtApp.constants',
  'ngResource',
  'ngSanitize',
  'ui.router',
  'ui.bootstrap'
])
  .config(function($urlRouterProvider) {
    $urlRouterProvider
      .otherwise('/');
  });
