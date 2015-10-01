'use strict';

var _ = require('lodash');
var Agent = require('./agent.model');
var uuid = require('node-uuid');

// Get list of agents
exports.index = function(req, res) {
  Agent.scan().exec(function (err, agents) {
    if(err) { return handleError(res, err); }
    return res.json(200, agents);
  });
};

// Get a single agent
exports.show = function(req, res) {
  Agent.get(req.params.id, function (err, agent) {
    if(err) { return handleError(res, err); }
    if(!agent) { return res.send(404); }
    return res.json(agent);
  });
};

// Creates a new agent in the DB.
exports.create = function(req, res) {
  req.body.id = uuid.v4();
  Agent.create(req.body, function(err, agent) {
    if(err) { return handleError(res, err); }
    return res.json(201, agent);
  });
};

// Updates an existing agent in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Agent.get(req.params.id, function (err, agent) {
    if (err) { return handleError(res, err); }
    if(!agent) { return res.send(404); }
    var updated = _.merge(agent, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, agent);
    });
  });
};

// Deletes a agent from the DB.
exports.destroy = function(req, res) {
  Agent.get(req.params.id, function (err, agent) {
    if(err) { return handleError(res, err); }
    if(!agent) { return res.send(404); }
    agent.delete(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
