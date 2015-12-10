'use strict';

angular.module('debtApp')

  .factory('Auth', ['$http', '$q', 'localStorageService', function ($http, $q, localStorageService) {
    var currentUser = {};
    var token = localStorageService.get('token');
    if (token) {
      currentUser = $http({
        method: 'GET',
        url: '/api/auth',
        headers: {
          authorization: token
        }
      });
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
          }).
          error(function (err) {
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
        //TODO: check token expiration
        if (currentUser.hasOwnProperty('$$state')) {
          currentUser.then(function (res) {
            currentUser = res.data;
            cb(true);
          }, function () {
            cb(false);
          });
        } else if (currentUser.hasOwnProperty('token')) {
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
