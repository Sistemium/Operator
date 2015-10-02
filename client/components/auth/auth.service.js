'use strict';

angular.module('debtApp')
  .factory('Auth', ['$cookieStore', '$resource', function ($cookieStore, $resource) {
    var currentUser = {};
    currentUser = $resource('/api/auth', {}, {
      get: {
        method: 'GET'
      }
    }).get();

    return {
      isLoggedInAsync: function(cb) {
        if(currentUser.hasOwnProperty('$promise')) {
          currentUser.$promise.then(function(res) {
            console.log(res);
            cb(true);
          }).catch(function() {
            cb(false);
          });
        } else if(currentUser.hasOwnProperty('role')) {
          cb(true);
        } else {
          cb(false);
        }
      }
    };
  }]);
