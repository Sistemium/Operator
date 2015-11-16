'use strict';

var _ = require('lodash');
var Invite = require('./invite.model');
var Agent = require('../agent/agent.model');
var Contact = require('../contact/contact.model');
var crypto = require('crypto');
var uuid = require('node-uuid');
var inviteSocket = require('./invite.socket');
var async = require('async');
var HttpError = require('../../components/errors/httpError').HttpError;

// Get list of invites
exports.index = function (req, res) {
  // get agents that belongs to user
  Agent.scan({authId: req.authId, isDeleted: false}, function (err, agents) {
    if (err) {
      handleError(res, err);
    }
    if (!agents) {
      return res.status(404);
    }
    var agentIds = _.pluck(agents, 'id');
    if (req.query.code) {
      Invite.scan({code: req.query.code, isDeleted: false}, function (err, invites) {
        if (err) {
          handleError(res, err);
        }
        if (!invites || invites.length === 0) {
          return res.send(404);
        }
        var invite = invites[0];
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
      Invite.scan({
        or: [{
          isDeleted: false,
          owner: {in: agentIds}
        }, {acceptor: {in: agentIds}}]
      }, function (err, invites) {
        if (err) {
          handleError(res, err);
        }
        return res.json(200, invites);
      });
    }
  });
};

// Get agent invites
exports.agentInvites = function (req, res) {
  var agent = req.params.agent;
  Invite.scan({owner: agent, isDeleted: false}, function (err, invites) {
    if (err) {
      return handleError(res, err);
    }

    return res.json(200, invites);
  });
};

// Get a single invite
exports.show = function (req, res) {
  Invite.get(req.params.id, function (err, invite) {
    if (err) {
      handleError(res, err);
    }
    if (!invite || invite.isDeleted) {
      return res.send(404);
    }
    return res.json(invite);
  });
};

// Creates a new invite in the DB.
exports.create = function (req, res, next) {
  function prepareData(invite) {
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
    async.waterfall([
      function (cb) {
        checkCanModify(req.authId, req.body, function (err, agents) {
          if (err) {
            cb(err);
          }
          cb(null, agents);
        });
      },
      function (agents, cb) {
        prepareData(req.body);
        Invite.create(req.body, function (err, invite) {
          if (err) {
            cb(err);
          }
          inviteSocket.inviteSave(invite, function (socket, agents) {
            return socket.authData.id === agents[0].authId
              || socket.authData.id === agents[1].authId;
          });
          cb(null, invite);
        });
      }
    ], function (err, result) {
      if (err) {
        return next(new HttpError(500, err));
      }
      return res.json(201, result);
    });
  }
};

// Updates an existing invite in the DB.
exports.update = function (req, res) {
  //prevent id sending in body
  if (req.body.id) {
    delete req.body.id;
  }
  async.waterfall([
    function (cb) {
      Invite.get(req.params.id, function (err, invite) {
        if (err) {
          cb(err);
        }
        if (!invite) {
          cb(404);
        }
        cb(null, invite);
      });
    },
    function (invite, cb) {
      checkCanModify(req.authId, invite, function (err, agents) {
        if (err) {
          cb(err);
        }
        cb(null, agents, invite.id);
      });
    },
    function (agents, id, cb) {
      var updated = _.clone(req.body);
      setStatus(updated);
      restoreDeleted(updated);

      Invite.update({id: id}, updated, function (err) {
        if (err) {
          cb(err);
        }
        updated.id = id;
        if (updated.status === 'accepted') {
          console.log('Invite accepted');
          var contacts = [{
            id: uuid.v4(),
            owner: updated.owner,
            agent: updated.acceptor,
            invite: updated.id
          }, {
            id: uuid.v4(),
            owner: updated.acceptor,
            agent: updated.owner,
            invite: updated.id
          }];
          Contact.batchPut(contacts, function (err) {
            if (err) return handleError(res, err);
            console.log('Contacts created for agent and counter agent');
          });
        }
        inviteSocket.inviteSave(updated, function (socket, agents) {
          return socket.authData.id === agents[0].authId
            || socket.authData.id === agents[1].authId;
        });
        cb(null, updated);

      });
    }
  ], function (err, updated) {
    if (err) {
      return next(new HttpError(err));
    }
    return res.json(updated);
  })
};


// Deletes a invite from the DB.
exports.destroy = function (req, res, next) {
  async.waterfall([
    function (cb) {
      Invite.get(req.params.id, function (err, invite) {
        if (err) {
          cb(err);
        }
        if (!invite || invite.isDeleted) {
          cb(null, null);
        }
        cb(null, invite);
      });
    },
    function (invite, cb) {
      checkCanModify(req.authId, invite, function (agents) {
        invite.isDeleted = true;
        var updated = _.clone(invite);
        delete updated.id;
        Invite.update({id: invite.id}, updated, function (err) {
          if (err) {
            cb(err);
          }
          inviteSocket.inviteRemove(invite, function (socket) {
            return socket.authData.id === agents[0].authId
              || socket.authData.id === agents[1].authId;
          });
          cb(null, null);
        });
      });
    }
  ], function (err) {
    if (err) {
      return next(new HttpError(500, err));
    }
    return res.send(204);
  });
};

function setStatus(invite) {
  if (!invite.isDeleted && !invite.acceptor) {
    invite.status = 'open';
  } else if (!invite.isDeleted && invite.acceptor) {
    invite.status = 'accepted';
  } else if (invite.isDeleted && invite.acceptor) {
    invite.status = 'disabled';
  } else if (invite.isDeleted && !invite.acceptor) {
    invite.status = 'deleted';
  }
}

function restoreDeleted(invite) {
  if (invite.isDeleted) {
    delete invite.isDeleted;
  }
}

function checkCanModify(authId, invite, next) {
  var owner = invite.owner;
  var acceptor = invite.acceptor;

  function getAgent(id, callback) {
    Agent.get(id, function (err, agent) {
      if (err) {
        callback(err);
      } else if (!agent || agent.isDeleted) {
        callback(null, null);
      } else if (agent.authId !== authId) {
        callback(401);
      } else {
        callback(null, agent);
      }
    });
  }

  async.parallel([
    function (callback) {
      getAgent(owner, callback);
    },
    function (callback) {
      getAgent(acceptor, callback);
    }
  ], function (err, results) {
    if (err) {
      console.log(err);
      next(err);
    }

    var filtered = _.filter(results, function (item) {
      return item !== null;
    });
    next(null, filtered);
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
