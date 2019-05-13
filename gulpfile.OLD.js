const gulp  = require('gulp');
const less  = require('gulp-less');
const concat = require('gulp-concat');
const jsmin  = require('gulp-jsmin');
const rename = require('gulp-rename');
const uglifycss = require('gulp-uglifycss');
const browserSync = require('browser-sync');
const notify = require('gulp-notify');

let reload = browserSync.reload;

let sources = {
    lib: [
        './node_modules/jquery/dist/jquery.min.js',
        './node_modules/chart.js/dist/Chart.min.js'
    ],
    js: [
        './assets/dev/js/default.js'
    ],
    less: [
        './assets/dev/less/reset.less',
        './assets/dev/less/default.less'
    ],
    dir_css: [
        './assets/dev/less/**'
    ],
    dir_js: [
        './assets/dev/js/**'
    ],
    server: {
        url: 'localhost',
        port: '8088'
    }
}

function css() {
    return gulp.src(sources.less)
        .pipe(concat('build.css'))
        .pipe(less())
        .pipe(uglifycss())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('./assets/pub/css/'));
}

function lib() {
    return gulp.src(sources.lib)
        .pipe(concat('lib.js'))
        .pipe(gulp.dest('./assets/pub/js/'));
}

function js() {
    return gulp.src(sources.js)
        .pipe(concat('build.js'))
        .pipe(jsmin())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('./assets/pub/js/'));
}

function browser_sync(done) {
    browserSync.init({
        proxy: sources.server.url,
        port: sources.server.port
    });

    done();
}

function watchFiles() {
    gulp.watch(sources.dir_css, css);
    gulp.watch(sources.dir_js, gulp.series(js, reload));
    gulp.src('./assets/pub/js/' + 'build.min.js')
        .pipe(notify({ message: 'Gulp is Watching. Happy Coding!' }));
}

gulp.task('css', css);
gulp.task('lib', lib);
gulp.task('js', js);
gulp.task('watchFiles', watchFiles);
// gulp.task('dev', dev);
gulp.task('default', gulp.series(watchFiles, browser_sync));