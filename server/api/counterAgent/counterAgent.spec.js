'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var Agent = require('../agent/agent.model');
var sinon = require('sinon');
var uuid = require('node-uuid');
var Contact = require('../contact/contact.model');
var headers = {
  'Authorization': 'c6dd52d226a821ac9acd45bd92d7a50d@pha'
};

describe('GET /api/counterAgents', function() {
  var contactStub, agentGetStub;
  var url = '/api/counterAgents/';
  beforeEach(function () {
    contactStub = sinon.stub(Contact, 'scan');
    agentGetStub = sinon.stub(Agent, 'batchGet');
  });

  afterEach(function () {
    contactStub.restore();
    agentGetStub.restore();
  });

  it('should respond with JSON array', function(done) {
    var agentId = uuid.v4();
    var contacts = [{
      acceptor: agentId
    }];
    var agents = [{
      id: agentId,
      name: 'acceptor'
    }];

    contactStub.withArgs({owner: agentId, isDeleted: false}).yieldsAsync(null, contacts);
    agentGetStub.withArgs([contacts[0].acceptor]).yieldsAsync(null, agents);

    request(app)
      .get(url + agentId)
      .set(headers)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        contactStub.calledOnce.should.be.equal(true);
        agentGetStub.calledOnce.should.be.equal(true);
        done();
      });
  });
});
