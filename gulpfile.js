'use strict';

var gulp = require('gulp');
var inject = require('gulp-inject');
var tsc = require('gulp-typescript');
var tslint = require('gulp-tslint');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var mainBowerFiles = require('main-bower-files');
var browserSync = require('browser-sync');
var ngAnnotate = require('gulp-ng-annotate');
var browserSync = require('browser-sync');
var wiredep = require('wiredep').stream;
var iff  =require('gulp-if');
var cache =require('gulp-cache');
var sass =require('gulp-sass');
var plumber =require('gulp-plumber');
var autoprefixer=require('gulp-autoprefixer');
var imagemin =require('gulp-imagemin');
var uglify = require('gulp-uglify');
var useref = require('gulp-useref');
var minifyCss = require('gulp-minify-css');
var minifyHtml = require('gulp-minify-html');
var eol = require('gulp-eol');
var usemin = require('gulp-usemin');
var rev = require('gulp-rev');
var lazypipe = require('lazypipe');
var $ = require("gulp-load-plugins")({lazy: false});

//const $ = gulpLoadPlugins();

var tsProject = tsc.createProject('tsconfig.json');

var Config = require('./gulpfile.config');
var config = new Config();
const reload = browserSync.reload;

/**
* Clean all
*/
gulp.task('clean', del.bind(null, ['.tmp', 'dist']));


/**
* Lint all custom TypeScript files.
*/
gulp.task('ts-lint', () => {
    return gulp.src(config.allTsFiles)
    .pipe(tslint())
    .pipe(tslint.report('verbose'));
});

/**
* Compile TypeScript and include references to library and app .d.ts files.
*/
gulp.task('compile-ts',['ts-lint'] ,() => {
    var sourceTsFiles = [config.allTsFiles, config.typingTsFiles]; //reference to library .d.ts files

    var tsResult = gulp.src(sourceTsFiles)
    .pipe(sourcemaps.init())
    .pipe(tsc(tsProject));

    tsResult.dts.pipe(gulp.dest(config.jsTemp));

    return tsResult.js
    .pipe(ngAnnotate())
    .pipe(sourcemaps.write(config.mapsTemp))
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
});

/**
* SASS to CSS
*/
gulp.task('styles', () => {
    return gulp.src(config.allSassFiles)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass.sync({
        outputStyle: 'expanded',
        precision: 10,
        includePaths: ['.']
    }).on('error', sass.logError))
    .pipe(autoprefixer({browsers: ['last 1 version']}))
    .pipe(sourcemaps.write(config.mapsTemp,{includeContent: false, sourceRoot: config.src}))
    .pipe(gulp.dest(config.cssTemp))
    .pipe(reload({stream: true}));
});

/*
* Minify images
*/
gulp.task('images', () => {
    return gulp.src(config.allImageFiles)
    .pipe(iff(iff.isFile, cache(imagemin({
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
        .pipe(inject(sources))
        .pipe(gulp.dest(config.temp));
}


gulp.task('useref', userefForIndexHtml);

function userefForIndexHtml(){
    return gulp.src(config.indexHtmlTemp)
        .pipe(useref({searchPath: '.'},lazypipe().pipe(sourcemaps.init, {loadMaps: true})))
        .pipe(iff('**/main.js', uglify({mangle: false})))
        .pipe(iff('*.css', minifyCss({compatibility: '*'})))
        .pipe(iff('*.html', minifyHtml({conditionals: true, loose: true})))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.dist));
}

gulp.task('build', ['styles','compile-ts','inject-rd','wiredep','extras','fonts','images'], userefForIndexHtml);


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
