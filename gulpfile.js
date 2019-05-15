'use strict';

const gulp  = require('gulp');
const less  = require('gulp-less');
const jsmin  = require('gulp-jsmin');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const notify = require('gulp-notify');
const nodemon = require('gulp-nodemon');
const uglifycss = require('gulp-uglifycss');
const browserSync = require('browser-sync').create();

let reload = browserSync.reload;

let sources = {
    less: [
        './assets/dev/less/reset.less',
        './assets/dev/less/default.less'
    ],
    lib: {
        css: [
            './node_modules/bootstrap/dist/css/bootstrap.min.css',
        ],
        js: [
            './node_modules/jquery/dist/jquery.min.js',
            './node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
            './node_modules/chart.js/dist/Chart.min.js'
        ]
    }, 
    js: [
        './assets/dev/js/default.js'
    ],
    watch: {
        less: [
            './assets/dev/less/**/*.less'
        ],
        js: [
            './assets/dev/js/**/*.js'
        ],
        html: [
            './*.html'
        ]
    },
    path: {
        css: [
            './assets/pub/css/'
        ],
        js: [
            './assets/pub/js/'
        ]
    },
    server: {
        url: 'localhost:8088',
        port: '8090',
        server_file: 'server.js',
        ignore: [
            'gulpfile.js',
            'node_modules/'
        ]
    }
}

function libScript() {
    return gulp.src(sources.lib.js)
        .pipe(concat('lib.js'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(sources.path.js));
}

function libStyle() {
    return gulp.src(sources.lib.css)
        .pipe(concat('lib.css'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(sources.path.css));
}

function script() {
    return gulp.src(sources.js)
        .pipe(concat('build.js'))
        .pipe(jsmin())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(sources.path.js));
}

function style() {
    return gulp.src(sources.less)
        .pipe(concat('build.css'))
        // .pipe(less().on('error', less.logError))
        .pipe(less())
        .pipe(uglifycss())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(sources.path.css))
        .pipe(browserSync.stream());
}

function server(done) {
    var called = false;
    return nodemon({
        script: sources.server.server_file,
        ignore: [sources.server.ignore]
    }).on('start', function() {
        if (!called) {
            called = true;
            done();
        }
    })
}

function browserSyncServer() {
    browserSync.init({
        proxy: sources.server.url,
        port: sources.server.port,
        notify: true
    });
}

function watchFile() {
    gulp.watch(sources.watch.less, style);
    gulp.watch(sources.watch.html).on('change', reload);
    gulp.watch(sources.watch.js).on('change', reload);
    gulp.src(sources.path.js + 'build.min.js')
        .pipe(notify({ 
            message: 'Gulp is Watching. Happy Coding!'
        }));
}

exports.libScript = libScript;
exports.libStyle = libStyle;
exports.style = style;
exports.script = script;
exports.server = server;
exports.watchFile = watchFile;
exports.browserSyncServer = browserSyncServer;

gulp.task('dev', gulp.series(libStyle, style, libScript, script, server));
gulp.task('default', gulp.parallel('dev', watchFile, browserSyncServer));
