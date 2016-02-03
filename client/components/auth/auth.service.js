'use strict';

angular.module('debtApp')

  .factory('Auth', ['$http', '$q', 'localStorageService', function ($http, $q, localStorageService) {
    var currentUser = {};
    var token = localStorageService.get('token');
    if (token) {
      currentUser = {
        "author": null,
        "billingName": "sasha",
        "code": 297,
        "email": "alevin.ru@gmail.com",
        "id": "26413a26-eb48-11e4-8000-b841f7915441",
        "info": "info",
        "isDisabled": false,
        "lastAuth": "2016-01-26 11:35:05.984",
        "phoneNumber": "141234234",
        "name": "Alexander Levin UN",
        "org": "un",
        "roles": "roles",
        "salesman": 1,
        "ts": "2016-01-26 11:27:22.697"
      };
      // $http({
      //  method: 'GET',
      //  url: '/api/auth',
      //  headers: {
      //    authorization: token
      //  }
      //});
    }

    return {
      login: function (token, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();

        $http.get('/api/auth', {
          headers: {
            authorization: token
          }
        }).success(function (data) {
          localStorageService.set('token', data.token);
          currentUser = data;
          deferred.resolve(data);
          return cb();
        }).error(function (err) {
          this.logout();
          deferred.reject(err);
          return cb(err);
        }.bind(this));

        return deferred.promise;
      },

      logout: function () {
        localStorageService.remove('token');
        currentUser = {};
      },

      isLoggedInAsync: function (cb) {
        if (currentUser.hasOwnProperty('$$state')) {
          currentUser.then(function (res) {
            currentUser = res.data;
            cb(true);
          }, function () {
            cb(false);
          });
        } else if (currentUser.hasOwnProperty('phoneNumber')) {
          cb(true);
        } else {
          cb(false);
        }
      },

      getToken: function () {
        return localStorageService.get('token');
      },

      getCurrentUser: function () {
        return currentUser;
      },

      isLoggedIn: function () {
        return currentUser.hasOwnProperty('body') || currentUser.hasOwnProperty('phoneNumber');
      }
    };
  }]);
