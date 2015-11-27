'use strict';

var redisClient = require('../../config/redis').redisClient;
var redback = require('redback').use(redisClient);

exports.operationChangelog = function () {
  return redback.createCappedList('operationChangelog', 5000);
};

exports.agentChangelog = function () {
  return redback.createCappedList('agentChangelog', 5000);
};

exports.getChangelog = function (changelog, req, res) {
  var arr, guid, json;
  var ret = [];
  var found = false;

  changelog.values(function (err, values) {
    values.forEach(function(value) {
      arr = value.split(':');
      guid = arr.shift();
      if (!found) {
        if ( guid === req.params.guid ) {
          found = true;
          return;
        } else {
          return;
        }
      }
      json = arr.join(':');
      ret.push(JSON.parse(json));
    });
    res.jsonp(ret);
  });
};
