'use strict';

var dynamoose = require('dynamoose'),
    Schema = dynamoose.Schema;

var AccountSchema = new Schema({
  id: {
    type: Number,
    hashKey: true
  },
  agentId: {
    type: Number
  }
});

module.exports = dynamoose.model('Account', AccountSchema);
