'use strict';

angular.module('debtApp')
  .controller('OperationCtrl', ['$stateParams', 'CounterAgent', 'Account', 'Operation', 'AgentOperation', 'Currency',
    function ($stateParams, CounterAgent, Account, Operation, AgentOperation, Currency) {
      var me = this;
      var lender = 'lender';
      me.counterAgents = [];
      me.operations = [];
      me.agentOperations = [];
      me.currencies = [];

      me.radioModel = lender;
      var agentId = $stateParams.agent;

      me.init = function () {
        me.operationsPromise = Operation.query();
        me.agentOperationsPromise = AgentOperation.query({agent: agentId});
        me.counterAgentsPromise = CounterAgent.query({agent: agentId});
        me.currenciesPromise = Currency.query();

        function getData(promise, promiseCb, cb) {
          if (promise.hasOwnProperty('$promise')) {
            promise.$promise.then(function (res) {
              if (promiseCb) {
                promiseCb(res);
              }
            });
          } else {
            cb(promise);
          }
        }

        getData(me.counterAgentsPromise, function (res) {
          res = _.filter(res, function (i) {
            return i.id !== agentId;
          });
          me.counterAgents = res;
        }, function (res) {
          me.counterAgents = res;
        });
        getData(me.currenciesPromise, function (res) {
          me.currencies = res;
          me.currency = res[0];
        }, function (res) {
          me.currencies = res;
          me.currency = res[0];
        });

        function processOperations (res) {
          me.operations = res;
          me.operations.waitingForConfirm = _.filter(me.operations, {'state': 'waitingForConfirm'});
        }

        getData(me.operationsPromise, processOperations, processOperations);

        function processAgentOperations (res) {
          me.agentOperations = res;
          me.agentOperations.agentConfirmed = _.filter(me.agentOperations, function (operation) {
            return (operation.lenderConfirmedAt && operation.lender === agentId && operation.state === 'waitingForConfirm')
              || (operation.debtorConfirmedAt && operation.debtor === agentId && operation.state === 'waitingForConfirm');
          });
          var withoutAgentConfirmed = _.difference(me.agentOperations, me.agentOperations.agentConfirmed);
          me.agentOperations.waitingForConfirm = _.filter(withoutAgentConfirmed, {'state': 'waitingForConfirm'});
        }

        getData(me.agentOperationsPromise, processAgentOperations, processAgentOperations);
      };

      me.saveOperation = function () {
        var operation = {
          id: uuid.v4(),
          sumTotal: me.sumTotal,
          currency: me.currency,
          remindDuration: Date.now() + 24 * 60 * 60 * 1000
        };
        if (me.radioModel === lender) {
          operation.lenderConfirmedAt = Date.now();
          operation.lender = agentId;
          operation.debtor = me.chosenContact.id;
        } else {
          operation.debtorConfirmedAt = Date.now();
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
