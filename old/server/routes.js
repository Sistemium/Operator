/**
 * Main application routes
 */

'use strict';

var express = require('express');
var errors = require('./components/errors/index');

module.exports = function(app) {

  // Insert routes below
  app.use('/api/counterAgents', require('./api/counterAgent/index'));
  app.use('/api/invites', require('./api/invite/index'));
  app.use('/api/agents', require('./api/agent/index'));
  app.use('/api/operations', require('./api/operation/index'));
  app.use('/api/currencies', require('./api/currency/index'));
  app.use('/api/contacts', require('./api/contact/index'));
  app.use('/api/accounts', require('./api/account/index'));
  app.use('/api/auth', require('./auth/auth'));
  app.use('/api/admin', require('./api/admin/index'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendfile(app.get('appPath') + '/app/index.html');
    });
};
