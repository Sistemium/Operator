(function () {
  'use strict';
  angular.module('debtApp')
    .config(['DSProvider', 'DSHttpAdapterProvider',
      function (DSProvider, DSHttpAdapterProvider) {
        angular.extend(DSProvider.defaults, {});
        angular.extend(DSHttpAdapterProvider.defaults, {
          basePath: '/api'
        });
      }])
    .run(['DataConnect', function (DataConnect) {
      DataConnect.init();
    }])
    .service('DataConnect', [
      '$rootScope',
      '$http',
      'localStorageService',
      'Agent',
      'Currency',
      'Invite',
      'Operation',
      'Account',
      'Auth',
      'messageBus',
      function ($rootScope
        , $http
        , localStorageService
        , Agent
        , Currency
        , Invite
        , Operation
        , Account
        , Auth
        , messageBus) {
        $http.defaults.headers.common.authorization = localStorageService.get('token');

        function init() {
          Auth.isLoggedInAsync(function (isLoggedIn) {
            if (isLoggedIn) {
              //register socket events
              messageBus.initSocket();

              // initially fetch data and inject in stores
              Agent.findAll();
              Currency.findAll();
              Invite.findAll();
              Operation.findAll();
              Account.findAll();
            }
          });
        }

        return {
          init: init
        };
      }])
    .service('Currency', ['DS', function (DS) {
      return DS.defineResource({
        name: 'currencies',
        relations: {
          hasMany: {
            accounts: {
              localField: 'accounts',
              foreignKey: 'currency'
            }
          }
        }
      });
    }])
    .service('Agent', ['DS', function (DS) {
      return DS.defineResource({
        name: 'agents',
        relations: {
          hasMany: {
            agentInvites: [
              {
                localField: 'ownerInvites',
                foreignKey: 'owner'
              }, {
                localField: 'acceptorInvites',
                foreignKey: 'acceptor'
              }
            ],
            agentOperations: [
              {
                localField: 'lenderOperations',
                foreignKey: 'lender'
              },
              {
                localField: 'debtorOperations',
                foreignKey: 'debtor'
              }
            ]
          }
        },
        validate: function (Agent, agent, cb) {
          var agentSchema = {
            name: {
              presence: true
            }
          };

          var err = validate(agent, agentSchema);
          if (err) {
            cb(err);
          } else {
            cb(null, agent);
          }
        },
      });
    }])
    .service('Invite', ['DS', function (DS) {
      return DS.defineResource({
        name: 'invites',
        relations: {
          belongsTo: {
            agents: [
              {
                localField: 'ownerAgent',
                localKey: 'owner'
              },
              {
                localField: 'acceptorAgent',
                localKey: 'acceptor'
              }
            ]
          }
        },
        actions: {
          findByCode: {}
        }
      });
    }])
    .service('AgentInvite', ['DS', function (DS) {
      return DS.defineResource({
        name: 'agentInvites',
        endpoint: '/invites/agentInvites',
        relations: {
          belongsTo: {
            agents: [
              {
                localField: 'ownerAgent',
                localKey: 'owner'
              },
              {
                localField: 'acceptorAgent',
                localKey: 'acceptor'
              }
            ]

          }
        }
      });
    }])
    .service('AgentOperation', ['DS', function (DS) {
      return DS.defineResource({
        name: 'agentOperations',
        endpoint: '/operations/agentOperations',
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
          });
          console.log(array);
          return array;
        }
      });
    }])
    .service('Operation', ['DS', function (DS) {
      return DS.defineResource({
        name: 'operations',
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
          });
          return array;
        }
      });
    }])
    .service('CounterAgent', ['DS', function (DS) {
      return DS.defineResource({
        name: 'counterAgents'
      });
    }])
    .service('Account', ['DS', function (DS) {
      return DS.defineResource({
        name: 'accounts',
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
    }]);
})();
