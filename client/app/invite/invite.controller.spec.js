'use strict';

describe('Controller: InviteCtrl', function () {

  //TODO try to test ctrl
  // load the controller's module
  beforeEach(module('debtApp'));
  beforeEach(module('socketMock'));

  var InviteCtrl, scope, stateParams, invite, socket, $httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_$httpBackend_, $controller, $rootScope, $injector) {
    $httpBackend = _$httpBackend_;
    scope = $rootScope.$new();

    InviteCtrl = $controller('InviteCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
