'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var headers = {
  'Authorization': 'c6dd52d226a821ac9acd45bd92d7a50d@pha'
};

describe('GET /api/operations', function() {

  this.timeout(20000);

  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/operations')
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
