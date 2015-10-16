'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var uuid = require('node-uuid');
var Invite = require('./invite.model');
var Agent = require('../agent/agent.model');
var sinon = require('sinon');

var headers = {
  'Authorization': 'c6dd52d226a821ac9acd45bd92d7a50d@pha'
};
//auth id for Albert Kovalevskij user
var agents = [
  {
    id: uuid.v4(),
    name: 'test1',
    authId: 'cbd77f5e-2644-11e5-8000-ffc34d526b60'
  },
  {
    id: uuid.v4(),
    name: 'test2',
    authId: 'cbd77f5e-2644-11e5-8000-ffc34d526b60'
  }
];
var invites = [
  {
    id: uuid.v4(),
    owner: agents[0].id
  },
  {
    id: uuid.v4(),
    owner: agents[1].id
  }
];

describe('GET /api/invites without code', function () {
  var agentStub, inviteStub;
  it('should get records which user given access to', function (done) {
    //arrange
    agentStub = sinon.stub(Agent, 'scan').yieldsAsync(null, agents);
    inviteStub = sinon.stub(Invite, 'scan').yieldsAsync(null, invites);

    //act
    request(app)
      .get('/api/invites')
      .set(headers)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) return done(err);
        res.body.should.be.instanceOf(Array);
        res.body.length.should.be.equal(2);
        done();
      });
  });
  after(function () {
    agentStub.restore();
    inviteStub.restore();
  })
});

describe('GET /api/invites/ with code', function () {
  var agentStub, inviteStub;
  var url = '/api/invites?code=123';

  beforeEach(function () {
    agentStub = sinon.stub(Agent, 'scan').yieldsAsync(null, agents);
  });

  afterEach(function () {
    agentStub.restore();
  });

  it('should get invite with "open" status', function (done) {
    var invite = {
      id: uuid.v4(),
      status: 'open'
    };
    inviteStub = sinon.stub(Invite, 'query').yieldsAsync(null, invite);
    request(app)
      .get(url)
      .set(headers)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) return done(err);
        res.body.should.have.property('status');
        res.body.status.should.be.equal('open');
        inviteStub.restore();
        done();
      });
  });

  it('should get invite with "accepted" status', function (done) {
    var invite = {
      id: uuid.v4(),
      status: 'accepted',
      owner: agents[0].id
    };
    inviteStub = sinon.stub(Invite, 'query').yieldsAsync(null, invite);
    request(app)
      .get(url)
      .set(headers)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) return done(err);
        res.body.should.have.property('status');
        res.body.status.should.be.equal('accepted');
        inviteStub.restore();
        done();
      });
  });

  it('should check if have access', function (done) {
    var invite = {
      id: uuid.v4(),
      status: 'accepted',
      //not the id of authorized user
      owner: uuid.v4()
    };
    inviteStub = sinon.stub(Invite, 'query').yieldsAsync(null, invite);
    request(app)
      .get(url)
      .set(headers)
      .expect(401)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) return done(err);
        res.body.should.have.property('message');
        res.body.message.should.be.equal('Access denied!');
        inviteStub.restore();
        done();
      });
  });
});

describe('POST /api/invites', function () {
  var agentStub, inviteStub;
  beforeEach(function () {
    agentStub = sinon.stub(Agent, 'get').yieldsAsync(null, agents[0]);

    var invite = {
      id: uuid.v4(),
      owner: agents[0].id
    };
    inviteStub = sinon.stub(Invite, 'create').yieldsAsync(null, invite);
  });
  afterEach(function () {
    agentStub.restore();
    inviteStub.restore();
  });
  it('should create invite', function (done) {
    var invite = {
      id: uuid.v4(),
      owner: agents[0].id
    };
    request(app)
      .post('/api/invites')
      .set(headers)
      .send(invite)
      .expect(201)
      .expect('Content-Type', /json/)
      .end(function (err) {
        if (err) return done(err);
        var inviteCreateArg = inviteStub.args[0][0];
        inviteCreateArg.should.have.property('status');
        inviteCreateArg.status.should.be.equal('open');
        inviteCreateArg.should.have.property('code');
        inviteStub.calledOnce.should.be.equal(true);
        done();
      });
  });
});

describe('DELETE /api/invites/:id', function () {
  var url = '/api/invites/';
  var inviteGetStub, inviteUpdateStub, agentGetStub;
  beforeEach(function () {
    inviteGetStub = sinon.stub(Invite, 'get');
    inviteUpdateStub = sinon.stub(Invite, 'update');
    agentGetStub = sinon.stub(Agent, 'get');
  });
  afterEach(function () {
    inviteGetStub.restore();
    inviteUpdateStub.restore();
    agentGetStub.restore();
  });

  it('should delete invite', function (done) {
    var inviteId = uuid.v4();
    var invite = {
      id: inviteId,
      owner: uuid.v4()
    };
    var agent = {
      id: invite.owner,
      name: 'test',
      authId: 'cbd77f5e-2644-11e5-8000-ffc34d526b60'
    };
    inviteGetStub.withArgs(inviteId).yieldsAsync(null, invite);
    inviteUpdateStub.withArgs({id: inviteId}).yieldsAsync(null);
    agentGetStub.withArgs(invite.owner).yieldsAsync(null, agent);
    request(app)
      .delete(url + inviteId)
      .set(headers)
      .expect(204)
      .end(function (err) {
        if (err) return done(err);
        inviteGetStub.calledOnce.should.be.equal(true);
        inviteUpdateStub.calledOnce.should.be.equal(true);
        inviteUpdateStub.args[0][1].should.have.property('isDeleted');
        inviteUpdateStub.args[0][1].isDeleted.should.be.equal(true);
        agentGetStub.calledOnce.should.be.equal(true);
        done();
      });
  });
});

describe('PUT /api/invites/:id', function () {
  var url = '/api/invites/';
  var inviteGetStub, agentGetStub, inviteUpdateStub;
  beforeEach(function () {
    inviteGetStub = sinon.stub(Invite, 'get');
    agentGetStub = sinon.stub(Agent, 'get');
    inviteUpdateStub = sinon.stub(Invite, 'update');
  });
  afterEach(function () {
    inviteGetStub.restore();
    agentGetStub.restore();
    inviteUpdateStub.restore();
  });

  it.only('should update invite', function (done) {
    var agent = {
      id: uuid.v4(),
      name: 'test',
      authId: 'cbd77f5e-2644-11e5-8000-ffc34d526b60'
    };
    var inviteId = uuid.v4();
    var invite = {
      id: inviteId,
      owner: agent.id,
      code: 'old',
      status: 'open',
      isActive: true
    };
    var updated = {
      id: inviteId,
      owner: agent.id,
      isActive: true,
      acceptor: agents[0].id,
      code: 'updated'
    };

    inviteGetStub.withArgs(inviteId).yieldsAsync(null, invite);
    agentGetStub.withArgs(agent.id).yieldsAsync(null, agent);
    inviteUpdateStub.withArgs({id: inviteId}).yieldsAsync(null);
    request(app)
      .put(url + inviteId)
      .set(headers)
      .send(updated)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) return done(err);
        inviteGetStub.calledOnce.should.be.equal(true);
        agentGetStub.calledOnce.should.be.equal(true);
        inviteUpdateStub.calledOnce.should.be.equal(true);
        inviteUpdateStub.args[0][1].code.should.be.equal('updated');
        res.body.status.should.be.equal('accepted');
        done();
      });
  });
});
