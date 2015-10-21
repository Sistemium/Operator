'use strict';

var _ = require('lodash');
var Currency = require('./currency.model');
var uuid = require('node-uuid');

// Get list of currencys
exports.index = function(req, res) {
  Currency.scan({isDeleted: false}, function (err, currencies) {
    if(err) { return handleError(res, err); }
    return res.json(200, currencies);
  });
};

// Get a single currency
exports.show = function(req, res) {
  Currency.get(req.params.id, function (err, currency) {
    if(err) { return handleError(res, err); }
    if(!currency || currency.isDeleted) { return res.send(404); }
    return res.json(currency);
  });
};

// Creates a new currency in the DB.
exports.create = function(req, res) {
  Currency.create(req.body, function(err, currency) {
    if(err) { return handleError(res, err); }
    return res.json(201, currency);
  });
};

// Updates an existing currency in the DB.
exports.update = function(req, res) {
  if(req.body.id) { delete req.body.id; }
  Currency.get(req.params.id, function (err, currency) {
    if (err) { return handleError(res, err); }
    if(!currency) { return res.send(404); }
    var updated = _.clone(currency);
    delete updated.id;
    Currency.update({id: currency.id}, updated, function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, currency);
    });
  });
};

// Deletes a currency from the DB.
exports.destroy = function(req, res) {
  Currency.get(req.params.id, function (err, currency) {
    if(err) { return handleError(res, err); }
    if(!currency) { return res.send(404); }
    currency.isDeleted = true;
    var updated = _.clone(currency);
    delete updated.id;
    Currency.update({id: currency.id}, updated, function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
