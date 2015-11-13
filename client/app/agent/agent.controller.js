'use strict';

angular.module('debtApp')
  .controller('AgentCtrl', ['$scope', '$state', 'Agent', 'socket',
    function ($scope, $state, Agent, socket) {
      var me = this;
      me.agents = [];
      var agentsPromise = Agent.query();

      angular.extend(me, {
        getData: function () {
          if (agentsPromise.hasOwnProperty('$promise')) {
            agentsPromise.$promise.then(function (res) {
              me.agents = res;
              socket.syncUpdates('agent', me.agents);
            })
          } else {
            me.agents = agentsPromise;
          }
        },

        save: function (form) {
          if (me.name) {
            var newAgent = new Agent({
              name: me.name,
              id: uuid.v4()
            });

            newAgent.$save(function () {
              me.name = '';
              form.$setPristine();
            });
          }
        },

        cancel: function (form) {
          me.name = '';
          form.$setPristine();
        },

        goToAccounts: function (id) {
          $state.go('account', {agent: id});
        },

        goToInvites: function (id) {
          $state.go('invite', {agent: id});
        },

        goToOperations: function (id) {
          $state.go('operation', {agent: id});
        },

        refresh: function () {
          me.getData();
        }
      });

      me.refresh();

      $scope.$on('$destroy', function () {
        socket.unsyncUpdates('agent');
      })
    }]
  )
;
