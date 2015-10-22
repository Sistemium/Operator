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
  status: {
    type: String,
    required: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
});

module.exports = dynamoose.model('Invite', InviteSchema);
