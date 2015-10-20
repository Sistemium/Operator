'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var sinon = require('sinon');
var Agent = require('../agent/agent.model');
var Operation = require('./operation.model');
var uuid = require('node-uuid');
var _ = require('lodash');
var headers = {
  'Authorization': 'c6dd52d226a821ac9acd45bd92d7a50d@pha'
};
var authId = 'cbd77f5e-2644-11e5-8000-ffc34d526b60';

var agents = [{
  id: uuid.v4(),
  name: 'test1',
  authId: 'cbd77f5e-2644-11e5-8000-ffc34d526b60'
}, {
  id: uuid.v4(),
  name: 'test2',
  authId: 'cbd77f5e-2644-11e5-8000-ffc34d526b60'
}];

var operations = [
  {
    id: uuid.v4(),
    executor: agents[0].id,
    initiator: agents[1].id
  },
  {
    id: uuid.v4(),
    executor: agents[1].id,
    initiator: agents[0].id
  }
];

describe('GET /api/operations', function () {

  var agentScanStub, operationScanStub;
  beforeEach(function () {
    agentScanStub = sinon.stub(Agent, 'scan');
    operationScanStub = sinon.stub(Operation, 'scan');
  });

  afterEach(function () {
    agentScanStub.restore();
    operationScanStub.restore();
  });

  it('should respond with JSON array', function (done) {

    agentScanStub.withArgs({authId: authId}).yieldsAsync(null, agents);
    operationScanStub.withArgs({or: [
      {isDeleted: false, executor: {'in': _.pluck(agents, 'id')}},
      {isDeleted: false, initiator: {'in': _.pluck(agents, 'id')}}
    ]}).yieldsAsync(null, operations);

    request(app)
      .get('/api/operations')
      .set(headers)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });
});

describe('POST /api/operations', function () {
  var url = '/api/operations';
  var agentGetStub, agentScanStub, operationCreateStub;
  beforeEach(function () {
    agentGetStub = sinon.stub(Agent, 'get');
    operationCreateStub = sinon.stub(Operation, 'create');
    agentScanStub = sinon.stub(Agent, 'scan');
  });

  afterEach(function () {
    agentGetStub.restore();
    agentScanStub.restore();
    operationCreateStub.restore();
  });

  it('should create new operation', function (done) {

    var operation = {
      id: uuid.v4(),
      executor: agents[0].id,
      initiator: agents[1].id
    };

    agentGetStub.withArgs(operation.executor).yieldsAsync(null, agents[0]);
    agentScanStub.withArgs({authId: authId}).yieldsAsync(null, agents);
    operationCreateStub.withArgs(operation).yieldsAsync(null, operation);

    request(app)
      .post(url)
      .set(headers)
      .send(operation)
      .expect(201)
      .expect('Content-Type', /json/)
      .end(function (err) {
        if (err) return done(err);
        agentGetStub.calledOnce.should.be.equal(true);
        agentScanStub.calledOnce.should.be.equal(true);
        operationCreateStub.calledOnce.should.be.equal(true);
        done();
      });
  });
});
