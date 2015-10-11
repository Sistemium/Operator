'use strict';

var _ = require('lodash');
var Contact = require('./contact.model');

// Get list of contacts
exports.index = function (req, res) {
  Contact.scan().exec(function (err, contacts) {
    if (err) {
      return handleError(res, err);
    }
    contacts = _.filter(contacts, 'isDeleted', false);
    return res.json(200, contacts);
  });
};

// Get a single contact
exports.show = function (req, res) {
  Contact.get(req.params.id, function (err, contact) {
    if (err) {
      return handleError(res, err);
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
      checkCanModify(item);
      restoreDeleted(item);
      Contact.create(item, function (err, contact) {
        if (err) {
          return handleError(res, err);
        }
        createdItems.push(contact);
      });
      return res.json(201, createdItems);
    });
  } else {
    checkCanModify(req.body);
    restoreDeleted(req.body);
    Contact.create(req.body, function (err, contact) {
      if (err) {
        return handleError(res, err);
      }
      return res.json(201, contact);
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
      return handleError(res, err);
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
        return handleError(res, err);
      }
      return res.json(200, contact);
    });
  });
};

// Deletes a contact from the DB.
exports.destroy = function (req, res) {
  Contact.get(req.params.id, function (err, contact) {
    if (err) {
      return handleError(res, err);
    }
    if (!contact || contact.isDeleted) {
      return res.send(404);
    }
    checkCanModify(contact);
    contact.isDeleted = true;
    contact.save(function (err) {
      if (err) {
        return handleError(res, err);
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

function checkCanModify(contact) {
  if (contact.authId !== req.authId) {
    return res.status(401).send({
      message: 'Access denied!'
    });
  }
}

function handleError(res, err) {
  return res.send(500, err);
}
