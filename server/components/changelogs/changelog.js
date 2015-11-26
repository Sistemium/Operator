'use strict';

var redisClient = require('../../config/redis').redisClient;
var redback = require('redback').use(redisClient);

exports.createOperationChangelog = function () {
  return redback.createCappedList('operationChangelog', 5000);
};
