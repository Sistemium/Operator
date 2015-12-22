/**
 * Express configuration
 */

'use strict';

let express = require('express')
  , favicon = require('serve-favicon')
  , morgan = require('morgan')
  , compression = require('compression')
  , bodyParser = require('body-parser')
  , methodOverride = require('method-override')
  , errorHandler = require('errorhandler')
  , path = require('path')
  , config = require('./environment')
  , HttpError = require('../components/errors/httpError').HttpError
  , cookieParser = require('cookie-parser')
  , session = require('express-session')
  , csrf = require('csurf')
  , helmet = require('helmet')
  , RedisStore = require('connect-redis')(session);

module.exports = function (app) {
  var env = app.get('env');

  app.set('views', config.root + '/server/views');
  app.set('view engine', 'jade');
  app.use(compression());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(methodOverride());
  app.use(require('express-domain-middleware'));
  app.set('redisdb', config.redis[env]);
  //app.use(cookieParser());
  //app.use(session({
  //  resave: true,
  //  saveUninitialized: true,
  //  store: new RedisStore({
  //    host: 'localhost',
  //    port: 6379
  //  }),
  //  secret: config.secrets.session,
  //  cookie: {
  //    path: '/',
  //    maxAge: 3600000
  //  }
  //}));
  //app.use(csrf());
  app.use(helmet());

  if ('production' === env) {
    app.use(favicon(path.join(config.root, 'public', 'favicon.ico')));
    app.use(express.static(path.join(config.root, 'public')));
    app.set('appPath', config.root + '/public');
    app.use(morgan('dev'));
    app.use(cookieParser(config.secrets.session));
    app.use(session({
      resave: true,
      saveUninitialized: true,
      store: new RedisStore({
        host: 'localhost',
        port: 6379
      }),
      secret: config.secrets.session,
      cookie: {
        path: '/',
        maxAge: 3600000
      }
    }));
    app.use(csrf());
    app.use(helmet());
  }

  if ('development' === env || 'test' === env) {
    app.use(favicon(path.join(config.root, 'client', 'favicon.ico')));
    app.use(require('connect-livereload')());
    app.use(express.static(path.join(config.root, '.tmp')));
    app.use(express.static(path.join(config.root, 'client')));
    app.set('appPath', 'client');
    app.use(morgan('dev'));
    //app.use(cookieParser());
    //app.use(session({
    //  resave: true,
    //  saveUninitialized: true,
    //  store: new RedisStore({
    //    host: 'localhost',
    //    port: 6379
    //  }),
    //  secret: config.secrets.session,
    //  cookie: {
    //    path: '/',
    //    maxAge: 3600000
    //  }
    //}));
    //app.use(csrf());
    app.use(helmet());
    app.use(function (err, req, res, next) {
      if (typeof err === 'number') {
        err = new HttpError(err);
      }
      if (err instanceof HttpError) {
        res.sendHttpError(err);
      }
      app.use(errorHandler()); // Error handler - has to be last
    });
  }
};
