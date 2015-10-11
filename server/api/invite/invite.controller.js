'use strict';

var _ = require('lodash');
var Invite = require('./invite.model');

// Get list of invites
exports.index = function (req, res) {
  Invite.scan().exec(function (err, invites) {
    if (err) {
      return handleError(res, err);
    }
    //filter deleted invites
    invites = _.filter(invites, 'isDeleted', false);
    return res.json(200, invites);
  });
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
  if (req.body && Object.prototype.toString.call(req.body) === '[object Array]') {
    var createdItems = [];
    _.each(req.body, function (item) {
      checkCanModify(item);
      restoreDeleted(item);
      Invite.create(item, function (err, invite) {
        if (err) {
          return handleError(res, err);
        }
        createdItems.push(invite);
      });
      return res.json(201, createdItems);
    })
  } else {
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
    checkCanModify(invite);
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
    checkCanModify(invite);
    invite.save(function (err) {
      if (err) {
        return handleError(res, err);
      }
      return res.send(204);
    });
  });
};

function restoreDeleted(invite) {
  if (invite.isDeleted) {
    delete invite.isDeleted;
  }
}

function checkCanModify(invite) {
  if (invite.authId !== req.authId) {
    return res.status(401).send({
      message: 'Access denied!'
    });
  }
}

function handleError(res, err) {
  return res.send(500, err);
}
