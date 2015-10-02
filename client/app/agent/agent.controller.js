'use strict';

angular.module('debtApp')
  .controller('AgentCtrl', function ($cookieStore, $state) {
    var me = this;

    angular.extend(me, {
      deleteTokenFromCookie: function () {
        $cookieStore.remove('token');
        $state.go('main');
      }
    })
  });
