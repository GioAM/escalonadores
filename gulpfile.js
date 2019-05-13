const gulp  = require('gulp');
const less  = require('gulp-less');
const jsmin  = require('gulp-jsmin');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
// const notify = require('gulp-notify');
const uglifycss = require('gulp-uglifycss');
const browserSync = require('browser-sync').create();

let reload = browserSync.reload;

let sources = {
    less: [
        './assets/dev/less/reset.less',
        './assets/dev/less/default.less'
    ],
    lib: [
        './node_modules/jquery/dist/jquery.min.js',
        './node_modules/chart.js/dist/Chart.min.js'
    ],
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
        url: 'localhost',
        port: '8088'
    }
}

function lib() {
    return gulp.src(sources.lib)
        .pipe(concat('lib.js'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(sources.path.js));
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

function browserSyncServer() {
    browserSync.init({
        baseDir: './',
        proxy: sources.server.url,
        port: sources.server.port
    });
}

function watchFile() {
    gulp.watch(sources.watch.less, style);
    gulp.watch(sources.watch.html).on('change', reload);
    gulp.watch(sources.watch.js).on('change', reload);
}

exports.lib = lib;
exports.style = style;
exports.script = script;
exports.watchFile = watchFile;
exports.browserSyncServer = browserSyncServer;

// gulp.task('dev', gulp.series(style, lib, script));
gulp.task('default', gulp.parallel(style, watchFile, browserSyncServer));
