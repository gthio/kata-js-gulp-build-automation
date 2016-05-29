module.exports = function(){
  
  var client = './src/client/';
  var clientApp = client + 'app/';
  var report = './report/';
  var root = './';
  var server = './src/server/';
  var specRunnerFile = 'specs.html';
  var temp = './.tmp/';
  var wiredep = require('wiredep');
  var bowerFile = wiredep({devDependencies: true})['js'];
  
  var config = {
    
    temp: temp,
  
    alljs: [
			'./src/**/*.js',
			'./*.js'
		],
    build: './build/',
    client: client,
    css: temp + 'styles.css',
    fonts: './bower_components/font-awesome/fonts/**/*.*',
    html: clientApp + '**/*.html',
    htmltemplates: clientApp + '**/*.html',
    images: client + 'images/**/*.*',
    index: client + 'index.html',
    js: [
      clientApp + '**/*.module.js',
      clientApp + '**/*.js',
      '!' + clientApp + '**.*/*.spec.js'
    ],
    
    less: client + '/styles/styles.less',
    report: report,
    root: root,
    server: server,
    
    optimized: {
      app: 'app.js',
      lib: 'lib.js'
    },
    
    templateCache: {
      file: 'template.js',
      options: {
        module: 'app.core',
        standAlone: false,
        root: 'app/'
      }
    },
    
    browserReloadDelay: 1000,
    
    bower: {
      json: require('./bower.json'),
      directory: './bower_components/',
      ignorePath: '../..'
    },
    
    packages: [
      './package.json',
      './bower.json'
    ],
    
    specRunner: client + specRunnerFile,
    specRunnerFile: specRunnerFile,
    testlibraries: [
      'node_modules/mocha/mocha.js',
      'node_modules/chai/chai.js',
      'node_modules/mocha-clean/index.js',
      'node_modules/sinon-chai/lib/sinon-chai.js'
    ],
    specs: [clientApp + '**/*.spec.js'],
    
    specHelpers: [client + 'test-helpers/*.js'],
    
    serverIntegrationSpecs: [
      client + 'tests/server-integration/**/*.spec.js'
    ],
    
    defaultPort: 7203,
    nodeServer: './src/server/app.js'
  };
  
  config.getWiredepDefaultOptions = function() {
    var options = {
      bowerJson: config.bower.json,
      directory: config.bower.directory,
      ignorePath: config.bower.ignorePath
    };
    
    return options;
  };
  
  config.karma = getKarmaOptions();
  
  return config;
  
  function getKarmaOptions(){
    var options = {
      files: [].concat(
        bowerFile,
        config.specHelpers,
        client + '**/*.module.js',
        client + '**/*.js',
        temp + config.templateCache.file,
        config.serverIntegrationSpecs
      ),
      exclude: [],
      coverage: {
        dir: report + 'coverage',
        reporters: [
          {type: 'html', subdir: 'report-html'},
          {type: 'lcov', subdir: 'report-lcov'},
          {type: 'text-summary', subdir: '.', file: 'text-summary.txt' },
        ]
      },
      preprocessors: {}
    };
    
    options.preprocessors[clientApp + '**/!(*.spec) + (.js)'] = ['coverage'];
    
    return options;
    
  }
};