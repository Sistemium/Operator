'use strict';

var _ = require('lodash');
var Operation = require('./operation.model');
var uuid = require('node-uuid');

// Get list of operations
exports.index = function(req, res) {
  Operation.scan().exec(function (err, operations) {
    if(err) { return handleError(res, err); }
    return res.json(200, operations);
  });
};

// Get a single operation
exports.show = function(req, res) {
  Operation.get(req.params.id, function (err, operation) {
    if(err) { return handleError(res, err); }
    if(!operation) { return res.send(404); }
    return res.json(operation);
  });
};

// Creates a new operation in the DB.
exports.create = function(req, res) {
  req.body.id = uuid.v4();
  Operation.create(req.body, function(err, operation) {
    if(err) { return handleError(res, err); }
    return res.json(201, operation);
  });
};

// Updates an existing operation in the DB.
exports.update = function(req, res) {
  if(req.body.id) { delete req.body.id; }
  Operation.get(req.params.id, function (err, operation) {
    if (err) { return handleError(res, err); }
    if(!operation) { return res.send(404); }
    var updated = _.merge(operation, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, operation);
    });
  });
};

// Deletes a operation from the DB.
exports.destroy = function(req, res) {
  Operation.get(req.params.id, function (err, operation) {
    if(err) { return handleError(res, err); }
    if(!operation) { return res.send(404); }
    operation.delete(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
