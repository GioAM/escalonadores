const gulp  = require('gulp');
const less  = require('gulp-less');
const concat = require('gulp-concat');
const jsmin  = require('gulp-jsmin');
const rename = require('gulp-rename');
const uglifycss = require('gulp-uglifycss');
const browserSync = require('browser-sync');

let sources = {
    lib: [
        './node_modules/jquery/dist/jquery.min.js',
        './node_modules/chart.js/dist/Chart.min.js'
    ],
    less: [
        './assets/dev/less/reset.less',
        './assets/dev/less/default.css'
    ],
    js: [
        './assets/dev/js/default.js'
    ],
    server: {
        url: 'localhost',
        port: '8088'
    }
}

// gulp.task('w', function() {
//     gulp.watch('./assets/dev/**/*', [
//         'css',
//         'js'
//     ]);
// });

gulp.task('css', function() {
    return gulp.src(sources.less)
    .pipe(concat('build.css'))
    .pipe(uglifycss())
    .pipe(rename({
        suffix: '.min'
    }))
    .pipe(gulp.dest('./assets/pub/css/'));
});

gulp.task('lib', function() {
    return gulp.src(sources.lib)
    .pipe(concat('lib.js'))
    .pipe(gulp.dest('./assets/pub/js/'));
});

gulp.task('js', function() {
    return gulp.src(sources.js)
    .pipe(concat('build.js'))
    .pipe(jsmin())
    .pipe(rename({
        suffix: '.min'
    }))
    .pipe(gulp.dest('./assets/dev/pub/js/'));
});

gulp.task('browser-sync', function () {
    browserSync.init({
        proxy: sources.server.url,
        port: sources.server.port
    });
});

// gulp.task('default', ['css']);