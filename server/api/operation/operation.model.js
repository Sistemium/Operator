'use strict';

var dynamoose = require('dynamoose'),
    Schema = dynamoose.Schema;

var OperationSchema = new Schema({
  id: {
    type: String
  },
  sumTotal: Number,
  currency: {
    type: String
  },
  remindDuration: {
    type: Object
  },
  initiator: {
    type: String
  },
  executor: {
    type: String
  },
  state: String
});

module.exports = dynamoose.model('Operation', OperationSchema);
