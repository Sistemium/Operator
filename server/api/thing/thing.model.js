'use strict';

var dynamoose = require('dynamoose'),
    Schema = dynamoose.Schema;

var ThingSchema = new Schema({
  id: {
    type: String,
    hashKey: true
  },
  name: String
});

module.exports = dynamoose.model('Thing', ThingSchema);
