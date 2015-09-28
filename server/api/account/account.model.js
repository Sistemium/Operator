'use strict';

var dynamoose = require('dynamoose'),
    Schema = dynamoose.Schema;

var AccountSchema = new Schema({
  name: String,
  info: String,
  active: Boolean
});

module.exports = dynamoose.model('Account', AccountSchema);
