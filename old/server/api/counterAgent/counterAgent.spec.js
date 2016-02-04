'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var Agent = require('../agent/agent.model.js');
var sinon = require('sinon');
var uuid = require('node-uuid');
var Contact = require('../contact/contact.model.js');
var req = require('request');
var headers = {
  'Authorization': 'authorization token'
};
var requestStub;
var authId = 'authId';

describe('GET /api/counterAgents', function() {
  var contactStub, agentGetStub;
  var url = '/api/counterAgents/';
  beforeEach(function () {
    contactStub = sinon.stub(Contact, 'scan');
    agentGetStub = sinon.stub(Agent, 'batchGet');
    requestStub = sinon.stub(req, 'get').yieldsAsync(null, {statusCode: 200}, {id: authId});
  });

  afterEach(function () {
    contactStub.restore();
    agentGetStub.restore();
    requestStub.restore();
  });

  it('should respond with JSON array', function(done) {
    var agentId = uuid.v4();
    var contacts = [{
      agent: agentId
    }];
    var agents = [{
      id: agentId,
      name: 'acceptor'
    }];

    contactStub.withArgs({owner: agentId, isDeleted: false}).yieldsAsync(null, contacts);
    agentGetStub.withArgs([contacts[0].agent]).yieldsAsync(null, agents);


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
