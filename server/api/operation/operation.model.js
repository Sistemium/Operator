'use strict';

var dynamoose = require('dynamoose'),
    Schema = dynamoose.Schema;

var OperationSchema = new Schema({
  id: {
    type: String,
    hashKey: true
  },
  sumTotal: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  remindDuration: {
    type: Number,
    required: true
  },
  initiator: {
    type: String,
    required: true
  },
  executor: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  }
});

module.exports = dynamoose.model('Operation', OperationSchema);
