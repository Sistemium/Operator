'use strict';

angular.module('debtApp')
  .controller('LoginCtrl', function ($state, Auth) {
    var me = this;

    angular.extend(me, {
      submit: function () {
        if (me.token) {
          Auth.login(me.token)
            .then( function() {
              // Logged in, redirect to home
              $state.go('main');
            }, function () {
              alert('Не ')
            })
            .catch( function(err) {
              $scope.errors.other = err.message;
            });
        }
      }
    });
  });
