'use strict';

var dynamoose = require('dynamoose'),
    Schema = dynamoose.Schema;

var ContactSchema = new Schema({
  id: {
    type: String,
    hashKey: true
  },
  owner: {
    type: String
  },
  agent: {
    type: String
  },
  permissions: {
    type: Array
  }
});

module.exports = dynamoose.model('Contact', ContactSchema);
