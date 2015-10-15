'use strict';

var _ = require('lodash');
var Contact = require('./contact.model');
var Agent = require('../agent/agent.model');
var Invite = require('../invite/invite.model');
var q = require('q');

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
      Contact.create(req.body, function (err, contact) {
        if (err) {
          handleError(res, err);
        }
        return res.json(201, contact);
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
    checkCanModify(contact);
    restoreDeleted(contact);
    if (contact.isDeleted) {
      delete contact.isDeleted;
    }
    var updated = _.merge(contact, req.body);
    updated.save(function (err) {
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
    checkCanModify(contact);
    contact.isDeleted = true;
    contact.save(function (err) {
      if (err) {
        handleError(res, err);
      }
      return res.send(204);
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
    checkAgent(res, contact.owner),
    checkAgent(res, contact.agent),
    checkInvite(res, contact.invite)
  ]).then(function (invite) {
    var cntInfo = {
      invite: invite[2],
      owner: contact.owner,
      agent: contact.agent
    };
    next(cntInfo);
  });
}

function checkAgent(res, agentId) {
  var deferred = q.defer();
  Agent.get(agentId, function (err, agent) {
    if (err) {
      handleError(res, err);
    }
    if (!agent || agent.isDeleted) {
      return res.status(404);
    }
    deferred.resolve();
  });
  return deferred.promise;
}

function checkInvite(res, inviteCode) {
  var deferred = q.defer();
  Invite.query({'code': {eq: inviteCode}}, function (err, invite) {
    if (err) {
      handleError(res, err);
    }
    if (!invite || invite.isDeleted || !invite.isActive) {
      return res.status(404);
    }
    if (invite.status !== 'open') {
      return res.status(401).send({
        message: 'Access denied!'
      });
    }
    deferred.resolve(invite);
  });
  return deferred.promise;
}

function handleError(res, err) {
  return res.send(500, err);
}
