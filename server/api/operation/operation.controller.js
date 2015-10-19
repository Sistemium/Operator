'use strict';

var _ = require('lodash');
var Operation = require('./operation.model');
var Agent = require('../agent/agent.model');

// Get list of operations
// Get only operations which initiator or executor belongs to user agents
exports.index = function (req, res) {
  getUserAgents(req, res, function (agentIds) {
    Operation.scan({
      isDeleted: false,
      executor: {'in': agentIds},
      initiator: {'in': agentIds}
    }, function (err, operations) {
      if (err) {
        return handleError(res, err);
      }
      return res.json(200, operations);
    });
  });
};

// Get a single operation
exports.show = function (req, res) {
  Operation.get(req.params.id, function (err, operation) {
    if (err) {
      return handleError(res, err);
    }
    if (!operation) {
      return res.send(404);
    }
    return res.json(operation);
  });
};

// Creates a new operation in the DB.
exports.create = function (req, res) {
  validate(req, res, function () {
    Operation.create(req.body, function (err, operation) {
      if (err) {
        return handleError(res, err);
      }
      return res.json(201, operation);
    });
  });
};

// Updates an existing operation in the DB.
exports.update = function (req, res) {
  if (req.body.id) {
    delete req.body.id;
  }
  Operation.get(req.params.id, function (err, operation) {
    if (err) {
      return handleError(res, err);
    }
    if (!operation) {
      return res.send(404);
    }
    var updated = _.merge(operation, req.body);
    Operation.update({id: updated.id}, updated, function (err) {
      if (err) {
        return handleError(res, err);
      }
      return res.json(200, operation);
    });
  });
};

// Deletes a operation from the DB.
exports.destroy = function (req, res) {
  Operation.get(req.params.id, function (err, operation) {
    if (err) {
      return handleError(res, err);
    }
    if (!operation) {
      return res.send(404);
    }
    operation.delete(function (err) {
      if (err) {
        return handleError(res, err);
      }
      return res.send(204);
    });
  });
};

function validate(req, res, next) {
  getUserAgents(req, res, function (agentIds) {
    //check operation initiator is agent's id
    if (!_.include(agentIds, req.body.initiator)) {
      return res.send(401, {
        message: 'Access denied!'
      });
    }
    checkExecutorExist(req.body.executor, res, next);
  });
}

function checkExecutorExist(id, res, next) {
  Agent.get(id, function (err, agent) {
    if (err) {
      return handleError(res, err);
    }
    if (!agent) {
      return res.send(404);
    }

    next();
  });
}

function getUserAgents(req, res, next) {
  Agent.scan({authId: req.authId}, function (err, agents) {
    if (err) {
      return handleError(res, err);
    }
    if (!agents) {
      return res.status(404);
    }

    var agentIds = _.pluck(agents, 'id');
    next(agentIds);
  });
}

function handleError(res, err) {
  return res.send(500, err);
}
