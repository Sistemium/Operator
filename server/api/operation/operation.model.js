'use strict';

var dynamoose = require('dynamoose'),
    Schema = dynamoose.Schema;

var OperationSchema = new Schema({
  name: String,
  info: String,
  active: Boolean
});

module.exports = dynamoose.model('Operation', OperationSchema);
