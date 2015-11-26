'use strict';

(function () {
  angular.module('debtApp')
    .factory('Currency', ['DS', function (DS) {
      return DS.defineResource('currencies')
    }]);
})();
