'use strict';

describe('Controller: OperationCtrl', function () {

  // load the controller's module
  beforeEach(module('debtApp'));

  var OperationCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    OperationCtrl = $controller('OperationCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
