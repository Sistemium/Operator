'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var authId = 'cbd77f5e-2644-11e5-8000-ffc34d526b60';
var headers = {
  'Authorization': 'c6dd52d226a821ac9acd45bd92d7a50d@pha'
};

describe('GET /api/accounts', function () {

  it('should respond with JSON array', function (done) {
    request(app)
      .get('/api/accounts')
      .set(headers)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });


});

describe.skip('integration tests', function () {
  it('should CRUD', function (done) {
    request(app)
      .get('/api/agents')
      .set(headers)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) {
          return done(err);
        }
        var agents = res.body;
        if (!agents.length) {
          return done('Create agent before creating account');
        }
        request(app)
          .get('/api/currencies')
          .set(headers)
          .end(function (err, res) {
            var currencies = res.body;
            if (!currencies.length) {
              return done('Create currency before creating account');
            }
            if (res)
            var account = {
              id: uuid.v4(),
              agentId: agents[0].id,
              authId: authId,
              currency: currencies[0].id
            };

            request(app)
              .post('/api/accounts')
              .set(headers)
              .send(account)
              .expect(201)
              .expect('Content-Type', /json/)
              .end(function (err, res) {
                if (err) return done(err);

              });
          });

      }
    );
  });
});
