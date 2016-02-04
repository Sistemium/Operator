'use strict';

var dynamoose = require('dynamoose'),
    Schema = dynamoose.Schema;

var ContactSchema = new Schema({
  id: {
    type: String,
    hashKey: true
  },
  owner: {
    type: String,
    required: true
  },
  agent: {
    type: String,
    required: true
  },
  invite: {
    type: String,
    required: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
});

module.exports = dynamoose.model('Operator_Contact', ContactSchema);
