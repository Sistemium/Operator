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
    .run([
      '$rootScope',
      'Agent',
      'Currency',
      'Invite',
      'Operation',
      'Account',
      'Auth',
      'messageBus',
      function ($rootScope, Agent, Currency, Invite, Operation, Account, Auth, messageBus) {
        Auth.isLoggedInAsync(function (isLoggedIn) {
          if (isLoggedIn) {
            //register socket events
            messageBus.initSocket();

            // initially fetch data and inject in stores
            Agent.findAll().then(function (res) {
              console.log(res);
            });
            Currency.findAll().then(function (res) {
              console.log(res);
            });
            Invite.findAll().then(function (res) {
              console.log(res);
            });
            Operation.findAll().then(function (res) {
              console.log(res);
            });
            Account.findAll().then(function (res) {
              console.log(res);
            })
          }
        });
      }])
    .service('Currency', ['DS', function (DS) {
      return DS.defineResource({
        name: 'currencies'
      });
    }])
    .service('Agent', ['DS', function (DS) {
      return DS.defineResource({
        name: 'agents',
        relations: {
          hasMany: {
            invites: [
              {
                localField: 'ownerInvites',
                foreignKey: 'owner'
              }, {
                localField: 'acceptorInvites',
                foreignKey: 'acceptor'
              }
            ],
            operations: [
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
        }
      });
    }])
    .service('Invite', ['DS', 'DSHttpAdapter', function (DS, DSHttpAdapter) {
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
          }
        }
      })
    }]);
})();
