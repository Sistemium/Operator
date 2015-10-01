'use strict';

var dynamoose = require('dynamoose'),
    Schema = dynamoose.Schema;

var OperationSchema = new Schema({
  id: {
    type: String
  },
  sumTotal: Number,
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
  state: String
});

module.exports = dynamoose.model('Operation', OperationSchema);
