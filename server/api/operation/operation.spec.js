'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var sinon = require('sinon');
var Agent = require('../agent/agent.model');
var Operation = require('./operation.model');
var uuid = require('node-uuid');
var _ = require('lodash');
var req = require('request');
var headers = {
  'Authorization': 'token'
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
    debtor: agents[0].id,
    lender: agents[1].id
  },
  {
    id: uuid.v4(),
    debtor: agents[1].id,
    lender: agents[0].id
  }
];
var requestStub;

describe('GET /api/operations', function () {

  var agentScanStub, operationScanStub;
  beforeEach(function () {
    agentScanStub = sinon.stub(Agent, 'scan');
    operationScanStub = sinon.stub(Operation, 'scan');
    requestStub = sinon.stub(req, 'get').yieldsAsync(null, {statusCode: 200}, {id: authId});
  });

  afterEach(function () {
    agentScanStub.restore();
    operationScanStub.restore();
    requestStub.restore();
  });

  it('should respond with JSON array', function (done) {

    agentScanStub.withArgs({authId: authId}).yieldsAsync(null, agents);
    operationScanStub.withArgs({or: [
      {'isDeleted': {eq: false}, 'debtor': {'in': _.pluck(agents, 'id')}},
      {'lender': {'in': _.pluck(agents, 'id')}}
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
    requestStub = sinon.stub(req, 'get').yieldsAsync(null, {statusCode: 200}, {id: authId});
  });

  afterEach(function () {
    agentGetStub.restore();
    agentScanStub.restore();
    operationCreateStub.restore();
    requestStub.restore();
  });

  it('should create new operation', function (done) {

    var operation = {
      id: uuid.v4(),
      debtor: agents[0].id,
      lender: agents[1].id
    };

    agentGetStub.withArgs(operation.debtor).yieldsAsync(null, agents[0]);
    agentScanStub.withArgs({authId: authId}).yieldsAsync(null, agents);
    operationCreateStub.yieldsAsync(null, operation);

    request(app)
      .post(url)
      .set(headers)
      .send(operation)
      .expect(201)
      .expect('Content-Type', /json/)
      .end(function (err) {
        if (err) return done(err);
        agentGetStub.calledTwice.should.be.equal(true);
        operationCreateStub.calledOnce.should.be.equal(true);
        done();
      });
  });
});
