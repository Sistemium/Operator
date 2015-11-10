'use strict';

angular.module('debtApp')
  .controller('OperationCtrl', ['$stateParams', 'CounterAgent', 'Account', 'Operation', 'AgentOperation', 'Currency',
    function ($stateParams, CounterAgent, Account, Operation, AgentOperation, Currency) {
      var me = this;
      var lender = 'lender';
      me.counterAgents = [];
      me.radioModel = lender;
      var agentId = $stateParams.agent;

      me.init = function () {
        me.operationsPromise = Operation.query();
        me.agentOperationsPromise = AgentOperation.query({agent: agentId});
        me.counterAgentsPromise = CounterAgent.query({agent: agentId});
        me.currenciesPromise = Currency.query();

        if (me.counterAgentsPromise.hasOwnProperty('$promise')) {
          me.counterAgentsPromise.$promise.then(function (res) {
            res = _.filter(res, function (i) {
              return i.id !== agentId;
            });
            me.counterAgents = res;
          });
        } else {
          me.counterAgents = me.counterAgentsPromise;
        }

        if (me.currenciesPromise.hasOwnProperty('$promise')) {
          me.currenciesPromise.$promise.then(function (res) {
            me.currencies = res;
            me.currency = res[0];
          });
        } else {
          me.currencies = me.currenciesPromise;
          me.currency = me.currenciesPromise[0];
        }

        if (me.operationsPromise.hasOwnProperty('$promise')) {
          me.operationsPromise.$promise.then(function (res) {
            me.operations = res;
          });
        } else {
          me.operations = me.operationsPromise;
        }

        if (me.agentOperationsPromise.hasOwnProperty('$promise')) {
          me.agentOperationsPromise.$promise.then(function (res) {
            me.agentOperations = res;
          });
        } else {
          me.agentOperations = me.agentOperationsPromise;
        }
      };

      me.saveOperation = function () {
        var operation = {
          id: uuid.v4(),
          sumTotal: me.sumTotal,
          currency: me.currency,
          remindDuration: Date.now() + 24*60*60*1000
        };
        if (me.radioModel === lender) {
          operation.lender = agentId;
          operation.debtor = me.chosenContact.id;
        } else {
          operation.lender = me.chosenContact.id;
          operation.debtor = agentId;
        }

        Operation.save(operation).$promise.then(function (res) {
          alert('Операция сохранена');
          me.showOperationCreateForm = false;
          me.operations.push(res);
        }, function () {
          alert('Неудача');
        });
      };

      me.createOperation = function (counterAgent) {
        me.showOperationCreateForm = true;
        me.chosenContact = counterAgent;
      };

      me.init();
    }]
  )
;
