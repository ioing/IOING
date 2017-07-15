var gulp = require("gulp"),
    del = require('del');
var minihtml = require("gulp-minify-ioing-html")
var minicss = require("gulp-minify-ioing-css")
var miniconfig = require("gulp-minify-ioing-config")
var gutil  = require("gulp-util");
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var concat = require('gulp-concat');


gulp.task('ioing', function () {
    
    var source = [
        'frameworks/lib/unify.js',
        'frameworks/lib/application.js',
        'frameworks/lib/proto.js',
        'frameworks/lib/transform.js',
        'frameworks/lib/template.js',
        'frameworks/lib/dom.js',
        'frameworks/lib/css.js',
        'frameworks/lib/fetch.js',
        'frameworks/lib/loader.js',
        'frameworks/lib/sandbox.js',
        'frameworks/lib/promise.js',
        'frameworks/lib/query.js',
        'frameworks/lib/move.js',
        'frameworks/lib/touch.js',
        'frameworks/lib/scroll.js'
    ]

    gulp.src(source)
        .pipe(concat('ioing.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./'))

    gulp.src(source)
        .pipe(concat('ioing.js'))
        .pipe(rename(function (path) {
            path.basename += ".debug"
            path.extname = ".js"
        }))
        .pipe(gulp.dest('./'))
})


// var dirOutput = 'build/pages/',
//     dirExculde = '';//排除的文件及文件夹


// gulp.task('copy', function () {
//     return gulp.src(['**/*'].concat(dirExculde))
//         .pipe(gulp.dest(dirOutput))
// })



gulp.task("copy", ["minify"], function() {
    return gulp.src(["{components,modules}/**/*.{svg,jpg,gif,png,webp,mp4,mp3,ogg}"], {
            base: "./"
        })
        .pipe(gulp.dest("build/pages/"));
});

gulp.task("minify", ["minify-js"], function() {
    return gulp.src(["{components,modules}/**/*.{html,css,json}"], {
            base: "./"
        })
        .pipe(minihtml())
        .pipe(gulp.dest("build/pages/"));
});

gulp.task("minify-js", ["clean"], function() {
    return gulp.src(["modules/config.js", "{components,modules}/*.js", "{components,modules}/**/*.js"], {
            base: "./"
        })
        .pipe(uglify())
        .pipe(gulp.dest("build/pages/"));
});

gulp.task("copy-css", function() {
    return gulp.src(["./modules/**/*.css"], {
            base: "./"
        })
        .pipe(minicss())
        .pipe(gulp.dest("build/css/"));
});

gulp.task("copy-config", function() {
    return gulp.src(["./modules/**/config.js"], {
            base: "./"
        })
        .pipe(uglify())
        .pipe(miniconfig())
        .pipe(gulp.dest("build/config/"));
});

gulp.task("copy-index", function() {
    return gulp.src(["index.html"], {
            base: "./"
        })
        .pipe(gulp.dest("build/pages/"));
});

//gulp.task("copy-components", ["clean"], function() {
//    return gulp.src(["components/**/*"])
//        .pipe(gulp.dest("build/pages/components"));
//});
//
//gulp.task("copy-indexHTML", ["clean"], function() {
//    return gulp.src(["index.html"])
//        .pipe(gulp.dest("build/pages/"));
//});

gulp.task("default", ['ioing'])