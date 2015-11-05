'use strict';

var _ = require('lodash');
var Account = require('./account.model');
var Agent = require('../agent/agent.model');
var uuid = require('node-uuid');

// Get list of accounts
exports.index = function (req, res) {
  Account.scan({authId: req.authId, agent: req.query.agent, isDeleted: false}, function (err, accounts) {
    if (err) {
      return handleError(res, err);
    }
    return res.json(200, accounts);
  });
};

// Get a single account
exports.show = function (req, res) {
  Account.get(req.params.id, function (err, account) {
    if (err) {
      return handleError(res, err);
    }
    if (!account || account.isDeleted) {
      return res.send(404);
    }
    return res.json(account);
  });
};

// Creates a new account in the DB.
exports.create = function (req, res) {
  if (req.body && Object.prototype.toString.call(req.body) === '[object Array]') {
    var createdItems = [];
    _.each(req.body, function (item) {
      checkCanModify(res, item, req.authId);
      Account.create(item, function (err, account) {
        if (err) {
          return handleError(res, err);
        }
        createdItems.push(account);
      });
      return res.json(201, createdItems);
    });
  } else {
    req.body.id = req.body.id ? req.body.id : uuid.v4();
    checkCanModify(res, req.body, req.authId);
    Account.create(req.body, function (err, account) {
      if (err) {
        return handleError(res, err);
      }
      return res.json(201, account);
    });
  }
};

// Updates an existing account in the DB.
exports.update = function (req, res) {
  //prevent id sending in body
  if (req.body.id) {
    delete req.body.id;
  }
  Account.get(req.params.id, function (err, account) {
    if (err) {
      return handleError(res, err);
    }
    if (!account) {
      return res.send(404);
    }
    //check if user can update entity
    checkCanModify(res, account, req.authId);
    //restore item if it was deleted
    restoreDeleted(account);
    var updated = _.merge(account, req.body);
    Account.update({id: account.id}, req.body, function (err) {
      if (err) {
        return handleError(res, err);
      }
      return res.json(200, updated);
    });
  });
};

// Deletes a account from the DB.
exports.destroy = function (req, res) {
  Account.get(req.params.id, function (err, account) {
    if (err) {
      return handleError(res, err);
    }
    if (!account || account.isDeleted) {
      return res.send(404);
    }
    //check if user can delete entity
    checkCanModify(res, account, req.authId);
    account.isDeleted = true;
    var updated = _.clone(account);
    delete updated.id;
    Account.update({id: account.id}, updated, function (err) {
      if (err) {
        return handleError(res, err);
      }
      return res.send(204);
    });
  });
};

function restoreDeleted(account) {
  if (account.isDeleted) {
    delete account.isDeleted;
  }
}

function checkCanModify(res, account, authId) {
  if (account.authId !== authId) {
    return res.status(401).send({
      message: 'Access denied!'
    });
  }
  checkAgent(res, account, authId);
}

function checkAgent(res, account, authId) {
  Agent.get(account.agent, function (err, agent) {
    if (err) {
      return handleError(res, err);
    }
    if (!agent) {
      return res.send(404);
    }

    // check if authorised user's agent
    if (agent.authId !== authId) {
      return res.send(401, {
        message: 'Access denied!'
      });
    }
  });
}

function handleError(res, err) {
  return res.send(500, err);
}
