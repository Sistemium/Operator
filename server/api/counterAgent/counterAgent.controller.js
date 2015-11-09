'use strict';

var _ = require('lodash');
var Contact = require('../contact/contact.model');
var Agent = require('../agent/agent.model');

// Get list of counterAgents
exports.index = function(req, res) {
  if (req.params.owner) {
    Contact.scan({owner: req.params.owner, isDeleted: false}, function (err, contacts) {
      console.log('GET counteragents ' + contacts);
      if (err) {
        handleError(res, err);
      }
      if (!contacts) {
        return res.send(404);
      }
      if (contacts.length === 0) {
        return res.send([]);
      }
      var acceptorIds = _.pluck(_.filter(contacts, function (cnt) {
        return !!cnt.acceptor;
      }), 'acceptor');
      Agent.batchGet(acceptorIds, function (err, agents) {
        if (err) {
          return handleError(res, err);
        }
        if (!agents) {
          return res.send(404);
        }

        return res.send(200, agents);
      });
    });
  }
};

function handleError(res, err) {
  return res.send(500, err);
}
