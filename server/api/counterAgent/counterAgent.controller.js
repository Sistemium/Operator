'use strict';

var _ = require('lodash');
var Contact = require('../contact/contact.model');
var Agent = require('../agent/agent.model');
var HttpError = require('../../components/errors/httpError').HttpError;

// Get list of counterAgents
exports.index = function(req, res, next) {
  if (req.params.owner) {
    Contact.scan({owner: req.params.owner, isDeleted: false}, function (err, contacts) {
      console.log('GET counter agents ' + JSON.stringify(contacts));
      if (err) {
        return next(new HttpError(500, err));
      }
      if (!contacts) {
        return next(new HttpError(404, 'not found'));
      }
      if (contacts.length === 0) {
        return res.send(200, []);
      }
      var acceptorIds = _.pluck(_.filter(contacts, function (cnt) {
        return !!cnt.agent;
      }), 'agent');
      if (acceptorIds.length > 0) {
        Agent.batchGet(acceptorIds, function (err, agents) {
          // TODO: let confirm invite only once, do not create duplicate contacts
          if (err) {
            return next(new HttpError(500, err));
          }
          if (!agents) {
            return next(new HttpError(404, 'not found'));
          }

          return res.send(200, agents);
        });
      }
    });
  }
};
