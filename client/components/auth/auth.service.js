'use strict';

angular.module('debtApp')

  .factory('Auth', ['$cookieStore', '$http', '$q', '$resource', function ($cookieStore, $http, $q, $resource) {
    var currentUser = {};
    if ($cookieStore.get('token')) {
      currentUser = $resource('/api/auth?token=' + $cookieStore.get('token')).get();
    }

    return {
      login: function (token, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();

        $http.post('/api/auth', {
          token: token
        }).
          success(function (data) {
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
        if (currentUser.hasOwnProperty('$promise')) {
          currentUser.$promise.then(function () {
            cb(true);
          }).catch(function () {
            cb(false);
          });
          // property of current user
        } else if (currentUser.hasOwnProperty('phoneNumber')) {
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
