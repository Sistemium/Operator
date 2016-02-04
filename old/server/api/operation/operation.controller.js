'use strict';

let _ = require('lodash')
  , Operation = require('./operation.model.js').dynamoose
  , OperationVogels = require('./operation.model.js').vogels
  , Agent = require('../agent/agent.model.js')
  , Account = require('../account/account.model.js')
  , async = require('async')
  , uuid = require('node-uuid')
  , socketService = require('../../socket/socket')
  , HttpError = require('../../components/errors/httpError').HttpError
  , changelog = require('../../components/changelogs/changelog')
  , operationChangelog = changelog.operationChangelog()
  , co = require('co');

// Get list of operations
// Get only operations which initiator or executor belongs to user agents
exports.index = function (req, res, next) {
  getUserAgents(req, res, function (agentIds) {
    if (agentIds.length === 0) {
      return res.json(200, []);
    }
    let tempStr = '', attrVal = {};
    agentIds.forEach(function (id, index) {
      let key = ':val' + index;
      tempStr += key + ',';
      attrVal[key] = id;
    });
    attrVal[':false'] = 'false';
    tempStr = tempStr.slice(0, -1);
    let expression = '#isDeleted = :false AND #debtor IN (' + tempStr + ') OR #isDeleted = :false AND #lender IN (' + tempStr + ')';
    OperationVogels.scan()
      .filterExpression(expression)
      .expressionAttributeValues(attrVal)
      .expressionAttributeNames({'#debtor': 'debtor', '#lender': 'lender', '#isDeleted': 'isDeleted'})
      .exec(function (err, operations) {
        if (err) {
          return next(new HttpError(500, err));
        }
        return res.json(200, operations.Items);
      });
  });
};

