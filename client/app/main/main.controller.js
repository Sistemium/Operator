'use strict';

angular.module('operationApp')
  .controller('MainCtrl', function ($scope, $http) {
    $scope.awesomeThings = [];

    $http.get('/api/agents').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
    });

    $scope.addThing = function() {
      if($scope.newThing === '') {
        return;
      }
      $http.post('/api/agents', { name: $scope.newThing});
      $scope.newThing = '';
    };

    $scope.deleteThing = function(thing) {
      $http.delete('/api/agents/' + thing.id);
    };
  });
