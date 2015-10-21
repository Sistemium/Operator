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
  isDeleted: {
    type: Boolean,
    default: false
  }
});

module.exports = dynamoose.model('Agent', AgentSchema);
