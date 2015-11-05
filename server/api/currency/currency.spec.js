'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var _ = require('lodash');
var Currency = require('./currency.model');
var sinon = require('sinon');
var req = require('request');
var headers = {
  'Authorization': 'authorization token'
};
var authId = 'authId';
var uuid = require('node-uuid');
var currencies = [
  {
    id: uuid.v4(),
    name: '$'
  },
  {
    id: uuid.v4(),
    name: '€'
  },
  {
    id: uuid.v4(),
    name: '£'
  }
];
var requestStub;

describe('GET /api/currencies', function () {
  var currencyScan;
  beforeEach(function () {
    currencyScan = sinon.stub(Currency, 'scan');
    requestStub = sinon.stub(req, 'get').yieldsAsync(null, {statusCode: 200}, {id: authId});
  });

  afterEach(function () {
    currencyScan.restore();
    requestStub.restore();
  });

  it('should get currencies', function (done) {
    currencyScan.withArgs({isDeleted: false}).yieldsAsync(null, currencies);
    request(app)
      .get('/api/currencies')
      .set(headers)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        currencyScan.calledOnce.should.be.equal(true);
        done();
      });
  });
});

describe('POST /api/currencies', function () {
  var createStub;
  beforeEach(function () {
    createStub = sinon.stub(Currency, 'create');
    requestStub = sinon.stub(req, 'get').yieldsAsync(null, {statusCode: 200}, {id: authId});
  });

  afterEach(function () {
    createStub.restore();
    requestStub.restore();
  });

  it('should create currency', function (done) {
    var currency = {
      id: uuid.v4(),
      name: '€'
    };
    createStub.yieldsAsync(null, currency);
    request(app)
      .post('/api/currencies')
      .set(headers)
      .send(currency)
      .expect(201)
      .expect('Content-Type', /json/)
      .end(function (err) {
        if (err) return done(err);
        createStub.calledOnce.should.be.equal(true);
        done();
      })
  });
});

describe('PUT /api/currencies/:id', function () {
  var currencyGet, currencyUpdate;
  beforeEach(function () {
    currencyGet = sinon.stub(Currency, 'get');
    currencyUpdate = sinon.stub(Currency, 'update');
    requestStub = sinon.stub(req, 'get').yieldsAsync(null, {statusCode: 200}, {id: authId});
  });

  afterEach(function () {
    currencyGet.restore();
    currencyUpdate.restore();
    requestStub.restore();
  });

  it('should update currency', function (done) {

    currencyGet.withArgs(currencies[0].id).yieldsAsync(null, currencies[0]);
    var updated = currencies[0];
    updated.name = 'updated';
    currencyUpdate.withArgs({id: currencies[0].id}).yieldsAsync(null);
    request(app)
      .put('/api/currencies/' + currencies[0].id)
      .set(headers)
      .send(updated)
      .expect(200)
      .end(function (err) {
        if (err) return done(err);
        currencyGet.calledOnce.should.be.equal(true);
        currencyUpdate.calledOnce.should.be.equal(true);
        done();
      })
  });
});


describe('DELETE /api/currencies/:id', function () {
  var currencyGet, currencyUpdate;
  beforeEach(function () {
    currencyGet = sinon.stub(Currency, 'get');
    currencyUpdate = sinon.stub(Currency, 'update');
    requestStub = sinon.stub(req, 'get').yieldsAsync(null, {statusCode: 200}, {id: authId});
  });

  afterEach(function () {
    currencyGet.restore();
    currencyUpdate.restore();
    requestStub.restore();
  });

  it('should delete currency', function (done) {
    currencyGet.withArgs(currencies[0].id).yieldsAsync(null, currencies[0]);
    currencyUpdate.withArgs({id: currencies[0].id}).yieldsAsync(null);

    request(app)
      .delete('/api/currencies/' + currencies[0].id)
      .set(headers)
      .expect(204)
      .end(function (err) {
        if (err) return done(err);
        currencyGet.calledOnce.should.be.equal(true);
        currencyUpdate.calledOnce.should.be.equal(true);
        done();
      });
  });
});

describe.skip('currencies integration tests', function () {
  it('should CRUD', function (done) {
    var currency = {
      id: uuid.v4(),
      name: '$'
    };

    this.timeout(0);

    request(app)
      .post('/api/currencies')
      .set(headers)
      .send(currency)
      .expect(201)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) return done(err);
        res.body.id.should.be.equal(currency.id);
        request(app)
          .get('/api/currencies')
          .set(headers)
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
            var currencyToUpdate = _.find(res.body, {id: currency.id});
            currencyToUpdate.should.not.be.equal(undefined);
            currencyToUpdate.name = 'updated';
            request(app)
              .put('/api/currencies/' + currencyToUpdate.id)
              .set(headers)
              .send(currencyToUpdate)
              .expect(200)
              .expect('Content-Type', /json/)
              .end(function (err, res) {
                if (err) return done(err);
                res.body.name.should.be.equal(currencyToUpdate.name);
                res.body.id.should.be.equal(currencyToUpdate.id);
                request(app)
                  .delete('/api/currencies/' + currencyToUpdate.id)
                  .set(headers)
                  .expect(204)
                  .end(function (err) {
                    if (err) return done(err);
                    request(app)
                      .get('/api/currencies/' + currencyToUpdate.id)
                      .set(headers)
                      .expect(404)
                      .end(function (err) {
                        if (err) return done(err);
                        done()
                      });
                  })
              });
          });
      });
  });
});
