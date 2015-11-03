'use strict';

angular.module('debtApp')
  .controller('SignupCtrl', ['$http', '$state', '$mdToast', 'authDomain',
    function ($http, $state, $mdToast, authDomain) {
      var me = this;
      me.code = false;

      me.sendPhoneNumber = function () {

        $http.post(authDomain + 'api/pha/auth/' + me.phoneNumber)
          .then(function (res) {
            if (res.data.accountId) {
              //put access token to local storage?
              me.accessToken = me.code;
              $state.go('authorized', res);
            }
            me.code = res.data.code;
          }, function () {
            $mdToast.show($mdToast.simple().content('Неправильный телефон'));
            //show message when max attempts exceeded
          });
      };

      me.confirmSmsCode = function () {
        var data = {
          phoneNumber: me.phoneNumber,
          smsCode: me.smsCode,
          code: me.code
        };
        $http.post(authDomain + '/api/pha/token', data)
          .then(function (res) {
            $state.go('authorized', res);
          }, function (err) {
            if (err.status === 400) {
              $mdToast.show($mdToast.simple().content('Неправильный телефон'));
              //show how many retries left
            } else {
              me.code = false;
            }
          })
      };
    }]);
