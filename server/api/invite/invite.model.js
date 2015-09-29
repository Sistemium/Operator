'use strict';

var dynamoose = require('dynamoose'),
  Schema = dynamoose.Schema;

var InviteSchema = new Schema({
  id: {
    type: Number,
    hashKey: true
  },
  owner: {
    type: String
  },
  acceptor: {
    type: Object
  },
  isActive: {
    type: Boolean
  },
  permissions: {
    type: Array
  }
});

module.exports = dynamoose.model('Thing', InviteSchema);
