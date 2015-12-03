'use strict';

(function () {
  angular.module('debtApp')
    .controller('OperationCtrl',
      ['$rootScope',
        '$scope',
        '$stateParams',
        'CounterAgent',
        'Operation',
        'AgentOperation',
        'Currency',
        'toastr',
        function ($rootScope, $scope, $stateParams, CounterAgent, Operation, AgentOperation, Currency, toastr) {
          var me = this;
          var lender = 'lender';
          me.counterAgents = [];
          me.operations = [];
          me.showSpinner = false;
          me.agentOperations = [];
          me.currencies = [];

          me.radioModel = lender;
          var agentId = $stateParams.agent;

          function filterAgentOperations (o) {
            me.agentConfirmedOperations = _.filter(o, function (operation) {
              return operation.lenderConfirmedAt && operation.lender === agentId && operation.state === 'waitingForConfirm'
                || operation.debtorConfirmedAt && operation.debtor === agentId && operation.state === 'waitingForConfirm';
            });
            var withoutAgentConfirmed = _.difference(o, me.agentConfirmedOperations);
            me.waitingForConfirm = _.filter(withoutAgentConfirmed, {'state': 'waitingForConfirm'})
            me.completedOperations = _.filter(o, {state: 'confirmed'});
          }

          me.refresh = function () {
            me.agentOperationsPromise = AgentOperation.find(agentId);
            me.counterAgentsPromise = CounterAgent.find(agentId, {bypassCache: true});
            me.showSpinner = true;
            function getData(promise, promiseCb) {
              promise.then(function (res) {
                if (promiseCb) {
                  promiseCb(res);
                }
              });
            }

            getData(me.counterAgentsPromise, function (res) {
              res = _.filter(res, function (i) {
                return i.id !== agentId;
              });
              me.counterAgents = res;
            });

            Currency.findAll().then(function (res) {
              me.currencies = res;
              me.currency = res[0];
            });

            function processAgentOperations(res) {
              me.agentOperations = res;
              filterAgentOperations(res);
              me.showSpinner = false;
            }

            getData(me.agentOperationsPromise, processAgentOperations);
          };

          me.saveOperation = function () {
            var operation = {
              total: me.total,
              currency: me.currency.id,
              // TODO: take remind duration from UI or from config
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

            Operation.create(operation).then(function () {
              toastr.success('Операция сохранена');
              me.showOperationCreateForm = false;
            }, function () {
              toastr.error('Неудача');
            });
          };

          me.createOperation = function (counterAgent) {
            me.showOperationCreateForm = true;
            me.chosenContact = counterAgent;
          };

          me.confirmOperation = function (operation) {
            if (!operation.lenderConfirmedAt) {
              operation.lenderConfirmedAt = Date.now();
            } else if (!operation.debtorConfirmedAt) {
              operation.debtorConfirmedAt = Date.now();
            }

            Operation.update(operation.id, operation).then(function (res) {
              toastr.success('Операция подтвержденна');
            }, function () {
              toastr.error('Что то пошло не так');
            });
          };

          me.refresh();

          $rootScope.$on('operation', function (event, data) {
            event.preventDefault();

            if (data.lender === agentId || data.debtor === agentId) {
              var isForUpdate = _.find(me.agentOperations, {id: data.id});
              !isForUpdate ? me.agentOperations.push(data) : _.merge(isForUpdate, data);
              filterAgentOperations(me.agentOperations);
              toastr.success('Operation successful');
            }
          });
        }]
    )
  ;
})();
