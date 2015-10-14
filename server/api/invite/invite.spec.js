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

describe('GET /api/invites', function () {

  it('should get records which user given access to', function (done) {
    //arrange
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
    })
  });
});
