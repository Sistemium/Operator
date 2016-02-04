'use strict';

// Use local.env.js for environment variables that grunt will set when the server starts locally.
// Use for your api keys, secrets, etc. This file should not be tracked by git.
//
// You will need to set these on the server you deploy to.

module.exports = {
  DOMAIN: 'http://localhost:9000',
  SESSION_SECRET: "super_secret_session_key",

  FACEBOOK_ID: 'app-id',
  FACEBOOK_SECRET: 'secret',
  // Control debug level for modules using visionmedia/debug
  DEBUG: '',

  AWS_ACCESS_KEY_ID: "AKIAJPZ4BU6EPKXBDTEQ",
  AWS_SECRET_ACCESS_KEY: "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",
  AWS_REGION: "eu-west-1",

  SENDGRID_API_KEY: "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",
};
