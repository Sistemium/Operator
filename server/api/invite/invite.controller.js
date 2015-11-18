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
exports.index = function (req, res, next) {
  // get agents that belongs to user
  Agent.scan({authId: req.authId, isDeleted: false}, function (err, agents) {
    if (err) {
      return next(new HttpError(500, err));
    }
    if (!agents) {
      return next(new HttpError(404, 'agents not found'));
    }
    var agentIds = _.pluck(agents, 'id');
    if (req.query.code) {
      Invite.scan({'code': req.query.code, 'isDeleted': false}, function (err, invites) {
        if (err) {
          return next(new HttpError(500, err));
        }
        if (!invites || invites.length === 0) {
          return next(new HttpError(404, 'invites not found'));
        }
        var invite = invites[0];
        if (invite.status === 'open') {
          return res.json(200, invite);
        } else if (['accepted', 'disabled', 'deleted'].indexOf(invite.status) >= 0) {
          if (_.include(agentIds, invite.acceptor) || _.include(agentIds, invite.owner)) {
            return res.json(200, invite);
          } else {
            return next(new HttpError(401, 'Access denied!'));
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
          return next(new HttpError(500, err));
        }
        return res.json(200, invites);
      });
    }
  });
};

// Get agent invites
exports.agentInvites = function (req, res, next) {
  var agent = req.params.agent;

  Invite.scan({
    // TODO: this not works
    and: [
      //{'isDeleted': false}, returns all records that have false
      {'or': [{'owner': agent, 'acceptor': agent}]}
    ]
  }, function (err, invites) {
    if (err) {
      return next(new HttpError(500, err));
    }
    return res.json(200, invites);
  });
};

// Get a single invite
exports.show = function (req, res, next) {
  Invite.get(req.params.id, function (err, invite) {
    if (err) {
      return next(new HttpError(500, err));
    }
    if (!invite || invite.isDeleted) {
      return next(new HttpError(404, 'invite not found'));
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
      checkCanModify(item, function () {
        prepareData(item);
        Invite.create(item, function (err, invite) {
          if (err) {
            return next(new HttpError(500, err))
          }
          createdItems.push(invite);
        });
        return res.json(201, createdItems);
      });
    })
  } else {
    async.waterfall([
      function (cb) {
        checkCanModify(req.body, function (err, agents) {
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
          inviteSocket.inviteSave(invite, function (socket) {
            return agents.reduce(function (curr, next) {
              return socket.authData.id === next || curr;
            }, false);
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
exports.update = function (req, res, next) {
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
      checkCanModify(invite, function (err, agents) {
        if (err) {
          cb(err);
        }
        cb(null, agents, invite.id);
      });
    },
    function (agents, inviteId, cb) {
      // check if acceptor have invite owner as contact
      if (!req.body.acceptor) {
        return cb(null, agents, inviteId);
      }
      Invite.scan({
        owner: req.body.owner,
        acceptor: req.body.acceptor,
        isDeleted: false
      }, function (err, inv) {
        if (err) {
          return cb(err);
        }

        if (!inv || !inv.length) {
          return cb(null, agents, inviteId);
        }
        console.log('Invite already accepted!');
        cb({status: 403, message: 'Already accepted'});
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
            if (err) return next(new HttpError(500, err));
            console.log('Contacts created for agent and counter agent');
          });
        }
        //return socket only where socket authId equal invite owner or acceptor authId
        inviteSocket.inviteSave(updated, function (socket) {
          var bool = agents.reduce(function (curr, next) {
            return socket.authData.id === next || curr;
          }, false);
          return bool;
        });
        cb(null, updated);

      });
    }
  ], function (err, updated) {
    if (err) {
      return next(new HttpError(err.status, err.message));
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
      checkCanModify(invite, function (agents) {
        invite.isDeleted = true;
        var updated = _.clone(invite);
        delete updated.id;
        Invite.update({id: invite.id}, updated, function (err) {
          if (err) {
            cb(err);
          }
          inviteSocket.inviteRemove(invite, function (socket) {
            return agents.reduce(function (curr, next) {
              return socket.authData.id === next || curr;
            }, false);
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

function checkCanModify(invite, next) {
  var owner = invite.owner;
  var acceptor = invite.acceptor;

  function getAgent(id, callback) {
    if (!id) {
      return callback(null, null);
    }
    Agent.get(id, function (err, agent) {
      if (err) {
        callback(err);
      } else if (!agent || agent.isDeleted) {
        callback(null, null);
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

    var filtered = _.pluck(_.filter(results, function (item) {
      return item !== null;
    }), 'authId');
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
