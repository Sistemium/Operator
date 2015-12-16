'use strict';

var _ = require('lodash');
var Invite = require('./invite.model').dynamoose;
var InviteVogels = require('./invite.model').vogels;
var Agent = require('../agent/agent.model');
var Contact = require('../contact/contact.model');
var crypto = require('crypto');
var uuid = require('node-uuid');
var socketService = require('../../socket/socket');
var async = require('async');
var HttpError = require('../../components/errors/httpError').HttpError;

// Get list of invites
exports.index = (req, res, next) => {
  // get agents that belongs to user
  Agent.scan({authId: req.authId, isDeleted: false}, (err, agents) => {
    if (err) {
      return next(new HttpError(500, err));
    }
    if (!agents) {
      return next(new HttpError(404, 'agents not found'));
    }
    var agentIds = _.pluck(agents, 'id');
    if (agentIds.length) {
      let tempStr = '';
      let attrVal = {};
      agentIds.forEach(function (id, index) {
        let key = ':val' + index;
        tempStr += key + ',';
        attrVal[key] = id;
      });
      attrVal[':false'] = 'false';
      tempStr = tempStr.slice(0, -1);
      let expression = '#owner IN (' + tempStr + ') AND #isDeleted = :false OR #acceptor IN (' + tempStr + ') AND #isDeleted = :false';
      InviteVogels.scan()
        .filterExpression(expression)
        .expressionAttributeValues(attrVal)
        .expressionAttributeNames({'#owner': 'owner', '#acceptor': 'acceptor', '#isDeleted': 'isDeleted'})
        .exec(function (err, invites) {
          if (err) {
            return next(new HttpError(500, err));
          }
          return res.json(200, invites.Items);
        });
    } else {
      return res.json([]);
    }
  });
};

// Get agent invites
exports.agentInvites = (req, res, next) => {
  var agent = req.params.agent;

  InviteVogels.scan()
    .filterExpression('#owner = :agent AND #isDeleted = :false OR #acceptor = :agent AND #isDeleted = :false')
    .expressionAttributeValues({':agent': agent, ':false': 'false'})
    .expressionAttributeNames({'#owner': 'owner', '#acceptor': 'acceptor', '#isDeleted': 'isDeleted'})
    .exec((err, invites) => {
      if (err) {
        return next(new HttpError(500, err));
      }
      return res.json(200, invites.Items);
    });
};

// Get a single invite
exports.show = (req, res, next) => {
  Invite.get(req.params.id, (err, invite) => {
    if (err) {
      return next(new HttpError(500, err));
    }
    if (!invite || invite.isDeleted) {
      return next(new HttpError(404, 'invite not found'));
    }
    return res.json(invite);
  });
};

exports.findByCode = (req, res, next) => {
  // get agents that belongs to user
  Agent.scan({authId: req.authId, isDeleted: false}, (err, agents) => {
    if (err) {
      return next(new HttpError(500, err));
    }
    if (!agents) {
      return next(new HttpError(404, 'agents not found'));
    }
    var agentIds = _.pluck(agents, 'id');
    if (req.params.code) {
      Invite.scan({'code': req.params.code, 'isDeleted': false}, function (err, invites) {
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
    }
  });
};


// Creates a new invite in the DB.
exports.create = (req, res, next) => {
  function prepareData(invite) {
    invite.id = uuid.v4();
    setStatus(invite);
    generateCode(invite);
  }

  if (req.body && Object.prototype.toString.call(req.body) === '[object Array]') {
    var createdItems = [];
    _.each(req.body, (item) => {
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
      (cb) => {
        checkCanModify(req.body, (err, agents) => {
          if (err) {
            cb(err);
          }
          cb(null, agents);
        });
      },
      (agents, cb) => {
        prepareData(req.body);
        Invite.create(req.body, (err, invite) => {
          if (err) {
            cb(err);
          }
          let socketData = _.extend(invite, {
            resource: 'invites'
          });
          socketService.save(socketData, (socket) => {
            return agents.reduce((curr, next) => {
              return socket.authData.id === next || curr;
            }, false);
          });
          cb(null, invite);
        });
      }
    ], (err, result) => {
      if (err) {
        return next(new HttpError(500, err));
      }
      return res.json(201, result);
    });
  }
};

// Updates an existing invite in the DB.
exports.update = (req, res, next) => {
  var getInviteById = (cb) => {
    Invite.get(req.params.id, (err, invite) => {
      if (err) {
        cb(err);
      }
      if (!invite) {
        cb(404);
      }
      cb(null, invite.id);
    });
  };

  var checkInviteAgents = (id, cb) => {
    checkCanModify(req.body, (err, agents) => {
      if (err) {
        cb(err);
      }
      cb(null, agents, id);
    });
  };

  var checkIfHaveContact = (agents, inviteId, cb) => {
    if (!req.body.acceptor) {
      return cb(null, agents, inviteId);
    }
    Invite.scan({
      owner: req.body.owner,
      acceptor: req.body.acceptor,
      isDeleted: false
    }, (err, inv) => {
      if (err) {
        return cb(err);
      }

      if (!inv || !inv.length) {
        return cb(null, agents, inviteId);
      }
      console.log('Invite already accepted!');
      cb({status: 403, message: 'Already accepted'});
    });
  };

  var updateInvite = (agents, id, cb) => {
    var updated = _.clone(req.body);
    setStatus(updated);
    restoreDeleted(updated);

    Invite.update({id: id}, updated, (err) => {
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
          //TODO sync counterAgents
          // send counterAgents to created contacts
          let socketData = _.extend(contacts, {
            resource: 'contacts'
          });

          socketService.save(socketData, (socket) => {
            let sendMessage = agents.reduce((curr, next) => {
              return socket.authData.id === next || curr;
            }, false);
            return sendMessage;
          })
        });
      }
      //return socket only where socket authId equal invite owner or acceptor authId
      let socketData = _.extend(updated, {
        resource: 'invites'
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
      cb(null, updated);
    });
  };

  //prevent id sending in body
  if (req.body.id) {
    delete req.body.id;
  }
  async.waterfall([
    //get invite by id
    getInviteById,
    // check invite agents, acceptor and owner
    checkInviteAgents,
    // check if acceptor have invite owner as contact
    checkIfHaveContact,
    // update invite and send message to socket
    updateInvite
  ], (err, updated) => {
    if (err) {
      return next(new HttpError(err.status, err.message));
    }
    return res.json(updated);
  })
};

// Deletes a invite from the DB.
exports.destroy = (req, res, next) => {
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
      checkCanModify(invite, function (err, agents) {
        if (err) {
          return next(new HttpError(500, err));
        }
        invite.isDeleted = true;
        setStatus(invite);
        var updated = _.clone(invite);
        delete updated.id;
        Invite.update({id: invite.id}, updated, function (err) {
          if (err) {
            cb(err);
          }
          let socketData = _.extend(updated, {
            resource: 'invites',
            id: invite.id
          });
          socketService.remove(socketData, function (socket) {
            return agents.reduce(function (curr, next) {
              return socket.authData.id === next || curr;
            }, false);
          });
          cb(null, null);
        });
      });
    }
  ], (err) => {
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
    Agent.get(id, (err, agent) => {
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
    (callback) => {
      getAgent(owner, callback);
    },
    (callback) => {
      getAgent(acceptor, callback);
    }
  ], (err, results) => {
    if (err) {
      next(err);
    }

    var filtered = _.pluck(_.filter(results, (item) => {
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
