let fs = require('fs'),
	del = require('del'),
	git = require('git-rev-sync'),
	gulp = require('gulp'),
	path=require("path"),
	replace = require('gulp-replace'),
	cssnano = require('gulp-cssnano'),
	rename = require('gulp-rename'),
	concat = require('gulp-concat'),
    watch = require('gulp-watch'),
    babel = require('gulp-babel'),
    uglify = require('gulp-uglify'),
 	livereload = require('gulp-livereload'),
    webserver = require('gulp-webserver')

let Promise = require("bluebird")

let PATH = {
	build : "./build/",  							// build 目录	
    pages : "./build/",  					    	// 应用 index.html 位置
    static : "./build/static/", 					// 应用 cdn 资源位置
    approot : "static/"
}

let release = false
let browser = {
	href: './index.html'
}
let loadcache = []

// 首页 html 打包模块配置

let prefetch = [
	{
		id : "frameworks",
		source : {
	        index : "index.html",
	        nav : "nav.html",
	        footer : "footer.html"
	    }
	},
	{
		id : "docs-started-ioing"
	}
]

// let version = getVersion()

// import to require

class ES6ModulesToCJSTransformer {
	constructor() {
		this.REGEXP_IMPORT_LINE = new RegExp("^\\s*import(?:\\s+(.*)\\s+from\\s+|\\s+)(?:\'|\")([^\\s;]+)(?:\'|\");?$")
		this.REGEXP_EXPORT_LINE = new RegExp("^\\s*export(?:\\s+(\\{(.*)\\}|[\\w]+))\\s?([\\w]+)?\\s?(\\=)?", "g")
		this.REGEXP_SUB_IMPORT = new RegExp("(.*)\\s*\\{(.*)\\}\\s*(.*)")
		this.REGEXP_ALIAS = new RegExp("(\\S+)\\s+as\\s+(\\S+)")
		this.REGEXP_BEFORE = new RegExp("\\s*([^\\s,]+)\\s*,")
		this.REGEXP_AFTER = new RegExp(",\\s*([^\\s,]+)\\s*")
		this.REGEXP_PATH = new RegExp("(?:\\.{0,2}(?:\\/|\\.))+(\\w)", "g")
		this.REGEXP_IMPORT_GROUP_SPLIT = new RegExp("\\s?,\\s?")
		this.REGEXP_NEW_LINE = new RegExp("\\n|\\r")
		this.variableDeclarationWord = 'const'
	}

	getStructure (subImport) {
	    let alias = subImport && subImport.match(this.REGEXP_ALIAS)
	    let structure = alias ? alias.slice(1) : [subImport, subImport]
	    return structure.map((name) => {
	        return name ? name.trim() : name
	    })
	}
	
	getAssignment (structure, requireName) {

	    if (structure[0] === '*') {
	        return ''
	    }
	    return this.variableDeclarationWord + ' ' + structure[0] + ' = ' + requireName + '[\'' + structure[1] + '\'];';

	}

	getRequireName (path) {

	    return path ? path.replace(this.REGEXP_PATH, (match, firstLetter, offset) => {
	        return offset ? firstLetter.toUpperCase() : firstLetter
	    }) : path

	}

