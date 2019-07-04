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
    // less: [
    //     './assets/dev/less/reset.less',
    //     './assets/dev/less/default.less'
    // ],
    // lib: {
    //     css: [
    //         './node_modules/bootstrap/dist/css/bootstrap.min.css',
    //         './node_modules/@fortawesome/fontawesome-free/css/all.min.css'
    //     ],
    //     js: [
    //         './node_modules/jquery/dist/jquery.min.js',
    //         './node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
    //         './node_modules/@fortawesome/fontawesome-free/js/all.min.js'
    //         // './node_modules/google-charts/dist/googleCharts.min.js'
    //     ]
    // }, 
    // js: [
    //     './assets/dev/js/default.js',
    //     './assets/dev/js/custom.js'
    // ],
    // watch: {
    //     less: [
    //         './assets/dev/less/**/*.less'
    //     ],
    //     js: [
    //         './assets/dev/js/**/*.js'
    //     ],
    //     html: [
    //         './*.html'
    //     ]
    // },
    // path: {
    //     css: [
    //         './assets/pub/css/'
    //     ],
    //     js: [
    //         './assets/pub/js/'
    //     ]
    // },
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


function server(done) {
    let called = false;
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


exports.server = server;
exports.browserSyncServer = browserSyncServer;

gulp.task('dev', gulp.series(server));
gulp.task('default', gulp.parallel('dev', browserSyncServer));
