'use strict';

var dynamoose = require('dynamoose'),
    Schema = dynamoose.Schema;

var ContactSchema = new Schema({
  id: {
    type: Number,
    hashKey: true
  },
  owner: {
    type: Object
  },
  agent: {
    type: Object
  },
  permissions: {
    type: Array
  }
});

module.exports = dynamoose.model('Contact', ContactSchema);
