'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var sinon = require('sinon');
var Agent = require('../agent/agent.model');
var Invite = require('../invite/invite.model');
var Contact = require('./contact.model');
var headers = {
  'Authorization': 'c6dd52d226a821ac9acd45bd92d7a50d@pha'
};
var uuid = require('node-uuid');
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
    owner: agents[0].id,
    isActive: true,
    status: 'open',
    code: '12345'
  },
  {
    id: uuid.v4(),
    owner: agents[1].id
  }
];


describe.skip('GET /api/contacts', function() {

  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/contacts')
      .set(headers)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });

  it('should save contact', function(done) {
    request(app)
      .post('/api/contacts')
      .send({
        owner: owner,
        agent: agent
      })
      .expect(201)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) {
          return done(err);
        }

        res.body.agent.should.be.exactly(agent);
        done();
      })
  });
});

describe('POST /api/contacts', function () {
  var agentStub, inviteQueryStub, inviteUpdateStub, contactStub;
  var contact = {
    id: uuid.v4(),
    owner: agents[0].id,
    agent: agents[1].id,
    invite: invites[0].code
  };
  beforeEach(function () {
    inviteQueryStub = sinon.stub(Invite, 'query').yields(null, invites[0]);
    inviteUpdateStub = sinon.stub(Invite, 'update').yields(null);
    agentStub = sinon.stub(Agent, 'get');
    agentStub.withArgs(agents[0].id).yields(null, agents[0]);
    agentStub.withArgs(agents[1].id).yields(null, agents[1]);
    contactStub = sinon.stub(Contact, 'create');
    contactStub.onFirstCall().yields(null, contact);
    contactStub.onSecondCall().yields(null, true);
  });
  afterEach(function () {
    agentStub.restore();
    inviteQueryStub.restore();
    inviteUpdateStub.restore();
    contactStub.restore();
  });
  it('should create contact', function (done) {
    request(app)
      .post('/api/contacts')
      .set(headers)
      .send(contact)
      .expect(201)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) return done(err);
        done();
      });
  });
});
