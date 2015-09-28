'use strict';

var _ = require('lodash');
var Currency = require('./currency.model');

// Get list of currencys
exports.index = function(req, res) {
  Currency.find(function (err, currencys) {
    if(err) { return handleError(res, err); }
    return res.json(200, currencys);
  });
};

// Get a single currency
exports.show = function(req, res) {
  Currency.findById(req.params.id, function (err, currency) {
    if(err) { return handleError(res, err); }
    if(!currency) { return res.send(404); }
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
  if(req.body._id) { delete req.body._id; }
  Currency.findById(req.params.id, function (err, currency) {
    if (err) { return handleError(res, err); }
    if(!currency) { return res.send(404); }
    var updated = _.merge(currency, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, currency);
    });
  });
};

// Deletes a currency from the DB.
exports.destroy = function(req, res) {
  Currency.findById(req.params.id, function (err, currency) {
    if(err) { return handleError(res, err); }
    if(!currency) { return res.send(404); }
    currency.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}