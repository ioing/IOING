
// import gulp from "gulp";
// import browserify from "browserify";
// import source from "vinyl-source-stream";

var gulp = require('gulp')
var browserify = require('browserify')
var source = require('vinyl-source-stream')


gulp.task("default", function () {

  return browserify("lib/application.js")
    .transform("babelify")
    .bundle()
    .pipe(source("application.js"))
    .pipe(gulp.dest("dist"))
})