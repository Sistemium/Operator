'use strict';

(function () {

  angular.module('debtApp')
    .service('Account', function (DS) {
      return DS.defineResource({
        name: 'account',
        relations: {
          hasMany: {
            operations: [
              {
                localField: 'debtorAccountOperations',
                foreignKey: 'debtorAccount'
              }, {
                localField: 'lenderAccountOperations',
                foreignKey: 'lenderAccount'
              }
            ]
          },
          hasOne: {
            currencies: {
              localField: 'currencyEntity',
              localKey: 'currency'
            }
          }
        }
      })
    })
    .run(function (Account) {
    });

}());
