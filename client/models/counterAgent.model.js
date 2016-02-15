'use strict';

(function () {

  angular.module('debtApp')
    .factory('CounterAgent', function (DS) {
      return DS.defineResource({
        name: 'counterAgent'
      });
    })
    .run(function (CounterAgent) {
    });

}());
