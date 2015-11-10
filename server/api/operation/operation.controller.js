'use strict';

var _ = require('lodash');
var Operation = require('./operation.model');
var Agent = require('../agent/agent.model');

// Get list of operations
// Get only operations which initiator or executor belongs to user agents
exports.index = function (req, res) {
  getUserAgents(req, res, function (agentIds) {
    Operation.scan({
        or: [
          {'isDeleted': {eq: false}, 'debtor': {'in': agentIds}},
          {'lender': {'in': agentIds}}
        ]
      },
      function (err, operations) {
        if (err) {
          return handleError(res, err);
        }
        return res.json(200, operations);
      });
  });
};

exports.agentOperations = function (req, res) {
  var agent = req.params.agent;
  if (agent) {
    Operation.scan({
      or: [
        {'debtor': agent},
        {'lender': agent}
      ]
    }, function (err, operations) {
      if (err) {
        return handleError(res, err);
      }
      return res.json(200, operations);
    });
  }
};

// Get a single operation
exports.show = function (req, res) {
  Operation.get(req.params.id, function (err, operation) {
    if (err) {
      return handleError(res, err);
    }
    if (!operation || operation.isDeleted) {
      return res.send(404);
    }
    return res.json(operation);
  });
};

// Creates a new operation in the DB.
exports.create = function (req, res) {
  var operation = req.body;
  operation.creator = req.authId;
  validate(req, res, function () {
    setStatus(operation);
    Operation.create(operation, function (err, operation) {
      if (err) {
        return handleError(res, err);
      }
      console.log(operation);
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
    var updated = _.clone(req.body);
    restoreDeleted(updated);
    setStatus(updated);
    Operation.update({id: operation.id}, updated, function (err) {
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

function restoreDeleted(operation) {
  if (operation.isDeleted) {
    delete operation.isDeleted;
  }
}

function setStatus(operation) {
  if ((operation.debtorConfirmedAt && !operation.lenderConfirmedAt)
  || (!operation.debtorConfirmedAt && operation.lenderConfirmedAt)) {
    operation.state = 'waitingForConfirm';
  } else if (operation.debtorConfirmedAt && operation.lenderConfirmedAt) {
    operation.state = 'confirmed';
  }
}

function validate(req, res, next) {
  getUserAgents(req, res, function (agentIds) {
    //check operation initiator is agent's id
    //TODO check lender
    //if (!_.include(agentIds, req.body.lender)) {
    //  return res.send(401, {
    //    message: 'Access denied!'
    //  });
    //}
    checkDebtorExist(req.body.debtor, res, next);
  });
}

function checkDebtorExist(id, res, next) {
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
