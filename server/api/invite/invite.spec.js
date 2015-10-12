'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var uuid = require('node-uuid');
var headers = {
  'Authorization': 'c6dd52d226a821ac9acd45bd92d7a50d@pha'
};

describe('GET /api/invites', function() {

  var agent1 = {
    id: uuid.v4(),
    name: 'agent1',
    authId: 'cbd77f5e-2644-11e5-8000-ffc34d526b60'
  };

  var agent2 = {
    id: uuid.v4(),
    name: 'agent2',
    authId: 'cbd77f5e-2644-11e5-8000-ffc34d526b60'
  };

  before(function () {
    it('should create two agents', function (done) {
      request(app)
        .post('/api/agents')
        .set(headers)
        .send([agent1, agent2])
        .expect(201)
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          if (err) return done(err);
          res.body.should.be.instanceOf(Array);
          done();
        });
    });
  });

  it('should create new invite', function(done) {
    var invite = {
      id: uuid.v4(),
      owner: agent1.authId,
      acceptor: agent2.id
    };

    request(app)
      .post('/api/invites')
      .set(headers)
      .send(invite)
      .expect(201)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.status.should.equal('accepted');
        should.exist(res.body.code);
        done();
      });
  });

  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/invites')
      .set(headers)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });
});
