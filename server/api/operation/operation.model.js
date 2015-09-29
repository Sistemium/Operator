'use strict';

var dynamoose = require('dynamoose'),
    Schema = dynamoose.Schema;

var OperationSchema = new Schema({
  id: {
    type: Number
  },
  sumTotal: {
    type: Number
  },
  currency: {
    type: Object
  },
  remindDuration: {
    type: Object
  },
  initiator: {
    type: Object
  },
  executor: {
    type: Object
  },
  state: {
    type: String
  }
});

module.exports = dynamoose.model('Operation', OperationSchema);
