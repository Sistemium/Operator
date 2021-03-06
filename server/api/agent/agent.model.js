'use strict';

var dynamoose = require('dynamoose'),
    Schema = dynamoose.Schema;

var AgentSchema = new Schema({
  id: {
    type: Number,
    hashKey: true
  },
  name: {
    type: String
  },
  authId: {
    type: String
  }
});

module.exports = dynamoose.model('Agent', AgentSchema);
