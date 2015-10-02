'use strict';

angular.module('debtApp')
  .factory('Agent', function ($resource) {
    return $resource('/api/agents');
  })
  .controller('AgentCtrl', function (Agent) {
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
        var newAgent = new Agent({name: me.name});
        newAgent.$save(function (u) {
          me.name = '';
          form.$setPristine();
        });
      },

      cancel: function (form) {
        me.name = '';
        form.$setPristine();
      },

      refresh: function () {
        me.getData();
      }
    });

    me.refresh();
  });
