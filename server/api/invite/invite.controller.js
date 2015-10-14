'use strict';

var _ = require('lodash');
var Invite = require('./invite.model');
var Agent = require('../agent/agent.model');
var crypto = require('crypto');

// Get list of invites
exports.index = function (req, res) {
  if (req.params.code) {
    Invite.query('code')
      .eq(req.params.code)
      .exec(function (err, invite) {
        if (err) {
          handleError(res, err);
        }
        if (!invite || invite.isDeleted) {
          return res.send(404);
        }
        if (invite.status === 'open') {
          return res.json(200, invite);
        } else if (['accepted', 'disabled', 'deleted'].indexOf(invite.status) >= 0) {
          if (invite.acceptor === req.authId || invite.owner === req.authId) {
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
    // get agents that belongs to user
    Agent.scan({authId: req.authId}, function(err, agents) {
      if (err) {
        return handleError(res, err);
      }
      if (!agents) {
        return res.status(404);
      }
      Invite.scan({}, function (err, invites) {
          if (err) {
            return handleError(res, err);
          }
          //filter deleted invites
          //filter invites that belongs to user,
          //TODO: investigate how to query dynamodb instead
          invites = _.filter(invites, function (invite) {
            return !invite.isDeleted;
          });
          var agentIds = _.pluck(agents, 'id');
          invites = _.filter(invites, function (invite) {
            return _.include(agentIds, invite.owner) || _.include(agentIds, invite.acceptor);
          });
          return res.json(200, invites);
        });
        return res.json(200, invites);
      });
  }
};

// Get a single invite
exports.show = function (req, res) {
  Invite.get(req.params.id, function (err, invite) {
    if (err) {
      return handleError(res, err);
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
    checkCanModify(req.authId, invite);
    //if (invite.acceptor) {
    //  checkAcceptor(invite.acceptor);
    //}
    restoreDeleted(invite);
    setStatus(invite);
    generateCode(invite);
  }

  if (req.body && Object.prototype.toString.call(req.body) === '[object Array]') {
    var createdItems = [];
    _.each(req.body, function (item) {
      prepareData(item);
      Invite.create(item, function (err, invite) {
        if (err) {
          return handleError(res, err);
        }
        createdItems.push(invite);
      });
      return res.json(201, createdItems);
    })
  } else {
    prepareData(req.body);
    Invite.create(req.body, function (err, invite) {
      if (err) {
        return handleError(res, err);
      }
      return res.json(201, invite);
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
      return handleError(res, err);
    }
    if (!invite) {
      return res.send(404);
    }
    checkCanModify(req.authId, invite);
    restoreDeleted(invite);
    var updated = _.merge(invite, req.body);
    updated.save(function (err) {
      if (err) {
        return handleError(res, err);
      }
      return res.json(200, invite);
    });
  });
};

// Deletes a invite from the DB.
exports.destroy = function (req, res) {
  Invite.get(req.params.id, function (err, invite) {
    if (err) {
      return handleError(res, err);
    }
    if (!invite || invite.isDeleted) {
      return res.send(404);
    }
    checkCanModify(req.authId, invite);
    invite.save(function (err) {
      if (err) {
        return handleError(res, err);
      }
      return res.send(204);
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

function checkCanModify(authId, invite) {
  if (invite.owner !== authId) {
    return res.status(401).send({
      message: 'Access denied!'
    });
  }
}

//function checkAcceptor(agentId) {
//  Agent.get(agentId, function (err, agent) {
//    if (err) {
//      handleError(res, err);
//    }
//    if (!agent || agent.isDeleted) {
//      return res.send(404);
//    }
//  });
//}

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
