'use strict';

angular.module('debtApp')
  .controller('OperationCtrl', ['$stateParams', 'CounterAgent', 'Account', 'Operation', 'Currency',
    function ($stateParams, CounterAgent, Account, Operation, Currency) {
      var me = this;
      me.counterAgents = [];
      var agentId = $stateParams.agent;

      me.init = function () {
        me.operationsPromise = Operation.query();
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
      };

      me.saveOperation = function () {
        var operation = {
          id: uuid.v4(),
          sumTotal: me.sumTotal,
          currency: me.currency,
          initiator: agentId,
          executor: me.chosenContact.id,
          remindDuration: Date.now() + 24*60*60*1000
        };

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
