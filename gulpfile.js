var gulp = require('gulp');
var args = require('yargs').argv;
var del = require('del');
var browserSync = require('browser-sync');
var config = require('./gulp.config')();

var $ = require('gulp-load-plugins')({lazy: true});

var port = process.env.PORT || config.defaultPort;

gulp.task('help', $.taskListing);
gulp.task('default', ['help']);

gulp.task('vet', function() {
	
	log('Analyzing source with JSHint and JSCS');
	
	return gulp
		.src(config.alljs)
		.pipe($.if(args.verbose, $.print()))
		.pipe($.jscs())
		.pipe($.jshint())
		.pipe($.jshint.reporter('jshint-stylish', {verbose: true}))
		.pipe($.jshint.reporter('fail'));
});

gulp.task('styles', ['clean-styles'], function(){
	
	log('compiling less to CSS');
	
	return gulp
		.src(config.less)
		.pipe($.plumber())
		.pipe($.less())
		.pipe($.autoprefixer({browsers: ['last 2 versions', '> 5%']}))
		.pipe(gulp.dest(config.temp));
});

gulp.task('fonts', ['clean-fonts'], function(){
	
	log('Copying fonts');
	
	return gulp.src(config.fonts)
		.pipe(gulp.dest(config.build + 'fonts'));
});

gulp.task('images', ['clean-images'],function(){
	
	log('Copying and compressing the images');
	
	return gulp.src(config.images)
		.pipe($.imagemin({optimizationLevel: 4}))
		.pipe(gulp.dest(config.build + 'images'))
});

gulp.task('clean', function(done){
	
	var delconfig = [].concat(config.build, config.temp);
	
	log('cleaning: ' + 
		$.util.colors.blue(delconfig));
		
	del(delconfig, done);
	
	clean(config.build + 'fonts/**/*.*', done);
})

gulp.task('clean-fonts', function(done){
	clean(config.build + 'fonts/**/*.*', done);
})

gulp.task('clean-images', function(done){
	clean(config.build + 'images/**/*.*', done);
})

gulp.task('clean-styles', function(done){
	clean(config.temp + '**/*.css', done);
});

gulp.task('clean-code', function(done){
	
	var files = [].concat(
		config.temp + '**/*.js',
		config.build + '**/*.html',
		config.build + 'js/**.*.js'
	);
	
	clean(files, done);
});

gulp.task('less-watcher', function() {
	gulp.watch([config.less], ['styles']);
});

gulp.task('templatecache', ['clean-code'], function(){
	log('Creating AngularJS $templateCache');
	
	return gulp
		.src(config.htmltemplates)
		.pipe($.minifyHtml({empty: true}))
		.pipe($.angularTemplatecache(
			config.templateCache.file,
			config.templateCache.options))
		.pipe(gulp.dest(config.temp));
});

gulp.task('wiredep', function(){
	
	log('Wire up the bower css js and app js into the html');
	
	var options = config.getWiredepDefaultOptions();
	var wiredep = require('wiredep').stream;
	
	return gulp
		.src(config.index)
		.pipe(wiredep(options))
		.pipe($.inject(gulp.src(config.js)))
		.pipe(gulp.dest(config.client));
});

gulp.task('inject', ['wiredep', 'styles'], function(){

	log('Wire up the bower css and app js into the html');
	
	return gulp
		.src(config.index)
		.pipe($.inject(gulp.src(config.css)))
		.pipe(gulp.dest(config.client));
});

gulp.task('serve-dev', ['inject'] , function(){
	var isDev = true;
	var nodeOptions = {
		script: config.nodeServer,
		delayTime: 1,
		env: {
			'PORT': port,
			'NODE_ENV': isDev ? 'dev' : 'build'
		},
		watch: [config.server]
	};
	
	$.nodemon(nodeOptions)
		.on('restart', ['vet'],function(){
			log('***nodemon restarted');
			log('files changed on restart');
			setTimeout(function(){
				browserSync.notify('reloading now ...');
				browserSync.reload({stream: false});
			}, config.browserReloadDelay);
		})
		.on('start', function(){
			log('***nodemon started');
			startBrowserSync();
		})
		.on('crash', function(){
			log('***nodemon crashed');
		})
		.on('exit', function(){
			log('nodemon exit');
		});
});

function changeEvent(event){
	var srcPattern = new RegExp('/.*(?=/)' + config.source + '}/');
	log ('File ' + event.path.replace(srcPattern, '') + ' ' + event.type);
}

function startBrowserSync(){
	if (args.nosync || browserSync.active){
		return;
	}
	
	log('Start browser-sync on port ' + port);
	
	gulp.watch([config.less], ['styles'])
		.on('change', function(event) {
			changeEvent(event);
		});
	
	var options = {
		proxy: 'localhost:' + port,
		port: 3000,
		files: [
			config.client + '**/*.*',
			'!' + config.less, //!Watch except for this one					
			config.temp + '**/*.css'	
		],
		ghostMode: {
			clicks: true,
			location: false,
			forms: true,
			scroll: true
		},
		injectChanges: true,
		logFileChanges: true,
		logLevel: 'debug',
		logPrefix: 'gulp-patterns',
		notify: true,
		reloadDelay: 1000
	};
	
	browserSync(options);
}

function clean(path, done){
	log('Cleaning: ' + $.util.colors.blue(path));
	del(path).then(done());
}

function log(msg){
	if (typeof(msg) === 'object'){
		for (var item in msg){
			if (msg.hasOwnProperty(item)){
				$.util.log($.util.colors.blue(msg[item]));
			}
		}
	}	
	else {
		$.util.log($.util.colors.blue(msg));
	}
}