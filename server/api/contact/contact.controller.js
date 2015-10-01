'use strict';

var _ = require('lodash');
var Contact = require('./contact.model');
var uuid = require('node-uuid');

// Get list of contacts
exports.index = function(req, res) {
  Contact.scan().exec(function (err, contacts) {
    if(err) { return handleError(res, err); }
    return res.json(200, contacts);
  });
};

// Get a single contact
exports.show = function(req, res) {
  Contact.get(req.params.id, function (err, contact) {
    if(err) { return handleError(res, err); }
    if(!contact) { return res.send(404); }
    return res.json(contact);
  });
};

// Creates a new contact in the DB.
exports.create = function(req, res) {
  req.body.id = uuid.v4();
  Contact.create(req.body, function(err, contact) {
    if(err) { return handleError(res, err); }
    return res.json(201, contact);
  });
};

// Updates an existing contact in the DB.
exports.update = function(req, res) {
  if(req.body.id) { delete req.body.id; }
  Contact.get(req.params.id, function (err, contact) {
    if (err) { return handleError(res, err); }
    if(!contact) { return res.send(404); }
    var updated = _.merge(contact, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, contact);
    });
  });
};

// Deletes a contact from the DB.
exports.destroy = function(req, res) {
  Contact.get(req.params.id, function (err, contact) {
    if(err) { return handleError(res, err); }
    if(!contact) { return res.send(404); }
    contact.delete(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
