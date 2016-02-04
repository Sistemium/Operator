//'use strict';
//
//(function () {
//  describe('Controller: OperationCtrl', function () {
//
//
//    // load the controller's module
//    beforeEach(module('frontend.domain'));
//    beforeEach(module('socketMock'));
//
//    var $controller, $httpBackend, scope;
//    var agentId = 'agentId';
//    var currencies = [
//      {
//        id: uuid.v4(),
//        name: '$'
//      },
//      {
//        id: uuid.v4(),
//        name: '€'
//      }
//    ];
//    var counterAgents = [
//      {
//        id: uuid.v4(),
//        name: 'Vasya'
//      },
//      {
//        id: uuid.v4(),
//        name: 'Petya'
//      }
//    ];
//    beforeEach(inject(function (_$rootScope_, _$controller_, _$httpBackend_) {
//      $httpBackend = _$httpBackend_;
//      scope = _$rootScope_.$new();
//      $httpBackend.whenGET('app/main/main.html')
//        .respond('hello world');
//      $httpBackend.expectGET('/api/operations')
//        .respond([
//          {
//            state: 'open'
//          },
//          {
//            state: 'waitingForConfirm'
//          }
//        ]);
//      $httpBackend.expectGET('/api/operations/agentOperations/' + agentId)
//        .respond([
//          {
//            state: 'open'
//          },
//          {
//            state: 'waitingForConfirm'
//          }
//        ]);
//      $httpBackend.expectGET('/api/counterAgents/' + agentId)
//        .respond(counterAgents);
//      $httpBackend.expectGET('/api/currencies')
//        .respond(currencies);
//      $controller = _$controller_('OperationCtrl', {
//        $scope: scope,
//        $stateParams: {
//          agent: agentId
//        }
//      });
//
//    }));
//
//    afterEach(function () {
//      $httpBackend.verifyNoOutstandingExpectation();
//      $httpBackend.verifyNoOutstandingRequest();
//    });
//
//    it('should set initial values', function () {
//      var me = $controller;
//      expect(me.counterAgents.length).toEqual(0);
//      expect(me.operations).toEqual([]);
//      expect(me.agentOperations).toEqual([]);
//      expect(me.currencies).toEqual([]);
//      expect(me.radioModel).toEqual('lender');
//      $httpBackend.flush();
//    });
//
//    it('should set values after response', function () {
//      var me = $controller;
//      $httpBackend.flush();
//      expect(me.counterAgents.length).toBe(2);
//      expect(me.currencies.length).toBe(2);
//      expect(me.currency.name).toBe(currencies[0].name);
//      expect(me.operations.length).toBe(2);
//      expect(me.operations.waitingForConfirm.length).toBe(1);
//      expect(me.agentOperations.length).toBe(2);
//      expect(me.agentOperations.waitingForConfirm.length).toBe(1);
//    });
//
//    it('should save operation as a lender', function () {
//      var me = $controller;
//      $httpBackend.flush();
//      expect(me.radioModel).toBe('lender');
//      $httpBackend.expectPOST('/api/operations', function (operation) {
//        operation = JSON.parse(operation);
//        expect(operation.lenderConfirmedAt).toBeDefined();
//        expect(operation.lender).toBe(agentId);
//        expect(operation.debtor).toBe(me.chosenContact.id);
//        return true;
//      }).respond();
//      me.createOperation(counterAgents[0]);
//      expect(me.showOperationCreateForm).toBe(true);
//      expect(me.chosenContact).toBe(counterAgents[0]);
//      me.saveOperation();
//      $httpBackend.flush();
//    });
//
//    it('should save operation as a debtor', function () {
//      var me = $controller;
//      $httpBackend.flush();
//      $httpBackend.expectPOST('/api/operations', function (operation) {
//        operation = JSON.parse(operation);
//        expect(operation.debtorConfirmedAt).toBeDefined();
//        expect(operation.lenderConfirmedAt).not.toBeDefined();
//        expect(operation.debtor).toBe(agentId);
//        expect(operation.lender).toBe(me.chosenContact.id);
//        return true;
//      }).respond();
//      me.createOperation(counterAgents[1]);
//      expect(me.showOperationCreateForm).toBe(true);
//      expect(me.chosenContact).toBe(counterAgents[1]);
//      me.radioModel = 'debtor';
//      me.saveOperation();
//      $httpBackend.flush();
//    });
//  });
//})();
