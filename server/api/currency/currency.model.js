'use strict';

var dynamoose = require('dynamoose'),
    Schema = dynamoose.Schema;

var CurrencySchema = new Schema({
  name: String,
  info: String,
  active: Boolean
});

module.exports = dynamoose.model('Currency', CurrencySchema);
