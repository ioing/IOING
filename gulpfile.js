let fs = require('fs'),
  del = require('del'),
  git = require('git-rev-sync'),
  gulp = require('gulp'),
  path = require("path"),
  replace = require('gulp-replace'),
  cssnano = require('gulp-cssnano'),
  rename = require('gulp-rename'),
  concat = require('gulp-concat'),
  watch = require('gulp-watch'),
  babel = require('gulp-babel'),
  uglify = require('gulp-uglify'),
  livereload = require('gulp-livereload'),
  webserver = require('gulp-webserver'),
  toCJSTransformer = require('gulp-imports-to-commonjs'),
  babelScriptTag = require('gulp-babel-script-tag'),
  createIoingDemo = require('gulp-create-ioing-demo')

let PATH = {
  build: "./build/", // build 目录
  pages: "./build/", // 应用 index.html 位置
  static: "./build/static/", // 应用 cdn 资源位置
  approot: "static/"
}

let release = false
let browser = {
  href: './index.html'
}
let loadcache = []

// 首页 html 打包模块配置

let prefetch = [{
    id: "frameworks",
    source: {
      index: "index.html",
      nav: "nav.html",
      footer: "footer.html"
    }
  },
  {
    id: "docs-started-ioing"
  }
]

// let version = getVersion()

// get git v

let getVersion = () => {
  let version = git.branch()
  // branch like: publish/1.1.0
  version = version.indexOf('publish/') > -1 ? version.replace(/publish\//, '') : '0.0.0'
  return version
}

let openbrowser = () => {
  return gulp.src(PATH.pages)
    .pipe(webserver({
      host: 'localhost',
      livereload: true,
      open: browser.href,
      port: 8000
    }))
}

// mkdirs

let mkdirs = (dirpath, mode) => {
  if (!fs.existsSync(dirpath)) {
    let pathtmp
    dirpath.split(path.sep).forEach(function(dirname) {
      if (pathtmp) {
        pathtmp = path.join(pathtmp, dirname)
      } else {
        pathtmp = dirname
      }
      if (!fs.existsSync(pathtmp)) {
        if (!fs.mkdirSync(pathtmp, mode)) {
          return false
        }
      }
    })
  }
  return true
}



let libs = [
  'src/ioing/unify.js',
  'src/ioing/application.js',
  'src/ioing/proto.js',
  'src/ioing/transform.js',
  'src/ioing/template.js',
  'src/ioing/dom.js',
  'src/ioing/css.js',
  'src/ioing/source.js',
  'src/ioing/loader.js',
  'src/ioing/sandbox.js',
  'src/ioing/promise.js',
  'src/ioing/query.js',
  'src/ioing/animate.js',
  'src/ioing/touch.js',
  'src/ioing/scroll.js'
]

// bulid ioing

gulp.task("ioing", (cb) => {
  let stream = gulp.src(libs)
    .on('end', cb)
    .pipe(babel({
      presets: ['es2015', 'stage-3'],
    }))

  if (release) {
    stream = stream.pipe(uglify())
  }

  stream.pipe(gulp.dest(PATH.static + 'io'))
})

gulp.task("concat:ioing", (cb) => {

  let stream = gulp.src(libs)
    .on('end', cb)
    .pipe(concat('ioing.js'))
    .pipe(babel({
      presets: ['es2015', 'stage-3'],
    }))

  if (release) {
    stream = stream.pipe(uglify())
  }
  stream.pipe(gulp.dest('./'))
  stream.pipe(gulp.dest(PATH.static))
})

// clean bulid

gulp.task("clean", () => {
  return del.sync(PATH.build)
})

// copy static

gulp.task("copy", (cb) => {
  let staticMedia = ["{components,modules}/**/*.{json,svg,jpg,jpeg,gif,png,webp,bmp,tpg,mp4,mp3,ogg,eot,woff,ttf}"]
  gulp.src(staticMedia)
    .on('end', cb)
    .pipe(watch(staticMedia))
    .pipe(gulp.dest(PATH.static))
})

// move ioing.js

gulp.task("moveRootJs", ["concat:ioing"], (cb) => {
  gulp.src(["*.js"])
    .on('end', cb)
    .pipe(gulp.dest(PATH.static))
})

// prefetch index module

gulp.task("fetchModule", ["js"], (cb) => {
  let id = ''
  let geter = () => {
    let through = require('through2')

    return through.obj(function(file, enc, cb, contents) {
      contents = file.contents.toString()
      contents = contents.replace(/define\(/, function(d) {
        return d + '"' + PATH.approot + id + '", '
      })
      loadcache.push('<script>\n' +
        contents + '\n' +
        '</script>')

      cb()
    })
  }

  let step = () => {
    id = "modules/" + prefetch.pop().id + "/config"
    gulp.src([PATH.static + id + ".js"])
      .on('end', function() {
        if (prefetch.length == 0) {
          cb()
        } else {
          step()
        }
      })
      .pipe(geter())
  }

  if (prefetch.length == 0) {
    cb()
  } else {
    step()
  }

})

// bulid index page

gulp.task("index", ["fetchModule", "serviceWorker", "moveRootJs"], (cb) => {
  gulp.src(["index.html"])
    .on('end', cb)
    .pipe(replace(/\/\*\*::config\*\*\//g, 'App.config.root = "' + PATH.approot + '"'))
    .pipe(replace(/<script .*?src=\"(.+?)\"/ig, function(script, url) {
      return url.match(/^\w+\:/) === null && url.indexOf('//') !== 0 ? script.replace(/src=\"(.+?)\"/, "src=\"" + PATH.approot + url + "\"") : script
    }))
    .pipe(replace(/\<\/head\>/ig, function(head) {
      return loadcache.join('\n') + head
    }))
    .pipe(babelScriptTag())
    .pipe(gulp.dest(PATH.pages))
})

gulp.task("serviceWorker", (cb) => {
  gulp.src(["service-worker.js"])
    .on('end', cb)
    .pipe(gulp.dest(PATH.pages))
})

// bulid js

gulp.task("js", (cb) => {
  var stream = gulp.src(["{components,modules}/**/*.js"])
    .on('end', cb)
    .pipe(watch(["{components,modules}/**/*.js"]))
    .pipe(toCJSTransformer())
    .pipe(babel({
      presets: ['es2015', 'stage-3'],
      plugins: ['babel-plugin-transform-es2015-modules-amd']
    }))

  if (release) {
    stream = stream.pipe(uglify())
  }

  stream.pipe(gulp.dest(PATH.static))
})

// bulid css

gulp.task('css', (cb) => {
  gulp.src(["{components,modules}/**/*.css"])
    .on('end', cb)
    .pipe(watch(["{components,modules}/**/*.css"]))
    .pipe(cssnano({
      safe: true
    }))
    .pipe(gulp.dest(PATH.static))
})

// build html

gulp.task("html", (cb) => {
  gulp.src(["{components,modules}/**/*.html"])
    .on('end', cb)
    .pipe(watch(["{components,modules}/**/*.html"]))
    .pipe(babelScriptTag())
    .pipe(gulp.dest(PATH.static))
})

// new --module [name]

gulp.task("new", () => {
  createIoingDemo((id) => {
    browser.href = '#' + id
    gulp.start('dev')
  })
})

// startup application

gulp.task("webserver", ["build"], openbrowser)
gulp.task('build', ["clean", "copy", "index", "css", "html"])
gulp.task("release", () => {
  release = true
  gulp.start("webserver")
})
gulp.task("dev", ["webserver"])
gulp.task("default", ["build"])
