//'use strict';
//
//(function () {
//  describe('Controller: InviteCtrl', function () {
//
//    //TODO try to test ctrl
//    // load the controller's module
//    beforeEach(module('frontend.domain'));
//    beforeEach(module('socketMock'));
//
//    var InviteCtrl, scope, invite, socket, $httpBackend;
//    var agentId = 'agentId';
//
//    // Initialize the controller and a mock scope
//    beforeEach(inject(function (_$httpBackend_, $controller, $rootScope) {
//      $httpBackend = _$httpBackend_;
//      $httpBackend.expectGET('/api/invites/agentInvites/' + agentId)
//        .respond([
//          {
//            acceptor: agentId
//          },
//          {
//            acceptor: 'not agent id'
//          }
//        ]);
//      $httpBackend.whenGET('app/main/main.html').respond('hello world');
//      scope = $rootScope.$new();
//
//      InviteCtrl = $controller('InviteCtrl', {
//        $scope: scope,
//        $stateParams: {
//          agent: agentId
//        }
//      });
//    }));
//
//    afterEach(function () {
//      $httpBackend.verifyNoOutstandingExpectation();
//      $httpBackend.verifyNoOutstandingRequest();
//    });
//
//    it('should set agent invites and accepted invites', function () {
//      $httpBackend.flush();
//      expect(InviteCtrl.agentInvites.length).toBe(2);
//      expect(InviteCtrl.acceptedInvites.length).toBe(1);
//    });
//
//    it('should send invite', function () {
//      $httpBackend.whenPOST('/api/invites', function (invite) {
//        invite = JSON.parse(invite);
//        expect(invite.owner).toBe(agentId);
//        expect(invite.id).not.toBeNull();
//        return true;
//      }).respond({code: 1234});
//      InviteCtrl.sendInvite();
//      $httpBackend.flush();
//      expect(InviteCtrl.inviteCode).toBe(1234);
//    });
//
//    it('should get invite by code', function () {
//      InviteCtrl.inviteCode = 1234;
//      $httpBackend.whenGET('/api/invites?code=' + InviteCtrl.inviteCode)
//        .respond({});
//      InviteCtrl.getInviteByCode();
//      $httpBackend.flush();
//      expect(InviteCtrl.invite).toBeTruthy();
//      expect(InviteCtrl.showInvite).toBe(true);
//    });
//  });
//})();
