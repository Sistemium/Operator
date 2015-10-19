'use strict';

var dynamoose = require('dynamoose'),
    Schema = dynamoose.Schema;

var CurrencySchema = new Schema({
  id: {
    type: String,
    hashKey: true
  },
  name: {
    type: String,
    required: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
});

module.exports = dynamoose.model('Currency', CurrencySchema);
