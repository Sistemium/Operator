'use strict';

var _ = require('lodash');
var Operation = require('./operation.model');
var Agent = require('../agent/agent.model');
var Account = require('../account/account.model');
var async = require('async');
var uuid = require('node-uuid');
var operationSocket = require('./operation.socket');
var HttpError = require('../../components/errors/httpError').HttpError;

// Get list of operations
// Get only operations which initiator or executor belongs to user agents
exports.index = function (req, res, next) {
  getUserAgents(req, res, function (agentIds) {
    Operation.scan({
        or: [
          {'isDeleted': {eq: false}, 'debtor': {'in': agentIds}},
          {'lender': {'in': agentIds}}
        ]
      },
      function (err, operations) {
        if (err) {
          return next(new HttpError(500, err));
        }
        return res.json(200, operations);
      });
  });
};

exports.agentOperations = function (req, res, next) {
  var agent = req.params.agent;
  if (agent) {
    Operation.scan({
      and: [
        {
          or: [
            {'debtor': agent},
            {'lender': agent}
          ]
        },
        {
          'isDeleted': false
        }
      ]
    }, function (err, operations) {
      if (err) {
        return next(new HttpError(500, err))(res, err);
      }
      return res.json(200, operations);
    });
  }
};

// Get a single operation
exports.show = function (req, res, next) {
  Operation.get(req.params.id, function (err, operation) {
    if (err) {
      return next(new HttpError(500, err));
    }
    if (!operation || operation.isDeleted) {
      return res.send(404);
    }
    return res.json(operation);
  });
};

// Creates a new operation in the DB.
exports.create = function (req, res, next) {
  var operation = req.body;
  operation.creator = req.authId;
  validate(req, function (err, agents) {
    if (err) {
      next(new HttpError(500, err));
    }
    setStatus(operation);
    Operation.create(operation, function (err, operation) {
      if (err) {
        return next(new HttpError(500, err));
      }
      // check if operation belongs to socket
      operationSocket.operationSave(operation, function (socket) {
        return agents.reduce(function (curr, next) {
          return socket.authData.id === next || curr;
        }, false);
      });
    });
    return res.json(201, operation);
  });
};

// Updates an existing operation in the DB.
exports.update = function (req, res, next) {
  if (req.body.id) {
    delete req.body.id;
  }
  Operation.get(req.params.id, function (err, operation) {
    if (err) {
      return next(new HttpError(500, err));
    }
    if (!operation) {
      return res.send(404);
    }
    var updated = _.clone(req.body);

    validate(req, function (err, agents) {
      if (err) {
        return next(new HttpError(500, err));
      }
      restoreDeleted(updated);
      setStatus(updated);
      Operation.update({id: operation.id}, updated, function (err) {
        if (err) {
          return next(new HttpError(500, err));
        }
        /**
         * TODO: find agent account with updated operation currency,
         * if no accounts, then create account with that currency,
         * if exists, update total balance in both accounts
         */
        if (updated.state === 'confirmed') {
          Account.scan({
            agent: updated.debtor,
            currency: updated.currency,
            isDeleted: false
          }, function (err, accounts) {
            if (err) {
              return next(new HttpError(500, err));
            }

            var debtorAccount;
            if (!accounts.length) {
              /**
               * When creating account for debtor total should be positive
               */
              debtorAccount = {
                id: uuid.v4(),
                agent: updated.debtor,
                currency: updated.currency,
                total: updated.total
              };
              Account.create(debtorAccount, function (err) {
                if (err) {
                  return next(new HttpError(500, err));
                }
              });
            } else {
              debtorAccount = accounts[0];
              // reduce account total when debtor
              debtorAccount.total = updated.total;
              Account.update({id: debtorAccount.id}, debtorAccount, function (err) {
                if (err) {
                  return next(new HttpError(500, err));
                }
              });
            }

          });

          Account.scan({
            agent: updated.lender,
            currency: updated.currency,
            isDeleted: false
          }, function (err, accounts) {
            if (err) {
              return next(new HttpError(500, err));
            }

            var lenderAccount;
            if (!accounts.length) {
              /**
               * When creating account for lender total should be negative
               */
              lenderAccount = {
                id: uuid.v4(),
                agent: updated.lender,
                currency: updated.currency,
                total: -updated.total
              };
              Account.create(lenderAccount, function (err) {
                if (err) {
                  return next(new HttpError(500, err));
                }
              });
            } else {
              lenderAccount = accounts[0];
              lenderAccount.total -= updated.total;
              Account.update({id: lenderAccount.id}, lenderAccount, function (err) {
                if (err) {
                  return next(new HttpError(500, err));
                }
              });
            }
          });
        }

        operationSocket.operationSave(operation, function (socket) {
          return socket.authData.id === agents[0].authId || socket.authData.id === agents[1].authId;
        });
        return res.json(200, operation);
      });
    });
  });
};

// Deletes a operation from the DB.
exports.destroy = function (req, res, next) {
  Operation.get(req.params.id, function (err, operation) {
    if (err) {
      return next(new HttpError(500, err));
    }
    if (!operation) {
      return res.send(404);
    }
    operation.delete(function (err) {
      if (err) {
        return next(new HttpError(500, err));
      }

      operationSocket.operationRemove(operation, function (socket) {
        // TODO: query operation agents
        return socket.authData.id === agents[0].authId || socket.authData.id === agents[1].authId;
      });
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

function validate(req, next) {
  async.parallel([
    function (cb) {
      checkAgentExist(req.body.lender, cb);
    },
    function (cb) {
      checkAgentExist(req.body.debtor, cb);
    }
  ], function (err, results) {
    if (err) {
      return next(err);
    }
    results = _.pluck(_.filter(results, function (i) {
      return !!i;
    }), 'authId');
    next(null, results);
  });
}

function checkAgentExist(id, cb) {
  Agent.get(id, function (err, agent) {
    if (err) {
      return cb(err);
    }
    if (!agent || agent.isDeleted) {
      return cb(null, null);
    } else {
      return cb(null, agent);
    }
  });
}

function getUserAgents(req, res, next) {
  Agent.scan({authId: req.authId}, function (err, agents) {
    if (err) {
      return next(new HttpError(500, err));
    }
    if (!agents) {
      return res.status(404);
    }

    var agentIds = _.pluck(agents, 'id');
    next(agentIds);
  });
}
