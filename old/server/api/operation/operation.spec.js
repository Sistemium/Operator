'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var sinon = require('sinon');
var Agent = require('../agent/agent.model.js');
var Operation = require('./operation.model.js').dynamoose;
var Account = require('../account/account.model.js');
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
    agentGetStub.withArgs(operation.lender).yieldsAsync(null, agents[1]);
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

describe('PUT /api/operations/:id', function () {
  var operationGetStub
    , agentGetStub
    , operationUpdateStub
    , accountScanStub
    , accountCreateStub
    , accountUpdateStub;
  beforeEach(function () {
    operationGetStub = sinon.stub(Operation, 'get');
    agentGetStub = sinon.stub(Agent, 'get');
    operationUpdateStub  = sinon.stub(Operation, 'update');
    accountScanStub = sinon.stub(Account, 'scan');
    accountCreateStub = sinon.stub(Account, 'create');
    accountUpdateStub = sinon.stub(Account, 'update');
    requestStub = sinon.stub(req, 'get').yieldsAsync(null, {statusCode: 200}, {id: authId});
  });

  afterEach(function () {
    operationGetStub.restore();
    agentGetStub.restore();
    operationUpdateStub.restore();
    accountCreateStub.restore();
    accountScanStub.restore();
    accountUpdateStub.restore();
    requestStub.restore();
  });

  it('should update operation', function (done) {
    var operation = {
      id: uuid.v4(),
      total: 1,
      debtor: agents[0].id,
      lender: agents[1].id,
      debtorConfirmedAt: Date.now()
    };
    agentGetStub.withArgs(operation.debtor).yieldsAsync(null, agents[0]);
    agentGetStub.withArgs(operation.lender).yieldsAsync(null, agents[1]);
    operationGetStub.withArgs(operation.id).yieldsAsync(null, operation);
    operationUpdateStub.withArgs({id: operation.id}).yieldsAsync(null);
    request(app)
      .put('/api/operations/' + operation.id)
      .set(headers)
      .send(operation)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (err) {
        if (err) return done(err);
        agentGetStub.calledTwice.should.be.equal(true);
        operationGetStub.calledOnce.should.be.equal(true);
        operationUpdateStub.calledOnce.should.be.equal(true);
        agentGetStub.calledAfter(operationGetStub);
        operationUpdateStub.calledAfter(agentGetStub);
        done();
      });
  });

  it('should create accounts if not already created on confirmed operation', function (done) {
    var operation = {
      id: uuid.v4(),
      debtor: agents[0].id,
      lender: agents[1].id,
      currency: uuid.v4(),
      total: 1,
      debtorConfirmedAt: Date.now(),
      lenderConfirmedAt: Date.now()
    };

    agentGetStub.withArgs(operation.debtor).yieldsAsync(null, agents[0]);
    agentGetStub.withArgs(operation.lender).yieldsAsync(null, agents[1]);
    operationGetStub.withArgs(operation.id).yieldsAsync(null, operation);
    operationUpdateStub.withArgs({id: operation.id}).yieldsAsync(null);
    accountScanStub.withArgs({
      agent: operation.debtor,
      currency: operation.currency,
      isDeleted: false
    }).yieldsAsync(null, []);
    accountCreateStub.yieldsAsync(null);
    accountScanStub.withArgs({
      agent: operation.lender,
      currency: operation.currency,
      isDeleted: false
    }).yieldsAsync(null, []);


    request(app)
      .put('/api/operations/' + operation.id)
      .set(headers)
      .send(operation)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (err) {
        if (err) return done(err);
        agentGetStub.calledTwice.should.be.equal(true);
        operationGetStub.calledOnce.should.be.equal(true);
        operationUpdateStub.calledOnce.should.be.equal(true);
        accountScanStub.calledTwice.should.be.equal(true);
        accountCreateStub.calledTwice.should.be.equal(true);
        agentGetStub.calledAfter(operationGetStub);
        operationUpdateStub.calledAfter(agentGetStub);
        accountScanStub.calledAfter(operationUpdateStub);
        done();
      });
  });

  it('should update account if already created on confirmed operation', function (done) {
    var operation = {
      id: uuid.v4(),
      debtor: agents[0].id,
      lender: agents[1].id,
      currency: uuid.v4(),
      total: 1,
      debtorConfirmedAt: Date.now(),
      lenderConfirmedAt: Date.now()
    };

    agentGetStub.withArgs(operation.debtor).yieldsAsync(null, agents[0]);
    agentGetStub.withArgs(operation.lender).yieldsAsync(null, agents[1]);
    operationGetStub.withArgs(operation.id).yieldsAsync(null, operation);
    operationUpdateStub.withArgs({id: operation.id}).yieldsAsync(null);
    accountScanStub.withArgs({
      agent: operation.debtor,
      currency: operation.currency,
      isDeleted: false
    }).yieldsAsync(null, [{}]);
    accountUpdateStub.yieldsAsync(null);
    accountScanStub.withArgs({
      agent: operation.lender,
      currency: operation.currency,
      isDeleted: false
    }).yieldsAsync(null, [{}]);

    request(app)
      .put('/api/operations/' + operation.id)
      .set(headers)
      .send(operation)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (err) {
        if (err) return done(err);
        agentGetStub.calledTwice.should.be.equal(true);
        operationGetStub.calledOnce.should.be.equal(true);
        operationUpdateStub.calledOnce.should.be.equal(true);
        accountScanStub.calledTwice.should.be.equal(true);
        accountUpdateStub.calledTwice.should.be.equal(true);
        agentGetStub.calledAfter(operationGetStub);
        operationUpdateStub.calledAfter(agentGetStub);
        accountScanStub.calledAfter(operationUpdateStub);
        done();
      });
  });
});

var agent = uuid.v4();
var agentOperationsUrl = '/api/operations/agentOperations/' + agent;
describe('GET ' + agentOperationsUrl, function () {
  var operationScanStub;
  beforeEach(function () {
    operationScanStub = sinon.stub(Operation, 'scan');
  });
  afterEach(function () {
    operationScanStub.restore();
  });

  it('should get agent operations', function (done) {

    request(app)
      .get(agentOperationsUrl)
      .set(headers)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (err) {
        if (err) return done(err);
        done();
      });
  });
});
