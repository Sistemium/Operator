'use strict';

var _ = require('lodash');
var Contact = require('../contact/contact.model.js');
var Agent = require('../agent/agent.model.js');
var HttpError = require('../../components/errors/httpError').HttpError;

exports.getAll = function (owner, next) {
  Contact.scan({owner: owner, isDeleted: false}, function (err, contacts) {
    if (err) {
      return next(new HttpError(500, err));
    }
    if (!contacts) {
      return next(new HttpError(404, 'not found'));
    }
    if (contacts.length === 0) {
      return next(null, []);
    }
    var acceptorIds = _.pluck(_.filter(contacts, function (cnt) {
      return !!cnt.agent;
    }), 'agent');
    if (acceptorIds.length > 0) {
      Agent.batchGet(acceptorIds, function (err, agents) {
        if (err) {
          return next(new HttpError(500, err));
        }
        if (!agents) {
          return next(new HttpError(404, 'not found'));
        }

        return next(null, agents);
      });
    }
  });
};
