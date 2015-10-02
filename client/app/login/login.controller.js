'use strict';

angular.module('debtApp')
  .controller('LoginCtrl', function ($cookieStore, $state) {
    var me = this;

    angular.extend(me, {
      submit: function () {
        if (me.token) {
          $cookieStore.put('token', me.token);
          $state.go('agent');
        }
      }
    });
  });
