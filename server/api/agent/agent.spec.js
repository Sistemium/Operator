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
  var stub;
  beforeEach(function () {
    stub = sinon.stub(Agent, 'scan');
  });
  afterEach(function () {
    stub.restore();
  });

  it('should respond with JSON array', function (done) {

    stub.withArgs({authId: 'cbd77f5e-2644-11e5-8000-ffc34d526b60', isDeleted: false}).yieldsAsync(null, []);
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
    stub.withArgs(agent).yieldsAsync(null, agent)
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
    stub.withArgs(agent).yieldsAsync(null, agent);
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
    stub.withArgs(agent).yieldsAsync(true);
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

describe('PUT /api/invites/:id', function () {
  var agentGetStub, agentUpdateStub;
  var url = '/api/agents/';
  beforeEach(function () {
    agentGetStub = sinon.stub(Agent, 'get');
    agentUpdateStub = sinon.stub(Agent, 'update');
  });
  afterEach(function () {
    agentGetStub.restore();
    agentUpdateStub.restore();
  });

  it('should update agent', function(done) {
    var agent = {
      id: uuid.v4(),
      name: 'test',
      authId: 'cbd77f5e-2644-11e5-8000-ffc34d526b60'
    };
    var updated = {
      id: agent.id,
      name: 'updated',
      authId: 'cbd77f5e-2644-11e5-8000-ffc34d526b60'
    };
    agentGetStub.withArgs(agent.id).yieldsAsync(null, agent);
    agentUpdateStub.withArgs({id: agent.id}).yieldsAsync(null);
    request(app)
      .put(url + agent.id)
      .set(headers)
      .send(updated)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (err) {
        if (err) return done(err);
        agentGetStub.calledOnce.should.be.equal(true);
        agentUpdateStub.args[0][1].should.have.property('name');
        agentUpdateStub.args[0][1].name.should.be.equal('updated');
        done();
      });
  });
});


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
    agentGetStub.withArgs(agentId).yieldsAsync(null, agent);
    agentUpdateStub.withArgs({id: agentId}).yieldsAsync(null);
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
    agentGetStub.withArgs(agentId).yieldsAsync(true);
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
    agentGetStub.withArgs(agentId).yieldsAsync(null, undefined);
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
    agentGetStub.withArgs(agentId).yieldsAsync(null, agent);
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
    agentGetStub.withArgs(agentId).yieldsAsync(null, agent);
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


describe('integration tests' , function () {
  it('should get only not deleted', function (done) {
    Agent.scan().exec(function (err, agents) {
      if (err) console.log(err);
      console.log(agents);
      done();
    });
  })
});