	transform (sourceContent) {

	    let lines = sourceContent.split(this.REGEXP_NEW_LINE)
	    let exports = []

	    let self = this

	    let getStructure = this.getStructure.bind(this)

	    lines = lines.map((line) => {
	        let match = line.match(self.REGEXP_IMPORT_LINE)

	        if (!match) {
	            return line
	        }

	        let allStructures = []
	        let requireName = ''

	        let importsString = match[1]
	        let path = match[2]

	        let allImports = importsString && importsString.match(self.REGEXP_SUB_IMPORT) || []
	        let structure = null

	        let requirePart = ''
	        let importParts = []

	        if (allImports.length > 1) {
	            let subImportMatch = allImports[2].split(self.REGEXP_IMPORT_GROUP_SPLIT)
	            allStructures = allStructures.concat(subImportMatch.map(getStructure))

	            if (allImports[1]) {
	                let beforeImports = allImports[1].match(self.REGEXP_BEFORE)
	                if (beforeImports) {
	                    structure = getStructure(beforeImports[1])
	                    allStructures.push(structure)
	                }
	            }

	            if (allImports[3]) {
	                let afterImports = allImports[3].match(self.REGEXP_AFTER)
	                if (afterImports) {
	                    structure = getStructure(afterImports[1])
	                    allStructures.push(structure)
	                }
	            }

	            if (!allImports[1] && !allImports[3]) {
	                structure = [path, path]
	            }

	        } else {
	            structure = getStructure(importsString)
	            allStructures.push(getStructure(importsString))
	        }

	        requireName = structure[1]

	        if (requireName) {
	            requireName = self.getRequireName(requireName)
	            requirePart = self.variableDeclarationWord + ' ___' + requireName + ' = '
	            importParts.push(self.variableDeclarationWord + ' ' + requireName + ' = ___' + requireName + '[\'default\'] || ___' + requireName + ';')
	        }

	        requirePart += 'require(\'' + path + '\')'

	        allStructures.forEach(function(structure) {
	            if (structure && requireName === structure[0] && structure[0] === structure[1]) {
	                return
	            }
	            let assignment = self.getAssignment(structure, '_' + requireName)
	            if (assignment) {
	                importParts.push(assignment)
	            }
	        })

	        line.replace(self.REGEXP_EXPORT_LINE, (c, n, v, l, k) => {
	        	let slin = v.split(' ')
	        	if ( n.indexOf('{') === 0 ) {
	        		let exports = []
	        		let spl = n.split(',')
	        		for (let i = 0, l = spl.length; i < l; i++) {
		        		let s = spl[i].split(' ')
		        		exports.push('module.exports[' + s[0] + '] = ' + s[s[1] === 'as' ? 2 : 0])
		        	}
		        	return exports.join('\n')
	        	} else if ( n === 'default' ) {
	        		return 'module.exports.default = '
	        	} else if ( k === '=' ) {
	        		return n + ' ' + l + ' = module.exports[' + n + '] = '
	        	}
	        })

	        return requirePart + (importParts.length ? '\n' + importParts.join('\n') : '')
	    })

	    return lines.join('\n')

	}
}

let ES6ModulesToCJS = new ES6ModulesToCJSTransformer()

// get git v

