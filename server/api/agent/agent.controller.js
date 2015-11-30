'use strict';

var _ = require('lodash');
var Agent = require('./agent.model');
var agentSocket = require('./agent.socket');
var HttpError = require('../../components/errors/httpError').HttpError;
var changelog = require('../../components/changelogs/changelog');
var agentChangelog = changelog.agentChangelog();
var uuid = require('node-uuid');

// Get list of agents
exports.index = function (req, res, next) {
  Agent.scan({authId: req.authId, isDeleted: false}, function (err, agents) {
    if (err) {
      return next(new HttpError(500, err));
    }
    return res.json(200, agents);
  });
};

// Get a single agent
exports.show = function (req, res, next) {

  Agent.get(req.params.id, function (err, agent) {
    if (err) {
      return next(new HttpError(500, err));
    }
    if (agent && agent.authId !== req.authId) {
      return next(401);
    }
    if (!agent || agent.isDeleted) {
      return next(404);
    }
    return res.json(agent);
  });
};

// Creates a new agent in the DB.
exports.create = function (req, res, next) {
  if (req.body && Object.prototype.toString.call(req.body) === '[object Array]') {
    var createdItems = [];
    var newItemsCount = req.body.length;
    _.each(req.body, function (item) {
      checkCanModify(res, item, req.authId);
      Agent.create(item, function (err, agent) {
        if (err) {
          return next(new HttpError(500, err));
        }
        createdItems.push(agent);
        if (createdItems.length === newItemsCount) {
          agentSocket.agentSave(agent);
          return res.json(201, createdItems);
        }
      });
    });
  } else {
    checkCanModify(res, req.body, req.authId);
    //create id for agent
    req.body.id = uuid.v4();
    Agent.create(req.body, function (err, agent) {
      if (err) {
        return next(new HttpError(500, err));
      }
      var changedRecord = {
        'id': req.body.id,
        'guid': uuid.v4()
      };
      agentChangelog.push(`${changedRecord.guid}:${changedRecord.id}`);
      _.extend(agent, {
        changelogGuid: changedRecord.guid
      });
      agentSocket.agentSave(agent);
      return res.json(201, agent);
    });
  }
};

// Updates an existing agent in the DB.
exports.update = function (req, res, next) {
  if (req.body.id) {
    delete req.body.id;
  }
  Agent.get(req.params.id, function (err, agent) {
    if (err) {
      return next(new HttpError(500, err));
    }
    if (!agent) {
      return res.send(404);
    }
    checkCanModify(res, agent, req.authId);
    restoreDeleted(agent);
    var updated = req.body;
    agent = _.merge(agent, updated);

    Agent.update({id: agent.id}, updated, function (err) {
      if (err) {
        return next(new HttpError(500, err));
      }
      agentSocket.agentSave(agent);
      return res.json(200, agent);
    });
  });
};

// Deletes a agent from the DB.
exports.destroy = function (req, res, next) {
  Agent.get(req.params.id, function (err, agent) {
    if (err) {
      return next(new HttpError(500, err));
    }
    if (!agent || agent.isDeleted) {
      return res.send(404);
    }
    checkCanModify(res, agent, req.authId);
    agent.isDeleted = true;
    var updatedAgent = _.clone(agent);
    delete updatedAgent.id;
    Agent.update({id: agent.id}, updatedAgent, function (err) {
      if (err) {
        return next(new HttpError(500, err));
      }
      agentSocket.agentRemove(agent);
      return res.send(204);
    });
  });
};

exports.changelog = function (req, res) {
  changelog.getChangelog(agentChangelog, req, res);
};

function restoreDeleted(agent) {
  if (agent.isDeleted) {
    delete agent.isDeleted;
  }
}

function checkCanModify(res, agent, authId) {
  if (!agent.authId) {
    return res.status(401).send({
      message: 'AuthId not provided'
    });
  }

  if (agent.authId !== authId) {
    return res.status(401).send({
      message: 'Access denied!'
    });
  }
}
