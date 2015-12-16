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
        'gettextCatalog',
        'NgTableOptions',
        function ($rootScope
          , $scope
          , $stateParams
          , CounterAgent
          , Operation
          , AgentOperation
          , Currency
          , toastr
          , gettextCatalog
          , NgTableOptions) {

          var me = this;
          var lender = 'lender';
          me.showSpinner = false;

          me.radioModel = lender;
          var agentId = $stateParams.agent;

          function filterAgentOperations (o) {
            me.agentConfirmedOperations = _.filter(o, function (operation) {
              return operation.lenderConfirmedAt && operation.lender === agentId && operation.state === 'waitingForConfirm'
                || operation.debtorConfirmedAt && operation.debtor === agentId && operation.state === 'waitingForConfirm';
            });
            me.agentConfirmedOperationsTableParams = NgTableOptions.setTable(me, me.agentConfirmedOperations);
            var withoutAgentConfirmed = _.difference(o, me.agentConfirmedOperations);
            me.waitingForConfirm = _.filter(withoutAgentConfirmed, {'state': 'waitingForConfirm'});
            me.waitingForConfirmTableParams = NgTableOptions.setTable(me, me.waitingForConfirm);
            me.completedOperations = _.filter(o, {state: 'confirmed'});
            me.completedOperationsTableParams = NgTableOptions.setTable(me, me.completedOperations);
          }

          me.refresh = function () {
            me.agentOperationsPromise = AgentOperation.find(agentId);
            me.counterAgentsPromise = CounterAgent.find(agentId, {bypassCache: true});
            var reqCount = 0;
            function getData(promise, promiseCb) {
              reqCount++;
              me.showSpinner = true;
              promise.then(function (res) {
                if (promiseCb) {
                  promiseCb(res);
                  reqCount--;
                  if (reqCount === 0) {
                    me.showSpinner = false;
                  }
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
            }

            getData(me.agentOperationsPromise, processAgentOperations);
          };

          me.saveOperation = function () {
            me.showSpiner = true;
            var operation = {
              total: me.total,
              currency: me.currency.id,
              comment: me.comment,
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
              me.showOperationCreateForm = false;
              me.showSpiner = false;
            }, function () {
              toastr.error(gettextCatalog.getString("Failed on saving operation"));
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

            Operation.update(operation.id, operation).then(function () {}, function () {
              toastr.error(gettextCatalog.getString("Operation confirmation failed"));
            });
          };

          me.refresh();

          $rootScope.$on('operation:save', function (event, data) {
            event.preventDefault();

            if (data.lender === agentId || data.debtor === agentId) {
              var isForUpdate = _.find(me.agentOperations, {id: data.id});
              !isForUpdate ? me.agentOperations.push(data) : _.merge(isForUpdate, data);
              filterAgentOperations(me.agentOperations);
              toastr.success(gettextCatalog.getString("Operation saved"));
            }
          });

          $rootScope.$on('contact:save', function (event, contacts) {
            event.preventDefault();

            console.log(contacts);
          });
        }]
    )
  ;
})();
