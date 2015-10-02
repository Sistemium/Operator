'use strict';

angular.module('debtApp')
  .controller('AgentCtrl', function ($state, Auth) {
    var me = this;

    angular.extend(me, {
      deleteTokenFromCookie: function () {
        Auth.logout();
        $state.go('main');
      }
    })
  });
