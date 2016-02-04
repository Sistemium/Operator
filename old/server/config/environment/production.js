'use strict';

// Production specific configuration
// =================================
module.exports = {
  // Server IP
  ip:       process.env.OPENSHIFT_NODEJS_IP ||
            process.env.IP ||
            undefined,

  // Server port
  port:     process.env.OPENSHIFT_NODEJS_PORT ||
            process.env.PORT ||
            8080,

  redis: {
    host: process.env.REDIS_HOST, // || 'TYPE_HOST_HERE',
    port: process.env.REDIS_PORT, // || 'TYPE_PORT_HERE',
    url: process.env.REDIS_URL // || 'TYPE_URL_HERE'
  }
};
