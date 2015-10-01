'use strict';

angular.module('operationApp')
  .controller('MainCtrl', function ($scope, $http, socket) {
    $scope.awesomeThings = [];

    $http.get('/api/agents').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
      socket.syncUpdates('thing', $scope.awesomeThings);
    });

    var i = 1;
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

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('thing');
    });
  });
