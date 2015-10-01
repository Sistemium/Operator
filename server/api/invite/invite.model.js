'use strict';

var dynamoose = require('dynamoose'),
  Schema = dynamoose.Schema;

var InviteSchema = new Schema({
  id: {
    type: String,
    hashKey: true
  },
  owner: {
    type: String,
    required: true
  },
  acceptor: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    required: true
  },
  permissions: {
    type: Array
  }
});

module.exports = dynamoose.model('Invite', InviteSchema);
