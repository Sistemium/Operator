'use strict';
var vogels = require('vogels');
var Joi = require('Joi');
var Invite = vogels.define('Operator_Invite', {
  hashKey: 'id',
  tableName: 'Operator_Invite',

  schema: {
    id: Joi.string(),
    code: Joi.string().required(),
    owner: Joi.string().required(),
    acceptor: Joi.string(),
    status: Joi.string().required(),
    isDeleted: Joi.boolean().default(false),
    acceptorName: Joi.string(),
    ownerName: Joi.string()
  }
});

var dynamoose = require('dynamoose'),
  Schema = dynamoose.Schema;

var InviteSchema = new Schema({
  id: {
    type: String,
    hashKey: true
  },
  code: {
    type: String,
    required: true
  },
  owner: {
    type: String,
    required: true
  },
  acceptorName: {
    type: String
  },
  ownerName: {
    type: String
  },
  acceptor: {
    type: String
  },
  status: {
    type: String,
    required: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
});

exports.dynamoose = dynamoose.model('Operator_Invite', InviteSchema);
exports.vogels = Invite;
