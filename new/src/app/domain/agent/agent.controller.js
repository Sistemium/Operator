'use strict';

(function () {
  angular.module('frontend.domain')
    .controller('AgentCtrl', [function () {}
    //  '$rootScope', '$scope', '$state', 'toastr', 'gettextCatalog',
    //  function ($rootScope, $scope, $state, toastr, gettextCatalog) {
    //    var me = this;
    //    me.agents = [];
    //    me.showSpinner = false;
    //    me.agentsPromise = Agent.findAll();
    //
    //    angular.extend(me, {
    //      getData: function () {
    //        me.agentsPromise.then(function (res) {
    //          me.agents = res;
    //          me.showSpinner = false;
    //        }, function (err) {
    //          console.log(err);
    //        });
    //      },
    //
    //      save: function (form) {
    //        if (me.name) {
    //          Agent.create({
    //            name: me.name
    //          }).then(function () {
    //            me.name = '';
    //            form.$setPristine();
    //          });
    //        }
    //      },
    //
    //      cancel: function (form) {
    //        me.name = '';
    //        form.$setPristine();
    //      },
    //
    //      goToAccounts: function (id) {
    //        $state.go('account', {agent: id});
    //      },
    //
    //      goToInvites: function (id) {
    //        $state.go('invite', {agent: id});
    //      },
    //
    //      goToOperations: function (id) {
    //        $state.go('operation', {agent: id});
    //      },
    //
    //      refresh: function () {
    //        me.showSpinner = true;
    //        me.getData();
    //      }
    //    });
    //
    //    me.refresh();
    //
    //    $rootScope.$on('agent:save', function (event, data) {
    //      event.preventDefault();
    //      if (!(_.find(me.agents, {id: data.id}))) {
    //        me.agents.push(data);
    //        toastr.success(gettextCatalog.getString("Agent was created"));
    //      }
    //    });
    //  }
    ]
    );
})();
