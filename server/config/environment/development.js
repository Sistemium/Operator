'use strict';

// Development specific configuration
// ==================================
module.exports = {
  redis: {
    host: process.env.REDIS_HOST ,
    port: process.env.REDIS_PORT ,
    url: process.env.REDIS_URL
  }
};
