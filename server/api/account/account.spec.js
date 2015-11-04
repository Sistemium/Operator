'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var sinon = require('sinon');
var uuid = require('node-uuid');
var Account = require('./account.model');
var Agent = require('../agent/agent.model');
var assert = require('assert');
var _ = require('lodash');
var req = require('request');
var headers = {
  'Authorization': 'authorization'
};
var authId = 'authId';

var agent = {
  id: uuid.v4(),
  name: 'test',
  authId: authId
};
var account = {
  id: uuid.v4(),
  authId: authId,
  currency: uuid.v4(),
  agentId: agent.id
};
var requestStub;

describe('GET /api/accounts', function () {

  var accountScan;
  beforeEach(function () {
    accountScan = sinon.stub(Account, 'scan');
    requestStub = sinon.stub(req, 'get').yieldsAsync(null, {statusCode: 200}, {id: authId});
  });
  afterEach(function () {
    accountScan.restore();
    requestStub.restore();
  });

  it('should respond with accounts array', function (done) {
    accountScan.withArgs({authId: authId, isDeleted: false}).yieldsAsync(null, []);
    request(app)
      .get('/api/accounts')
      .set(headers)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        accountScan.calledOnce.should.be.equal(true);
        done();
      });
  });
});

describe('POST /api/accounts', function () {
  var agentGet, accountCreate;
  beforeEach(function () {
    agentGet = sinon.stub(Agent, 'get');
    accountCreate = sinon.stub(Account, 'create');
    requestStub = sinon.stub(req, 'get').yieldsAsync(null, {statusCode: 200}, {id: authId});
  });

  afterEach(function () {
    agentGet.restore();
    accountCreate.restore();
    requestStub.restore();
  });

  it('should create account', function (done) {
    agentGet.withArgs(account.agentId).yieldsAsync(null, agent);
    accountCreate.withArgs(account).yieldsAsync(null, account);

    request(app)
      .post('/api/accounts')
      .set(headers)
      .send(account)
      .expect(201)
      .expect('Content-Type', /json/)
      .end(function (err) {
        if (err) return done(err);
        agentGet.calledOnce.should.be.equal(true);
        accountCreate.calledOnce.should.be.equal(true);
        done();
      });
  });
});

describe('PUT /api/accounts/:id', function () {
  var accountGet, agentGet, accountUpdate;

  beforeEach(function () {
    accountGet = sinon.stub(Account, 'get');
    agentGet = sinon.stub(Agent, 'get');
    accountUpdate = sinon.stub(Account, 'update');
    requestStub = sinon.stub(req, 'get').yieldsAsync(null, {statusCode: 200}, {id: authId});
  });

  afterEach(function () {
    accountGet.restore();
    agentGet.restore();
    accountUpdate.restore();
    requestStub.restore();
  });

  it('should update account', function (done) {
    var updated = {
      agentId: uuid.v4(),
      currency: uuid.v4()
    };
    accountGet.withArgs(account.id).yieldsAsync(null, account);
    agentGet.withArgs(account.agentId).yieldsAsync(null, agent);
    accountUpdate.withArgs({id: account.id}).yieldsAsync(null);

    request(app)
      .put('/api/accounts/' + account.id)
      .set(headers)
      .send(updated)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (err) {
        if (err) return done(err);
        accountGet.calledOnce.should.be.equal(true);
        agentGet.calledOnce.should.be.equal(true);
        accountUpdate.calledOnce.should.be.equal(true);
        done();
      })
  })
});

describe('DELETE /api/accounts/:id', function () {
  var accountGet, accountUpdate, agentGet;

  beforeEach(function () {
    accountGet = sinon.stub(Account, 'get');
    accountUpdate = sinon.stub(Account, 'update');
    agentGet = sinon.stub(Agent, 'get');
    requestStub = sinon.stub(req, 'get').yieldsAsync(null, {statusCode: 200}, {id: authId});
  });

  afterEach(function () {
    accountGet.restore();
    accountUpdate.restore();
    agentGet.restore();
    requestStub.restore();
  });

  it('should delete account', function (done) {
    accountGet.withArgs(account.id).yieldsAsync(null, account);
    agentGet.withArgs(account.agentId).yieldsAsync(null, agent);
    accountUpdate.withArgs({id: account.id}).yieldsAsync(null);

    request(app)
      .delete('/api/accounts/' + account.id)
      .set(headers)
      .expect(204)
      .end(function (err) {
        if (err) return done(err);
        accountGet.calledOnce.should.be.equal(true);
        agentGet.calledOnce.should.be.equal(true);
        accountUpdate.calledOnce.should.be.equal(true);
        done();
      });
  });
});

describe.skip('accounts integration tests', function () {
  this.timeout(0);

  it('should CRUD', function (done) {
    request(app)
      .get('/api/agents')
      .set(headers)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) {
          return done(err);
        }
        var agents = res.body;
        if (!agents.length) {
          return done('Create agent before creating account');
        }
        request(app)
          .get('/api/currencies')
          .set(headers)
          .end(function (err, res) {
            var currencies = res.body;
            if (!currencies.length) {
              return done('Create currency before creating account');
            }

            var account = {
              id: uuid.v4(),
              agentId: agents[0].id,
              authId: authId,
              currency: currencies[0].id
            };

            request(app)
              .post('/api/accounts')
              .set(headers)
              .send(account)
              .expect(201)
              .expect('Content-Type', /json/)
              .end(function (err, res) {
                if (err) return done(err);
                res.body.id.should.be.equal(account.id);
                request(app)
                  .get('/api/accounts')
                  .set(headers)
                  .expect(200)
                  .expect('Content-Type', /json/)
                  .end(function (err, res) {
                    if (err) return done(err);
                    var accountToUpdate = _.find(res.body, {id: account.id});
                    accountToUpdate.should.not.be.equal(undefined);
                    accountToUpdate.currency = 'updated';
                    request(app)
                      .put('/api/accounts/' + accountToUpdate.id)
                      .set(headers)
                      .send(accountToUpdate)
                      .expect(200)
                      .expect('Content-Type', /json/)
                      .end(function (err, res) {
                        if (err) return done(err);
                        res.body.currency.should.be.equal(accountToUpdate.currency);
                        res.body.id.should.be.equal(accountToUpdate.id);
                        request(app)
                          .delete('/api/accounts/' + accountToUpdate.id)
                          .set(headers)
                          .expect(204)
                          .end(function (err) {
                            if (err) return done(err);
                            request(app)
                              .get('/api/accounts/' + accountToUpdate.id)
                              .set(headers)
                              .expect(404)
                              .end(function (err) {
                                if (err) return done(err);
                                done()
                              });
                          });
                      });
                  });
              });
          });
      });
  });
});
