'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var Currency = require('./currency.model');
var sinon = require('sinon');
var headers = {
  'Authorization': 'c6dd52d226a821ac9acd45bd92d7a50d@pha'
};
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

describe('GET /api/currencies', function () {
  var currencyScan;
  beforeEach(function () {
    currencyScan = sinon.stub(Currency, 'scan');
  });

  afterEach(function () {
    currencyScan.restore();
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
  });

  afterEach(function () {
    createStub.restore();
  });

  it('should create currency', function (done) {
    var currency = {
      id: uuid.v4(),
      name: '€'
    };
    createStub.withArgs(currency).yieldsAsync(null, currency);
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

describe.skip('PUT /api/currencies/:id', function () {
  var currencyGet, currencyUpdate;
  beforeEach(function () {
    currencyGet = sinon.stub(Currency, 'get');
    currencyUpdate = sinon.stub(Currency, 'update');
  });

  afterEach(function () {
    currencyGet.restore();
    currencyUpdate.restore();
  });

  it('should update currency', function (done) {

    currencyGet.withArgs(currencies[0].id).yieldsAsync(null, currencies[0]);
    var updated = currencies[0];
    updated.name = 'updated';
    currencyUpdate.withArgs(currencies[0].id).yieldsAsync(null);
    request(app)
      .put('/api/currencies/' + currencies[0].id)
      .set(headers)
      .send(updated)
      .expect(204)
      .end(function (err) {
        if (err) return done(err);
        currencyGet.calledOnce.should.be.equal(true);
        currencyUpdate.calledOnce.should.be.equal(true);
        done();
      })
  });
});


describe.skip('DELETE /api/currencies/:id', function () {
  var currencyGet, currencyUpdate;
  beforeEach(function () {
    currencyGet = sinon.stub(Currency, 'get');
    currencyUpdate = sinon.stub(Currency, 'update');
  });

  afterEach(function () {
    currencyGet.restore();
    currencyUpdate.restore();
  });

  it('should delete currency', function (done) {
    currencyGet.withArgs(currencies[0].id).yieldsAsync(null, currencies[0]);
    currencyUpdate.withArgs(currencies[0].id).yieldsAsync(null);

    request(app)
      .delete('/api/currencies/' + currencies[0].id)
      .set(headers)
      .expect(204)
      .end(function (err) {
        if (err) return done(err);
        currencyGet.calledOnce.should.be.equal(true);
        currencyUpdate.calledOnce.should.be.equal(true);
        done();
      })
  });
});