let getVersion = () => {
    let version = git.branch()
    // branch like: publish/1.1.0
    version = version.indexOf('publish/') > -1 ? version.replace(/publish\//,'') : '0.0.0'
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
            }
            else {
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

// importToAmd

let importToAmd = () => {
    let through = require('through2')
    let babelcore = require("babel-core")

    return through.obj(function(file, enc, cb, contents) {
        contents = file.contents.toString()
		contents = ES6ModulesToCJS.transform(contents)
        file.contents = new Buffer(contents)

        this.push(file)
        cb()
    })
}

// babel

let babelhtml = () => {
    let through = require('through2')
    let babelcore = require("babel-core")

    return through.obj(function(file, enc, cb, contents) {
        contents = file.contents.toString()

		contents = ES6ModulesToCJS.transform(contents)
        contents = contents.replace(/(\<script[^\>]*>)([\s\S]*?)(?=\<\/script\>)(\<\/script\>)/ig, function (content, pre, code, suf) {
        	if ( /^[\s\n]+$/g.test(code) || code.length == 0 ) return content
        	if ( /\ses6/.test(pre) ) {
        		return pre.replace(/\ses6/, '') + code + suf
        	}
            return  pre + babelcore.transform(code, {
                        presets: ['es2015','stage-3']
                    }).code + suf
        })

        file.contents = new Buffer(contents)

        this.push(file)
        cb()
    })
}

// babel unify

gulp.task("babel:unify", (cb) => {
	let index = 'ioing_src/lib/unify.js'
	gulp.src(index)
		.on('end', cb)
    	.pipe(watch(index))
    	.pipe(babel({
	      presets: ['es2015','stage-3']
	    }))
	    .pipe(gulp.dest('ioing_src/dist'))
})

// bulid ioing

gulp.task("build:ioing", ["babel:unify"], (cb) => {
	let libs = [
        'ioing_src/lib/application.js',
        'ioing_src/lib/proto.js',
        'ioing_src/lib/transform.js',
        'ioing_src/lib/template.js',
        'ioing_src/lib/dom.js',
        'ioing_src/lib/css.js',
        'ioing_src/lib/fetch.js',
        'ioing_src/lib/loader.js',
        'ioing_src/lib/sandbox.js',
        'ioing_src/lib/promise.js',
        'ioing_src/lib/query.js',
        'ioing_src/lib/move.js',
        'ioing_src/lib/touch.js',
        'ioing_src/lib/scroll.js'
    ]

    gulp.src(libs)
    	.on('end', cb)
    	.pipe(watch(libs))
    	.pipe(babel({
	      presets: ['es2015','stage-3'],
	    }))
	    .pipe(gulp.dest('ioing_src/dist'))
})

// concat ioing

gulp.task("concat:ioing", ["build:ioing"], (cb) => {
	 let dist = [
		'ioing_src/dist/unify.js',
        'ioing_src/dist/application.js',
        'ioing_src/dist/proto.js',
        'ioing_src/dist/transform.js',
        'ioing_src/dist/template.js',
        'ioing_src/dist/dom.js',
        'ioing_src/dist/css.js',
        'ioing_src/dist/fetch.js',
        'ioing_src/dist/loader.js',
        'ioing_src/dist/sandbox.js',
        'ioing_src/dist/promise.js',
        'ioing_src/dist/query.js',
        'ioing_src/dist/move.js',
        'ioing_src/dist/touch.js',
        'ioing_src/dist/scroll.js'
    ]

    let stream = gulp.src(dist) 
    	.on('end', cb)
        .pipe(concat('ioing.js'))

    if ( release ) {
    	stream = stream.pipe(uglify())
    }

    stream.pipe(gulp.dest('./'))
})

// clean bulid

gulp.task("clean", () => {
    return del.sync(PATH.build)
})

// copy static

gulp.task("copy", (cb) => {
	let staticMedia = ["{components,modules}/**/*.{json,svg,jpg,jpeg,gif,png,webp,bmp,tpg,mp4,mp3,ogg}"]
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
	        contents = contents.replace(/define\(/, function (d) {
	        	return d + '"' + PATH.approot + id + '", '
	        })
	        loadcache.push('<script>\n'
	        	+ contents + '\n'
	        	+ '</script>')
			
	        cb()
	    })
    }

    let step = () => {
    	id = "modules/" + prefetch.pop().id + "/config"
    	gulp.src([PATH.static + id + ".js"])
			.on('end', function () {
				if ( prefetch.length == 0 ) {
					cb()
				} else {
					step()
				}
			})
			.pipe(geter())
    }
 
    if ( prefetch.length == 0 ) {
    	cb()
    } else {
    	step()
    }
    
})

// bulid index page

