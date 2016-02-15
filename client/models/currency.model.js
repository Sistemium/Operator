'use strict';

(function () {

  angular.module('debtApp')
    .factory('Currency', function (DS) {
      return DS.defineResource({
        name: 'currency',
        relations: {
          hasMany: {
            accounts: {
              localField: 'accounts',
              foreignKey: 'currency'
            }
          }
        }
      });
    })
    .run(function (Currency) {
    });

}());
