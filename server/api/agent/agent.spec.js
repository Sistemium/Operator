'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var uuid = require('node-uuid');
var Agent = require('./agent.model');
var sinon = require('sinon');
var headers = {
  'Authorization': 'c6dd52d226a821ac9acd45bd92d7a50d@pha'
};

describe('GET /api/agents', function () {
  var stub = sinon.stub(Agent, 'scan').yields(null, []);
  it('should respond with JSON array', function (done) {
    request(app)
      .get('/api/agents')
      .set(headers)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        stub.calledOnce.should.be.equal(true);
        done();
      });
  });

  after(function () {
    stub.restore();
  })
});

describe('POST /api/agents', function () {
  var stub;
  var url = '/api/agents';
  before(function () {
    stub = sinon.stub(Agent, 'create');
  });

  afterEach(function () {
    stub.restore();
  });

  it('should create new agent', function (done) {
    var agent = {
      id: uuid.v4(),
      name: 'test',
      authId: 'cbd77f5e-2644-11e5-8000-ffc34d526b60'
    };
    stub.withArgs(agent).yields(null, agent)
    request(app)
      .post(url)
      .set(headers)
      .send(agent)
      .expect(201)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Object);
        stub.calledOnce.should.be.equal(true);
        done();
      })
  });

  it('should check if authId was passed', function (done) {
    var agent = {
      id: uuid.v4(),
      name: 'test'
    };
    stub.withArgs(agent).yields(null, agent);
    request(app)
      .post(url)
      .set(headers)
      .send(agent)
      .expect(401)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) return done(err);
        res.body.message.should.be.equal('AuthId not provided');
        stub.calledOnce.should.be.equal(true);
        done();
      });
  });

  it.skip('should return 500 if error occurs', function (done) {
    var agent = {
      id: uuid.v4(),
      name: 'test2',
      authId: 'cbd77f5e-2644-11e5-8000-ffc34d526b60'
    };
    stub.withArgs(agent).yields(true);
    request(app)
      .post(url)
      .set(headers)
      .send(agent)
      .expect(500)
      .end(function (err) {
        if (err) return done(err);
        done();
      });
  });
});

//describe('PUT /api/invites', function () {
//  it('should update agent', function(done) {
//    var agent = {
//      id: uuid.v4(),
//      name: 'test',
//      authId: 'cbd77f5e-2644-11e5-8000-ffc34d526b60'
//    };
//    var stubGet = sinon.stub(Agent, 'get').yields(null, agent);
//    var modelStub = sinon.stub(Agent, 'save');
//    request(app)
//      .put('/api/agents')
//      .set(headers)
//      .expect(200)
//      .expect('Content-Type', /json/)
//      .end(function (err, res) {
//        if (err) return done(err);
//        stubGet.calledOnce.should.be.equal(true);
//        modelStub.calledOnce.should.be.equal(true);
//        done();
//      });
//  });
//});


describe('DELETE /api/agents/:id', function () {
  var agentGetStub, agentUpdateStub;
  var url = '/api/agents/';
  var agentId;
  beforeEach(function () {
    agentGetStub = sinon.stub(Agent, 'get');
    agentUpdateStub = sinon.stub(Agent, 'update');
  });

  afterEach(function () {
    agentGetStub.restore();
    agentUpdateStub.restore();
    agentId = null;
  });

  it('should set record property isDeleted', function (done) {
    agentId = uuid.v4();
    var agent = {
      id: agentId,
      name: 'test',
      authId: 'cbd77f5e-2644-11e5-8000-ffc34d526b60'
    };
    agentGetStub.withArgs(agentId).yields(null, agent);
    agentUpdateStub.withArgs({id: agentId}).yields(null);
    request(app)
      .delete(url + agentId)
      .set(headers)
      .expect(204)
      .end(function (err) {
        if (err) return done(err);
        agentUpdateStub.args[0][1].should.have.property('isDeleted');
        agentUpdateStub.args[0][1].isDeleted.should.be.equal(true);
        done();
      })
  });

  it('should return status 500 if error occurs in Agent.get', function (done) {
    agentId = uuid.v4();
    agentGetStub.withArgs(agentId).yields(true);
    request(app)
      .delete(url + agentId)
      .set(headers)
      .expect(500)
      .end(function (err) {
        if (err) return done(err);
        done();
      });
  });

  it('should return status 404 if agent undefined', function (done) {
    agentId = uuid.v4();
    agentGetStub.withArgs(agentId).yields(null, undefined);
    request(app)
      .delete(url + agentId)
      .set(headers)
      .expect(404)
      .end(function (err) {
        if (err) return done(err);
        done();
      });
  });

  it('should return 401 when auth id not provided', function (done) {
    agentId = uuid.v4();
    var agent = {
      id: agentId,
      name: 'test'
    };
    agentGetStub.withArgs(agentId).yields(null, agent);
    request(app)
      .delete(url + agentId)
      .set(headers)
      .expect(401)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) return done(err);
        res.body.should.have.property('message');
        res.body.message.should.be.equal('AuthId not provided');
        done();
      });
  });

  it('should return 401 when auth id not belongs to user', function (done) {
    agentId = uuid.v4();
    var agent = {
      id: agentId,
      name: 'test',
      authId: 'fake'
    };
    agentGetStub.withArgs(agentId).yields(null, agent);
    request(app)
      .delete(url + agentId)
      .set(headers)
      .expect(401)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) return done(err);
        res.body.should.have.property('message');
        res.body.message.should.be.equal('Access denied!');
        done();
      })
  })
});
