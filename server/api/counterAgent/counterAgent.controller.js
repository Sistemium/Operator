'use strict';
var getCounterAgents = require('./counterAgent.bll').getAll;

// Get list of counterAgents
exports.index = function(req, res, next) {
  if (req.params.owner) {
    getCounterAgents(req.params.owner, function (err, response) {
      if (err) {
        return next(err);
      }
      res.send(200, response);
    })
  }
};
