/**
 * Main application routes
 */

'use strict';

var express = require('express');
var errors = require('./components/errors');

module.exports = function(app) {

  // Insert routes below
  app.use('/api/counterAgents', require('./api/counterAgent'));
  app.use('/api/invites', require('./api/invite'));
  app.use('/api/agents', require('./api/agent'));
  app.use('/api/operations', require('./api/operation'));
  app.use('/api/currencies', require('./api/currency'));
  app.use('/api/contacts', require('./api/contact'));
  app.use('/api/accounts', require('./api/account'));
  app.use('/api/auth', require('./auth/auth'));
  app.use('/api/admin', require('./api/admin'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendfile(app.get('appPath') + '/index.html');
    });
};
