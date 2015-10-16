'use strict';

var _ = require('lodash');
var Contact = require('./contact.model');
var Agent = require('../agent/agent.model');
var Invite = require('../invite/invite.model');
var q = require('q');
var uuid = require('node-uuid');

// Get list of contacts
exports.index = function (req, res) {
  Contact.scan().exec(function (err, contacts) {
    if (err) {
      handleError(res, err);
    }
    contacts = _.filter(contacts, 'isDeleted', false);
    return res.json(200, contacts);
  });
};

// Get a single contact
exports.show = function (req, res) {
  Contact.get(req.params.id, function (err, contact) {
    if (err) {
      handleError(res, err);
    }
    if (!contact || !contact.isDeleted) {
      return res.send(404);
    }
    return res.json(contact);
  });
};

// Creates a new contact in the DB.
exports.create = function (req, res) {
  if (req.body && Object.prototype.toString.call(req.body) === '[object Array]') {
    var createdItems = [];
    _.each(req.body, function (item) {
      checkCanModify(res, item, function () {
        Contact.create(item, function (err, contact) {
          if (err) {
            handleError(res, err);
          }
          createdItems.push(contact);
        });
      });
    });
    return res.json(201, createdItems);
  } else {
    checkCanModify(res, req.body, function (cntInfo) {
      var invite = cntInfo.invite;
      invite.acceptor = cntInfo.owner;
      Invite.update({id: invite.id}, invite, function(err) {
        if (err) {
          handleError(res, err);
        }
        Contact.create(req.body, function (err, contact) {
          if (err) {
            handleError(res, err);
          }
          var respondingContact = {
            id: uuid.v4(),
            owner: invite.owner,
            agent: cntInfo.owner,
            invite: invite.id
          };
          Contact.create(respondingContact, function (err, resContact) {
            if (err) {
              handleError(res, err);
            }
            if (resContact) {
              return res.json(201, contact);
            }
          });
        });
      });
    });
  }
};

// Updates an existing contact in the DB.
exports.update = function (req, res) {
  if (req.body.id) {
    delete req.body.id;
  }
  Contact.get(req.params.id, function (err, contact) {
    if (err) {
      handleError(res, err);
    }
    if (!contact) {
      return res.send(404);
    }

    var updated = _.merge(contact, req.body);
    checkCanModify(contact);
    restoreDeleted(contact);
    Contact.update({id: updated.id}, updated, function (err) {
      if (err) {
        handleError(res, err);
      }
      return res.json(200, contact);
    });
  });
};

// Deletes a contact from the DB.
exports.destroy = function (req, res) {
  Contact.get(req.params.id, function (err, contact) {
    if (err) {
      handleError(res, err);
    }
    if (!contact || contact.isDeleted) {
      return res.send(404);
    }
    checkCanModify(res, contact, function () {
      contact.isDeleted = true;
      Contact.update({id: contact.id}, contact, function (err) {
        if (err) {
          handleError(res, err);
        }
        return res.send(204);
      });
    });
  });
};

function restoreDeleted(contact) {
  if (contact.isDeleted) {
    delete contact.isDeleted;
  }
}

function checkCanModify(res, contact, next) {

  q.all([
    checkAgent(contact.owner),
    checkAgent(contact.agent),
    checkInvite(contact.invite)
  ]).then(function (invite) {
    var cntInfo = {
      invite: invite[2],
      owner: contact.owner,
      agent: contact.agent
    };
    next(cntInfo);
  }, function (status, message) {
    return res.send(status, message);
  });
}

function checkAgent(agentId) {
  var deferred = q.defer();
  Agent.get(agentId, function (err, agent) {
    if (err) {
      deferred.reject(500, err);
      return;
    }
    if (!agent || agent.isDeleted) {
      deferred.reject(404);
      return;
    }
    deferred.resolve();
  });
  return deferred.promise;
}

function checkInvite(inviteCode) {
  var deferred = q.defer();
  Invite.query({'code': {eq: inviteCode}}, function (err, invite) {
    if (err) {
      deferred.reject(500, err);
      return;
    }
    if (!invite || invite.isDeleted || !invite.isActive) {
      deferred.reject(404);
      return;
    }
    if (invite.status !== 'open') {
      deferred.reject(401, {
        message: 'Access denied!'
      });
      return;
    }
    deferred.resolve(invite);
  });
  return deferred.promise;
}

function handleError(res, err) {
  return res.send(500, err);
}
