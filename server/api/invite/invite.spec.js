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
var agents = [
  {
    id: uuid.v4(),
    name: 'test1',
    authId: 'testAuthId'
  },
  {
    id: uuid.v4(),
    name: 'test2',
    authId: 'testAuthId'
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

describe.skip('GET /api/invites without code', function () {
  it('should get records which user given access to', function (done) {
    //arrange
    var agentStub = sinon.stub(Agent, 'scan').yields(null, agents);
    var inviteStub = sinon.stub(Invite, 'scan').yields(null, invites);

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

    after(function () {
      agentStub.restore();
      inviteStub.restore();
    });
  });
});

describe('GET /api/invites/ with code', function () {
  var agentStub, inviteStub;
  var url = '/api/invites?code=123';

  beforeEach(function () {
    agentStub = sinon.stub(Agent, 'scan').yields(null, agents);
  });

  afterEach(function () {
    agentStub.restore();
    inviteStub.restore();
  });

  it('should get invite with "open" status', function (done) {
    var invite = {
      id: uuid.v4(),
      status: 'open'
    };
    inviteStub = sinon.stub(Invite, 'query').yields(null, invite);
    request(app)
      .get(url)
      .set(headers)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) done(err);
        res.body.should.have.property('status');
        res.body.status.should.be.equal('open');
        done();
      })
  });

  it('should get invite with "accepted" status', function (done) {
    var invite = {
      id: uuid.v4(),
      status: 'accepted',
      owner: agents[0].id
    };
    inviteStub = sinon.stub(Invite, 'query').yields(null, invite);
    request(app)
      .get(url)
      .set(headers)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) done(err);
        res.body.should.have.property('status');
        res.body.status.should.be.equal('accepted');
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
    inviteStub = sinon.stub(Invite, 'query').yields(null, invite);
    request(app)
      .get(url)
      .set(headers)
      .expect(401)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) done(err);
        res.body.should.have.property('message');
        res.body.message.should.be.equal('Access denied!');
        done();
      });
  });
});