exports.agentOperations = function (req, res, next) {
  var agent = req.params.agent;
  if (agent) {
    OperationVogels.scan()
      .filterExpression('#debtor = :agent AND #isDeleted = :false OR #lender = :agent AND #isDeleted = :false')
      .expressionAttributeValues({':agent': agent, ':false': 'false'})
      .expressionAttributeNames({'#debtor': 'debtor', '#lender': 'lender', '#isDeleted': 'isDeleted'})
      .exec(function (err, operations) {
        if (err) {
          return next(new HttpError(500, err));
        }
        return res.json(200, operations.Items);
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
  req.body.id = uuid.v4();
  validate(req, function (err, agents) {
    if (err) {
      return next(new HttpError(500, err));
    }
    setStatus(operation);
    Operation.create(operation, function (err, operation) {
      if (err) {
        return next(new HttpError(500, err));
      }

      var changeRecord = {
        'id': operation.id,
        'guid': uuid.v4()
      };

      operationChangelog.push(`${changeRecord.guid}:${changeRecord.id}`);
      // check if operation belongs to socket
      socketService.save(_.extend(operation, {
        changelogGuid: changeRecord.guid,
        resource: 'operations'
      }), function (socket) {
        console.info(JSON.stringify(agents));
        console.info('###################');
        console.info(socket.authData.id);
        console.info('###################');
        let sendMessage = agents.reduce(function (curr, next) {
          return socket.authData.id === next || curr;
        }, false);
        console.info(sendMessage);
        return sendMessage;
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
        return next(new HttpError(404, 'not found'));
      }
      if (operation) {
        if (operation.state === 'confirmed') {
          return next(new HttpError(400, 'operation already confirmed'));
        }
      }
      var updated = _.clone(req.body);

      function checkDebtorAccount() {
        return new Promise(function (resolve) {
          Account.scan({
            agent: updated.debtor,
            currency: updated.currency,
            isDeleted: false
          }, function (err, accounts) {
            if (err) {
              return next(new HttpError(500, err));
            }

            let debtorAccount;
            if (!accounts.length) {
              /**
               * When creating account for debtor total should be positive
               */
              console.log(req.authId);
              debtorAccount = {
                id: uuid.v4(),
                authId: req.authId,
                agent: updated.debtor,
                currency: updated.currency,
                total: updated.total
              };
              Account.create(debtorAccount, function (err) {
                if (err) {
                  return next(new HttpError(500, err));
                }
                console.info('Account was created: ' + JSON.stringify(debtorAccount));
                let socketData = _.extend(debtorAccount, {
                  resource: 'accounts'
                });
                socketService.save(socketData, (socket) => {
                  console.info(`Account emitted with ${socketData}`);
                  return socket.authData.id === debtorAccount.authId;
                });

                resolve(debtorAccount.id);
              });
            } else {
              debtorAccount = accounts[0];
              let id = debtorAccount.id;
              // reduce account total when debtor
              debtorAccount.total += Number(updated.total);
              delete debtorAccount.id;
              Account.update({id: id}, debtorAccount, function (err) {
                if (err) {
                  return next(new HttpError(500, err));
                }
                console.info('Account was updated ' + JSON.stringify(debtorAccount));
                let socketData = _.extend(debtorAccount, {
                  resource: 'accounts'
                });
                socketService.save(socketData, (socket) => {
                  return socket.authData.id === debtorAccount.authId;
                });
                resolve(id);
              });
            }
          });
        });
      }

      function checkLenderAccount() {
        return new Promise(function (resolve) {
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
                authId: req.authId,
                agent: updated.lender,
                currency: updated.currency,
                total: -updated.total
              };
              Account.create(lenderAccount, function (err) {
                if (err) {
                  return next(new HttpError(500, err));
                }
                console.info('Account was created ' + JSON.stringify(lenderAccount));
                let socketData = _.extend(lenderAccount, {
                  resource: 'accounts'
                });
                socketService.save(socketData, (socket) => {
                  return socket.authData.id === socketData.authId;
                });
                resolve(lenderAccount.id);
              });
            } else {
              lenderAccount = accounts[0];
              let id = lenderAccount.id;
              lenderAccount.total -= Number(updated.total);
              delete lenderAccount.id;
              Account.update({id: id}, lenderAccount, function (err) {
                if (err) {
                  return next(new HttpError(500, err));
                }
                console.info('Account was updated ' + JSON.stringify(lenderAccount));
                let socketData = _.extend(lenderAccount, {
                  resource: 'accounts'
                });
                socketService.save(socketData, (socket) => {
                  return socket.authData.id === socketData.authId;
                });
                resolve(id);
              });
            }
          });
        });
      }

      function updateOperation(agents) {
        return new Promise(function (resolve) {
          Operation.update({id: operation.id}, updated, function (err) {
            if (err) {
              return next(new HttpError(500, err));
            }

            updated.id = operation.id;
            /**
             * TODO: find agent account with updated operation currency,
             * if no accounts, then create account with that currency,
             * if exists, update total balance in both accounts
             */

            var changeRecord = {
              'id': operation.id,
              'guid': uuid.v4()
            };

            operationChangelog.push(`${changeRecord.guid}:${changeRecord.id}`);

            let socketData = _.extend(updated, {
              resource: 'operations'
            });
            socketService.save(socketData, (socket) => {
              console.info('Check socket have access to emit event...');
              console.info(JSON.stringify(agents));
              console.info('###################');
              console.info(socket.authData.id);
              console.info('###################');
              let sendMessage = agents.reduce((curr, next) => {
                return socket.authData.id === next || curr;
              }, false);
              console.info(sendMessage);
              return sendMessage;
            });
            resolve(updated);
          });
        });
      }

      validate(req, function (err, agents) {
        if (err) {
          return next(new HttpError(500, err));
        }
        restoreDeleted(updated);
        setStatus(updated);
        co(function *() {
          try {
            let lenderAccountId, debtorAccountId;
            if (updated.state === 'confirmed') {
              console.log(req.authId);
              debtorAccountId = yield checkDebtorAccount();
              lenderAccountId = yield checkLenderAccount();
            }
            updated.debtorAccount = debtorAccountId;
            updated.lenderAccount = lenderAccountId;
            let result = yield updateOperation(agents);
            return res.json(200, result);
          } catch (error) {
            console.error(error.message);
          }
        }).catch(function (err) {
          console.error(err.stack);
        });
      });
    }
  )
  ;
}
;

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

      var changeRecord = {
        'id': operation.id,
        'guid': uuid.v4()
      };

      operationChangelog.push(`${changeRecord.guid}:${changeRecord.id}`);
      let socketData = _.extend(operation, {
        resource: 'operations'
      });
      socketService.remove(socketData, function (socket) {
        // TODO: query operation agents
        return socket.authData.id === agents[0].authId || socket.authData.id === agents[1].authId;
      });
      return res.send(204);
    });
  });
};

exports.changelog = function (req, res) {
  changelog.getChangelog(operationChangelog, req, res);
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
