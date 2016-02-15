'use strict';

(function () {

  angular.module('debtApp')
    .factory('Operation', function (DS) {
      return DS.defineResource({
        name: 'operation',
        relations: {
          belongsTo: {
            agents: [
              {
                localField: 'lenderAgent',
                localKey: 'lender'
              },
              {
                localField: 'debtorAgent',
                localKey: 'debtor'
              }
            ],
            accounts: [
              {
                localField: 'lenderAccountEntity',
                localKey: 'lenderAccount'
              }, {
                localField: 'debtorAccountEntity',
                localKey: 'debtorAccount'
              }
            ]
          },
          hasOne: {
            currencies: {
              localField: 'currencyEntity',
              localKey: 'currency'
            }
          }
        },
        validate: function (Operation, operation, cb) {
          var operationSchema = {
            lender: {
              presence: true
            },
            debtor: {
              presence: true
            },
            total: {
              presence: true
            }
          };

          var err = validate(operation, operationSchema);
          if (err) {
            cb(err);
          } else {
            cb(null, operation);
          }
        },
        afterInject: function (res, array) {
          _.each(array, function (i) {
            if (i.hasOwnProperty('lenderConfirmedAt')) {
              i.lenderConfirmedAt = moment(+i.lenderConfirmedAt);
            }
            if (i.hasOwnProperty('debtorConfirmedAt')) {
              i.debtorConfirmedAt = moment(+i.debtorConfirmedAt);
            }
            if (i.hasOwnProperty('remindDuration')) {
              i.remindDuration = moment(+i.remindDuration);
            }
          });
          return array;
        },
        beforeUpdate: function (res, obj, cb) {

          var isNumber;
          if (obj.hasOwnProperty('lenderConfirmedAt')) {
            isNumber = typeof obj.lenderConfirmedAt;
            obj.lenderConfirmedAt = isNumber === "number" ? obj.lenderConfirmedAt : obj.lenderConfirmedAt._i;
          }
          if (obj.hasOwnProperty('debtorConfirmedAt')) {
            isNumber = typeof obj.debtorConfirmedAt;
            obj.debtorConfirmedAt = isNumber === "number" ? obj.debtorConfirmedAt : obj.debtorConfirmedAt._i;
          }
          if (obj.hasOwnProperty('remindDuration')) {
            isNumber = typeof obj.remindDuration;
            obj.remindDuration = isNumber === "number" ? obj.remindDuration : obj.remindDuration._i;
          }

          cb(null, obj);
        },
        afterUpdate: function (res, obj, cb) {
          if (obj.hasOwnProperty('lenderConfirmedAt')) {
            obj.lenderConfirmedAt = moment(+obj.lenderConfirmedAt);
          }
          if (obj.hasOwnProperty('debtorConfirmedAt')) {
            obj.debtorConfirmedAt = moment(+obj.debtorConfirmedAt);
          }
          if (obj.hasOwnProperty('remindDuration')) {
            obj.remindDuration = moment(+obj.remindDuration);
          }

          cb(null, obj);
        }
      });
    })
    .run(function (Operation) {
    });

}());
