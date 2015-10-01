'use strict';

var dynamoose = require('dynamoose'),
    Schema = dynamoose.Schema;

var AccountSchema = new Schema({
  id: {
    type: String,
    hashKey: true
  },
  agentId: {
    type: String
  },
  authId: {
    type: String
  },
  currency: {
    type: String
  }
});

module.exports = dynamoose.model('Account', AccountSchema);
