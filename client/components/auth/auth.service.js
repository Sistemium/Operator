'use strict';

angular.module('debtApp')

  .factory('Auth', ['$cookieStore', '$http', '$q', function ($cookieStore, $http, $q) {
    var currentUser = {};
    //TODO remove this hack when authorization will work properly
    $cookieStore.put('token', 'bb9a72e07b7ea5850278ef4782cc8312658aa1b2');
    if ($cookieStore.get('token')) {
      currentUser = $http({
        method: 'GET',
        url: '/api/auth?token=' + $cookieStore.get('token')
      });
    }

    return {
      login: function (token, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();

        $http.post('/api/auth', {
          token: token
        }).success(function (data) {
            $cookieStore.put('token', data.token);
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
        $cookieStore.remove('token');
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
        return $cookieStore.get('token');
      },

      getCurrentUser: function () {
        return currentUser;
      },

      isLoggedIn: function () {
        return currentUser.hasOwnProperty('body') || currentUser.hasOwnProperty('phoneNumber');
      }
    };
  }]);
