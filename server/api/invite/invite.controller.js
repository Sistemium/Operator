'use strict';

var _ = require('lodash');
var Invite = require('./invite.model');
var Agent = require('../agent/agent.model');
var crypto = require('crypto');

// Get list of invites
exports.index = function (req, res) {
  // get agents that belongs to user
  Agent.scan({authId: req.authId}, function (err, agents) {
    if (err) {
      handleError(res, err);
    }
    if (!agents) {
      return res.status(404);
    }
    var agentIds = _.pluck(agents, 'id');
    if (req.query.code) {
      Invite.query({'code': {eq: req.query.code}}, function (err, invite) {
        if (err) {
          handleError(res, err);
        }
        if (!invite || invite.isDeleted) {
          return res.send(404);
        }
        if (invite.status === 'open') {
          return res.json(200, invite);
        } else if (['accepted', 'disabled', 'deleted'].indexOf(invite.status) >= 0) {
          if (_.include(agentIds, invite.acceptor) || _.include(agentIds, invite.owner)) {
            return res.json(200, invite);
          } else {
            return res.status(401).send({
              message: 'Access denied!'
            });
          }
        } else {
          return res.json(404);
        }
      });
    } else {
      // on get without code get only invites where user id in owner or acceptor
      Invite.scan({}, function (err, invites) {
        if (err) {
          handleError(res, err);
        }
        //filter deleted invites
        //filter invites that belongs to user,
        //TODO: investigate how to query dynamodb instead
        invites = _.filter(invites, function (invite) {
          return !invite.isDeleted;
        });
        invites = _.filter(invites, function (invite) {
          return _.include(agentIds, invite.owner) || _.include(agentIds, invite.acceptor);
        });
        return res.json(200, invites);
      });
    }
  });
};

// Get a single invite
exports.show = function (req, res) {
  Invite.get(req.params.id, function (err, invite) {
    if (err) {
      handleError(res, err);
    }
    if (!invite || !invite.isDeleted) {
      return res.send(404);
    }
    return res.json(invite);
  });
};

// Creates a new invite in the DB.
exports.create = function (req, res) {
  function prepareData(invite) {
    invite.isActive = true;
    setStatus(invite);
    generateCode(invite);
  }

  if (req.body && Object.prototype.toString.call(req.body) === '[object Array]') {
    var createdItems = [];
    _.each(req.body, function (item) {
      checkCanModify(res, req.authId, item, function () {
        prepareData(item);
        Invite.create(item, function (err, invite) {
          if (err) {
            handleError(res, err);
          }
          createdItems.push(invite);
        });
        return res.json(201, createdItems);
      });
    })
  } else {
    checkCanModify(res, req.authId, req.body, function () {
      prepareData(req.body);
      Invite.create(req.body, function (err, invite) {
        if (err) {
          handleError(res, err);
        }
        return res.json(201, invite);
      });
    });
  }
};

// Updates an existing invite in the DB.
exports.update = function (req, res) {
  //prevent id sending in body
  if (req.body.id) {
    delete req.body.id;
  }
  Invite.get(req.params.id, function (err, invite) {
    if (err) {
      handleError(res, err);
    }
    if (!invite) {
      return res.send(404);
    }
    checkCanModify(res, req.authId, invite, function () {
      var updated = _.merge(invite, req.body);
      setStatus(updated);
      restoreDeleted(updated);
      Invite.update({id: updated.id}, updated, function (err) {
        if (err) {
          handleError(res, err);
        }
        return res.json(200, invite);
      });
    });
  });
};

// Deletes a invite from the DB.
exports.destroy = function (req, res) {
  Invite.get(req.params.id, function (err, invite) {
    if (err) {
      handleError(res, err);
    }
    if (!invite || invite.isDeleted) {
      return res.send(404);
    }
    checkCanModify(res, req.authId, invite, function () {
      invite.isDeleted = true;
      Invite.update({id: invite.id}, invite, function (err) {
        if (err) {
          handleError(res, err);
        }
        return res.send(204);
      });
    });
  });
};

function setStatus(invite) {
  if (invite.isActive && !invite.acceptor) {
    invite.status = 'open';
  } else if (invite.isActive && invite.acceptor) {
    invite.status = 'accepted';
  } else if (!invite.isActive && invite.acceptor) {
    invite.status = 'disabled';
  } else if (!invite.isActive && !invite.acceptor) {
    invite.status = 'deleted';
  }
}

function restoreDeleted(invite) {
  if (invite.isDeleted) {
    delete invite.isDeleted;
  }
}

function checkCanModify(res, authId, invite, next) {
  var id = invite.owner;
  Agent.get(id, function (err, agent) {
    if (err) {
      handleError(res, err);
    }
    if (!agent || agent.isDeleted) {
      return res.send(404);
    }
    if (agent.authId !== authId) {
      return res.status(401).send({
        message: 'Access denied!'
      });
    }
    next();
  });
}

function generateCode(invite) {
  function randomValueHex(len) {
    return crypto.randomBytes(Math.ceil(len / 2))
      .toString('hex') // convert to hexadecimal format
      .slice(0, len);   // return required number of characters
  }

  invite.code = randomValueHex(10);
}

function handleError(res, err) {
  return res.send(500, err);
}
