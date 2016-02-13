(function () {
  'use strict';

  angular.module('frontend.domain', []);

  angular.module('frontend.domain')
    .config([
      '$stateProvider',
      function ($stateProvider) {
        $stateProvider
          .state('domain', {
            parent: 'frontend',
            data: {
              access: 0
            },
            views: {
              'content@': {
                controller: [
                  '$state',
                  function ($state) {
                    $state.go('domain.main');
                  }
                ]
              }
            }
          })
        ;
      }
    ]);
}());
