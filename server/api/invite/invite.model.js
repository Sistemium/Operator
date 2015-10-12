'use strict';

var dynamoose = require('dynamoose'),
  Schema = dynamoose.Schema;

var InviteSchema = new Schema({
  id: {
    type: String,
    hashKey: true
  },
  code: {
    type: String,
    required: true
  },
  owner: {
    type: String,
    required: true
  },
  acceptor: {
    type: String
  },
  isActive: {
    type: Boolean,
    required: true
  },
  permissions: {
    type: Array
  },
  status: {
    type: String,
    required: true
  }
});

module.exports = dynamoose.model('Invite', InviteSchema);
