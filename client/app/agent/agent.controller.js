'use strict';

angular.module('debtApp')
  .factory('Agent', function ($resource) {
    return $resource('/api/agents');
  })
  .controller('AgentCtrl', function ($state, Agent) {
    var me = this;
    me.agents = [];
    var agentsPromise = Agent.query();

    angular.extend(me, {
      getData: function () {
        if (agentsPromise.hasOwnProperty('$promise')) {
          agentsPromise.$promise.then(function (res) {
            me.agents = res;
          })
        } else {
          me.agents = agentsPromise;
        }
      },

      save: function (form) {
        if (me.name) {
          var newAgent = new Agent({
            name: me.name
          });

          newAgent.$save(function (u) {
            me.agents.push(u);
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
        $state.go('account', {agentId: id});
      },

      goToInvites: function (id) {
        $state.go('invite', {agentId: id});
      },

      refresh: function () {
        me.getData();
      }
    });

    me.refresh();
  });
