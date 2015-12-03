'use strict';

var vogels = require('vogels');
var Joi = require('Joi');
var Operation = vogels.define('Operator_Operation', {
  hashKey: 'id',
  tableName: 'Operator_Operation',
  schema: {
    id: Joi.string(),
    total: Joi.number().required(),
    comment: Joi.string(),
    currency: Joi.string().required(),
    account: Joi.string().required(),
    remindDuration: Joi.number().required(),
    creator: Joi.string().required(),
    lender: Joi.string().required(),
    debtor: Joi.string().required(),
    state: Joi.string(),
    isDeleted: Joi.boolean().default(false),
    lenderConfirmedAt: Joi.string(),
    debtorConfirmedAt: Joi.string()
  }
});

var dynamoose = require('dynamoose'),
    Schema = dynamoose.Schema;

var OperationSchema = new Schema({
  id: {
    type: String,
    hashKey: true
  },
  total: {
    type: Number,
    required: true
  },
  comment: {
    type: String
  },
  currency: {
    type: String,
    required: true
  },
  lenderAccount: {
    type: String
  },
  debtorAccount: {
    type: String
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
  },
  lenderConfirmedAt: {
    type: String
  },
  debtorConfirmedAt: {
    type: String
  }
});

exports.dynamoose = dynamoose.model('Operator_Operation', OperationSchema);
exports.vogels = Operation;
