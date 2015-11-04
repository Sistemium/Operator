'use strict';

angular.module('debtApp')
  .controller('SignupCtrl', ['$http', '$state', '$scope', '$mdToast', 'authDomain', 'Auth',
    function ($http, $state, $scope, $mdToast, authDomain, Auth) {
      var me = this;
      me.code = false;

      //TODO: add toasts on page
      function redirectToMain() {
        $state.go('main');
        $mdToast.show($mdToast.simple().content('Удачно подключились'));
      }

      function login(code) {
        Auth.login(code)
          .then(function () {
            redirectToMain();
          }, function () {

          })
          .catch(function (err) {
            $scope.errors.other = err.message;
          });
      }

      me.sendPhoneNumber = function () {

        $http.post(authDomain + 'api/pha/auth/' + me.phoneNumber)
          .then(function (res) {
            if (res.data.accountId) {
              //put access token to local storage?
              login(res.data.code);
            } else {
              me.code = res.data.code;
            }
          }, function () {
            var toast = $mdToast.simple()
              .content('Что то пошло не так')
              .parent(angular.element(document.getElementById('toast-container')))
              .position('top');
            $mdToast.show(toast);
            //show message when max attempts exceeded
          })
          .catch(function (err) {
            alert(err);
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
            login(res.code);
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
