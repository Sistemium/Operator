'use strict';

angular.module('debtApp')

  .factory('Auth', ['$http', '$q', 'localStorageService', function ($http, $q, localStorageService) {
    var currentUser = {};
    //TODO remove this hack when authorization will work properly
    localStorageService.set('token', 'bb9a72e07b7ea5850278ef4782cc8312658aa1b2');
    if (localStorageService.get('token')) {
      currentUser = $http({
        method: 'GET',
        url: '/api/auth',
        headers: {
          authorization: localStorageService.get('token')
        }
      });
    }

    return {
      login: function (token, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();

        $http.post('/api/auth').success(function (data) {
            localStorageService.set('token', data.token);
            currentUser = data.body;
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
        if (!currentUser.hasOwnProperty('token')) {
          currentUser.success(function (data) {
            currentUser = data;
            cb(true);
          }).catch(function () {
            cb(false);
          });
          // property of current user
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
