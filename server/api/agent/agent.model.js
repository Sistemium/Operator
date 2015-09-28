'use strict';

var dynamoose = require('dynamoose'),
    Schema = dynamoose.Schema;

var AgentSchema = new Schema({
  name: String,
  info: String,
  active: Boolean
});

module.exports = dynamoose.model('Agent', AgentSchema);
