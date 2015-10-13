'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');

describe.skip('GET /api/accounts', function() {

  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/accounts')
      .set('Authorization', 'c6dd52d226a821ac9acd45bd92d7a50d@pha')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });
});
