'use strict';

(function () {
  angular.module('debtApp')
    .controller('AgentCtrl', ['$scope', '$state', 'Agent', 'socket',
      function ($scope, $state, Agent, socket) {
        var me = this;
        me.agents = [];
        me.showSpinner = false;
        me.agentsPromise = Agent.findAll();

        angular.extend(me, {
          getData: function () {
            me.agentsPromise.then(function (res) {
              me.agents = res;
              me.showSpinner = false;
            }, function (err) {
              console.log(err);
            });
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
            me.showSpinner = true;
            me.getData();
          }
        });

        me.refresh();
      }]
    )
  ;
})();
