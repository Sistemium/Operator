'use strict';

angular.module('debtApp')
  .controller('OperationCtrl', ['$stateParams', 'CounterAgent', 'Account', 'Operation',
    function ($stateParams, CounterAgent, Account, Operation) {
      var me = this;
      me.counterAgents = [];
      var agentId = $stateParams.agent;

      me.init = function () {
        me.counterAgentsPromise = CounterAgent.query({agent: agentId});

        if (me.counterAgentsPromise.hasOwnProperty('$promise')) {
          me.counterAgentsPromise.$promise.then(function (res) {
            res = _.filter(res, function (i) {
              return i.id !== agentId;
            });
            me.counterAgents = res;
          });
        } else {
          me.counterAgents = counterAgentsPromise;
        }
      };

      me.saveOperation = function () {
        var operation = {
          id: uuid.v4(),
          sumTotal: me.sumTotal,
          currency: me.chosenAccount.currency.id,
          initiator: accountId,
          executor: me.chosenAccount.id,
          remindDuration: 'date until'
        };

        Operation.save(operation).$promise.then(function () {
          alert('Операция сохранена');
        }, function () {
          alert('Неудача');
        })
      };

      me.init();
    }]
  )
;
