'use strict';

var dynamoose = require('dynamoose'),
    Schema = dynamoose.Schema;

var ContactSchema = new Schema({
  name: String,
  info: String,
  active: Boolean
});

module.exports = dynamoose.model('Contact', ContactSchema);