gulp.task("index", ["fetchModule", "moveRootJs"], (cb) => {
    gulp.src(["index.html"])
    	.on('end', cb)
        .pipe(replace(/\/\*\*::config\*\*\//g, 'App.config.root = "' + PATH.approot + '"'))
        .pipe(replace(/<script .*?src=\"(.+?)\"/ig, function (script, url) {
        	return url.match(/^\w+\:/) === null && url.indexOf('//') !== 0 ? script.replace(/src=\"(.+?)\"/, "src=\"" + PATH.approot + url + "\"") : script
        }))
        .pipe(replace(/\<\/head\>/ig, function (head) {
        	return loadcache.join('\n') + head
        }))
        .pipe(babelhtml())
        .pipe(gulp.dest(PATH.pages))
})

// bulid js

gulp.task("js", (cb) => {
    var stream = gulp.src(["{components,modules}/**/*.js"])
	    .on('end', cb)
	    .pipe(watch(["{components,modules}/**/*.js"]))
	    .pipe(importToAmd())
	    .pipe(babel({
	      presets: ['es2015','stage-3'],
	      plugins: ['babel-plugin-transform-es2015-modules-amd']
	    }))

	if ( release ) {
    	stream = stream.pipe(uglify())
    }

	stream.pipe(gulp.dest(PATH.static))
})

// bulid css

gulp.task('css', (cb) => {
    gulp.src(["{components,modules}/**/*.css"])
    	.on('end', cb)
	    .pipe(watch(["{components,modules}/**/*.css"]))
	    .pipe(cssnano({safe: true}))
	    .pipe(gulp.dest(PATH.static))
})

// build html

gulp.task("html", (cb) => {
    gulp.src(["{components,modules}/**/*.html"])
    	.on('end', cb)
    	.pipe(watch(["{components,modules}/**/*.html"]))
        .pipe(babelhtml())
        .pipe(gulp.dest(PATH.static))
})

gulp.task("new", () => {
	let options = process.argv.slice(2)
	let id = options[2]
	let type = options[1].replace(/^-+/, '')
	let time = Date.now()
	let uri

	switch (type) {
		case 'module':
			id = id || 'new-module-' + time
			uri = "modules/" + id
			if ( mkdirs(uri, 0777) ) {
				let fsopt =  { encoding: 'utf8', mode: 777, flag: 'w' }

				fs.writeFile(uri + "/config.js", `
export default {
	transformstart : function () {
	},
	transformsend : function () {
	},
    preload : function () {
    },
    resources : {
        script : {
        },
        source : {
            index : "index.html"
        },
        style : {
        	main : "main.css"
        },
        data : {
        	lang : ["你好！", "Hello!", "こんにちは!", "안녕 하세요!", "bonjour!", "Hallo!", "Ciao!", "Hola!", "Здравствуйте!"]
        }
    },
    config : {
    	leve : 1,
        absolute : true,
        background : "#fff",
        style : ["main"],
        script : [],
        source : ["index"],
        data : ["lang"],
        cache : 360,
        sandbox : true,
        shadowbox : false,
        animation : "slide"
    },
    helper : {
    },
    controller : {
    }
}
					`, fsopt, function(err) {
				    if ( err ) {
				        return console.log(err)
				    }
				})

				fs.writeFile(uri + "/main.css", `
h1 {
	position: absolute;
    width: 100%;
    top: 45%;
	font-size: 36dp;
	color: #333;
	font-weight: 300;
	text-align: center;
	opacity: 0;
	transition: opacity .3s;
}
h1.active {
	opacity: 1;
}
					`, fsopt, function(err) {
				    if ( err ) {
				        return console.log(err)
				    }
				})

				fs.writeFile(uri + "/index.html", `
<script sync>
	scope.cur = 0
</script>
<scroll fullscreen>
	<scrolling>
		<loop lang as val i>
			<h1 class="{{cur == i ? 'active' : ''}}">{val}</h1>
		</loop>
	</scrolling>
</scroll>
<script>
    setInterval(function () {
    	if ( scope.cur == scope.lang.length - 1 ) {
    		scope.cur = 0
    	} else {
    		scope.cur++
    	}
    }, 2500)
</script>
					`, fsopt, function(err) {
				    if ( err ) {
				        return console.log(err)
				    }
				    browser.href = '#' + id
				    gulp.start('dev')
				    console.log("模块[" + id + "]创建成功！")
				})
			} else {
				console.log("模块[" + id + "]创建失败！")
			}
			
		break

		case 'components':
			id = id || 'new-components' + time
			uri = "components/" + id
			if ( mkdirs(uri, 0777) ) {
				fs.writeFile(uri + "/index.html", `
<style>
	h1 {
		font-size: 14dp;
	}
</style>
<h1>components content</h1>
					`, fsopt, function(err) {
				    if ( err ) {
				        return console.log(err)
				    }
				    console.log("组件[" + id + "]创建成功！")
				})
			} else {
				console.log("组件[" + id + "]创建失败！")
			}
			
		break

		default:
			console.log("命令错误！")
		break
	}
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