'use strict';

var dynamoose = require('dynamoose'),
    Schema = dynamoose.Schema;

var AgentSchema = new Schema({
  id: {
    type: String,
    hashKey: true
  },
  name: {
    type: String,
    required: true
  },
  authId: {
    type: String,
    required: true
  },
  accounts: {
    type: Array
  }
});

module.exports = dynamoose.model('Agent', AgentSchema);
