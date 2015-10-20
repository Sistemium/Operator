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
  var url = '/api/contacts';
  beforeEach(function () {
    inviteQueryStub = sinon.stub(Invite, 'query');
    inviteQueryStub.withArgs({'code': {eq: contact.invite}, isDeleted: false}).yieldsAsync(null, invites[0]);
    inviteUpdateStub = sinon.stub(Invite, 'update').yieldsAsync(null);
    agentStub = sinon.stub(Agent, 'get');
    agentStub.withArgs(agents[0].id).yieldsAsync(null, agents[0]);
    agentStub.withArgs(agents[1].id).yieldsAsync(null, agents[1]);
    contactStub = sinon.stub(Contact, 'create');
    contactStub.onFirstCall().yieldsAsync(null, contact);
    contactStub.onSecondCall().yieldsAsync(null, true);
  });
  afterEach(function () {
    agentStub.restore();
    inviteQueryStub.restore();
    inviteUpdateStub.restore();
    contactStub.restore();
  });
  it('should create contact', function (done) {
    request(app)
      .post(url)
      .set(headers)
      .send(contact)
      .expect(201)
      .expect('Content-Type', /json/)
      .end(function (err) {
        if (err) return done(err);
        done();
      });
  });

  it('should return status 404 if contact owner not found', function (done) {
    var cnt = contact;
    cnt.owner = 'owner not exists';
    agentStub.withArgs(cnt.owner).yieldsAsync(null, undefined);
    request(app)
      .post(url)
      .set(headers)
      .send(cnt)
      .expect(404)
      .end(function(err) {
        if (err) return done(err);
        done();
      });
  });

  it('should return status 404 if contact agent not found', function (done) {
    var cnt = contact;
    cnt.agent = 'agent not exists';
    agentStub.withArgs(cnt.agent).yieldsAsync(null, undefined);
    request(app)
      .post(url)
      .set(headers)
      .send(cnt)
      .expect(404)
      .end(function (err) {
        if (err) return done(err);
        done();
      });
  });

  it('should return status 404 if invite not found', function (done) {
    var cnt = contact;
    cnt.invite = 'invite not exists';
    inviteQueryStub.withArgs({'code': {eq: cnt.invite}, isDeleted: false}).yieldsAsync(null, undefined);
    request(app)
      .post(url)
      .set(headers)
      .send(cnt)
      .expect(404)
      .end(function (err){
        if (err) return done(err);
        done();
      });
  });

  it('should return status 401 if contact invite status not open', function (done) {
    var cnt = contact;
    cnt.invite = 'not open';
    inviteQueryStub.withArgs({'code': {eq: cnt.invite}, isDeleted: false}).yieldsAsync(null, {status: 'not open', isActive: true});
    request(app)
      .post(url)
      .set(headers)
      .send(cnt)
      .expect(401)
      .end(function (err) {
        if (err) return done(err);
        done();
      });
  });

  it('should return status 500 if error occurs on contact agent check', function (done) {
    var cnt = contact;
    cnt.agent = 'agent error';
    agentStub.withArgs(cnt.agent).yieldsAsync({err: 'Houston we have a problem..'});
    request(app)
      .post(url)
      .set(headers)
      .send(cnt)
      .expect(500)
      .end(function (err) {
        if (err) return done(err);
        done();
      })
  });

  it('should return status 500 if error occurs on contact owner check', function (done) {
    var cnt = contact;
    cnt.owner = 'owner error';
    agentStub.withArgs(cnt.owner).yieldsAsync({err: 'error'});
    request(app)
      .post(url)
      .set(headers)
      .send(cnt)
      .expect(500)
      .end(function (err){
        if (err) return done(err);
        done();
      });
  });

  it('should return status 500 if error occurs on contract invite check', function (done) {
    var cnt = contact;
    cnt.invite = 'invite error';
    inviteQueryStub.withArgs({'code': {eq: cnt.invite}, isDeleted: false}).yieldsAsync({err: 'err'});
    request(app)
      .post(url)
      .set(headers)
      .send(cnt)
      .expect(500)
      .end(function (err){
        if (err) return done(err);
        done();
      });
  });
});

describe('DELETE /api/contacts/:id', function () {
  var contactGetStub, contactUpdateStub, agentGetStub, inviteQueryStub;
  var url = '/api/contacts/';
  beforeEach(function () {
    contactGetStub = sinon.stub(Contact, 'get');
    contactUpdateStub = sinon.stub(Contact, 'update');
    agentGetStub = sinon.stub(Agent, 'get');
    inviteQueryStub = sinon.stub(Invite, 'query');
  });

  afterEach(function () {
    contactGetStub.restore();
    contactUpdateStub.restore();
    agentGetStub.restore();
    inviteQueryStub.restore();
  });

  it('should delete contact', function (done) {
    var contactId = uuid.v4();
    var contact = {
      id: contactId,
      owner: agents[0].id,
      agent: agents[1].id,
      invite: invites[0].code
    };
    contactGetStub.withArgs(contactId).yieldsAsync(null, contact);
    agentGetStub.withArgs(contact.owner).yieldsAsync(null, agents[0]);
    agentGetStub.withArgs(contact.agent).yieldsAsync(null, agents[1]);
    inviteQueryStub.withArgs({'code': {eq: contact.invite}, isDeleted: false}).yieldsAsync(null, invites[0]);
    contactUpdateStub.withArgs({id: contactId}).yieldsAsync(null);

    request(app)
      .delete(url + contactId)
      .set(headers)
      .expect(204)
      .end(function (err) {
        if (err) done(err);
        contactGetStub.calledOnce.should.be.equal(true);
        agentGetStub.calledTwice.should.be.equal(true);
        inviteQueryStub.calledOnce.should.be.equal(true);
        contactUpdateStub.args[0][1].should.have.property('isDeleted');
        contactUpdateStub.args[0][1].isDeleted.should.be.equal(true);
        done();
      });
  });
});
