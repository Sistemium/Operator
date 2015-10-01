'use strict';

var dynamoose = require('dynamoose'),
  Schema = dynamoose.Schema;

var InviteSchema = new Schema({
  id: {
    type: String,
    hashKey: true
  },
  owner: {
    type: String
  },
  acceptor: {
    type: String
  },
  isActive: {
    type: Boolean
  },
  permissions: {
    type: Array
  }
});

module.exports = dynamoose.model('Invite', InviteSchema);
