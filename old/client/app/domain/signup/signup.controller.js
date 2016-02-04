'use strict';

(function () {
  angular.module('frontend.domain')
    .controller('SignupCtrl', [ function () {}
      //'$http', '$location', '$scope', '$mdToast',
      //function ($http, $location, $scope, $mdToast) {
      //  var me = this;
      //  me.code = false;
      //
      //  //TODO: add toasts on page
      //  function redirectToMain() {
      //    $location.path('/');
      //    $mdToast.show(createToast('Удачно подключились'));
      //  }
      //
      //  function login(code) {
      //    Auth.login(code)
      //      .then(function () {
      //        redirectToMain();
      //      }, function () {
      //
      //      })
      //      .catch(function (err) {
      //        $scope.errors.other = err.message;
      //      });
      //  }
      //
      //  function createToast(message, el, position) {
      //    //noinspection JSValidateTypes
      //    return $mdToast.simple()
      //      .content(message)
      //      .parent(el || null)
      //      .position(position || 'bottom');
      //  }
      //
      //  me.sendPhoneNumber = function () {
      //
      //    $http.post(authDomain + 'api/pha/auth/' + me.phoneNumber)
      //      .then(function (res) {
      //        if (res.data.accountId) {
      //          //put access token to local storage?
      //          login(res.data.code);
      //        } else {
      //          me.code = res.data.code;
      //        }
      //      }, function () {
      //        $mdToast.show(createToast('Неправильный телефон'));
      //        //show message when max attempts exceeded
      //      })
      //      .catch(function (err) {
      //        alert(err);
      //      });
      //  };
      //
      //  me.confirmSmsCode = function () {
      //    var data = {
      //      phoneNumber: me.phoneNumber,
      //      smsCode: me.smsCode,
      //      code: me.code
      //    };
      //    $http.post(authDomain + 'api/pha/token', data)
      //      .then(function (res) {
      //        login(res.data.code);
      //      }, function (err) {
      //        if (err.status === 400) {
      //          $mdToast.show(createToast('Неправильный телефон'));
      //          //show how many retries left
      //        } else {
      //          me.code = false;
      //        }
      //      })
      //  };
      //}
    ]
    );
})();
