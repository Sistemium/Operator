'use strict';

var _ = require('lodash');
var Agent = require('./agent.model');

// Get list of agents
exports.index = function (req, res) {
  Agent.scan({}, function (err, agents) {
    if (err) {
      handleError(res, err);
    }
    agents = _.filter(agents, 'isDeleted', false);
    return res.json(200, agents);
  });
};

// Get a single agent
exports.show = function (req, res) {
  Agent.get(req.params.id, function (err, agent) {
    if (err) {
      handleError(res, err);
    }
    if (!agent || !agent.isDeleted) {
      return res.send(404);
    }
    return res.json(agent);
  });
};

// Creates a new agent in the DB.
exports.create = function (req, res) {
  if (req.body && Object.prototype.toString.call(req.body) === '[object Array]') {
    var createdItems = [];
    var newItemsCount = req.body.length;
    _.each(req.body, function (item) {
      checkCanModify(res, item, req.authId);
      Agent.create(item, function (err, agent) {
        if (err) {
          handleError(res, err);
        }
        createdItems.push(agent);
        if (createdItems.length === newItemsCount) {
          return res.json(201, createdItems);
        }
      });
    });
  } else {
    checkCanModify(res, req.body, req.authId);
    Agent.create(req.body, function (err, agent) {
      if (err) {
        handleError(res, err);
      }
      return res.json(201, agent);
    });
  }
};

// Updates an existing agent in the DB.
exports.update = function (req, res) {
  if (req.body.id) {
    delete req.body.id;
  }
  Agent.get(req.params.id, function (err, agent) {
    if (err) {
      handleError(res, err);
    }
    if (!agent) {
      return res.send(404);
    }
    checkCanModify(agent);
    restoreDeleted(agent);
    if (agent.isDeleted) {
      delete agent.isDeleted;
    }
    var updated = _.merge(agent, req.body);
    updated.save(function (err) {
      if (err) {
        handleError(res, err);
      }
      return res.json(200, agent);
    });
  });
};

// Deletes a agent from the DB.
exports.destroy = function (req, res) {
  Agent.get(req.params.id, function (err, agent) {
    if (err) {
      handleError(res, err);
    }
    if (!agent || agent.isDeleted) {
      return res.send(404);
    }
    checkCanModify(agent);
    agent.isDeleted = true;
    agent.save(function (err) {
      if (err) {
        handleError(res, err);
      }
      return res.send(204);
    });
  });
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

function handleError(res, err) {
  return res.send(500, err);
}
