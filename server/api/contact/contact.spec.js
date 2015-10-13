'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var headers = {
  'Authorization': 'c6dd52d226a821ac9acd45bd92d7a50d@pha'
};
var uuid = require('node-uuid');
var owner = uuid.v4();
var agent = uuid.v4();

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
