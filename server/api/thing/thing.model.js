'use strict';

var dynamoose = require('dynamoose'),
    Schema = dynamoose.Schema;

var ThingSchema = new Schema({
  id: {
    type: Number,
    hashKey: true
  },
  name: {
    type: String
  }
});

module.exports = dynamoose.model('Thing', ThingSchema);
