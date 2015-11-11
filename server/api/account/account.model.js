'use strict';

var dynamoose = require('dynamoose'),
    Schema = dynamoose.Schema;

var AccountSchema = new Schema({
  id: {
    type: String,
    hashKey: true
  },
  agent: {
    type: String,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
});

module.exports = dynamoose.model('Operator_Account', AccountSchema);
