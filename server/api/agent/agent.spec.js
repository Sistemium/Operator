'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var uuid = require('node-uuid');
var headers = {
  'Authorization': 'c6dd52d226a821ac9acd45bd92d7a50d@pha'
};

describe('GET /api/agents', function() {
  this.timeout(10000);

  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/agents')
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

describe('POST /api/agents', function() {
  it('should create new agent', function(done) {
    var agent = {
      id: uuid.v4(),
      name: 'test',
      authId: 'cbd77f5e-2644-11e5-8000-ffc34d526b60'
    };
    request(app)
      .post('/api/agents')
      .set(headers)
      .send(agent)
      .expect(201)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Object);
        done();
      })
  });

  it('should check if authId was passed', function(done) {
    var agent = {
      id: uuid.v4(),
      name: 'test'
    };
    request(app)
      .post('/api/agents')
      .set(headers)
      .send(agent)
      .expect(401)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.message.should.be.equal('AuthId not provided');
        done();
      })
  })
});
