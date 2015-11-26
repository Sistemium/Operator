// Karma configuration
// Generated on Wed Nov 18 2015 18:06:43 GMT+0200 (EET)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'client/bower_components/jquery/dist/jquery.js',
      'client/bower_components/angular/angular.js',
      'client/bower_components/angular-resource/angular-resource.js',
      'client/bower_components/angular-mocks/angular-mocks.js',
      'client/bower_components/angular-resource/angular-resource.js',
      'client/bower_components/angular-cookies/angular-cookies.js',
      'client/bower_components/angular-sanitize/angular-sanitize.js',
      'client/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'client/bower_components/lodash/dist/lodash.compat.js',
      'client/bower_components/angular-material/angular-material.js',
      'client/bower_components/angular-socket-io/socket.js',
      'client/bower_components/angular-ui-router/release/angular-ui-router.js',
      'client/bower_components/angular-gettext/dist/angular-gettext.js',
      'client/bower_components/angular-animate/angular-animate.js',
      'client/bower_components/angular-aria/angular-aria.js',
      'client/bower_components/ui-select/dist/select.js',
      'client/bower_components/angular-ui-bootstrap/dist/ui-bootstrap-tpls-0.14.3.js',
      'client/bower_components/node-uuid/uuid.js',
      'client/app/*.js',
      'client/app/**/*.js',
      'client/components/**/*.js',
      'client/app/**/*.jade',
      'client/app/**/*.html',
      'client/components/**/*.jade',
      'client/components/**/*.html'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      '**/*.jade': ['ng-jade2js'],
      '**/*.html': ['html2js']
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_WARN,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultanous
    concurrency: Infinity
  })
};
