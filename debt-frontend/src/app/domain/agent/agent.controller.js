(function () {
  'use strict';
  angular.module('frontend.domain')
    .controller('AgentCtrl', [
        '$scope', '$state', 'uuid4',
        'MessageService',
        'ListConfig', 'AgentModel',
        '_items',
        function ($scope, $state, uuid4, MessageService, ListConfig, AgentModel, _items) {
          var me = this;

          // Set current scope reference to model
          AgentModel.setScope($scope, false, 'items', 'itemCount');

          // Set initial data
          me.items = _items;

          angular.extend(me, {
            save: function (form) {
              if (me.name) {
                AgentModel
                  .create(angular.copy({
                    id: uuid4.generate(),
                    name: me.name,
                    authId: 'pass user authId'
                  }))
                  .then(function () {
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
              $state.go('domain.account', {agent: id});
            },

            goToInvites: function (id) {
              $state.go('domain.invite', {agent: id});
            },

            goToOperations: function (id) {
              $state.go('domain.operation', {agent: id});
            }
          });
        }
      ]
    );
})();
