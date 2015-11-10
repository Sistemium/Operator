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
  /**
   * Who creates record, authId
   */
  creator: {
    type: String,
    required: true
  },
  /**
   * Agent who lends
   */
  lender: {
    type: String,
    required: true
  },
  /**
   * Agent who owes
   */
  debtor: {
    type: String,
    required: true
  },
  state: {
    type: String
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
});

module.exports = dynamoose.model('Operation', OperationSchema);
