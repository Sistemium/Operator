'use strict';

var dynamoose = require('dynamoose'),
    Schema = dynamoose.Schema;

var AccountSchema = new Schema({
  id: {
    type: String,
    hashKey: true
  },
  agentId: {
    type: String,
    required: true
  },
  authId: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  isDeleted: {
    type: String,
    default: false
  }
});

module.exports = dynamoose.model('Account', AccountSchema);
