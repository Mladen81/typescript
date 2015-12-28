'use strict';

var gulp = require('gulp');
var $ = require("gulp-load-plugins")({lazy: false});

var mainBowerFiles = require('main-bower-files');
var del = require('del');
var browserSync = require('browser-sync');
var wiredep = require('wiredep').stream;
var lazypipe = require('lazypipe');
var Server = require('karma').Server;

require('require-dir')('./gulp');

var Config = require('./gulpfile.config');
var config = new Config();

var tsProject = $.typescript.createProject('tsconfig.json');
/**
* Clean all
*/
gulp.task('clean', del.bind(null, ['.tmp', 'dist']));


/**
* Lint all custom TypeScript files.
*/
gulp.task('ts-lint', () => {
    return gulp.src(config.allTsFiles)
    .pipe($.tslint())
    .pipe($.tslint.report('verbose'));
});

/**
* Compile TypeScript and include references to library and app .d.ts files.
*/
gulp.task('compile-ts',['ts-lint'] ,() => {
    var sourceTsFiles = [config.allTsFiles, config.typingTsFiles]; //reference to library .d.ts files

    var tsResult = gulp.src(sourceTsFiles)
    .pipe($.sourcemaps.init())
    .pipe($.typescript(tsProject));

    tsResult.dts.pipe(gulp.dest(config.jsTemp));

    return tsResult.js
    .pipe($.ngAnnotate())
    .pipe($.sourcemaps.write(config.mapsTemp))
    .pipe(gulp.dest(config.jsTemp));
});

/*
* Inject bower components
*/
gulp.task('wiredep',['index-html'], () => {
    gulp.src(config.allSassFiles)
    .pipe(wiredep({
        ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest(config.styles));

    gulp.src(config.indexHtmlTemp)
    .pipe(wiredep({
        exclude: ['bootstrap-sass'],
        ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest(config.temp));

    // gulp.src(config.karmaConfFile)
    // .pipe(wiredep({
    //     exclude: ['bootstrap-sass'],
    //     ignorePath: /^(\.\.\/)*\.\./
    // }))
    // .pipe(gulp.dest(config.test));
});

/**
* SASS to CSS
*/
gulp.task('styles', () => {
    return gulp.src(config.allSassFiles)
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
        outputStyle: 'expanded',
        precision: 10,
        includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['last 1 version']}))
    .pipe($.sourcemaps.write(config.mapsTemp,{includeContent: false, sourceRoot: config.src}))
    .pipe(gulp.dest(config.cssTemp))
    .pipe(browserSync.reload({stream: true}));
});

/*
* Minify images
*/
gulp.task('images', () => {
    return gulp.src(config.allImageFiles)
    .pipe($.if($.if.isFile, $.cache($.imagemin({
        progressive: true,
        interlaced: true,
        // don't remove IDs from SVGs, they are often used
        // as hooks for embedding and styling
        svgoPlugins: [{cleanupIDs: false}]
    }))
    .on('error', function (err) {
        console.log(err);
        this.end();
    })))
    .pipe(gulp.dest(config.imagesDist));
});

/**
* Copy fonts to temp and dist folder.
*/
gulp.task('fonts', () => {
    return gulp.src(require('main-bower-files')({
        filter: '**/*.{eot,svg,ttf,woff,woff2}'
    }).concat(config.allFontsFiles))
    .pipe(gulp.dest(config.fontsDist));
});

/**
* Copy all extra files to dist folder
*/
gulp.task('extras', () => {
    return gulp.src(config.allExtraFiles, {
        dot: true
    }).pipe(gulp.dest(config.dist));
});

/**
* Copy all extra files to dist folder
*/
gulp.task('index-html', () => {
    return gulp.src(config.indexHtml, {
        dot: true
    }).pipe(gulp.dest(config.temp));
});


// INJECT FILES
gulp.task('inject', injectToIndexHtml);
gulp.task('inject-rd',['styles','compile-ts','index-html'], injectToIndexHtml);

function injectToIndexHtml() {
    var sources = gulp.src([config.allJsFiles, config.allCssFiles], {read: false});
    return gulp.src(config.indexHtmlTemp)
        .pipe($.inject(sources))
        .pipe(gulp.dest(config.temp));
}


gulp.task('useref', userefForIndexHtml);

function userefForIndexHtml(){
    return gulp.src(config.indexHtmlTemp)
        .pipe($.useref({searchPath: '.'},lazypipe().pipe($.sourcemaps.init, {loadMaps: true})))
        .pipe($.if('**/main.js', $.uglify({mangle: false})))
        .pipe($.if('*.css', $.minifyCss({compatibility: '*'})))
        .pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest(config.dist));
}



gulp.task('build', ['styles','compile-ts','inject-rd','wiredep','extras','fonts','images'], userefForIndexHtml);

// SERVE

gulp.task('serve:dist', () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  });
});

gulp.task('serve', () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist','.tmp','src/scripts']
    }
  });
});

/**
 * Run test once and exit
 */
gulp.task('test', function (done) {
  new Server({
    configFile: require('path').resolve(config.karmaConfFile),
    singleRun: true
  }, done).start();
});

/**
 * Watch for file changes and re-run tests on each change
 */
gulp.task('tdd', function (done) {
  new Server({
    configFile: require('path').resolve(config.karmaConfFile),
  }, done).start();
});
