/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	// templates & trans viewport
	
	import Async from './fetch.js'
	import Template from './template.js'
	import Transform from './transform.js'
	import Proto from './proto.js'
	
	// Immunity
	
	var IMMUNITY = []
	
	function DNA (element, remove) {
		if ( remove ) {
			var i = IMMUNITY.indexOf(element)
			if ( i >= 0 ) {
				IMMUNITY.splice(i, 1)
			}
		} else {
			IMMUNITY.push(element)
		}
	}
	
	// Module
	
	function Module (id) {
	
		// initial
	
		this.id = id
		this.param = {}
		this.status = {}
		this.helper = {}
		this.elements = {}
		this.prefetch = {}
		this.dimension = null
		this.controller = {}
		this.updatetime = {}
		this.remoteframe = false
		this.storagemaps = []
		this.initialparam = {}
		this.initialconfig = {}
	
		// _
		this.events = {}
		this._events = {}
	}
	
	Module.prototype = {
		init : function () {
			this.update = true
			this._events = {}
	
			this.rsetParam()
	
			return this
		},
	
		on : function (types, fn) {
			var that = this
	
	        types.split(' ').each(function (i, type) {
	        	that._events.initial(type, []).push(fn)
	        })
	
	        return this
	    },
	
	    one : function (types, fn) {
	    	var that = this
	
	    	function once () {
	    		fn.apply(this, arguments)
	    		this.off(types, once)
	    	}
	
	    	types.split(' ').each(function (i, type) {
	    		that._events.initial(type, []).push(once)
	    	})
	
	    	return this
	    },
	
	    off : function (types, fn) {
	    	var that = this
	
	        types.split(' ').each(function (i, type) {
	        	if ( !that._events[type] ) return
	
	        	var index = that._events[type].indexOf(fn)
	
	        	if ( index > -1 ) {
	                that._events[type].splice(index, 1)
	            }
	        })
	    },
	
	    origin : function (sids, callback) {
	        var geter = new promise.Promise()
	
	        App.async.async(this.id, this.param, sids, 'data', geter)
	
	        promise.join([geter]).then(function (data) {
	            callback(data[0][3], data)
	        })
	    },
	
	    turnover : function (options, callback) {
	    	var id = options.id
	    	var data = options.data
	    	var start = options.start
	    	var limit = options.limit
	    	var linker = options.linker
	    	var origins = options.origins
	    	var endflag = options.endflag
	    	var turnover = options.turnover
	
	    	function filter (data) {
	            var row = []
	            var ext = {}
	            var end = true
	
	            row = linker ? data.getValueByRoute(linker) : data
	
	            if ( !row || !row[0] ) {
	                return callback(null, end)
	            }
	
	            if ( endflag ) {
	                end = data.getValueByRoute(endflag) ? true : false
	            } else {
	                end = row.length < Number(limit) ? true : false
	            }
	
	            // 附加源
	
	            row.map(function (v, i) { return v.__proto__ = data })
	            
	            // 回调给滚动组件
	            
	            callback(row, end)
	        }
	
	        // set module param
	
	        this.setParam((function () {
	
	            this.page = this._page = this.$page = Math.ceil(start / limit)
	            this.start = this._start = this.$start = start
	            this.limit = this._limit = this.$limit = limit
	            this.turnover = this._turnover = this.$turnover = turnover
	
	            return this
	        }).call({}))
	
	        data ? filter(data) : this.origin(origins, filter)
	    },
	
	    trigger : function (type) {
	    	var that = this
	    	var args = arguments
	    	var events = this._events[type]
	
	    	if ( !events ) return
	
	    	for (var i = events.length - 1; i >= 0; i--) {
	    		events[i].apply(that, [].slice.call(args, 1))
	    	}
	    },
	
		setParam : function (param, initial) {
			App.setParam(this.id, param, initial)
	
			return this
		},
	
		rsetParam : function () {
			this.param = this.initialparam.clone()
	
			return this
	    },
	
		clearCache : function (dimension, storage) {
			App.clearCache(this.id, dimension, storage)
	
			return this
		},
	
		cloneAsNew : function (id) {
			return {}.extend(this, new Module(this.id), { 
				id : id, 
				config : {}.extend(this.config), 
				param : {}.extend(this.initialparam), 
				elements : {},
				initialparam : this.initialparam 
			})
		},
	
		clipView : function (clip) {
			var mask = this.elements.mask
			var view = this.elements.view
			
			if ( !clip || !mask || !view ) return
	
			if ( clip.length === 1 ) {
	            clip[1] = clip[2] = clip[3] = clip[0]
	        } else if ( clip.length === 2 ) {
	            clip[2] = clip[0]
	            clip[3] = clip[1]
	        } else if ( clip.length === 3 ) {
	            clip[3] = clip[1]
	        }
	
			mask.css({
				"display"   : "block",
	            "position"  : "absolute",
	            "top"       : clip[0] + 'dp',
	            "right"     : clip[1] + 'dp',
	            "bottom"    : clip[2] + 'dp',
	            "left"      : clip[3] + 'dp',
	            "overflow"  : "hidden"
	        })
	
			view.css({
				"display"   : "block",
	            "position"  : "absolute",
	            "top"       : "-" + clip[0] + 'dp',
	            "right"     : "-" + clip[1] + 'dp',
	            "bottom"    : "-" + clip[2] + 'dp',
	            "left"      : "-" + clip[3] + 'dp'
	        })
		},
	
		addElement : function (name, element) {
			if ( this.refreshing && this.elements[name] instanceof Element ) {
				this.refreshing.push(this.elements[name])
			}
			
			// sandbox
			
			if ( name === 'sandbox' ) {
				this.sandbox = element
			}
	
			this.elements[name] = element
		},
	
		loading : function (display) {
			App.transform.loading(this.id, display)
		},
	
		refresh : function (dimension, prefetch, readied) {
	
			// refreshstart
			
			this.trigger('refresh')
			App.trigger('refreshstart', this.id)
	
			// module dimension
	
			dimension = !dimension ? this.dimension : dimension
	
			// clear module cache & storeage
	
			this.clearCache(true, true)
	
			// setParam
			
			this.setParam(dimension, true)
	
			// refreshing elements
			
			this.refreshing = []
	
	        // prefetch this module resources
	
	        App.transform.update(this.id, dimension, function (render) {
	        	if ( prefetch ) {
					prefetch(render)
				} else {
					render()
				}
	        }, function (render) {
	
	        	if ( this.refreshing ) {
					this.refreshing.each(function (i, element) {
						if ( element.localName === 'iframe' ) {
							element.src = 'about:blank'
						}
	
						element.remove()
					})
	
					this.refreshing = null
				}
	
				if ( readied ) {
					readied(render)
				} else {
					render()
				}
	
				App.trigger('refreshend', this.id)
	
			}.bind(this))
	
	        return this
		},
	
		destroy : function (type) {
			var sandbox = this.elements.sandbox
	
			if ( sandbox ) {
	
				var swindow = sandbox.window
	
				sandbox.iframe.src = 'about:blank'
				swindow.location.reload()
	
				// clear document
	
				swindow.document.write('') //清空iframe的内容
	
				// close iframe window
	
				swindow.close() //避免iframe内存泄漏
	
				// clear window
	
				for ( var i in swindow ) { 
					try {
						delete swindow[i]
					} catch (e) {}
				}
	
				// remove iframe
	
				sandbox.iframe.remove()
	
				// delete sandbox
	
				delete this.elements.sandbox
			}
	
			this.Template = null
			this.loaded = null
	
			delete this.Template
	
			// clear container
	
			switch (type) {
				case 1:
					this.elements.container.innerHTML = null
					break
	
				case -1:
					this.elements.container.remove()
	
					delete App.modules[this.id]
	
					break
			}
	
			return this
		}
	}
	
	// define Application
	
	function Application () {
		if ( !(this instanceof Application) ) {
	        return new Application()
	    }
	
		this.init()
	}
	
	Application.prototype = {
		init : function () {
			this._error = {}
			this._events = {}
			this._prefetchs = {}
			this._callbacks = {}
	
			this.async = new Async()
			this.sandbox = new Sandbox(true, true).extend()
			this.transform = new Transform()
	
			// _EXISTS
	
			this._EXISTS = false
	
			// setting
			
			this.modules = {}
			this.config = {}
	
			this.setting(window.__config__)
	
			// console version
	
			this.name = App
			this.version = '3.0.1'
			this.console.log(this.version, 'Version', 'ioing.com')
	
	        // lock top window
	        
	        window.addEventListener('touchstart', function (e) {
	        	if ( !App.preventDefaultException(e, { tagName: /^(INPUT|TEXTAREA|HTMLAREA|BUTTON|SELECT)$/ }) ) {
					e.preventDefault()
				}
	        }, false)
	        window.addEventListener('touchmove', preventDefaultEvent, false)
		},
	
		setting : function (opts) {
			opts = opts || {
				root : ''
			}
	
			this.config.extend(opts)
		},
	
		check : function () {
			
			function check () {
				return applicationCache.status == applicationCache.UPDATEREADY
			}
	
			function updateready () {
				// Browser downloaded a new app cache.
				 
		      	// Swap it in and reload the page to get the new hotness.
		 		try {
	
		      		applicationCache.swapCache()
	
		      		App.trigger("cachechange")
	
		      	} catch (e) {}
			}
	
			if ( check() ) {
	
				updateready()
	
			} else {
				applicationCache.addEventListener("updateready", function (e) {
	 
				    if ( check() ) {
				 
				      	updateready()
				 
				    } else {
				 
				      	// Manifest didn’t changed. Nothing new to server.
	
				      	App.trigger('cachenochange')
				 
				    }
				 
				}, false)
			}
		
		},
	
		on : function (types, fn) {
			var that = this
	
	        types.split(' ').each(function (i, type) {
	        	that._events.initial(type, []).push(fn)
	        })
	
	        return this
	    },
	
	    one : function (types, fn) {
	    	var that = this
	
	    	function once () {
	    		fn.apply(this, arguments)
	    		this.off(types, once)
	    	}
	
	    	types.split(' ').each(function (i, type) {
	    		that._events.initial(type, []).push(once)
	    	})
	
	    	return this
	    },
	
	    off : function (types, fn) {
	    	var that = this
	
	        types.split(' ').each(function (i, type) {
	        	if ( !that._events[type] ) return
	
	        	var index = that._events[type].indexOf(fn)
	
	        	if ( index > -1 ) {
	                that._events[type].splice(index, 1)
	            }
	        })
	    },
	
	    trigger : function (type) {
	    	var that = this
	    	var args = arguments
	
	        if ( !this._events[type] ) return
	
	        this._events[type].each(function (i, fn) {
	        	try {
	        		fn.apply(that, [].slice.call(args, 1))
	        	} catch (e) {
	        		that.off(type, fn)
	        		that.console.warn('event:' + type, 'Expire', 'be off')
	        	}
	        })
	    },
	
	    to : function () {
	    	return App.transform.to.apply(App.transform, arguments)
	    },
	
		get : function (id, callback, failed) {
	
			if ( !id ) return
			if ( this._error[id] ) return failed && failed()
	
			// 主依赖
			
			if ( id !== 'frameworks' && this.modules.frameworks === undefined ) {
				return this.get('frameworks', function () {
					App.get(id, callback, failed)
				})
			}
	
			var that = this
			var modules = this.modules
	
			id = decodeURIComponent(id).split('^')[0]
	
			// define callback
	
			callback = callback || noop
	
			// module is not defined
	
			if ( typeof modules[id] !== 'object' ) { 
	
				// clalback list
	
				this._callbacks.initial(id, []).push(callback)
	
				// require module config
	
				this.fetch(id, function (uri) {
	
					// 异步回调重新检测模块是否存在
	
					if ( modules[id] === undefined ) {
						modules[id] = new Module(id).extend(__webpack_require__(1)(uri))
	
						// filter
	
						that.filter(id)
	
						// setup
						
						modules[id].initialparam = {}.extend(modules[id].param)
						modules[id].initialconfig = {}.extend(modules[id].config)
	
						// callback
	
						that._callbacks[id].each(function (i, callback) {
							callback.apply(that, [modules[id]])
						})
	
						// del callback list
	
						delete that._callbacks[id]
					}
				}, function () {
					that._error[id] = true
					failed && failed()
				})
			} else {
				callback.apply([modules[id]])
	
				return modules[id]
			}
	
		},
	
		origin : function (id) {
			var remote = id.match(/^\w+\:/) === null ? false : true
			var repath = remote ? id.split('/').shift() : null
	
			// proto module id
	
			id = remote ? id : id.split('^')[0]
			
			return {
	        	root : repath ? repath : this.config.root + 'modules',
	        	path : remote ? id : this.config.root + 'modules/' + id
	    	}
		},
	
		realpath : function (id, sid, url, path) {
	
			// removeQuotes
	
	        url = url.replace(/\"|\'/g, '')
	        url = url.trim()
	
	        if ( !url ) return ''
	
	        // indexOf keyWord
	
	        if ( url.match(/^\w+\:/) === null && url.indexOf('//') != 0 ) {
	
	        	if ( path == true ) return this.config.root + url
	
	        	var origin = this.origin(id)
	        	var root = origin.root
	        	var modpath = origin.path
	        	var prepath = path ? this.config.root + path : sid ? root + '/' + sid : modpath
	
	            if ( url.indexOf('/') === 0 ) {
	                url = root + url
	            } else if ( url.indexOf('./') === 0 ) {
	                url = prepath + url.substr(1)
	            } else if ( url.indexOf('~/') === 0 ) {
	                url = prepath + url.substr(1)
	            } else if ( url.indexOf('~~/') === 0 ) {
	                url = modpath + url.substr(2)
	            } else {
	                url = prepath + '/' + url
	            }
	        }
	
	        return url
		},
	
		template : function (id) {
			return new Template(id, DNA)
		},
	
		fetch : function (id, callback, failed) {
			var uri = ''
			var frame = this.frameworks 
			var config = frame ? frame.config : {}
			var origins = config.origins
	
			if ( !id ) return
	
			// module config path
	
			if ( id.match(/^\w+\:/) === null ) {
				uri = this.realpath(id, id, 'config')
			} else if ( origins ) {
				origins.each(function (i, origin) {
					if ( id.indexOf(origin) == 0 ) {
						uri = id + '/config'
					}
				})
			} else {
				uri = id + '/config'
			}
	
			if ( !uri ) return
	
			__webpack_require__(1)([uri], function () {
				callback && callback(uri)
			}, function () {
				failed && failed()
			})
		},
	
		prefetch : function (id, param, callback) {
			
			if ( !id ) return
	
			var that = this
			var modules = this.modules
			var prefetch = this._prefetchs
	
			id = id.split('^')[0]
			callback = callback || noop
	
			/*
	     	 * 模块配置未存在时推入预取队列
	     	 * prefetch : app 状态 > 预取队列
			 */
	
			param = param || null
	
			prefetch.initial(id, []).push(param)
			
			if ( modules[id] === undefined || prefetch[id] === undefined ) {
				return  that.get(id, function () {
							that.prefetch(id, param)
						})
			}
	
			/*
			 * 模块已存在
			 * 按参数预取模块source
			 * 通过extend模块参数获取新的数据
			 */
	
			prefetch[id].each(function (i, params) {
	
				// remoteframe
	
				if ( modules[id].remoteframe ) return
	
				// startTime
	
				modules[id].startLoadTime = Date.now()
	
				// nomal param url
	
				params = that.getParam(params)
	
				if ( modules[id].prefetch[params] === undefined ) {
	
					// waiting
	
					modules[id].prefetch[params] = false
	
					// 标记为update模块预取无效
	
					if ( modules[id].config.update === true || modules[id].config.cache === 0 ) {
						return that.console.warn('Modules[' + id + ']', 'Prefetch', 'config[update == true or cache == 0] cannot prefetch')
					}
	
					// 预取资源
	
					App.async.prefetch(id, modules[id].config, {}.extend(modules[id].initialparam, that.filterParam(params)[0]), function (sids, suri, data) {
	
						// endTime
	
						modules[id].endLoadTime = Date.now()
						
						// console
	
	            		that.console.info('Module [' + id + ']', 'Prefetch', (modules[id].endLoadTime - modules[id].startLoadTime) + 'ms')
	
						/* 
						 * 预取成功
						 * 以参数为key存储预取状态
						 */
	
						modules[id].prefetch[params] = arguments
						modules[id].updatetime[params] = Date.now()
	
						// timeout
	
						setTimeout(function () {
							if ( modules[id] ) {
								modules[id].prefetch[params] = null
								modules[id].updatetime[params] = null
								delete modules[id].prefetch[params]
								delete modules[id].updatetime[params]
							}
						}, modules[id].config.cache * 1000)
	
	
						callback()
	
					}, function (err) {
	
						delete modules[id].prefetch[params]
	
						that.console.error('Module [' + id + ']', 'Prefetch', 'failed')
					})
				}
			})
	
			delete prefetch[id]
		},
	
		refresh : function () {
			var that = this
	
			this.clearSessionStorage()
	
			// remove module element
	
			this.modules.each(function (id, module) {
	
				if ( id !== 'frameworks' ) {
					if ( module.elements ) {
						module.elements.container.remove()
					}
					
					delete that.modules[id]
				}
				
			})
		},
	
		clearSessionStorage : function (key) {
			try {
				if ( key ) {				
					(typeof key == 'string' ? [key] : key).each(function (i, key) {
						sessionStorage.removeItem(key)
					})
				} else {
					for (var i = sessionStorage.length; i >= 0; i--) {
						sessionStorage.removeItem(sessionStorage.key(i))
					}
				}
			} catch (e) {}
		},
	
		clearLocalStorage : function (key) {
			try {
				if ( key ) {
					(typeof key == 'string' ? [key] : key).each(function (i, key) {
						localStorage.removeItem(key)
					})
				} else {
					for (var i = localStorage.length; i >= 0; i--) {
						localStorage.removeItem(localStorage.key(i))
					}
				}
			} catch (e) {}
		},
	
		checkLocalStorage : function (time) {
			try {
				var expires = localStorage.getItem('EXPIRES')
	
				if ( expires ) {
					if ( Date.now() - expires > time ) {
						this.clearLocalStorage()
						expires = true
					}
				} else {
					localStorage.setItem('EXPIRES', Date.now())
				}
	
				this.expires = expires
	
			} catch (e) {}
		},
	
		clearCache : function (id, dimension, storage) {
			
			var module = this.modules[id]
	
			if ( !module ) return
	
			dimension = dimension == true ? module.dimension : dimension
	
			if ( dimension ) {
				delete module.prefetch[dimension]
			} else {
				module.prefetch = {}
			}
	
			// claer param
	
			module.init()
	
			// clear storage
	
			if ( storage ) {
				this.clearLocalStorage(module.storagemaps)
				this.clearSessionStorage(module.storagemaps)
			}
	
			// clear dimension
	
			delete module.dimension
			
		},
	
		getParam : function (param) {
			return param ? this.route('/' + param).param : null
		},
	
		setParam : function (id, param, initial) {
	        var module = this.modules[id]
	        var params = this.filterParam(param)
	
	        // if this module cache param != param ? update = ture
	        
	        if ( typeof param === 'string' || param === null ) {
	        	module.update = this.equalsParam(module.dimension, param) ? false : true
	        	module.dimension = param
	        }
	
	        if ( initial && module.update ) {
	    		module.init()
	    		module.param.extend(module.initialparam, params[0])
	    		module.config.extend(module.initialconfig, params[1])           	
	        } else {
	        	module.param.extend(params[0])
	        }
	    },
	
		filterParam : function (param) {
			var config = {}
			var params = (typeof param === 'string' ? param.paramsToObject() : param) || {}
	
			// filter config param
	
	        params.each(function (key, value) {
	
	        	if ( key.indexOf('^') === 0 ) {
	
	        		delete params[key]
	
	        		key = key.substr(1)
	
	        		if ( ['level', 'cache', 'timeout'].indexOf(key) !== -1 ) {
	            		config[key] = Number(value)
	            	}
	
	        	}
	
	        })
	
	        return [params, config]
		},
	
		equalsParam : function (a, b) {
	    	a = typeof a === 'string' ? a.paramsToObject() : a
	    	b = typeof b === 'string' ? b.paramsToObject() : b
	
	    	return Object.equals(a, b)
	    },
	
	    exists : function (push) {
	    	try {
	
	    		if ( push ) {
	    			sessionStorage.setItem('EXISTS', history.length)
	    		} else {
	    			return parseInt(sessionStorage.getItem('EXISTS')) === history.length
	    		}
	
			} catch (e) {
				this.console.warn('storage', 'Warn', 'error')
				return false
			}
	    },
	
	    defend : function (element, clear) {
	
	    	if ( clear ) element.innerHTML = null
	
	    	element.observer(
	        	{ childList: true },
	        	function (records) {
					records.each(function (i, record) {
						var garbages = record.addedNodes
						garbages.each(function (i, garbage) {
							if ( IMMUNITY.indexOf(garbage) == -1 ) {
								if ( garbage.nodeName !== 'SCRIPT' ) garbage.remove()
							}
						})
					})
				}
			)
	    },
	
	    route : function (route) {
	    	var id, param
	
	    	if ( !route ) {
	        	if ( this.config.hash == false && this.config.root ) {
	        		route = location.href.indexOf(this.config.root)
	        		if ( route.length <= 16 ) {
	        			route += this.config.root.length
	        			route = location.href.substr(route)
	        		}
	        	} else {
	        		route = location.hash.substr(1)
	        	}
	        }
	
	        id = /(^\%(.*?)(?=\%)\%)/.exec(route)
	        id = id ? id[2] : false
	        route = id ? route.slice(id.length) : route
	    	route = route.split(/\/|\$|\?|\&|\,|\=|\:/)
	    	id = id ? id : route[0]
	    	param = route.slice(1).join('/')
	    	
	    	return {
	    		id : id ? decodeURIComponent(id) : null,
	    		param : param ? decodeURIComponent(param) : null
	    	}
	    },
	
	    /**
		 * 组织默认行为的元素过滤
		 * @param  {Element} el
		 * @param  {Object} exceptions
		 * @return {Boolean}
		 */
		preventDefaultException : function (e, exceptions) {
			var target = e.target
			var origin = e.path ? e.path[0] : null
	
			// shadow dom 中无法捕捉源
	
			if ( origin && !(origin instanceof Node) ) return true
	
			// 意外处理
			
			target = target || {}
			origin = origin || {}
	
			// 比对
			
			for ( var i in exceptions ) {
				var exc = exceptions[i]
				
				if ( exc.test(target[i]) || exc.test(origin[i]) ) {
					return true
				}
			}
	
			return false
		},
	
	    filter : function (id) {
	    	var module = this.modules[id]
	    	var config = module.config
	
	    	// 主模块禁止卸载
	    	
	    	if ( ["frameworks", "system"].consistOf(id) ) {
	    		config.sandbox = false
	    		config.destroy = false
	
	    		if ( id == "system" ) {
	    			config.shadowbox = true
	    		}
	    	}
	
	    	// reset level
	    	
	    	if ( isNaN(config.level) ) {
	    		config.level = 0
	    	}
	
	    	// app type
	    	
	    	if ( typeof config.source === 'string' ) {
	    		module.remoteframe = true
	    		config.source = this.realpath(null, null, config.source, true)
	    	}
	
	
	    	// iframe input blur bug
	
	        // if ( device.feat.iframeInputBlurBug ) {
	        // 	this.console.warn('There iframe input focus bug in your browser sandbox > been config sandbox = false')
	        // }
	
	        // shadowRoot
	
	        if ( device.feat.shadowRoot == false ) {
	            config.shadowbox = false
	        }
	
	        // blur && mutations
	
	        if ( !device.feat.isBadTransition && !device.feat.prefixStyle('filter') ) {
	        	config.mirroring = false
	        }
	
	        if ( config.mirroring && config.mirroring.filter && config.mirroring.filter.indexOf('blur(') === 0 ) {
	    		if ( device.feat.prefixStyle('backdrop-filte') ) {
	    			config.mirroring = false
	    		}
	    	}
	
	        // cache timeout
	
	        config.cache = config.cache == undefined ? 600 : config.cache
	
	        // WARMING: cache and update cannot coexist
	
	        if ( config.cache && config.update ) {
	        	this.console.warn('cache and update cannot coexist', 'Config error', 'The cache should be 0')
	        }
	
	        // module type
	
	        if ( config.absolute !== false ) {
	        	config.absolute = true
	        }
	
	        // module script
	
	        if ( config.script == undefined ) {
	        	config.script = []
	        }
	
	        // module style
	
	        if ( config.style == undefined ) {
	        	config.style = []
	        }
	
	        // module source
	
	        if ( config.source == undefined ) {
	        	config.source = []
	        }
	
	        // filter
	    	
	    	if ( typeof this.modules.frameworks.filter == 'function' ) {
	    		this.modules.frameworks.filter(id, config)
	    	}
	    },
	
	    console : {
	    	echo : function (type, pre, mid, suf) {
	    		console[type](
					"%c " 
					+ (pre[0] ? pre[0] + ' ' : '') 
					+ "%c " + (mid[0] ? mid[0] + ' ' : '')
					+ "%c " + (suf[0] ? suf[0] + ' ' : ''), 
					"color: #ffffff; background:" + pre[1],
					"color: #ffffff; background:" + mid[1],
					"color: #ffffff; background:" + (suf[0] ? suf[1] : mid[1])
				)
	    	},
	    	log : function (message, title, description) {
	    		this.echo('log', [title, '#999'], [message, '#333'], [description, '#666'])
	    	},
	    	info : function (message, title, description) {
	    		this.echo('info', [title, '#0cf'], [message, '#06c'], [description, '#0c0'])
	    	},
	    	warn : function (message, title, description) {
	    		this.echo('warn', [title, '#f60'], [message, '#f30'], [description, '#f90'])
	    	},
	    	error : function (message, title, description) {
	    		this.echo('warn', [title, '#f06'], [message, '#903'], [description, '#993'])
	    	},
	    	dir : function (message) {
	    		console.dir.apply(console, message)
	    	}
	    }
	}
	
	
	// define proto
	
	window.__defineProto__ = Proto
	window.__defineProto__(window)
	
	// 初始化 Application
	
	window.App = window.application = new Application()
	
	// applicationready
	
	window.trigger("applicationready")
	window.trigger("startup")
	window.trigger("launch")
	
	// document ready after
	
	document.ready(function () {
	
		var route = App.route()
		var id = route.id
		var od = id
		var param = route.param
		var exists = App.exists()
	
		// async get current page config 
	
		App.fetch(id)
	
		// start main view
	
		App.get('frameworks', function (module) {
	
			this.frameworks = module
	
			var mainc = module.config
			var index = mainc.index
			var system = mainc.system
	
			// current page
	
			id = id || index
	
			// check localStorage
	
			this.checkLocalStorage((mainc.expires || 604800) * 1000)
	
			// defend
	
			if ( mainc.defend ) this.defend(document.body, true)
	
			// transform init
	
			this.transform.init(DNA)
			this.transform.setup({ 
				singleflow : mainc.singleflow,
				singlelocking : mainc.singlelocking,
				nofindpage : mainc.nofind,
				currpage : id,
				homepage : index,
				limit : Math.max(mainc.limit || 50, 10),
				exists : exists
			})
	
			// start App
	
			this.to('frameworks', param, -1).then(function () {
	
				// frameworksready
	
				window.trigger('frameworksready')
	
				// check
				
				App.check()
	
				// no transform
				
				if ( id ) {
	
					// no need mark hash, because id is hash
					
					App.to(id, param, mainc.singleflow ? 1 : 0).then(function () {
	
						App._EXISTS = true
	
						window.trigger('frameworksload')
						
						// 预取得默认首页
	
						if ( !App.modules[index] ) {
							setTimeout(function () {
								App.prefetch(index)
							}, 2000)
						}
						
					})
	
				} else {
	
					App._EXISTS = true
	
					window.trigger('frameworksload')
				}
	
				if ( system ) {
					App.get('system', function (module) {
						this.transform.container('system')
						module.Template = App.template('system').prefetch(function (module, callback) {
							callback()
						}).then(function (module, callback) {
							callback()
							App.trigger('systemload', { module : module })
						}).get(function (module) {
							App.trigger('systemloadall', { module : module })
						}).error(function (module) {
							App.trigger('systemloaderror', { module : module })
						})
					})
				}
	
			})
		}, function () {
			App.console.error('Module[frameworks]', 'Fatal error', 'is necessary')
		})
	
		// error
	
		window.onerror = function () {
			App.console.error(arguments[1] || '(anonymous function)', 'Error', arguments[2] + ':' + arguments[3])
			App.trigger('unknownerror', arguments)
	
			return false
		}
	
	})

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	var map = {
		"./css": 2,
		"./css.js": 2,
		"./fetch": 4,
		"./fetch.js": 4,
		"./loader": 5,
		"./loader.js": 5,
		"./move": 6,
		"./move.js": 6,
		"./promise": 7,
		"./promise.js": 7,
		"./proto": 8,
		"./proto.js": 8,
		"./query": 9,
		"./query.js": 9,
		"./sandbox": 10,
		"./sandbox.js": 10,
		"./scroll": 11,
		"./scroll.js": 11,
		"./template": 12,
		"./template.js": 12,
		"./touch": 13,
		"./touch.js": 13,
		"./transform": 14,
		"./transform.js": 14,
		"./unify": 15,
		"./unify.js": 15
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 1;


/***/ }),
/* 2 */
/***/ (function(module, exports) {

	// 人之所畏不可不畏 ，天之所予不得不受
	// 将欲歙之，必故张之；将欲弱之，必故强之；将欲废之，必故兴之；将欲取之，必故与之。是谓微明。
	
	// class & global scope
	
	var CLASS = {}
	var GLOBAL = {}
	
	// requestAnimationFrame
	
	var rAF = window.requestAnimationFrame
	
	/*
	 * 语法解释 提取
	 * var, unit, url(), Math(), @section ()
	*/
	
	// Capture groups
	
	var REGEXP = {
	        variable : /\[(.*?)(?=\])\]/g,
	        factor : /\((.*?)(?=\))\)/,
	        url : /\burl\((.*?)(?=\))\)/,
	        calc : /\bcalc\((.*)(?=\))\)/,
	        fun : /(\w+)\((.*)(?=\))\)/,
	        eval : /[\(\)]/g,
	        evals : /\@\((.*?)(?=\%\>)\%\>/g,
	        media : /\(([^\)]+)(?=\))\)/,
	        classes : /\bclass[\s]?([^\s\(]+)[\s]?\((.*?)(?=\))\)/,
	        section : /\(([^\)]+)(?=\))\)/,
	        comment : /\/\*[\s\S]*?\*\//g,
	        onload : /\bonload\(?(.*\b)?\)?(\s+url\(\'(.*?)?(?=\'\))\'\))/gi,
	        attr : /([^\:]+):([^\;]*)[\;\}]/,
	        alt : /(\/\*[\s\S]*?\*\/)|([^\s\;\{\}][^\;\{\}]*(?=\{))|(\})|([^\;\{\}]+[\;\}](?!\s*\*\/))/gmi
	    }
	
	// Capture groups
	
	var CAP_COMMENT = 1
	  , CAP_SELECTOR = 2
	  , CAP_END = 3
	  , CAP_ATTR = 4
	
	// 是为空也
	
	function isEmpty (x) {
	    return typeof x == 'undefined' || x.length == 0 || x == null
	}
	
	// 适配的前缀
	
	function getPrefixStyleProp (prop) {
	    return device.feat.prefixStyle(prop, true)
	}
	
	// CLASS CSS
	
	function CSS () {
	    if ( !(this instanceof CSS) ) {
	        return new CSS()
	    }
	}
	
	CSS.prototype = {
	    init : function (id, module) {
	        this.id = id
	        this.module = module
	        this._keyFrame = []
	        this.sandbox = application.sandbox
	
	        return this
	    },
	
	    setup : function (config) {
	        this.config = config || {
	            root : "modules/",
	            data : {},
	            descendant : false
	        }
	
	        // 更新模块css配置，同时清空模块css的变量
	
	        this.variable = {
	            attributes : {},
	            children : {}
	        }
	
	        this._descendant = this.config.descendant ? this.config.descendant + ' ' : ''
	
	        // image cache print log >> attr:style
	
	        this.sandbox.window.fileCache = {}
	        this.sandbox.window.fileLoading = []
	    },
	
	    clear : function () {
	
	        // 清除当前模块css变量
	
	        this.variable = {
	            attributes : {},
	            children : {}
	        }
	    },
	
	    render : function (list, sids, sources) {
	        var css = this.compile('frameworks', CSSBaseStyle)
	
	        if ( !list ) {
	            throw 'IOING ERROR { module ' + sids + ' css source is null }'
	        }
	
	        for (var i = 0, l = list.length; i < l; i++) {
	            var name = list[i]
	
	            css += this.compile(sids[name], sources[name], { root : 0 })
	        }
	
	        return css
	    },
	
	    compile : function (id, source, scope, opts, element) {
	        this.id = id
	        this.opts = opts || {}
	        this.scope = {}.extend(this.config.data, scope)
	        this.descendant = this.opts.descendant === false ? '' : this._descendant + (this.opts.descendant ? this.opts.descendant + ' ' : '')
	        this.element = element
	
	        return this.toCSS(this.data = this.toJSON(source))
	    },
	
	    toJSON : function (cssString, args) {
	        var node = {
	            children: {},
	            attributes: {}
	        }
	        var match = null
	        var count = 0
	
	        if ( typeof args == 'undefined' ) {
	            var args = {
	                ordered: false,
	                comments: false,
	                stripComments: false,
	                split: false
	            }
	        }
	
	        if ( args.stripComments ) {
	            args.comments = false
	            cssString = cssString.replace(REGEXP.comment, '')
	        }
	
	        while ( (match = REGEXP.alt.exec(cssString)) != null ) {
	            if ( !isEmpty(match[CAP_COMMENT]) && args.comments ) {
	
	                // Comment
	
	                var add = match[CAP_COMMENT].trim()
	                node[count++] = add
	            } else if ( !isEmpty(match[CAP_SELECTOR]) ) {
	
	                // New node, we recurse
	
	                var name = match[CAP_SELECTOR].trim()
	
	                // This will return when we encounter a closing brace
	
	                var newNode = this.toJSON(cssString, args)
	                if ( args.ordered ) {
	                    var obj = {}
	                    obj['name'] = name
	                    obj['value'] = newNode
	
	                    // Since we must use key as index to keep order and not
	                    // name, this will differentiate between a Rule Node and an
	                    // Attribute, since both contain a name and value pair.
	
	                    obj['type'] = 'rule'
	                    node[count++] = obj
	                } else {
	                    if ( args.split ) {
	                        var bits = name.split(',')
	                    } else {
	                        var bits = [name]
	                    }
	                    for (var i in bits) {
	                        var sel = bits[i].trim()
	                        var unique = sel in node.children
	
	                        // function unique
	                        
	                        if ( unique && sel.indexOf('@') == 0 ) {
	                            sel = sel + ' '
	                            unique = false
	                        }
	                        if ( unique ) {
	                            for (var att in newNode.attributes) {
	                                node.children[sel].attributes[att] = newNode.attributes[att]
	                            }
	                            for (var cel in newNode.children) {
	                                node.children[sel].children[cel] = newNode.children[cel]
	                            }
	                        } else {
	                            node.children[sel] = newNode
	                        }
	                    }
	                }
	            } else if ( !isEmpty(match[CAP_END]) ) {
	
	                // Node has finished
	
	                return node
	            } else if ( !isEmpty(match[CAP_ATTR]) ) {
	                var line = match[CAP_ATTR].trim()
	
	                if ( line.charAt(line.length - 1) == '}' ) {
	                    REGEXP.alt.lastIndex = REGEXP.alt.lastIndex - 1
	                }
	
	                var attr = REGEXP.attr.exec(line)
	
	                if (attr) {
	
	                    // Attribute
	
	                    var name = attr[1].trim()
	                    var value = attr[2].trim()
	                    if ( args.ordered ) {
	                        var obj = {}
	                        obj['name'] = name
	                        obj['value'] = value
	                        obj['type'] = 'attr'
	                        node[count++] = obj
	                    } else {
	                        if ( name in node.attributes ) {
	                            var currVal = node.attributes[name]
	                            if ( !(currVal instanceof Array) ) {
	                                node.attributes[name] = [currVal]
	                            }
	                            node.attributes[name].push(value)
	                        } else {
	                            node.attributes[name] = value
	                        }
	                    }
	                } else {
	
	                    // Semicolon terminated line
	
	                    node[count++] = line
	                }
	            }
	        }
	
	        return node
	    },
	
	    toCSS : function (node, depth, scope, breaks, parent) {
	        var cssString = ''
	        if ( typeof depth == 'undefined' ) {
	            depth = 0
	        }
	        if ( typeof scope == 'undefined' ) {
	            scope = false
	        }
	        if ( typeof breaks == 'undefined' ) {
	            breaks = false
	        }
	        if ( node.attributes ) {
	            for (i in node.attributes) {
	                var att = node.attributes[i]
	                if ( att instanceof Array ) {
	                    for (var j = 0; j < att.length; j++) {
	                        cssString += this._setAttr(i, att[j], depth, scope, parent)
	                    }
	                } else {
	                    cssString += this._setAttr(i, att, depth, scope, parent)
	                }
	            }
	        }
	        if ( node.children ) {
	            var first = true
	            for (var i in node.children) {
	                if (breaks && !first) {
	                    cssString += '\n'
	                } else {
	                    first = false
	                }
	                
	                cssString += this._setNode(i, node.children[i], depth, scope)
	            }
	        }
	
	        return cssString
	    },
	
	    realpath : function (url) {
	        return application.realpath(this.id, this.opts.sid, url, this.opts.path)
	    },
	
	    unit : function (value, data, li, ri) {
	        li = 0
	        ri = 0
	        data = data || this.scope
	
	        if ( value.indexOf('@(') !== -1 ) {
	            value = value.replace(REGEXP.eval, function (val, i) {
	                switch (val) {
	                    case '(':
	                        li++
	                    break
	                    case ')':
	                        ri++
	                        if ( li == ri ) {
	                            val = '%>'
	                        }
	                    break
	                }
	                return val
	            })
	
	            value = value.replace(REGEXP.evals, function (val, count) { 
	                var translate = false
	                count = data.getValueByRoute(count.replace(UNIT.__unitRegExp__, function (size, length, unit) { 
	                    if ( unit == '%' ) {
	                        switch (name) {
	                            case 'width':
	                                unit = 'vw'
	
	                                break
	
	                            case 'height':
	                                unit = 'vh'
	
	                                break
	                        }
	                    }
	
	                    translate = true
	
	                    return length * (UNIT[unit] || 1)
	                }))
	                
	                return typeof count === 'number' && translate ? count + 'px' : count
	
	            }) 
	        }
	
	        value = value.replace(UNIT.__unitRegExp__, function (size, length, unit) { 
	
	            // support view sizing units
	
	            if ( UNIT.__nativeUnits__[unit] ) {
	                return length + unit
	            }
	
	            return length * (UNIT[unit] || 1) + 'px'
	        })
	
	        return value
	    },
	
	    eval : function (value, data) {
	
	        if ( value.indexOf('(') !== -1 ) {
	            if ( !device.feat.supportSizeCalc ) {
	                value = value.replace(REGEXP.calc, function (val, calc) { 
	                    return '@(' + calc + ')'
	                })
	            }
	        }
	
	        value = this.unit(value, data)
	
	        return value
	    },
	
	    _loadBackgroundImage : function (dom, url, src, call, file) {
	        var that = this
	        var image = document.createElement('IMG')
	
	        image.src = src
	        image.onload = function () {
	
	            rAF(function () {
	                dom.style.backgroundImage = file ? '' : url
	
	                // additional style
	
	                if ( call ) {
	                    var styler = call.split(' ')
	
	                    for (var i = 0, l = styler.length; i < l; i++) {
	                        var prop = styler[i].split(':')
	
	                        dom.style.set[prop[0], prop[1]]
	                    }
	                }
	
	                // removr image
	
	                image.remove()
	            })
	
	            // mark cache
	            
	            that.sandbox.window.fileCache[src] = true
	        }
	
	        image.onerror = function () {
	
	            // removr image
	            
	            image.remove()
	        }
	
	        // append image
	
	        that.sandbox.window.document.documentElement.appendChild(image)
	    },
	
	    // $
	
	    _getVariable : function (value, scope) {
	        var data = this.scope
	        var config = this.config
	        var variable = this.variable
	
	        // 解析变量
	
	        if ( value.indexOf('[') !== -1 ) {
	            value = value.replace(REGEXP.variable, function (val, key) { 
	                val = null
	
	                if ( scope && variable.children[scope] ) {
	                   val = variable.children[scope].getValueByRoute(key)
	                }
	
	                if ( val ) return val
	                
	                return variable.attributes.getValueByRoute(key) 
	                    || GLOBAL.getValueByRoute(key) 
	                    || data.getValueByRoute(key)
	            }) || value
	        }
	
	        return value
	    },
	
	    // Helpers
	
	    _setAttr : function (name, value, depth, scope, parent) {
	        var that = this
	
	        var id = this.id
	        var config = this.config
	        var cssString = ''
	
	        // 处理前缀
	
	        name = getPrefixStyleProp(name)
	
	        // 解析变量
	
	        value = this._getVariable(value, scope)
	
	        // 转换单位
	
	        value = this.eval(value)
	
	        // url 相对路径转换
	
	        switch (name) {
	            case 'display':
	                if ( ['box', 'inline-box'].consistOf(value) ) {
	
	                    cssString += '\t'.repeat(depth) + name + ': ' + device.feat.prefix + value + ';\n'
	                    cssString += '\t'.repeat(depth) + name + ': ' + value + ';\n'
	
	                    return cssString
	                }
	
	                break
	                
	            case 'background-image':
	            case 'border-image':
	            case 'background':
	            case 'content':
	            case 'src':
	                
	                // real path
	                
	                if ( value.indexOf('url(') != -1 ) {
	                    value = value.replace(REGEXP.url, function (val, url) { 
	                        return "url('" + that.realpath(url ? url : '') + "')"
	                    })
	
	                    // inline element onload
	                    
	                    if ( value.indexOf('onload') != -1 ) {
	                        value = value.replace(REGEXP.onload, function (context, call, url, src) {
	
	                            // css file
	
	                            if ( src ) {
	                                var dom = that.element
	                                var target = that.opts.target
	
	                                if ( dom ) {
	
	                                    // is loaded
	
	                                    if ( that.sandbox.window.fileCache[src] ) return url
	
	                                    var fragment = dom.parentFragment
	                                    var scroller = dom.previousScroller
	                                    var infinite = scroller && scroller.getAttrSign('infinite')
	                                    var delaying
	
	                                    // 延时取得图片
	                                    
	                                    function fetch (time) {
	                                        delaying = setTimeout(function () {
	                                            that._loadBackgroundImage(dom, url, src, call)
	                                            
	                                            if ( infinite ) {
	                                                fragment.off('show', show).off('hide', hide)
	                                            }
	                                        }, time || 0)
	                                    }
	
	                                    // 无限循环时对于 show 的元素之行加载
	
	                                    if ( infinite ) {
	
	                                        // infinite show
	
	                                        var show = function (e) {
	                                            var scroll = scroller.scrollEvent
	                                            var timeout = 0
	
	                                            if ( scroll ) {
	                                                timeout = scroll.wrapperHeight
	
	                                                if ( scroll.acceleration == 0 ) {
	                                                    timeout = Math.min((scroll.speedM || 1) * 500, 2000)
	                                                }
	                                            }
	
	                                            fetch(timeout)
	                                        }
	
	                                        // infinite hide
	
	                                        var hide = function () {
	                                            clearTimeout(delaying)
	                                        }
	
	                                        // fetch
	
	                                        fragment.on('show', show).on('hide', hide)
	
	                                    } else {
	
	                                        // fetch
	
	                                        fetch(0)
	                                    }
	                                } else if ( target ) {
	
	                                    // 对于 CSS 文件的 onload 处理
	
	                                    target.on('ready', function () {
	                                        this.find(parent).each(function () {
	                                            this.style.backgroundImage = 'none'
	                                            that._loadBackgroundImage(this, url, src, call, 1)
	                                        })
	                                    })
	
	                                    return url
	                                } 
	                            }
	
	                            return ''
	                        })
	                    }
	                }
	
	                // gradient 兼容处理
	                
	                var gradient = value.indexOf('gradient(')
	
	                if ( gradient >= 0 ) {
	                    cssString += '\t'.repeat(depth) + name + ': ' + value + ';\n'
	                    value = gradient == 0 ? device.feat.prefix + value : value.replace(/([\b\w\-]+gradient\()/, function (context, val) {
	                        if ( val.indexOf('-') == 0 ) {
	                            val = val.replace(/\-\w+\-/, '')
	                        }
	                        return device.feat.prefix + val
	                    })
	                    cssString += '\t'.repeat(depth) + name + ': ' + value + ';\n'
	
	                    return cssString
	                }
	
	                break
	
	            case '@extend':
	                var extend = this.data.children[value]
	
	                if ( extend ) {
	                    var attributes = extend.attributes
	
	                    for (name in attributes) {
	                        cssString += this._setAttr(name, attributes[name], depth, scope)
	                    }
	
	                    return cssString
	                }
	
	                break
	
	            case '@class':
	                var methods = REGEXP.fun.exec(value),
	                    name = methods[1],
	                    args = methods[2].split(/[\s]?\,[\s]?/),
	                    classes = this.data.children['@' + name] || CLASS[name] || {},
	                    argsKey = classes.args,
	                    attributes = classes.attr
	
	                    for (name in attributes) {
	                        cssString += this._setAttr(name, attributes[name].replace(REGEXP.variable, function (context, variable) { return args[argsKey[variable]] || context }), depth, scope)
	                    }
	
	                    return cssString
	
	                break
	        }
	
	        return '\t'.repeat(depth) + name + ': ' + value + ';\n'
	    },
	
	    _setNode : function (name, value, depth, scope) {
	        var cssString = '',
	            descendant = value.descendant || this.descendant,
	            names = [],
	            section = 0,
	            fixed = false,
	            proto = false,
	            command = false,
	            attributes = {}
	
	
	        // 预置大括号语法
	        /*
	         * @section 定义模块作用域
	         * @global 定义全局变量
	         * @var 定义变量
	        */
	        // ”@“ 语法
	        // 修正css基本命名适配部分; ”@“ 语法不包含 “&” 并列逻辑，因此不影响下面的并列类 @ : @keyframes
	
	        if ( name.indexOf('@') == 0 ) {
	            descendant = ''                    // ”@“ 语法作用域失效
	            names = name.split(/\s/)
	            switch (names[0]) {
	                case '@keyframes':
	                    command = false
	
	                    name = '@' + device.feat.keyframesPrefix + 'keyframes ' + names[1]
	
	                    // 禁止属性作用域
	                    
	                    if ( this.descendant ) {
	                        for (var i in value.children) {
	                            value.children[i].descendant = ' '
	                        }
	                    }
	                    
	                    break
	
	                case '@section':
	                    command = false
	
	                    // section name
	                    
	                    var sname = REGEXP.section.exec(name)
	                    
	                    sname = sname ? sname[1] : 'section:error'
	                    scope = scope ? scope + ' ' + sname : sname
	                    section = true
	                    depth--
	
	                    break
	
	                case '@media':
	                    command = false
	                    name = this._getVariable(name, scope)
	                    name = this.eval(name)
	                    fixed = true
	
	                    break
	
	                case '@class':
	                    command = true
	
	                    name = REGEXP.classes.exec(name)
	
	                    var className = name[1],
	                        classArgs = name[2]
	
	                    var argsKey = {}
	                    var argsMap = classArgs.split(/[\s]?\,[\s]?/)
	
	                    for (var i = 0, l = argsMap.length; i < l; i++) {
	                        argsKey[argsMap[i]] = i
	                    }
	
	                    this.data.children['@' + className] = {
	                        args : argsKey,
	                        attr : value.attributes
	                    }
	
	                    // CLASS 定义全局作用域
	
	                    if ( this.id == 'frameworks' ) {
	                        CLASS[className] = this.data.children['@' + className]
	                    }
	
	                    break
	
	                case '@global':
	                    command = true
	
	                    if ( depth == 0 ) {
	                        attributes = value.attributes
	                        for (var key in attributes) {
	                            GLOBAL[key] = this._getVariable(attributes[key], scope)
	                        }
	                    }
	
	                    break
	
	                case '@var':
	                    command = true
	
	                    if ( depth == 0 || scope ) {
	                        attributes = value.attributes
	                        for (var key in attributes) {
	                            if ( scope ) {
	                                if ( !this.variable.children[scope] ) this.variable.children[scope] = {}
	                                this.variable.children[scope][key] = attributes[key]
	                            } else {
	                                this.variable.attributes[key] = attributes[key]
	                            }
	                        }
	                    }
	
	                    break
	
	                case '@if':
	                    command = false
	
	                    section = true
	
	                    if ( !this.scope.getValueByRoute(REGEXP.factor.exec(name)[1]) ) {
	                        delete value.children
	                    }
	
	                    break
	
	            }
	        }
	
	        if ( command == false ) {
	            names = name.split(',')
	            name = ''
	
	            for (var i = 0, l = names.length; i < l; i++) {
	                var sname = names[i].trim()
	
	                // this 关键字替换
	
	                if ( sname.indexOf('this') == 0 ) {
	                    sname = sname.substr(4)
	                    proto = true
	                }
	
	                // 连续声明迭代
	
	                name += (descendant ? descendant : '') + (typeof scope == 'string' && fixed == false ? scope + (proto ? '' : ' ') : '') + sname + (i == l - 1 ? '' : ', ')
	            }
	
	            cssString += section ? '' : '\t'.repeat(depth) + name + ' {\n'
	            cssString += this.toCSS(value, depth + 1, scope, false, name)
	            cssString += section ? '' : '\t'.repeat(depth) + '}\n'
	        }
	
	        return cssString
	    }
	
	}
	
	export default CSS

/***/ }),
/* 3 */,
/* 4 */
/***/ (function(module, exports) {

	// 道生一，一生二，二生三，三生万物。万物负阴而抱阳，冲气以为和。
	
	import promise from './promise.js'
	
	var Promise = promise.Promise
	
	// 为学日益，为道日损。损之又损，以至於无为。
	
	var Get = function () {
	    if ( !(this instanceof Get) ) {
	        return new Get()
	    }
	}
	
	// 圣人常无心，以百姓之心为心。善者，吾善之；不善者，吾亦善之，德善。信者，吾信之；
	// 不信者，吾亦信之，德信。圣人在天下，歙歙焉为天下浑其心，百姓皆注其耳目，圣人皆孩之。
	
	Get.prototype = {
	    uri : function (id, param, name, type, callback) {
	        var that = this,
	            uri,
	            remote,
	            rename,
	            module = App.modules[id],
	            inputs = arguments,
	            output
	
	        // 获取依赖模块配置
	
	        if ( !module ) {
	            return App.get(id, function () {
	                that.uri.apply(this, inputs)
	            })
	        }
	
	        // 被映射数据源的真实key和映射key
	
	        if ( typeof name === 'string' ) {
	            rename = name
	        } else {
	            rename = name[0]
	            name = name[1]
	        }
	
	        // 第一页加速
	
	        output = document.getElementById(id + '/' + type + '/' + name)
	
	        if ( output ) {
	            callback.call(this, id, rename, output.innerHTML || '', "object")
	            output.remove()
	
	            return
	        }
	
	        // get uri
	
	        uri = module.resources
	        uri = uri ? uri[type] : null
	        uri = uri ? uri[name] : null
	
	        // debug
	
	        if ( !uri ) {
	            if ( id !== 'frameworks' ) {
	                uri = 'frameworks::' + name
	            } else {
	                App.console.error('resources.' + type + '[' + name + ']', 'Config error', 'is not definde')
	            }
	        }
	
	        // DATA TYPE
	
	        if ( typeof uri === "function" ) {
	            uri = callback.call(this, id, rename, function (callback) { return uri.call(module, param, callback) }, "function")
	
	            // uri 的继续类型， 若uri == undefined, 则认为为异步数据，终止以下
	            if ( uri === undefined ) return
	        } 
	
	        if ( typeof uri === "object" ) {
	            return callback.call(this, id, rename, uri, "object")
	        } 
	
	        if ( typeof uri === "string" ) {
	
	            // trim
	
	            uri = uri.trim()
	
	            // 映射
	
	            if ( uri.indexOf('::') > 0 ) {
	                uri = uri.split(/\:\:/)
	
	                if ( uri.length === 2 ) return this.uri(uri[0], param, [name, uri[1]], type, callback)
	            }
	
	            // real path
	
	            uri = App.realpath(id, null, uri)
	
	            // mark module network
	
	            if ( uri.indexOf('//') == 0 || uri.indexOf('://') > 0 ) {
	
	                // 网络请求类型标记
	                
	                remote = App.get(id).network = true
	            } 
	
	            // helpher
	
	            if ( uri.indexOf("|@") > -1 ) {
	                var urs = uri.split(/\|\@/)
	                var url = urs[0]
	
	                uri = {
	                    url : url,
	                    remote : remote,
	                    method : 'GET',
	                    cache : 0,
	                    param : {},
	                    headers : {},
	                    settings : {},
	                    storeage : sessionStorage
	                }
	
	                for (var i = 1, l = urs.length; i < l; i++) {
	                    var helpher = /(\w+)\((.*)?\)/g.exec(urs[i]),
	                        helper = helpher[1],
	                        value = helpher[2]
	
	                    switch (helper) {
	                        case 'param':
	                        case 'headers':
	                        case 'settings':
	                            value = value || ''
	                            value = value.indexOf('{') === 0 ? value : '{' + value + '}'
	                            uri[helper] = uri[helper].extend(param.getValueByRoute(value) || {})
	
	                        break
	
	                        case 'cache':
	                            uri.cache = value || 60
	
	                        break
	
	                        case 'storeage':
	                            uri.cache = value || 2592000000
	                            uri.storeage = localStorage
	                            uri.permanent = true
	
	                        break
	
	                        case 'origin':
	                            uri.settings.origin = value
	
	                        break
	
	                        case 'caller':
	                            uri.settings.caller = value
	
	                        break
	
	                        case 'method':
	                            uri.method = value
	                        break
	                    }
	
	                }    
	                
	            } else {
	                uri = {
	                    url : uri,
	                    remote : remote,
	                    method : 'GET',
	                    cache : 0,
	                    param : {},
	                    headers : {},
	                    settings : {},
	                    storeage : sessionStorage
	                }
	            }
	
	            return callback.call(this, id, rename, uri, 'url')
	        }
	    },
	
	    ajax : function (id, type, sid, sname, suri, stack, cacid, geter) {
	        var that = this
	        var module = App.get(id)
	
	        // server请求发起时间
	
	        if ( suri.remote ) {
	            var sendTime = Date.now()
	        }
	
	        promise.ajax(suri.method, suri.url, suri.param, suri.headers, suri.settings, type, id).then(function (err, data, xhr) {
	            if ( err ) {
	                App.trigger('sourceerror', {
	                    id : id,
	                    url : suri.url,
	                    params : suri.param
	                })
	                
	                return that.error()
	            }
	
	            // 数据缓存 
	
	            if ( cacid ) {
	                try {
	                    stack.setItem(cacid, '[' + Date.now() + ']=' + xhr.response)
	
	                    // storagemaps
	                    
	                    module.storagemaps.push(cacid)
	                } catch (e) {}
	            }
	
	            if ( type == 'data' ) {
	                data = that.filter(module, data, sname)
	            }
	
	            if ( geter ) geter.done(err, sid, sname, suri.url, data)
	
	            // request 请求用时统计
	            
	            if ( suri.remote ) {
	                App.trigger('requestserver', { url : suri.url, time : Date.now() - sendTime })
	            }
	        })
	    },
	
	    filter : function (module, data, name) {
	        var con = module.controller
	
	        if ( typeof con == 'function' ) {
	            return con.call(module, data, name) || data
	        } else if ( typeof con[name] == 'function' ) {
	            return con[name].call(module, data) || data
	        } else {
	            return data
	        }
	    },
	
	    async : function (id, param, source, type, geter) {
	        var that = this
	          , gets = []
	          , module = App.get(id)
	
	        for (var i in source) {
	            gets.push((function () {
	                var geter = new Promise()
	
	                this.uri(id, param, source[i], type, function (sid, sname, suri, stype) {
	
	                    switch (stype) {
	                        case 'object':
	
	                            // filter
	                            
	                            if ( type == 'data' ) {
	                                suri = that.filter(module, suri, sname)
	                            }
	
	                            geter.done(null, sid, sname, null, suri)
	                            
	                        break
	
	                        case 'function':
	                            var callback = function (data) {
	                                    geter.done(null, sid, sname, suri, data)
	                                }
	                              , data = suri(callback)
	
	                            // filter
	
	                            if ( type == 'data' ) {
	                                data = that.filter(module, data, sname)
	                            }
	
	                            // suri return fn (param, callback) param 为模块参数
	                            
	                            // 支持同步和异步, 如果function返回的方式是异步则需要callback
	
	                            if ( typeof data === 'object' || data === false ) {
	                                callback(data)
	                            } else {
	                                return data
	                            }
	                            
	                        break
	
	                        case 'url':
	                            var stack = suri.storeage 
	                            var cacid = suri.cache ? suri.url + '$' + JSON.stringify(suri.param) : false
	                            var cache, clife, ctime
	
	                            try {
	                                cache = cacid ? stack.getItem(cacid) : false
	                            } catch (e) {}
	
	                            // 查看cache生命周期
	
	                            if ( cache ) {
	                                clife = /\[(\d+)\]\=/.exec(cache) || [0, 0]
	                                ctime = clife[1]
	
	                                cache = !ctime 
	                                        ? null 
	                                        : App._EXISTS && Date.now() - ctime > suri.cache * 1000 
	                                        ? null 
	                                        : cache.substr(clife[0].length)
	                            }
	
	                            // 如果cache符合条件则从cache读取数据
	
	                            if ( cache ) {
	
	                                if ( type === 'data' ) {
	
	                                    if ( typeof cache === 'string' ) {
	                                        try {
	                                            cache = JSON.parse(cache)
	                                        } catch (e) {
	
	                                            try {
	                                                cache = App.sandbox.window.eval('(' + cache + ')')
	                                            } catch (e) {
	                                                cache = null 
	                                            }
	
	                                            App.console[typeof cache === 'object' ? 'Warning' : 'error']('url[' + suri.url + ']', 'SyntaxError', 'Unexpected token in JSON')
	                                        }
	                                    }
	
	                                    cache = cache ? that.filter(module, cache, sname) : null
	                                }
	
	                                if ( App._EXISTS === false && suri.permanent && Date.now() - ctime > module.config.timeout * 1000 ) {
	                                    module.timeout = true
	                                }
	
	                                if ( cache ) {
	
	                                    geter.done(null, sid, sname, suri.url, cache)
	
	                                    setTimeout(function () {
	
	                                        // fetch
	
	                                        that.ajax(id, type, sid, sname, suri, stack, cacid)
	                                        
	                                    }, 2000)
	
	                                    App.console.info('Data [' + sname + ']', 'From cache', sid)
	
	                                    break
	                                }
	                            }
	                            
	
	                            // fetch
	
	                            that.ajax(id, type, sid, sname, suri, stack, cacid, geter)
	
	                        break
	                    }
	
	                })
	
	                return geter
	
	            }).call(this))
	        }
	
	        promise.join(gets).then(
	            function (results) {
	                var sids = [],
	                    suri = [],
	                    source = []
	
	                for (var i = 0, l = results.length; i < l; i++) {
	                    var data = results[i],
	                        id = data[1],
	                        sid = data[2],
	                        uri = data[3],
	                        context = data[4]
	
	                    sids[sid] = id
	                    suri[sid] = uri
	                    source[sid] = context
	                }
	
	                geter.done(null, sids, suri, source, type)
	            }
	        )
	    },
	
	    source : function (id, param, config, type) {
	        var geter = new Promise()
	        
	        if ( !config[type] || !config[type].length ) {
	            geter.done(null, id, null, {}, type)
	        } else {
	            this.async(id, param, config[type], type, geter)
	        }
	
	        return geter
	    },
	
	    get : function (id, config, param, callback, error) {
	        this.error = error || noop
	
	        promise.join([
	            this.source(id, param, config, 'data'),
	            this.source(id, param, config, 'style'),
	            this.source(id, param, config, 'source')
	        ]).then(
	            function(results) {
	                var sids = [],
	                    suri = [],
	                    source = []
	
	                for (var i = 0, l = results.length; i < l; i++) {
	                    var data = results[i],
	                        type = data[4]
	
	                    sids[type] = data[1] || {}
	                    suri[type] = data[2] || {}
	                    source[type] = data[3] || {}
	                }
	
	                callback(sids, suri, source)
	            }
	        )
	    },
	
	    fetch : function () {
	        this.sessioncache = false
	        this.get.apply(this, arguments)
	    },
	
	    prefetch : function () {
	        this.sessioncache = true
	        this.get.apply(this, arguments)
	    }
	}
	
	export default Get

/***/ }),
/* 5 */
/***/ (function(module, exports) {

	// 为无为，事无事，味无味。
	// 曲则全，枉则直，洼则盈，敝则新，少则多，多则惑。
	
	  /*
	* Copyright (c) 2011 Róbert Pataki
	* 
	* Permission is hereby granted, free of charge, to any person obtaining a copy
	* of this software and associated documentation files (the "Software"), to deal
	* in the Software without restriction, including without limitation the rights
	* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	* copies of the Software, and to permit persons to whom the Software is
	* furnished to do so, subject to the following conditions:
	* 
	* The above copyright notice and this permission notice shall be included in
	* all copies or substantial portions of the Software.
	* 
	* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	* THE SOFTWARE.
	* 
	* ----------------------------------------------------------------------------------------
	* 
	* Check out my GitHub:  http://github.com/heartcode/
	* Send me an email:   heartcode@robertpataki.com
	* Follow me on Twitter: http://twitter.com/#iHeartcode
	* Blog:         http://heartcode.robertpataki.com
	*/
	
	/**
	* CanvasLoader uses the HTML5 canvas element in modern browsers and VML in IE6/7/8 to create and animate the most popular preloader shapes (oval, spiral, rectangle, square and rounded rectangle).<br/><br/>
	* It is important to note that CanvasLoader doesn't show up and starts rendering automatically on instantiation. To start rendering and display the loader use the <code>show()</code> method.
	* @module CanvasLoader
	**/
	export default (function (window) {
	  "use strict";
	  /**
	  * CanvasLoader is a JavaScript UI library that draws and animates circular preloaders using the Canvas HTML object.<br/><br/>
	  * A CanvasLoader instance creates two canvas elements which are placed into a placeholder div (the id of the div has to be passed in the constructor). The second canvas is invisible and used for caching purposes only.<br/><br/>
	  * If no id is passed in the constructor, the canvas objects are paced in the document directly.
	  * @class CanvasLoader
	  * @constructor
	  * @param id {String} The id of the placeholder div
	  * @param opt {Object} Optional parameters<br/><br/>
	  * <strong>Possible values of optional parameters:</strong><br/>
	  * <ul>
	  * <li><strong>id (String):</strong> The id of the CanvasLoader instance</li>
	  * <li><strong>safeVML (Boolean):</strong> If set to true, the amount of CanvasLoader shapes are limited in VML mode. It prevents CPU overkilling when rendering loaders with high density. The default value is true.</li>
	  **/
	  var CanvasLoader = function (id, opt) {
	    if (typeof(opt) == "undefined") { opt = {}; }
	    this.init(id, opt);
	  }, p = CanvasLoader.prototype, engine, engines = ["canvas", "vml"], shapes = ["oval", "spiral", "square", "rect", "roundRect"], cRX = /^\#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/, ie8 = navigator.appVersion.indexOf("MSIE") !== -1 && parseFloat(navigator.appVersion.split("MSIE")[1]) === 8 ? true : false, canSup = !!document.createElement('canvas').getContext, safeDensity = 40, safeVML = true,
	  /**
	  * Creates a new element with the tag and applies the passed properties on it
	  * @method addEl
	  * @protected
	  * @param tag {String} The tag to be created
	  * @param par {String} The DOM element the new element will be appended to
	  * @param opt {Object} Additional properties passed to the new DOM element
	  * @return {Object} The DOM element
	  */
	    addEl = function (tag, par, opt) {
	      var el = document.createElement(tag), n;
	      for (n in opt) { el[n] = opt[n]; }
	      if(typeof(par) !== "undefined") {
	        par.appendChild(el);
	      }
	      return el;
	    },
	  /**
	  * Sets the css properties on the element
	  * @method setCSS
	  * @protected
	  * @param el {Object} The DOM element to be styled
	  * @param opt {Object} The style properties
	  * @return {Object} The DOM element
	  */
	    setCSS = function (el, opt) {
	      for (var n in opt) { el.style[n] = opt[n]; }
	      return el;
	    },
	  /**
	  * Sets the attributes on the element
	  * @method setAttr
	  * @protected
	  * @param el {Object} The DOM element to add the attributes to
	  * @param opt {Object} The attributes
	  * @return {Object} The DOM element
	  */
	    setAttr = function (el, opt) {
	      for (var n in opt) { el.setAttribute(n, opt[n]); }
	      return el;
	    },
	  /**
	  * Transforms the cache canvas before drawing
	  * @method transCon
	  * @protected
	  * @param  x {Object} The canvas context to be transformed
	  * @param  x {Number} x translation
	  * @param  y {Number} y translation
	  * @param  r {Number} Rotation radians
	  */
	    transCon = function(c, x, y, r) {
	      c.save();
	      c.translate(x, y);
	      c.rotate(r);
	      c.translate(-x, -y);
	      c.beginPath();
	    };
	  /** 
	  * Initialization method
	  * @method init
	  * @protected
	  * @param id {String} The id of the placeholder div, where the loader will be nested into
	  * @param opt {Object} Optional parameters<br/><br/>
	  * <strong>Possible values of optional parameters:</strong><br/>
	  * <ul>
	  * <li><strong>id (String):</strong> The id of the CanvasLoader instance</li>
	  * <li><strong>safeVML (Boolean):</strong> If set to true, the amount of CanvasLoader shapes are limited in VML mode. It prevents CPU overkilling when rendering loaders with high density. The default value is true.</li>
	  **/
	  p.init = function (pId, opt) {
	    
	    if (typeof(opt.safeVML) === "boolean") { safeVML = opt.safeVML; }
	    
	    /*
	    * Find the containing div by id
	    * If the container element cannot be found we use the document body itself
	    */
	    try {
	      // Look for the parent element
	      if (document.getElementById(pId) !== undefined) {
	        this.mum = document.getElementById(pId);
	      } else {
	        this.mum = document.body;
	      }
	    } catch (error) {
	      this.mum = document.body;
	    }
	
	    this.mum = pId;
	    // Creates the parent div of the loader instance
	    this.cont = addEl("loader", this.mum);
	    if (canSup) {
	    // For browsers with Canvas support...
	      engine = engines[0];
	      // Create the canvas element
	      this.can = addEl("canvas", this.cont);
	      this.con = this.can.getContext("2d");
	      // Create the cache canvas element
	      this.cCan = setCSS(addEl("canvas", this.cont), { display: "none" });
	      this.cCon = this.cCan.getContext("2d");
	    } else {
	    // For browsers without Canvas support...
	      engine = engines[1];
	      // Adds the VML stylesheet
	      if (typeof (CanvasLoader.vmlSheet) === "undefined") {
	        document.getElementsByTagName("head")[0].appendChild(addEl("style"));
	        CanvasLoader.vmlSheet = document.styleSheets[document.styleSheets.length - 1];
	        var a = ["group", "oval", "roundrect", "fill"], n;
	        for ( var n = 0; n < a.length; ++n ) { CanvasLoader.vmlSheet.addRule(a[n], "behavior:url(#default#VML); position:absolute;"); }
	      }
	      this.vml = addEl("group", this.cont);
	    }
	    // Set the RGB color object
	    this.setColor(this.color);
	    // Draws the shapes on the canvas
	    this.draw();
	    //Hides the preloader
	    setCSS(this.cont, {display: "none"});
	  };
	/////////////////////////////////////////////////////////////////////////////////////////////
	// Property declarations
	  /**
	  * The div we place the canvas object into
	  * @property cont
	  * @protected
	  * @type Object
	  **/
	  p.cont = {};
	  /**
	  * The div we draw the shapes into
	  * @property can
	  * @protected
	  * @type Object
	  **/
	  p.can = {};
	  /**
	  * The canvas context
	  * @property con
	  * @protected
	  * @type Object
	  **/
	  p.con = {};
	  /**
	  * The canvas we use for caching
	  * @property cCan
	  * @protected
	  * @type Object
	  **/
	  p.cCan = {};
	  /**
	  * The context of the cache canvas
	  * @property cCon
	  * @protected
	  * @type Object
	  **/
	  p.cCon = {};
	  /**
	  * Adds a timer for the rendering
	  * @property timer
	  * @protected
	  * @type Boolean
	  **/
	  p.timer = {};
	  /**
	  * The active shape id for rendering
	  * @property activeId
	  * @protected
	  * @type Number
	  **/
	  p.activeId = 0;
	  /**
	  * The diameter of the loader
	  * @property diameter
	  * @protected
	  * @type Number
	  * @default 40
	  **/
	  p.diameter = 40;
	  /**
	  * Sets the diameter of the loader
	  * @method setDiameter
	  * @public
	  * @param diameter {Number} The default value is 40
	  **/
	  p.setDiameter = function (diameter) { this.diameter = Math.round(Math.abs(diameter)); this.redraw(); };
	  /**
	  * Returns the diameter of the loader.
	  * @method getDiameter
	  * @public
	  * @return {Number}
	  **/
	  p.getDiameter = function () { return this.diameter; };
	  /**
	  * The color of the loader shapes in RGB
	  * @property cRGB
	  * @protected
	  * @type Object
	  **/
	  p.cRGB = {};
	  /**
	  * The color of the loader shapes in HEX
	  * @property color
	  * @protected
	  * @type String
	  * @default "#000000"
	  **/
	  p.color = "#000000";
	  /**
	  * Sets hexadecimal color of the loader
	  * @method setColor
	  * @public
	  * @param color {String} The default value is '#000000'
	  **/
	  p.setColor = function (color) { this.color = cRX.test(color) ? color : "#000000"; this.cRGB = this.getRGB(this.color); this.redraw(); };
	  /**
	  * Returns the loader color in a hexadecimal form
	  * @method getColor
	  * @public
	  * @return {String}
	  **/
	  p.getColor = function () { return this.color; };
	  /**
	  * The type of the loader shapes
	  * @property shape
	  * @protected
	  * @type String
	  * @default "oval"
	  **/
	  p.shape = shapes[0];
	  /**
	  * Sets the type of the loader shapes.<br/>
	  * <br/><b>The acceptable values are:</b>
	  * <ul>
	  * <li>'oval'</li>
	  * <li>'spiral'</li>
	  * <li>'square'</li>
	  * <li>'rect'</li>
	  * <li>'roundRect'</li>
	  * </ul>
	  * @method setShape
	  * @public
	  * @param shape {String} The default value is 'oval'
	  **/
	  p.setShape = function (shape) {
	    var n;
	    for (n in shapes) {
	      if (shape === shapes[n]) { this.shape = shape; this.redraw(); break; }
	    }
	  };
	  /**
	  * Returns the type of the loader shapes
	  * @method getShape
	  * @public
	  * @return {String}
	  **/
	  p.getShape = function () { return this.shape; };
	  /**
	  * The number of shapes drawn on the loader canvas
	  * @property density
	  * @protected
	  * @type Number
	  * @default 40
	  **/
	  p.density = 40;
	  /**
	  * Sets the number of shapes drawn on the loader canvas
	  * @method setDensity
	  * @public
	  * @param density {Number} The default value is 40
	  **/
	  p.setDensity = function (density) { 
	    if (safeVML && engine === engines[1]) {
	      this.density = Math.round(Math.abs(density)) <= safeDensity ? Math.round(Math.abs(density)) : safeDensity;
	    } else {
	      this.density = Math.round(Math.abs(density));
	    }
	    if (this.density > 360) { this.density = 360; }
	    this.activeId = 0;
	    this.redraw();
	  };
	  /**
	  * Returns the number of shapes drawn on the loader canvas
	  * @method getDensity
	  * @public
	  * @return {Number}
	  **/
	  p.getDensity = function () { return this.density; };
	  /**
	  * The amount of the modified shapes in percent.
	  * @property range
	  * @protected
	  * @type Number
	  **/
	  p.range = 1.3;
	  /**
	  * Sets the amount of the modified shapes in percent.<br/>
	  * With this value the user can set what range of the shapes should be scaled and/or faded. The shapes that are out of this range will be scaled and/or faded with a minimum amount only.<br/>
	  * This minimum amount is 0.1 which means every shape which is out of the range is scaled and/or faded to 10% of the original values.<br/>
	  * The visually acceptable range value should be between 0.4 and 1.5.
	  * @method setRange
	  * @public
	  * @param range {Number} The default value is 1.3
	  **/
	  p.setRange = function (range) { this.range = Math.abs(range); this.redraw(); };
	  /**
	  * Returns the modified shape range in percent
	  * @method getRange
	  * @public
	  * @return {Number}
	  **/
	  p.getRange = function () { return this.range; };
	  /**
	  * The speed of the loader animation
	  * @property speed
	  * @protected
	  * @type Number
	  **/
	  p.speed = 2;
	  /**
	  * Sets the speed of the loader animation.<br/>
	  * This value tells the loader how many shapes to skip by each tick.<br/>
	  * Using the right combination of the <code>setFPS</code> and the <code>setSpeed</code> methods allows the users to optimize the CPU usage of the loader whilst keeping the animation on a visually pleasing level.
	  * @method setSpeed
	  * @public
	  * @param speed {Number} The default value is 2
	  **/
	  p.setSpeed = function (speed) { this.speed = Math.round(Math.abs(speed)); };
	  /**
	  * Returns the speed of the loader animation
	  * @method getSpeed
	  * @public
	  * @return {Number}
	  **/
	  p.getSpeed = function () { return this.speed; };
	  /**
	  * The FPS value of the loader animation rendering
	  * @property fps
	  * @protected
	  * @type Number
	  **/
	  p.fps = 24;
	  /**
	  * Sets the rendering frequency.<br/>
	  * This value tells the loader how many times to refresh and modify the canvas in 1 second.<br/>
	  * Using the right combination of the <code>setSpeed</code> and the <code>setFPS</code> methods allows the users to optimize the CPU usage of the loader whilst keeping the animation on a visually pleasing level.
	  * @method setFPS
	  * @public
	  * @param fps {Number} The default value is 24
	  **/
	  p.setFPS = function (fps) { this.fps = Math.round(Math.abs(fps)); this.reset(); };
	  /**
	  * Returns the fps of the loader
	  * @method getFPS
	  * @public
	  * @return {Number}
	  **/
	  p.getFPS = function () { return this.fps; };
	// End of Property declarations
	///////////////////////////////////////////////////////////////////////////////////////////// 
	  /**
	  * Return the RGB values of the passed color
	  * @method getRGB
	  * @protected
	  * @param color {String} The HEX color value to be converted to RGB
	  */
	  p.getRGB = function (c) {
	    c = c.charAt(0) === "#" ? c.substring(1, 7) : c;
	    return {r: parseInt(c.substring(0, 2), 16), g: parseInt(c.substring(2, 4), 16), b: parseInt(c.substring(4, 6), 16) };
	  };
	  /**
	  * Draw the shapes on the canvas
	  * @method draw
	  * @protected
	  */
	  p.draw = function () {
	    var i = 0, size, w, h, x, y, ang, rads, rad, de = this.density, animBits = Math.round(de * this.range), bitMod, minBitMod = 0, s, g, sh, f, d = 1000, arc = 0, c = this.cCon, di = this.diameter, e = 0.47;
	    if (engine === engines[0]) {
	      c.clearRect(0, 0, d, d);
	      setAttr(this.can, {width: di, height: di});
	      setAttr(this.cCan, {width: di, height: di});
	      while (i < de) {
	        bitMod = i <= animBits ? 1 - ((1 - minBitMod) / animBits * i) : bitMod = minBitMod;
	        ang = 270 - 360 / de * i;
	        rads = ang / 180 * Math.PI;
	        c.fillStyle = "rgba(" + this.cRGB.r + "," + this.cRGB.g + "," + this.cRGB.b + "," + bitMod.toString() + ")";
	        switch (this.shape) {
	        case shapes[0]:
	        case shapes[1]:
	          size = di * 0.07;
	          x = di * e + Math.cos(rads) * (di * e - size) - di * e;
	          y = di * e + Math.sin(rads) * (di * e - size) - di * e;
	          c.beginPath();
	          if (this.shape === shapes[1]) { c.arc(di * 0.5 + x, di * 0.5 + y, size * bitMod, 0, Math.PI * 2, false); } else { c.arc(di * 0.5 + x, di * 0.5 + y, size, 0, Math.PI * 2, false); }
	          break;
	        case shapes[2]:
	          size = di * 0.12;
	          x = Math.cos(rads) * (di * e - size) + di * 0.5;
	          y = Math.sin(rads) * (di * e - size) + di * 0.5;
	          transCon(c, x, y, rads);
	          c.fillRect(x, y - size * 0.5, size, size);
	          break;
	        case shapes[3]:
	        case shapes[4]:
	          w = di * 0.24;
	          h = w * 0.36;
	          x = Math.cos(rads) * (h + (di - h) * 0.13) + di * 0.5;
	          y = Math.sin(rads) * (h + (di - h) * 0.13) + di * 0.5;
	          transCon(c, x, y, rads);
	          if(this.shape === shapes[3]) {
	            c.fillRect(x, y - h * 0.5, w, h);
	          } else {
	            rad = h * 0.55;
	            c.moveTo(x + rad, y - h * 0.5);
	            c.lineTo(x + w - rad, y - h * 0.5);
	            c.quadraticCurveTo(x + w, y - h * 0.5, x + w, y - h * 0.5 + rad);
	            c.lineTo(x + w, y - h * 0.5 + h - rad);
	            c.quadraticCurveTo(x + w, y - h * 0.5 + h, x + w - rad, y - h * 0.5 + h);
	            c.lineTo(x + rad, y - h * 0.5 + h);
	            c.quadraticCurveTo(x, y - h * 0.5 + h, x, y - h * 0.5 + h - rad);
	            c.lineTo(x, y - h * 0.5 + rad);
	            c.quadraticCurveTo(x, y - h * 0.5, x + rad, y - h * 0.5);
	          }
	          break;
	        }
	        c.closePath();
	        c.fill();
	        c.restore();
	        ++i;
	      }
	    } else {
	      setCSS(this.cont, {width: di, height: di});
	      setCSS(this.vml, {width: di, height: di});
	      switch (this.shape) {
	      case shapes[0]:
	      case shapes[1]:
	        sh = "oval";
	        size = d * 0.14;
	        break;
	      case shapes[2]:
	        sh = "roundrect";
	        size = d * 0.12;
	        break;
	      case shapes[3]:
	      case shapes[4]:
	        sh = "roundrect";
	        size = d * 0.3;
	        break;
	      }
	      w = h = size;
	      x = d * 0.5 - h;
	      y = -h * 0.5;   
	      while (i < de) {
	        bitMod = i <= animBits ? 1 - ((1 - minBitMod) / animBits * i) : bitMod = minBitMod;
	        ang = 270 - 360 / de * i;
	        switch (this.shape) {
	        case shapes[1]:
	          w = h = size * bitMod;
	          x = d * 0.5 - size * 0.5 - size * bitMod * 0.5;
	          y = (size - size * bitMod) * 0.5;
	          break;
	        case shapes[0]:
	        case shapes[2]:
	          if (ie8) {
	            y = 0;
	            if(this.shape === shapes[2]) {
	              x = d * 0.5 -h * 0.5;
	            }
	          }
	          break;
	        case shapes[3]:
	        case shapes[4]:
	          w = size * 0.95;
	          h = w * 0.28;
	          if (ie8) {
	            x = 0;
	            y = d * 0.5 - h * 0.5;
	          } else {
	            x = d * 0.5 - w;
	            y = -h * 0.5;
	          }
	          arc = this.shape === shapes[4] ? 0.6 : 0; 
	          break;
	        }
	        g = setAttr(setCSS(addEl("group", this.vml), {width: d, height: d, rotation: ang}), {coordsize: d + "," + d, coordorigin: -d * 0.5 + "," + (-d * 0.5)});
	        s = setCSS(addEl(sh, g, {stroked: false, arcSize: arc}), { width: w, height: h, top: y, left: x});
	        f = addEl("fill", s, {color: this.color, opacity: bitMod});
	        ++i;
	      }
	    }
	    this.tick(true);
	  };
	  /**
	  * Cleans the canvas
	  * @method clean
	  * @protected
	  */
	  p.clean = function () {
	    if (engine === engines[0]) {
	      this.con.clearRect(0, 0, 1000, 1000);
	    } else {
	      var v = this.vml;
	      if (v.hasChildNodes()) {
	        while (v.childNodes.length >= 1) {
	          v.removeChild(v.firstChild);
	        }
	      }
	    }
	  };
	  /**
	  * Redraws the canvas
	  * @method redraw
	  * @protected
	  */
	  p.redraw = function () {
	      this.clean();
	      this.draw();
	  };
	  /**
	    * Resets the timer
	    * @method reset
	    * @protected
	    */
	    p.reset = function () {
	      if (typeof (this.timer) === "number") {
	        this.hide();
	        this.show();
	      }
	    };
	  /**
	  * Renders the loader animation
	  * @method tick
	  * @protected
	  */
	  p.tick = function (init) {
	    var c = this.con, di = this.diameter;
	    if (!init) { this.activeId += 360 / this.density * this.speed; }
	    if (engine === engines[0]) {
	      c.clearRect(0, 0, di, di);
	      transCon(c, di * 0.5, di * 0.5, this.activeId / 180 * Math.PI);
	      c.drawImage(this.cCan, 0, 0, di, di);
	      c.restore();
	    } else {
	      if (this.activeId >= 360) { this.activeId -= 360; }
	      setCSS(this.vml, {rotation:this.activeId});
	    }
	  };
	  /**
	  * Shows the rendering of the loader animation
	  * @method show
	  * @public
	  */
	  p.show = function () {
	    if (typeof (this.timer) !== "number") {
	      var t = this;
	      this.timer = self.setInterval(function () { t.tick(); }, Math.round(1000 / this.fps));
	      setCSS(this.cont, {display: "block"});
	    }
	  };
	  /**
	  * Stops the rendering of the loader animation and hides the loader
	  * @method hide
	  * @public
	  */
	  p.hide = function () {
	    if (typeof (this.timer) === "number") {
	      clearInterval(this.timer);      
	      delete this.timer;
	      setCSS(this.cont, {display: "none"});
	    }
	  };
	  /**
	  * Removes the CanvasLoader instance and all its references
	  * @method kill
	  * @public
	  */
	  p.kill = function () {
	    var c = this.cont;
	    if (typeof (this.timer) === "number") { this.hide(); }
	    if (engine === engines[0]) {
	      c.removeChild(this.can);
	      c.removeChild(this.cCan);
	    } else {
	      c.removeChild(this.vml);
	    }
	    var n;
	    for (n in this) { delete this[n]; }
	  };
	
	  return CanvasLoader;
	}(window));

/***/ }),
/* 6 */
/***/ (function(module, exports) {

	// 合抱之木，生於毫末；九层之台，起於累土；千里之行，始於足下。
	
	var browser = {
	        prefixStyle : device.feat.prefixStyle
	    }
	var rAF = requestAnimationFrame
	
	
	/**
	* CSS Easing functions
	*/
	
	var ease = {
	      'in':                'ease-in'
	    , 'out':               'ease-out'
	    , 'in-out':            'ease-in-out'
	    , 'snap':              'cubic-bezier(0, 1, .5, 1)'
	    , 'linear':            'cubic-bezier(0.250, 0.250, 0.750, 0.750)'
	    , 'ease-in-quad':      'cubic-bezier(0.550, 0.085, 0.680, 0.530)'
	    , 'ease-in-cubic':     'cubic-bezier(0.550, 0.055, 0.675, 0.190)'
	    , 'ease-in-quart':     'cubic-bezier(0.895, 0.030, 0.685, 0.220)'
	    , 'ease-in-quint':     'cubic-bezier(0.755, 0.050, 0.855, 0.060)'
	    , 'ease-in-sine':      'cubic-bezier(0.470, 0.000, 0.745, 0.715)'
	    , 'ease-in-expo':      'cubic-bezier(0.950, 0.050, 0.795, 0.035)'
	    , 'ease-in-circ':      'cubic-bezier(0.600, 0.040, 0.980, 0.335)'
	    , 'ease-in-back':      'cubic-bezier(0.600, -0.280, 0.735, 0.045)'
	    , 'ease-out-quad':     'cubic-bezier(0.250, 0.460, 0.450, 0.940)'
	    , 'ease-out-cubic':    'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
	    , 'ease-out-quart':    'cubic-bezier(0.165, 0.840, 0.440, 1.000)'
	    , 'ease-out-quint':    'cubic-bezier(0.230, 1.000, 0.320, 1.000)'
	    , 'ease-out-sine':     'cubic-bezier(0.390, 0.575, 0.565, 1.000)'
	    , 'ease-out-expo':     'cubic-bezier(0.190, 1.000, 0.220, 1.000)'
	    , 'ease-out-circ':     'cubic-bezier(0.075, 0.820, 0.165, 1.000)'
	    , 'ease-out-back':     'cubic-bezier(0.175, 0.885, 0.320, 1.275)'
	    , 'ease-in-out-quad':  'cubic-bezier(0.455, 0.030, 0.515, 0.955)'
	    , 'ease-in-out-cubic': 'cubic-bezier(0.645, 0.045, 0.355, 1.000)'
	    , 'ease-in-out-quart': 'cubic-bezier(0.770, 0.000, 0.175, 1.000)'
	    , 'ease-in-out-quint': 'cubic-bezier(0.860, 0.000, 0.070, 1.000)'
	    , 'ease-in-out-sine':  'cubic-bezier(0.445, 0.050, 0.550, 0.950)'
	    , 'ease-in-out-expo':  'cubic-bezier(1.000, 0.000, 0.000, 1.000)'
	    , 'ease-in-out-circ':  'cubic-bezier(0.785, 0.135, 0.150, 0.860)'
	    , 'ease-in-out-back':  'cubic-bezier(0.680, -0.550, 0.265, 1.550)'
	}
	
	
	
	/**
	* Module Dependencies.
	*/
	
	
	var hasTransitions = device.feat.prefixStyle('transition')
	
	
	/**
	* Get computed style.
	*/
	
	var style = window.getComputedStyle || window.currentStyle
	
	/**
	* Export `ease`
	*/
	
	Move.ease = ease
	
	/**
	* Defaults.
	*
	*   `duration` - default duration of 500ms
	*
	*/
	
	
	Move.select = function (selector) {
	    if ('string' != typeof selector) return selector
	    return $$(selector)[0]
	}
	
	function Move (el) {
	    if (!(this instanceof Move)) return new Move(el)
	    if ('string' == typeof el) el = $$(el)[0]
	    if (!el) return
	    this.el = el
	    this._events = {}
	    this._props = {}
	    this._rotate = 0
	    this._transitionProps = []
	    this._transforms = {}
	    this.duration(0)
	}
	
	var proto = Move.prototype
	
	proto.on = function (types, fn) {
	    var that = this
	
	    types.split(' ').each(function (i, type) {
	        that._events.initial(type, []).push(fn)
	    })
	
	    return this
	}
	
	proto.one = function (types, fn) {
	    var that = this
	
	    function once () {
	        fn.apply(this, arguments)
	        this.off(types, once)
	    }
	
	    types.split(' ').each(function (i, type) {
	        that._events.initial(type, []).push(once)
	    })
	
	    return this
	}
	
	proto.off = function (types, fn) {
	    var that = this
	
	    types.split(' ').each(function (i, type) {
	        if ( !that._events[type] ) return
	
	        var index = that._events[type].indexOf(fn)
	
	        if ( index > -1 ) {
	            that._events[type].splice(index, 1)
	        }
	    })
	
	    return this
	}
	
	proto.trigger = function (type) {
	    var that = this
	    var args = arguments
	    var events = this._events[type]
	
	    if ( !events ) return
	
	    for (var i = events.length - 1; i >= 0; i--) {
	        events[i].apply(that, [].slice.call(args, 1))
	    }
	}
	
	// once fn
	
	proto._transitionend = function (fn) {
	    if ( this._duration == 0 || !hasTransitions ) return fn()
	    this.el.one('transitionend', fn)
	}
	
	/**
	* Buffer `transform`.
	*
	* @param {String} transform
	* @return {Move} for chaining
	* @api private
	*/
	
	proto.transform = function (transform) {
	    var prop = transform.match(/\w+\b/)
	
	    this._transforms[prop] = transform
	
	    return this
	}
	
	proto._applyTransform = function () {
	    var transform = []
	
	    for (var i in this._transforms) {
	        transform.push(this._transforms[i])
	    }
	
	    if ( transform.length ) {
	        this.setProperty('transform', transform.join(' '))
	    }
	
	    return this
	}
	
	proto.skew = function (x, y) {
	    return this.transform('skew(' + x + 'deg, ' + (y || 0) + 'deg)')
	}
	
	proto.skewX = function (n) {
	    return this.transform('skewX(' + n + 'deg)')
	}
	
	proto.skewY = function (n) {
	    return this.transform('skewY(' + n + 'deg)')
	}
	
	proto.translate =
	proto.translate3d =
	proto.to = function (x, y, z) {
	
	    // 3d set
	
	    this.transform('translate3d(' + (x ? x + 'px' : 0) + ',' + (y ? y + 'px' : 0) + ',' + (z ? z + 'px' : 0) + ')')
	
	    return this
	}
	
	proto.translateX =
	proto.x = function (n) {
	    return this.transform('translateX(' + n + 'px)')
	}
	
	proto.translateY =
	proto.y = function (n) {
	    return this.transform('translateY(' + n + 'px)')
	}
	
	proto.translateZ =
	proto.z = function (n) {
	    return this.transform('translateZ(' + n + 'px)')
	}
	
	proto.scale = function (x, y) {
	    return this.transform('scale('
	      + x + ', '
	      + (y || x)
	      + ')')
	}
	
	proto.opacity = function (val) {
	    this._props['opacity'] = val
	    return this
	}
	
	proto.scaleX = function (n) {
	    return this.transform('scaleX(' + n + ')')
	}
	
	proto.matrix = function (m11, m12, m21, m22, m31, m32) {
	    return this.transform('matrix(' + [m11,m12,m21,m22,m31,m32].join(',') + ')')
	}
	
	proto.scaleY = function (n) {
	    return this.transform('scaleY(' + n + ')')
	}
	
	proto.rotate = function (n) {
	    return this.transform('rotate(' + n + 'deg)')
	}
	
	proto.rotateX = function (n) {
	    return this.transform('rotateX(' + n + 'deg)')
	}
	
	proto.rotateY = function (n) {
	    return this.transform('rotateY(' + n + 'deg)')
	}
	
	proto.rotateZ = function (n) {
	    return this.transform('rotateZ(' + n + 'deg)')
	}
	
	proto.rotate3d = function (x, y, z, d) {
	    return this.transform('rotate3d(' + x + ', ' + y + ',' + z +',' + d + 'deg)')
	}
	
	proto.perspective = function (z) {
	    this.el.parentNode.style.set('transform-style', 'preserve-3d')
	    this.el.parentNode.style.set('perspective', z + 'px')
	    return this
	}
	
	/**
	* Set transition easing function to to `fn` string.
	*
	* When:
	*
	*   - null "ease" is used
	*   - "in" "ease-in" is used
	*   - "out" "ease-out" is used
	*   - "in-out" "ease-in-out" is used
	*
	* @param {String} fn
	* @return {Move} for chaining
	* @api public
	*/
	
	proto.ease = function (fn) {
	    fn = ease[fn] || fn || 'ease'
	    return this.setProperty('transition-timing-function', fn)
	}
	
	/**
	* Set animation properties
	*
	* @param {String} name
	* @param {Object} props
	* @return {Move} for chaining
	* @api public
	*/
	
	proto.animate = function (name, props) {
	    for (var i in props) {
	        if ( props.hasOwnProperty(i) ) {
	            this.setProperty('animation-' + i, props[i])
	        }
	    }
	    return this.setProperty('animation-name', name)
	}
	
	/**
	* Set duration to `n`.
	*
	* @param {Number|String} n
	* @return {Move} for chaining
	* @api public
	*/
	
	proto.duration = function (n) {
	    n = this._duration = 'string' == typeof n
	      ? parseFloat(n) * 1000
	      : n
	
	    return this.setProperty('transition-duration', n + 'ms')
	}
	
	/**
	* Delay the animation by `n`.
	*
	* @param {Number|String} n
	* @return {Move} for chaining
	* @api public
	*/
	
	proto.delay = function (n) {
	    n = this._delay = 'string' == typeof n
	      ? parseFloat(n) * 1000
	      : n
	
	    return this.setProperty('transition-delay', n + 'ms')
	}
	
	proto.origin = function (x, y, n) {
	    n = x
	
	    if ( typeof x === 'object' ) {
	        y = x[1] || 0
	        x = x[0] || 0
	    }
	
	    if ( !isNaN(x) && !isNaN(y) ) {
	        n = x + 'px' + ' ' + y + 'px'
	    } else if ( y ) {
	        n = x + ' ' + y
	    }
	
	    return this.setProperty('transform-origin', n)
	}
	
	/**
	* Set `prop` to `val`, deferred until `.end()` is invoked.
	*
	* @param {String} prop
	* @param {String} val
	* @return {Move} for chaining
	* @api public
	*/
	
	proto.setProperty = function (prop, val) {
	    this._props[prop] = val === undefined ? '' : val
	    return this
	}
	
	proto.width = function (val) {
	    this._props.width = val === undefined ? '' : val + 'px'
	    return this
	}
	
	proto.height = function (val) {
	    this._props.height = val === undefined ? '' : val + 'px'
	    return this
	}
	
	/**
	* Set `prop` to `value`, deferred until `.end()` is invoked
	* and adds the property to the list of transition props.
	*
	* @param {String} prop
	* @param {String} val
	* @return {Move} for chaining
	* @api public
	*/
	
	proto.style = function (prop, val) {
	    this._props[prop] = val === undefined ? '' : val
	    return this
	}
	
	/**
	* Increment `prop` by `val`, deferred until `.end()` is invoked
	* and adds the property to the list of transition props.
	*
	* @param {String} prop
	* @param {Number} val
	* @return {Move} for chaining
	* @api public
	*/
	
	proto.add = function (prop, val) {
	    if (!style) return
	    var self = this
	    return this.on('start', function () {
	      var curr = parseInt(self.current(prop), 10)
	      self.set(prop, curr + val + 'px')
	    })
	}
	
	/**
	* Decrement `prop` by `val`, deferred until `.end()` is invoked
	* and adds the property to the list of transition props.
	*
	* @param {String} prop
	* @param {Number} val
	* @return {Move} for chaining
	* @api public
	*/
	
	proto.sub = function (prop, val) {
	    if (!style) return
	    var self = this
	    return this.on('start', function () {
	      var curr = parseInt(self.current(prop), 10)
	      self.set(prop, curr - val + 'px')
	    })
	}
	
	/**
	* Get computed or "current" value of `prop`.
	*
	* @param {String} prop
	* @return {String}
	* @api public
	*/
	
	proto.current = function (prop) {
	    return style(this.el).getPropertyValue(prop)
	}
	
	/**
	* Add `prop` to the list of internal transition properties.
	*
	* @param {String} prop
	* @return {Move} for chaining
	* @api private
	*/
	
	proto.transition = function (prop) {
	    if ( !this._transitionProps.indexOf(prop) ) this._transitionProps.push(prop)
	    return this
	}
	
	proto.all = function () {
	    this._transitionAll = true
	    return this
	}
	
	/**
	* Commit style properties, aka apply them to `el.style`.
	*
	* @return {Move} for chaining
	* @see Move#end()
	* @api private
	*/
	
	proto.applyProperties = function (callback) {
	    var that = this
	    
	    if ( callback ) { 
	        rAF(function () {
	            that.el.css(that._props)
	            that._props = {}
	
	            // callback
	            
	            callback.call(that)
	        })
	    } else {
	        this.el.css(that._props)
	        this._props = {}
	    }
	    
	    return this
	}
	
	/**
	* Re-select element via `selector`, replacing
	* the current element.
	*
	* @param {String} selector
	* @return {Move} for chaining
	* @api public
	*/
	
	proto.move =
	proto.select = function (selector) {
	    this.el = Move.select(selector)
	    return this
	}
	
	/**
	* Defer the given `fn` until the animation
	* is complete. `fn` may be one of the following:
	*
	*   - a function to invoke
	*   - an instanceof `Move` to call `.end()`
	*   - nothing, to return a clone of this `Move` instance for chaining
	*
	* @param {Function|Move} fn
	* @return {Move} for chaining
	* @api public
	*/
	
	proto.then = function (fn) {
	    //invoke .end()
	    if ( fn instanceof Move ) {
	      this.on('end', function () {
	        fn.end()
	      })
	    // callback
	    } else if ('function' == typeof fn) {
	      this.on('end', fn)
	    // chain
	    } else {
	      var clone = new Move(this.el)
	      clone._transforms = this._transforms.slice(0)
	      this.then(clone)
	      clone.parent = this
	      return clone
	    }
	
	    return this
	}
	
	/**
	* Pop the move context.
	*
	* @return {Move} parent Move
	* @api public
	*/
	
	proto.pop = function () {
	    return this.parent
	}
	
	/**
	* Reset duration.
	*
	* @return {Move}
	* @api public
	*/
	
	proto.clear = function () {
	    this.el.style.set('transition-duration', '')
	    this._transforms = {}
	
	    return this
	}
	
	proto.instant = function (fn) {
	
	    // emit "start" event
	    
	    this.trigger('start')
	
	    // transition properties 检索或设置对象中的参与过渡的属性
	
	    this.setProperty('transition-property', this._transitionAll ? 'all' : this._transitionProps.join(', '))
	
	    // transforms
	
	    this._applyTransform()
	
	    // set properties
	
	    this.applyProperties(fn)
	}
	
	/**
	* Start animation, optionally calling `fn` when complete.
	*
	* @param {Function} fn
	* @return {Move} for chaining
	* @api public
	*/
	
	proto.end = function (fn) {
	    var that = this
	
	    this.instant(function () {
	
	        // emit "end" when complete
	
	        that._transitionend(function () {
	            if (fn) fn.call(that)
	            that.clear()
	        })
	    })
	
	    return this
	}
	
	export default Move

/***/ }),
/* 7 */
/***/ (function(module, exports) {

	// 民不畏威，则大威至。
	
	import Sandbox from './sandbox.js'
	
	function Promise () {
	    this._callbacks = []
	}
	
	Promise.prototype.then = function (func, context) {
	    var p
	
	    if (this._isdone) {
	        p = func.apply(context, this.result)
	    } else {
	        p = new Promise()
	        this._callbacks.push(function () {
	            var res = func.apply(context, arguments)
	            if (res && typeof res.then === 'function')
	                res.then(p.done, p)
	        })
	    }
	    return p
	}
	
	Promise.prototype.done = function () {
	    this.result = arguments
	    this._isdone = true
	    for (var i = 0; i < this._callbacks.length; i++) {
	        this._callbacks[i].apply(null, arguments)
	    }
	    this._callbacks = []
	}
	
	function join (promises) {
	    var p = new Promise()
	    var results = []
	
	    if (!promises || !promises.length) {
	        p.done(results)
	        return p
	    }
	
	    var numdone = 0
	    var total = promises.length
	
	    function notifier (i) {
	        return function () {
	            numdone += 1
	            results[i] = Array.prototype.slice.call(arguments)
	            if (numdone === total) {
	                p.done(results)
	            }
	        }
	    }
	
	    for (var i = 0; i < total; i++) {
	        promises[i].then(notifier(i))
	    }
	
	    return p
	}
	
	function chain (funcs, args) {
	    var p = new Promise()
	    if (funcs.length === 0) {
	        p.done.apply(p, args)
	    } else {
	        funcs[0].apply(null, args).then(function () {
	            funcs.splice(0, 1)
	            chain(funcs, arguments).then(function () {
	                p.done.apply(p, arguments)
	            })
	        })
	    }
	    return p
	}
	
	/*
	 * AJAX requests
	 */
	
	function new_xhr () {
	    var xhr = new XMLHttpRequest()
	
	    // CORS 跨域支持 后端输出：header(“Access-Control-Allow-Origin：*“)
	
	    if ( !("withCredentials" in xhr) ) {
	
	        if ( typeof XDomainRequest != "undefined" ) {
	            xhr = new XDomainRequest()
	        } else {
	            xhr = null
	        }
	
	    }
	
	    return xhr
	}
	
	
	function ajax (method, url, data, headers, settings, type, id) {
	    if ( method.toUpperCase === 'JSONP' || /=\~/.test(url) ) {
	        return origin(url, data, settings.caller, type, id)
	    }
	
	    var p = new Promise()
	    var xhr
	
	    settings = settings || {}
	    headers = headers || {}
	    data = data || {}
	
	    var payload = Object.objectToParams(data)
	    var withCredentials = true
	
	    if ( method === 'GET' && payload ) {
	        url += (url.indexOf('?') != -1 ? '&' : '?') + payload
	        payload = null
	    }
	
	    try {
	        xhr = new_xhr(method, url)
	    } catch (e) {
	        p.done(promise.ENOXHR, "")
	        return p
	    }
	
	    function open () {
	        xhr.open(method, url, true)
	
	        // 是否同域 withCredentials 解决跨域
	
	        if ( url.indexOf('//') == 0 || url.indexOf('://') > 0 ) {
	
	            [window.location.host].concat(App.config.origin || []).each(function (i, host) {
	                i = url.indexOf(host)
	                if ( i !== -1 && i <= 16 ) {
	                    withCredentials = false
	                }
	            })
	
	            if ( withCredentials && settings.origin !== 'true' ) xhr.withCredentials = true
	        }
	
	        if ( settings.contentType ) headers['Content-Type'] = settings.contentType
	
	        var content_type = 'application/x-www-form-urlencoded'
	        for (var h in headers) {
	            if (headers.hasOwnProperty(h)) {
	                if (h.toLowerCase() === 'content-type')
	                    content_type = headers[h]
	                else
	                    xhr.setRequestHeader(h, headers[h])
	            }
	        }
	        xhr.setRequestHeader('Content-type', content_type)
	    }
	
	    // abort
	
	    function abort () {
	        if ( timeout ) {
	            clearTimeout(tid)
	        }
	
	        xhr.abort()
	    }
	
	    // send
	
	    function send () {
	        open()
	        xhr.send(payload)
	    }
	
	    // tryAgain
	
	    function over () {
	
	        abort()
	
	        if ( tryAgain(url, abort, send, id) == false ) {
	            p.done(true, {}, {})
	        }
	    }
	
	    // timeout
	
	    var timeout = promise.ajaxTimeout
	    if ( timeout ) {
	        var tid = setTimeout(over, timeout)
	    }
	
	    xhr.onerror = over 
	
	    xhr.onload = function () {
	        if ( timeout ) {
	            clearTimeout(tid)
	        }
	        if ( xhr.readyState === 4 ) {
	            var err = (!xhr.status ||
	                       (xhr.status < 200 || xhr.status >= 300) &&
	                       xhr.status !== 304)
	
	            delete _tryAgain[url]
	
	            var data = xhr.responseText
	
	            if ( ['{', '['].consistOf(data.charAt(0)) ) {
	                try {
	                    data = JSON.parse(data)
	                } catch (e) {
	                    try {
	                        data = application.sandbox.window.eval('(' + data + ')')
	                    } catch (e) {}
	                }
	            }
	
	            p.done(err, data, xhr)
	        }
	    }
	
	    // open
	    
	    send()
	
	    return p
	}
	
	function _ajaxer (method) {
	    return function (url, data, headers, settings, type, id) {
	        return ajax(method, url, data, headers, settings, type, id)
	    }
	}
	
	function origin (url, data, caller, type, id) {
	    var p = new Promise()
	    var callbackName = !caller ? '__' + type + '__' + caller : '__call__' + (++_jsonPID)
	    var script = sandboxDocument.createElement("script")
	
	    var data = data || {}
	
	    // JsonP data
	    
	    if ( caller ) {
	        data[caller] = callbackName
	    }
	
	    var payload = Object.objectToParams(data)
	
	    if ( payload ) {
	        url += (url.indexOf('?') != -1 ? '&' : '?') + payload
	        payload = null
	    }
	
	    // JsonP URL
	
	    url = url.replace(/=\~/, '=' + callbackName)
	
	    // abort
	
	    function abort () {
	        if ( timeout ) {
	            clearTimeout(tid)
	        }
	
	        try {
	            sandboxDocumentHead.removeChild(script)
	        } catch (e) {}
	    }
	
	    // send
	
	    function send () {
	        script = sandboxDocument.createElement("script")
	        script.charset = 'utf-8'
	        script.src = url
	
	        // failed
	
	        script.onerror = over
	
	        sandboxDocumentHead.appendChild(script)
	    }
	
	    // 错误处理
	
	    function over () {
	
	        abort()
	
	        if ( tryAgain(url, abort, send, id) == false ) {
	            p.done(true, {}, {})
	        }
	    }
	
	    // DEBUG
	
	    sandboxWindow.onerror = function (e) {
	        over()
	        application.trigger('jsonerror', e)
	    }
	
	    // timeout
	    
	    var timeout = promise.ajaxTimeout
	    if ( timeout ) {
	        var tid = setTimeout(over, timeout)
	    }
	
	    // callback ! 超时被移除的script加载成功后仍会被执行
	    
	    sandboxWindow[callbackName] = function (data, type) {
	        abort()
	
	        if ( (type == 'data' || type == 'js') && typeof data !== 'object' ) return
	
	        delete sandboxWindow[callbackName]
	        delete _tryAgain[url]
	
	        p.done(null, data, {})
	    }
	
	    send()
	
	    return p
	}
	
	function tryAgain (url, abort, send, id) {
	    var again = _tryAgain[url] || 1
	    var module = App.modules[id]
	
	    if ( module ) {
	        module.trigger('failedtoload', {
	            id : id,
	            url : url,
	            again : again
	        })
	    }
	
	    if ( again && again >= promise.TRYAGAIN ) return false
	
	    // again times++
	
	    again++
	    _tryAgain[url] = again
	
	    function regain () {
	        abort()
	        
	        setTimeout(function () {
	            send()
	        }, 1000)
	
	        if ( !_tryAgain[url] ) {
	            window.removeEventListener("online", regain, false)
	        }
	    }
	
	    if ( navigator.onLine === false ) {
	        window.addEventListener("online", regain, false)
	    } else {
	        setTimeout(function () {
	            send()
	        }, 3000)
	    }
	
	    return again
	}
	
	var sandbox = new Sandbox(true)
	  , sandboxWindow = sandbox.window
	  , sandboxDocument = sandbox.document
	  , sandboxDocumentHead = sandboxDocument.head
	  , _jsonPID = 0
	  , _tryAgain = []
	
	// JsonP define
	
	sandboxWindow.define = function (type, name, context) {
	    sandboxWindow['__' + type + '__' + name](context, type)
	}
	
	sandboxWindow.style = function (name, context) {
	    sandboxWindow['__style__' + name](context, 'style')
	}
	
	sandboxWindow.source = function (name, context) {
	    sandboxWindow['__source__' + name](context, 'source')
	}
	
	sandboxWindow.data = function (name, context) {
	    sandboxWindow['__data__' + name](context, 'source')
	}
	
	var promise = {
	    Promise: Promise,
	    join: join,
	    chain: chain,
	    ajax: ajax,
	    origin: origin,
	    get: _ajaxer('GET'),
	    post: _ajaxer('POST'),
	    put: _ajaxer('PUT'),
	    del: _ajaxer('DELETE'),
	
	    /* Error codes */
	    ENOXHR: 1,
	    ETIMEOUT: 2,
	
	    /* Network error then try again */
	    TRYAGAIN: 3,
	
	    /**
	     * Configuration parameter: time in milliseconds after which a
	     * pending AJAX request is considered unresponsive and is
	     * aborted. Useful to deal with bad connectivity (e.g. on a
	     * mobile network). A 0 value disables AJAX timeouts.
	     *
	     * Aborted requests resolve the promise with a ETIMEOUT error
	     * code.
	     */
	    ajaxTimeout: 60000
	}
	
	
	export default promise

/***/ }),
/* 8 */
/***/ (function(module, exports) {

	// 信言不美，美言不信。善者不辩，辩者不善。知者不博，博者不知。
	
	import query from './query.js'
	import sandbox from './sandbox.js'
	import move from './move.js'
	import promise from './promise.js'
	import scroll from './scroll.js'
	import touch from './touch.js'
	import loader from './loader.js'
	
	export default (function () {
	    
	    // compatible body ======================================== body ========================================
	
	    return function (window) {
	
	        // jquery
	
	        Object.defineProperty(window, "$$", {configurable:true, writable:true})
	        window.$$ = window.query = query(window)
	
	        // sandbox
	
	        window.extendProperty("sandbox", sandbox)
	
	        // Sandbox
	
	        window.extendProperty("Sandbox", window.sandbox.sandbox)
	
	        // SandboxWindow
	
	        window.extendProperty("sandboxWindow", window.sandbox.sandboxWindow)
	
	        // SandboxFunction
	
	        window.extendProperty("SandboxFunction", window.sandbox.SandboxFunction)
	
	        // ShadowRootWindow
	
	        window.extendProperty("shadowRootWindow", window.sandbox.shadowRootWindow)
	
	        // ShadowRootFunction
	
	        window.extendProperty("ShadowRootFunction", window.sandbox.ShadowRootFunction)
	
	        // safe eval
	
	        window.extendProperty("seval", function (code, shadow) {
	
	            //安全闭包
	
	            return new (shadow ? window.ShadowRootFunction : window.SandboxFunction)(' try { return ' + code + ' } catch (e) {}')()
	        })
	
	        // Sandbox
	
	        window.extendProperty("openWorker", function (content) {
	            return new window.Worker(window.URL.createObjectURL(new Blob([typeof content === 'string' ? content : content.toString()])))
	        })
	
	        // move
	
	        Object.defineProperty(window, "move", {configurable:true, writable:true})
	        window.Move = move
	
	        // Promise
	
	        Object.defineProperty(window, "Promise", {configurable:true, writable:true})
	        window.io = window.promise = promise
	
	        // Scroll
	
	        Object.defineProperty(window, "Scroll", {configurable:true, writable:true})
	        window.Scroll = scroll(window, window.document, window.Math)
	
	        // Touch
	
	        Object.defineProperty(window, "Touch", {configurable:true, writable:true})
	        window.Touch = touch(window, window.document, undefined)
	
	        // Loader
	
	        Object.defineProperty(window, "Loader", {configurable:true, writable:true})
	        window.Loader = loader
	
	        // Object extend
	
	        !(function () {
	
	            // element extend
	
	            (function ($) {
	                var proto = window.Node.prototype
	
	                    // == $(document.createElement('div'))
	
	                  , $element = [
	                                "constructor", 
	                                "proxy",
	                                "map",
	                                "each",
	                                "find", 
	                                "html", 
	                                "text", 
	                                "css", 
	                                "computedStyle", 
	                                "empty", 
	                                "hide", 
	                                "show", 
	                                "toggle", 
	                                "val", 
	                                "attr", 
	                                "removeAttr", 
	                                "prop", 
	                                "removeProp", 
	                                "remove", 
	                                "addClass", 
	                                "removeClass", 
	                                "toggleClass", 
	                                "replaceClass", 
	                                "hasClass", 
	                                "append", 
	                                "appendTo", 
	                                "prependTo", 
	                                "prepend", 
	                                "before", 
	                                "after", 
	                                "get", 
	                                "position",
	                                "offsetParent",
	                                "offset", 
	                                "height", 
	                                "width", 
	                                "parent", 
	                                "parents", 
	                                "childrens", 
	                                "siblings", 
	                                "closest", 
	                                "filter", 
	                                "not", 
	                                "data", 
	                                "end", 
	                                "clone", 
	                                "size", 
	                                "serialize", 
	                                "eq", 
	                                "index", 
	                                "is", 
	                                "bind", 
	                                "unbind", 
	                                "one", 
	                                "delegate", 
	                                "undelegate", 
	                                "on", 
	                                "off", 
	                                "trigger", 
	                                "click", 
	                                "keydown", 
	                                "keyup", 
	                                "keypress", 
	                                "submit", 
	                                "load", 
	                                "resize", 
	                                "change", 
	                                "select", 
	                                "error"
	                            ]
	                  , $window = ['trigger', 'bind', 'unbind', 'on', 'one', 'off', 'load']
	                  , $document = ['trigger', 'bind', 'unbind', 'on', 'one', 'off','ready']
	                  , applyQuery = function (key) {
	                        return (function (key) {
	                            return function () {
	                                var that = $(this)
	                                that.native = true
	                                return that[key].apply(that, arguments)
	                            }
	                        })(key)
	                    }
	                    
	
	                // element extend
	
	                $element.each(function (i, key) {
	                    // if ( !proto[key] ) 
	                    try {
	                        proto[key] = applyQuery(key)
	                    } catch (e) {}
	                })
	
	                // window events extend
	
	                for (var i in $window) {
	                    var key = $window[i]
	                    window[key] = applyQuery(key)
	                }
	
	                // document events extend
	
	                for (var i in $document) {
	                    var key = $document[i]
	                    window.document[key] = applyQuery(key)
	                }
	
	            })(window.$$)
	
	        })()
	
	        // ScrollEvent
	
	        !(function () {
	            var scrollid = 0
	
	            window.top.addEventListener('scroll', function () {
	
	                var event = {
	                    x : top.scrollX,
	                    y : top.scrollY
	                }
	                
	                if ( scrollid == 0 ) {
	                    if ( window.onscrollstart ) window.onscrollstart(event)
	                    window.trigger('scrollstart', event)
	                }
	
	                clearTimeout(scrollid)
	
	                scrollid = setTimeout(function () {
	                    scrollid = 0
	                    if ( window.onscrollend ) window.onscrollend(event)
	                    window.trigger('scrollend', event)
	                }, 400)
	
	                if ( window !== top ) {
	                    if ( window.onscrollend ) window.onscroll(event)
	                    window.trigger('scroll')
	                }
	            }, false)
	        })()
	
	    }
	
	    
	})()

/***/ }),
/* 9 */
/***/ (function(module, exports) {

	// 和大怨，必有余怨；报怨以德，安可以为善？
	
	export default function(window) {
	    
	    var gCS = window.getComputedStyle
	    var document = window.document
	    var emptyArray = []
	    var slice = emptyArray.slice
	    var classCache = {}
	    var _attrCache = {}
	    var _propCache = {}
	    var fragmentRE = /<(\w+)[^>]*>/
	    var classSelectorRE = /^\.([\w-]+)$/
	    var tagSelectorRE = /^[\w-]+$/
	    var rootNodeRE = /^(?:body|html)$/i
	
	    /**
	     * This calls the $query function
	     * @param {String|Element|Object|Array} selector
	     * @param {String|Element|Object} [context]
	     */
	    var $ = function(selector, what) {
	        return new $query(selector, what)
	    }
	
	    /**
	     * This is the internal appframework object that gets extended and added on to it
	     * This is also the start of our query selector engine
	     * @param {String|Element|Object|Array} selector
	     * @param {String|Element|Object} [context]
	     */
	    var $query = function(toSelect, what) {
	        this.length = 0
	
	        if (!toSelect) {
	            return this
	        } else if ((toSelect instanceof $query || toSelect.constructor.name === '$query') && what == undefined) {
	            return toSelect
	        } else if ($.isFunction(toSelect)) {
	            return $(document).ready(toSelect)
	        } else if ($.isArray(toSelect) && toSelect.length != undefined) { //Passing in an array or object
	            for (var i = 0; i < toSelect.length; i++)
	                this[this.length++] = toSelect[i]
	            return this
	        } else if ($.isObject(toSelect) && $.isObject(what)) { //var tmp=$("span");  $("p").find(tmp);
	            if (toSelect.length == undefined) {
	                if (toSelect.parentNode == what)
	                    this[this.length++] = toSelect
	            } else {
	                for (var j = 0; j < toSelect.length; j++)
	                    if (toSelect[j].parentNode == what)
	                        this[this.length++] = toSelect[j]
	            }
	            return this
	        } else if ($.isObject(toSelect) && what == undefined) { //Single object
	            this[this.length++] = toSelect
	            return this
	        } else if (what !== undefined) {
	            if (what instanceof $query) {
	                return what.find(toSelect)
	            }
	
	        } else {
	            what = document
	        }
	
	        return this.selector(toSelect, what)
	    }
	
	    /**
	     * internal function to use domfragments for insertion
	     *
	     * @api private
	     */
	
	    function _insertFragments(afm, container, insert) {
	        var frag = document.createDocumentFragment()
	        if (insert) {
	            for (var j = afm.length - 1; j >= 0; j--) {
	                frag.insertBefore(afm[j], frag.firstChild)
	            }
	            container.insertBefore(frag, container.firstChild)
	
	        } else {
	
	            for (var k = 0; k < afm.length; k++) {
	                frag.appendChild(afm[k])
	            }
	            container.appendChild(frag)
	        }
	        frag = null
	    }
	
	    /**
	     * Internal function to test if a class name fits in a regular expression
	     * @param {String} name to search against
	     * @return {Boolean}
	     * @api private
	     */
	
	    function _classRE(name) {
	        return name in classCache ? classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
	    }
	
	    /**
	     * Internal function that returns a array of _unique elements
	     * @param {Array} array to compare against
	     * @return {Array} array of _unique elements
	     * @api private
	     */
	
	    function _unique(arr) {
	        for (var i = 0; i < arr.length; i++) {
	            if (arr.indexOf(arr[i]) != i) {
	                arr.splice(i, 1)
	                i--
	            }
	        }
	        return arr
	    }
	
	    /**
	     * Given a set of nodes, it returns them as an array.  Used to find
	     * siblings of an element
	     * @param {Nodelist} Node list to search
	     * @param {Object} [element] to find siblings off of
	     * @return {Array} array of sibblings
	     * @api private
	     */
	
	    function _siblings(nodes, element) {
	        var elems = []
	        if (nodes == undefined)
	            return elems
	
	        for (; nodes; nodes = nodes.nextSibling) {
	            if (nodes.nodeType == 1 && nodes !== element) {
	                elems.push(nodes)
	            }
	        }
	        return elems
	    }
	
	    /**
	     * this is the engine for "all" and is only exposed internally
	     * @api private
	     */
	
	    function _selectorAll(selector, what) {
	        try {
	            return what.querySelectorAll(selector)
	
	        } catch (e) {
	            return []
	        }
	    }
	    /**
	     * this is the query selector engine for elements
	     * @param {String} selector
	     * @param {String|Element|Object} [context]
	     * @api private
	     */
	
	    function _selector(selector, what) {
	
	        selector = selector.trim()
	
	        if (selector[0] === "#" && selector.indexOf(".") == -1 &&selector.indexOf(",") == -1 && selector.indexOf(" ") === -1 && selector.indexOf(">") === -1) {
	            if (what == document)
	                _shimNodes(what.getElementById(selector.replace("#", "")), this)
	            else
	                _shimNodes(_selectorAll(selector, what), this)
	        } else if ((selector[0] === "<" && selector[selector.length - 1] === ">") || (selector.indexOf("<") !== -1 && selector.indexOf(">") !== -1)) //html
	
	        {
	            var tmp = document.createElement("div")
	                tmp.innerHTML = selector.trim()
	            _shimNodes(tmp.childNodes, this)
	        } else {
	            _shimNodes((_selectorAll(selector, what)), this)
	        }
	        return this
	    }
	
	    function _shimNodes(nodes, obj) {
	        if (!nodes)
	            return
	        if (nodes.nodeType) {
	            obj[obj.length++] = nodes
	            return
	        }
	        for (var i = 0, iz = nodes.length; i < iz; i++)
	            obj[obj.length++] = nodes[i]
	    }
	    /**
	    * Checks to see if the parameter is a $query object
	        ```
	        var foo=$('#header');
	        $.is$(foo);
	        ```
	
	    * @param {Object} element
	    * @return {Boolean}
	    * @title $.is$(param)
	    */
	
	    $.is$$ = function(obj) {
	        return obj instanceof $query
	    }
	
	    /**
	    * Map takes in elements and executes a callback function on each and returns a collection
	    ```
	    $.map([1,2],function(ind){return ind+1});
	    ```
	
	    * @param {Array|Object} elements
	    * @param {Function} callback
	    * @return {Object} appframework object with elements in it
	    * @title $.map(elements,callback)
	    */
	
	    $.map = function(elements, callback) {
	        var value, values = [],
	            i, key
	        if ($.isArray(elements))
	            for (i = 0; i < elements.length; i++) {
	                value = callback.apply(elements[i],[i,elements[i]])
	                if (value !== undefined)
	                    values.push(value)
	        } else if ($.isObject(elements))
	            for (key in elements) {
	                if (!elements.hasOwnProperty(key) || key == "length")
	                    continue
	                value = callback(elements[key],[key,elements[key]])
	                if (value !== undefined)
	                    values.push(value)
	        }
	        return $(values)
	    }
	
	    /**
	    * Checks to see if the parameter is an array
	        ```
	        var arr=[];
	        $.isArray(arr);
	        ```
	
	    * @param {Object} element
	    * @return {Boolean}
	    * @example $.isArray([1]);
	    * @title $.isArray(param)
	    */
	
	    $.isArray = function(obj) {
	        return obj instanceof Array && obj.push != undefined; //ios 3.1.3 doesn't have Array.isArray
	    }
	
	    /**
	    * Checks to see if the parameter is a function
	        ```
	        var func=function(){};
	        $.isFunction(func);
	        ```
	
	    * @param {Object} element
	    * @return {Boolean}
	    * @title $.isFunction(param)
	    */
	
	    $.isFunction = function(obj) {
	        return typeof obj === "function" && !(obj instanceof RegExp)
	    }
	
	    /*
	    NEW LIEN
	    */
	    $.isWindow = function(obj) { 
	        return obj != null && obj == obj.window
	    };
	    /**
	    * Checks to see if the parameter is a object
	        ```
	        var foo={bar:'bar'};
	        $.isObject(foo);
	        ```
	
	    * @param {Object} element
	    * @return {Boolean}
	    * @title $.isObject(param)
	    */
	
	    $.isObject = function(obj) {
	        return typeof obj === "object" && obj !== null
	    }
	
	    /*
	    NEW LIEN
	    */
	
	    $.isPlainObject = function(obj) {
	        return $.isObject(obj) && !$.isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
	    }
	
	    $.isEmptyObject = function( obj ) {
	        var name;
	        for ( name in obj ) {
	            return false
	        }
	        return true
	    }
	
	    /**
	     * Prototype for afm object.  Also extens $.fn
	     */
	
	    $.fn = $query.prototype = {
	        constructor: $query,
	        forEach: emptyArray.forEach,
	        reduce: emptyArray.reduce,
	        push: emptyArray.push,
	        indexOf: emptyArray.indexOf,
	        concat: emptyArray.concat,
	        selector: _selector,
	        oldElement: undefined,
	        slice: emptyArray.slice,
	        length: 0,
	        /**
	         * This is a utility function for .end()
	         * @param {Object} params
	         * @return {Object} an appframework with params.oldElement set to this
	         * @api private
	         */
	        _setupOld: function(params) {
	            if (params == undefined)
	                return $()
	            params.oldElement = this
	            return params
	
	        },
	        /**
	        * This is a wrapper to $.map on the selected elements
	            ```
	            $().map(function(){this.value+=ind});
	            ```
	
	        * @param {Function} callback
	        * @return {Object} an appframework object
	        * @title $().map(function)
	        */
	        map: function(fn) {
	            var value, values = [],
	                i
	            for (i = 0; i < this.length; i++) {
	                value = fn.apply(this[i],[i,this[i]])
	                if (value !== undefined)
	                    values.push(value)
	            }
	            return $(values)
	        },
	        /**
	        * Iterates through all elements and applys a callback function
	            ```
	            $().each(function(){console.log(this.value)});
	            ```
	
	        * @param {Function} callback
	        * @return {Object} an appframework object
	        * @title $().each(function)
	        */
	        each: function(callback) {
	            this.forEach(function(el, idx) {
	                callback.call(el, idx, el)
	            })
	            return this
	        },
	        /**
	        * This is executed when DOMContentLoaded happens, or after if you've registered for it.
	            ```
	            $(document).ready(function(){console.log('I'm ready');});
	            ```
	
	        * @param {Function} callback
	        * @return {Object} an appframework object
	        * @title $().ready(function)
	        */
	
	        ready: function(callback) {
	            var document = this[0]
	            if (document.readyState === "complete" || document.readyState === "loaded" || document.readyState === "interactive") 
	                callback()
	            else
	                document.addEventListener("DOMContentLoaded", callback, false)
	            return this
	        },
	        /**
	        * Searches through the collection and reduces them to elements that match the selector
	            ```
	            $("#foo").find('.bar');
	            $("#foo").find($('.bar'));
	            $("#foo").find($('.bar').get(0));
	            ```
	
	        * @param {String|Object|Array} selector
	        * @return {Object} an appframework object filtered
	        * @title $().find(selector)
	
	        */
	        find: function(sel) {
	            if (this.length === 0)
	                return this
	            var elems = []
	            var tmpElems
	            for (var i = 0; i < this.length; i++) {
	                tmpElems = ($(sel, this[i]))
	
	                for (var j = 0; j < tmpElems.length; j++) {
	                    elems.push(tmpElems[j])
	                }
	            }
	            
	            return $(_unique(elems))
	        },
	        /**
	        * Gets or sets the innerHTML for the collection.
	        * If used as a get, the first elements innerHTML is returned
	            ```
	            $("#foo").html(); //gets the first elements html
	            $("#foo").html('new html');//sets the html
	            $("#foo").html('new html',false); //Do not do memory management cleanup
	            ```
	
	        * @param {String} html to set
	        * @param {Bool} [cleanup] - set to false for performance tests and if you do not want to execute memory management cleanup
	        * @return {Object} an appframework object
	        * @title $().html([html])
	        */
	        html: function(html, cleanup) {
	            if (this.length === 0)
	                return this
	            if (html === undefined)
	                return this[0].innerHTML
	
	            for (var i = 0; i < this.length; i++) {
	                if (cleanup !== false)
	                    $.cleanUpContent(this[i], false, true)
	                this[i].innerHTML = html
	            }
	            return this
	        },
	
	
	        /**
	        * Gets or sets the innerText for the collection.
	        * If used as a get, the first elements innerText is returned
	            ```
	            $("#foo").text(); //gets the first elements text;
	            $("#foo").text('new text'); //sets the text
	            ```
	
	        * @param {String} text to set
	        * @return {Object} an appframework object
	        * @title $().text([text])
	        */
	        text: function(text) {
	            if (this.length === 0)
	                return this
	            if (text === undefined)
	                return this[0].textContent
	            for (var i = 0; i < this.length; i++) {
	                this[i].textContent = text
	            }
	            return this
	        },
	        /**
	        * Gets or sets a css property for the collection
	        * If used as a get, the first elements css property is returned
	        * This will add px to properties that need it.
	            ```
	            $().css("background"); // Gets the first elements background
	            $().css("background","red")  //Sets the elements background to red
	            ```
	
	        * @param {String} attribute to get
	        * @param {String} value to set as
	        * @return {Object} an appframework object
	        * @title $().css(attribute,[value])
	        */
	        css: function(attribute, value, obj) {
	            var toAct = obj != undefined ? obj : this[0]
	            if (this.length === 0)
	                return this
	            if (value == undefined && typeof(attribute) === "string") {
	                return toAct.style[attribute] ? toAct.style[attribute] : gCS(toAct)[attribute]
	            }
	            for (var i = 0; i < this.length; i++) {
	                if ($.isObject(attribute)) {
	                    for (var j in attribute) {
	                        this[i].style.set(j, attribute[j])
	                    }
	                } else {
	                    this[i].style.set(attribute, value)
	                }
	            }
	            return this
	        },
	        /**
	         * Gets the computed style of CSS values
	         *
	        ```
	           $("#main").computedStyle('display');
	        ```
	         * @param {String} css property
	         * @return {Int|String|Float|} css vlaue
	         * @title $().computedStyle()
	         */
	        computedStyle: function(val) {
	            if (this.length === 0 || val == undefined) return
	            return gCS(this[0], '')[val]
	        },
	        /**
	        * Sets the innerHTML of all elements to an empty string
	            ```
	            $().empty();
	            ```
	
	        * @return {Object} an appframework object
	        * @title $().empty()
	        */
	        empty: function() {
	            for (var i = 0; i < this.length; i++) {
	                $.cleanUpContent(this[i], false, true)
	                this[i].textContent = ''
	            }
	            return this
	        },
	        /**
	        * Sets the elements display property to "none".
	        * This will also store the old property into an attribute for hide
	            ```
	            $().hide();
	            ```
	
	        * @return {Object} an appframework object
	        * @title $().hide()
	        */
	        hide: function() {
	            if (this.length === 0)
	                return this;
	            for (var i = 0; i < this.length; i++) {
	                if (this.css("display", null, this[i]) != "none") {
	                    this[i].setAttribute("afmOldStyle", this.css("display", null, this[i]))
	                    this[i].style.display = "none"
	                }
	            }
	            return this
	        },
	        /**
	        * Shows all the elements by setting the css display property
	        * We look to see if we were retaining an old style (like table-cell) and restore that, otherwise we set it to block
	            ```
	            $().show();
	            ```
	
	        * @return {Object} an appframework object
	        * @title $().show()
	        */
	        show: function() {
	            if (this.length === 0)
	                return this
	            for (var i = 0; i < this.length; i++) {
	                if (this.css("display", null, this[i]) == "none") {
	                    this[i].style.display = this[i].getAttribute("afmOldStyle") ? this[i].getAttribute("afmOldStyle") : 'block'
	                    this[i].removeAttribute("afmOldStyle")
	                }
	            }
	            return this
	        },
	        /**
	        * Toggle the visibility of a div
	            ```
	            $().toggle();
	            $().toggle(true); //force showing
	            ```
	
	        * @param {Boolean} [show] -force the hiding or showing of the element
	        * @return {Object} an appframework object
	        * @title $().toggle([show])
	        */
	        toggle: function(show) {
	            if(this.length === 0)
	                return this
	            var show2 = !!(show === true)
	            for (var i = 0; i < this.length; i++) {
	                if (this.css("display", null, this[i]) != "none" && (show == undefined || show2 === false)) {
	                    this[i].setAttribute("afmOldStyle", this.css("display", null, this[i]))
	                    this[i].style.display = "none"
	                } else if (this.css("display", null, this[i]) == "none" && (show == undefined || show2 === true)) {
	                    this[i].style.display = this[i].getAttribute("afmOldStyle") ? this[i].getAttribute("afmOldStyle") : 'block'
	                    this[i].removeAttribute("afmOldStyle")
	                }
	            }
	            return this
	        },
	        /**
	        * Gets or sets an elements value
	        * If used as a getter, we return the first elements value.  If nothing is in the collection, we return undefined
	            ```
	            $().value; //Gets the first elements value;
	            $().value="bar"; //Sets all elements value to bar
	            ```
	
	        * @param {String} [value] to set
	        * @return {String|Object} A string as a getter, appframework object as a setter
	        * @title $().val([value])
	        */
	        val: function(value) {
	            if (this.length === 0)
	                return (value === undefined) ? undefined : this
	            if (value == undefined)
	                return this[0].value
	            for (var i = 0; i < this.length; i++) {
	                this[i].value = value
	            }
	            return this
	        },
	        /**
	        * Gets or sets an attribute on an element
	        * If used as a getter, we return the first elements value.  If nothing is in the collection, we return undefined
	            ```
	            $().attr("foo"); //Gets the first elements 'foo' attribute
	            $().attr("foo","bar");//Sets the elements 'foo' attribute to 'bar'
	            $().attr("foo",{bar:'bar'}) //Adds the object to an internal cache
	            ```
	
	        * @param {String|Object} attribute to act upon.  If it's an object (hashmap), it will set the attributes based off the kvp.
	        * @param {String|Array|Object|function} [value] to set
	        * @return {String|Object|Array|Function} If used as a getter, return the attribute value.  If a setter, return an appframework object
	        * @title $().attr(attribute,[value])
	        */
	        attr: function(attr, value) {
	            if (this.length === 0)
	                return (value === undefined) ? undefined : this
	            if (value === undefined && !$.isObject(attr)) {
	                var val = (this[0].afmCacheId && _attrCache[this[0].afmCacheId][attr]) ? (this[0].afmCacheId && _attrCache[this[0].afmCacheId][attr]) : this[0].getAttribute(attr)
	                return val
	            }
	            for (var i = 0; i < this.length; i++) {
	                if ($.isObject(attr)) {
	                    for (var key in attr) {
	                        $(this[i]).attr(key, attr[key])
	                    }
	                } else if ($.isArray(value) || $.isObject(value) || $.isFunction(value)) {
	
	                    if (!this[i].afmCacheId)
	                        this[i].afmCacheId = $.uuid()
	
	                    if (!_attrCache[this[i].afmCacheId])
	                        _attrCache[this[i].afmCacheId] = {}
	                    _attrCache[this[i].afmCacheId][attr] = value
	                } else if (value === null) {
	                    this[i].removeAttribute(attr)
	                    if (this[i].afmCacheId && _attrCache[this[i].afmCacheId][attr])
	                        delete _attrCache[this[i].afmCacheId][attr]
	                } else {
	                    this[i].setAttribute(attr, value)
	                }
	            }
	            return this
	        },
	        /**
	        * Removes an attribute on the elements
	            ```
	            $().removeAttr("foo");
	            ```
	
	        * @param {String} attributes that can be space delimited
	        * @return {Object} appframework object
	        * @title $().removeAttr(attribute)
	        */
	        removeAttr: function(attr) {
	            var that = this
	            for (var i = 0; i < this.length; i++) {
	                attr.split(/\s+/g).forEach(function(param) {
	                    that[i].removeAttribute(param)
	                    if (that[i].afmCacheId && _attrCache[that[i].afmCacheId][attr])
	                        delete _attrCache[that[i].afmCacheId][attr]
	                })
	            }
	            return this
	        },
	
	        /**
	        * Gets or sets a property on an element
	        * If used as a getter, we return the first elements value.  If nothing is in the collection, we return undefined
	            ```
	            $().prop("foo"); //Gets the first elements 'foo' property
	            $().prop("foo","bar");//Sets the elements 'foo' property to 'bar'
	            $().prop("foo",{bar:'bar'}) //Adds the object to an internal cache
	            ```
	
	        * @param {String|Object} property to act upon.  If it's an object (hashmap), it will set the attributes based off the kvp.
	        * @param {String|Array|Object|function} [value] to set
	        * @return {String|Object|Array|Function} If used as a getter, return the property value.  If a setter, return an appframework object
	        * @title $().prop(property,[value])
	        */
	        prop: function(prop, value) {
	            if (this.length === 0)
	                return (value === undefined) ? undefined : this
	            if (value === undefined && !$.isObject(prop)) {
	                var res
	                var val = (this[0].afmCacheId && _propCache[this[0].afmCacheId][prop]) ? (this[0].afmCacheId && _propCache[this[0].afmCacheId][prop]) : !(res = this[0][prop]) && prop in this[0] ? this[0][prop] : res
	                return val
	            }
	            for (var i = 0; i < this.length; i++) {
	                if ($.isObject(prop)) {
	                    for (var key in prop) {
	                        $(this[i]).prop(key, prop[key])
	                    }
	                } else if ($.isArray(value) || $.isObject(value) || $.isFunction(value)) {
	
	                    if (!this[i].afmCacheId)
	                        this[i].afmCacheId = $.uuid()
	
	                    if (!_propCache[this[i].afmCacheId])
	                        _propCache[this[i].afmCacheId] = {}
	                    _propCache[this[i].afmCacheId][prop] = value
	                } else if (value === null && value !== undefined) {
	                    $(this[i]).removeProp(prop)
	                } else {
	                    this[i][prop] = value
	                }
	            }
	            return this
	        },
	        /**
	        * Removes a property on the elements
	            ```
	            $().removeProp("foo");
	            ```
	
	        * @param {String} properties that can be space delimited
	        * @return {Object} appframework object
	        * @title $().removeProp(attribute)
	        */
	        removeProp: function(prop) {
	            var that = this
	            for (var i = 0; i < this.length; i++) {
	                prop.split(/\s+/g).forEach(function(param) {
	                    if (that[i][param])
	                        that[i][param] = undefined
	                    if (that[i].afmCacheId && _propCache[that[i].afmCacheId][prop]) {
	                        delete _propCache[that[i].afmCacheId][prop]
	                    }
	                })
	            }
	            return this
	        },
	
	        /**
	        * Removes elements based off a selector
	            ```
	            $().remove();  //Remove all
	            $().remove(".foo");//Remove off a string selector
	            var element=$("#foo").get(0);
	            $().remove(element); //Remove by an element
	            $().remove($(".foo"));  //Remove by a collection
	
	            ```
	
	        * @param {String|Object|Array} selector to filter against
	        * @return {Object} appframework object
	        * @title $().remove(selector)
	        */
	        remove: function(selector) {
	            var elems = $(this).filter(selector)
	            if (elems == undefined)
	                return this
	            for (var i = 0; i < elems.length; i++) {
	                $.cleanUpContent(elems[i], true, true)
	                if (elems[i] && elems[i].parentNode) {
	                    elems[i].parentNode.removeChild(elems[i])
	                }
	            }
	            return this
	        },
	        /**
	        * Adds a css class to elements.
	            ```
	            $().addClass("selected");
	            ```
	
	        * @param {String} classes that are space delimited
	        * @return {Object} appframework object
	        * @title $().addClass(name)
	        */
	        addClass: function(name) {
	            if (name == undefined) return this
	            for (var i = 0; i < this.length; i++) {
	                var cls = this[i].className
	                var classList = []
	                var that = this
	                name.split(/\s+/g).forEach(function(cname) {
	                    if (!that.hasClass(cname, that[i]))
	                        classList.push(cname)
	                })
	
	                this[i].className += (cls ? " " : "") + classList.join(" ")
	                this[i].className = this[i].className.trim()
	            }
	            return this
	        },
	        /**
	        * Removes a css class from elements.
	            ```
	            $().removeClass("foo"); //single class
	            $().removeClass("foo selected");//remove multiple classess
	            ```
	
	        * @param {String} classes that are space delimited
	        * @return {Object} appframework object
	        * @title $().removeClass(name)
	        */
	        removeClass: function(name) {
	            if (name == undefined) return this
	            for (var i = 0; i < this.length; i++) {
	                if (name == undefined) {
	                    this[i].className = ''
	                    return this
	                }
	                var classList = this[i].className
	                //SGV LINK EVENT
	                if (typeof this[i].className == "object") {
	                    classList = " "
	                }
	                name.split(/\s+/g).forEach(function(cname) {
	                    classList = classList.replace(_classRE(cname), " ")
	                })
	                if (classList.length > 0)
	                    this[i].className = classList.trim()
	                else
	                    this[i].className = ""
	            }
	            return this
	        },
	        /**
	        * Adds or removes a css class to elements.
	            ```
	            $().toggleClass("selected");
	            ```
	
	        * @param {String} classes that are space delimited
	        * @param {Boolean} [state] force toggle to add or remove classes
	        * @return {Object} appframework object
	        * @title $().toggleClass(name)
	        */
	        toggleClass: function(name, state) {
	            if (name == undefined) return this
	            for (var i = 0; i < this.length; i++) {
	                if (typeof state != "boolean") {
	                    state = this.hasClass(name, this[i])
	                }
	                $(this[i])[state ? 'removeClass' : 'addClass'](name)
	            }
	            return this
	        },
	        /**
	        * Replaces a css class on elements.
	            ```
	            $().replaceClass("on", "off");
	            ```
	
	        * @param {String} classes that are space delimited
	        * @param {String} classes that are space delimited
	        * @return {Object} appframework object
	        * @title $().replaceClass(old, new)
	        */
	        replaceClass: function(name, newName) {
	            if (name == undefined || newName == undefined) return this
	            for (var i = 0; i < this.length; i++) {
	                if (name == undefined) {
	                    this[i].className = newName
	                    continue
	                }
	                var classList = this[i].className;
	                name.split(/\s+/g).concat(newName.split(/\s+/g)).forEach(function(cname) {
	                    classList = classList.replace(_classRE(cname), " ")
	                })
	                classList = classList.trim()
	                if (classList.length > 0) {
	                    this[i].className = (classList + " " + newName).trim()
	                } else
	                    this[i].className = newName
	            }
	            return this
	        },
	        /**
	        * Checks to see if an element has a class.
	            ```
	            $().hasClass('foo');
	            $().hasClass('foo',element);
	            ```
	
	        * @param {String} class name to check against
	        * @param {Object} [element] to check against
	        * @return {Boolean}
	        * @title $().hasClass(name,[element])
	        */
	        hasClass: function(name, element) {
	            if (this.length === 0)
	                return false
	            if (!element)
	                element = this[0]
	            return _classRE(name).test(element.className)
	        },
	        /**
	        * Appends to the elements
	        * We boil everything down to an appframework object and then loop through that.
	        * If it's HTML, we create a dom element so we do not break event bindings.
	        * if it's a script tag, we evaluate it.
	            ```
	            $().append("<div></div>"); //Creates the object from the string and appends it
	            $().append($("#foo")); //Append an object;
	            ```
	
	        * @param {String|Object} Element/string to add
	        * @param {Boolean} [insert] insert or append
	        * @return {Object} appframework object
	        * @title $().append(element,[insert])
	        */
	        append: function(element, insert) {
	            if (element && element.length != undefined && element.length === 0)
	                return this
	            if ($.isArray(element) || $.isObject(element))
	                element = $(element)
	            var i
	
	
	            for (i = 0; i < this.length; i++) {
	                if (element.length && typeof element != "string") {
	                    element = $(element)
	                    _insertFragments(element, this[i], insert)
	                } else {
	                    var obj = fragmentRE.test(element) ? $(element) : undefined                       
	                    if (obj == undefined || obj.length === 0) {
	                        obj = document.createTextNode(element)
	                    }
	                    if (obj.nodeName != undefined && obj.nodeName.toLowerCase() == "script" && (!obj.type || obj.type.toLowerCase() === 'text/javascript')) {
	                        window['eval'](obj.innerHTML)
	                    } else if (obj instanceof $query) {
	                        _insertFragments(obj, this[i], insert)
	                    } else {
	                        insert != undefined ? this[i].insertBefore(obj, this[i].firstChild) : this[i].appendChild(obj)
	                    }
	                }
	            }
	            return this
	        },
	        /**
	        * Appends the current collection to the selector
	            ```
	            $().appendTo("#foo"); //Append an object;
	            ```
	
	        * @param {String|Object} Selector to append to
	        * @param {Boolean} [insert] insert or append
	        * @title $().appendTo(element,[insert])
	        */
	        appendTo: function(selector, insert) {
	            var tmp = $(selector)
	            tmp.append(this)
	            return this
	        },
	        /**
	        * Prepends the current collection to the selector
	            ```
	            $().prependTo("#foo"); //Prepend an object;
	            ```
	
	        * @param {String|Object} Selector to prepent to
	        * @title $().prependTo(element)
	        */
	        prependTo: function(selector) {
	            var tmp = $(selector)
	            tmp.append(this, true)
	            return this
	        },
	        /**
	        * Prepends to the elements
	        * This simply calls append and sets insert to true
	            ```
	            $().prepend("<div></div>");//Creates the object from the string and appends it
	            $().prepend($("#foo")); //Prepends an object
	            ```
	
	        * @param {String|Object} Element/string to add
	        * @return {Object} appframework object
	        * @title $().prepend(element)
	        */
	        prepend: function(element) {
	            return this.append(element, 1)
	        },
	        /**
	         * Inserts collection before the target (adjacent)
	            ```
	            $().inBefore(af("#target"));
	            ```
	
	         * @param {String|Object} Target
	         * @title $().before(target);
	         */
	        before: function(nodes, after) {
	            if (this.length === 0)
	                return this
	            if (!nodes)
	                return this
	
	            nodes = $(nodes)
	
	            for (var i = 0; i < nodes.length; i++) {
	                after ? this[0].parentNode.insertBefore(nodes[i], this[0].nextSibling) : this[0].parentNode.insertBefore(nodes[i], this[0]);
	            }
	            return this
	        },
	        /**
	         * Inserts collection after the target (adjacent)
	            ```
	            $().inAfter(af("#target"));
	            ```
	         * @param {String|Object} target
	         * @title $().after(target);
	         */
	        after: function(nodes) {
	            this.before(nodes, true)
	        },
	        /**
	        * Returns the raw DOM element.
	            ```
	            $().get(0); //returns the first element
	            $().get(2);// returns the third element
	            ```
	
	        * @param {Int} [index]
	        * @return {Object} raw DOM element
	        * @title $().get([index])
	        */
	        get: function(index) {
	            index = index == undefined ? 0 : index
	            if (index < 0)
	                index += this.length;
	            return (this[index]) ? this[index] : undefined
	        },
	        position: function() {
	            if (!this.length) 
	                return this
	
	            var elem = this[0],
	                // Get *real* offsetParent
	                offsetParent = this.offsetParent(),
	                // Get correct offsets
	                offset       = this.offset(),
	                parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()
	
	          // Subtract element margins
	          // note: when an element has margin: auto the offsetLeft and marginLeft
	          // are the same in Safari causing offset.left to incorrectly be 0
	          offset.top  -= parseFloat( $(elem).css('margin-top') ) || 0
	          offset.left -= parseFloat( $(elem).css('margin-left') ) || 0
	
	          // Add offsetParent borders
	          parentOffset.top  += parseFloat( $(offsetParent[0]).css('border-top-width') ) || 0
	          parentOffset.left += parseFloat( $(offsetParent[0]).css('border-left-width') ) || 0
	
	          // Subtract the two offsets
	          return {
	            top:  offset.top  - parentOffset.top,
	            left: offset.left - parentOffset.left
	          }
	        },
	        offsetParent: function() {
	            return this.map(function(){
	                var parent = this.offsetParent || document.body
	                while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
	                    parent = parent.offsetParent
	                return parent
	            })
	        },
	        /**
	        * Returns the offset of the element, including traversing up the tree
	            ```
	            $().offset();
	            ```
	
	        * @return {Object} with left, top, width and height properties
	        * @title $().offset()
	        */
	        offset: function() {
	            var obj
	            if (this.length === 0)
	                return this
	            if (this[0] == window)
	                return {
	                    left: 0,
	                    top: 0,
	                    right: 0,
	                    bottom: 0,
	                    width: window.innerWidth,
	                    height: window.innerHeight
	                }
	            else
	                obj = this[0].getBoundingClientRect()
	
	            return {
	                left: obj.left + window.pageXOffset,
	                top: obj.top + window.pageYOffset,
	                right: obj.right + window.pageXOffset,
	                bottom: obj.bottom + window.pageYOffset,
	                width: obj.right - obj.left,
	                height: obj.bottom - obj.top
	            }
	        },
	        /**
	         * returns the height of the element, including padding on IE
	           ```
	           $().height();
	           ```
	         * @return {string} height
	         * @title $().height()
	         */
	        height: function(val) {
	            if (this.length === 0)
	                return this
	            if (val != undefined)
	                return this.css("height", val)
	            if (this[0] == this[0].window)
	                return window.innerHeight
	            if (this[0].nodeType == this[0].DOCUMENT_NODE)
	                return this[0].documentElement.offsetheight
	            else {
	                var tmpVal = this.css("height").replace("px", "")
	                if (tmpVal)
	                    return tmpVal
	                else
	                    return this.offset().height
	            }
	        },
	        /**
	         * returns the width of the element, including padding on IE
	           ```
	           $().width();
	           ```
	         * @return {string} width
	         * @title $().width()
	         */
	        width: function(val) {
	            if (this.length === 0)
	                return this
	            if (val != undefined)
	                return this.css("width", val)
	            if (this[0] == this[0].window)
	                return window.innerWidth
	            if (this[0].nodeType == this[0].DOCUMENT_NODE)
	                return this[0].documentElement.offsetwidth
	            else {
	                var tmpVal = this.css("width").replace("px", "")
	                if (tmpVal)
	                    return tmpVal
	                else
	                    return this.offset().width
	            }
	        },
	        /**
	        * Returns the parent nodes of the elements based off the selector
	            ```
	            $("#foo").parent('.bar');
	            $("#foo").parent($('.bar'));
	            $("#foo").parent($('.bar').get(0));
	            ```
	
	        * @param {String|Array|Object} [selector]
	        * @return {Object} appframework object with _unique parents
	        * @title $().parent(selector)
	        */
	        parent: function(selector, recursive) {
	            if (this.length === 0)
	                return this
	            var elems = []
	            for (var i = 0; i < this.length; i++) {
	                var tmp = this[i]
	                while (tmp.parentNode && tmp.parentNode != document) {
	                    elems.push(tmp.parentNode)
	                    if (tmp.parentNode)
	                        tmp = tmp.parentNode
	                    if (!recursive)
	                        break
	                }
	            }
	            return this._setupOld($(_unique(elems)).filter(selector))
	        },
	        /**
	        * Returns the parents of the elements based off the selector (traversing up until html document)
	            ```
	            $("#foo").parents('.bar');
	            $("#foo").parents($('.bar'));
	            $("#foo").parents($('.bar').get(0));
	            ```
	
	        * @param {String|Array|Object} [selector]
	        * @return {Object} appframework object with _unique parents
	        * @title $().parents(selector)
	        */
	        parents: function(selector) {
	            return this.parent(selector, true)
	        },
	        /**
	        * Returns the child nodes of the elements based off the selector
	            ```
	            $("#foo").children('.bar'); //Selector
	            $("#foo").children($('.bar')); //Objects
	            $("#foo").children($('.bar').get(0)); //Single element
	            ```
	
	        * @param {String|Array|Object} [selector]
	        * @return {Object} appframework object with _unique children
	        * @title $().children(selector)
	        */
	        childrens: function(selector) {
	
	            if (this.length === 0)
	                return this
	            var elems = []
	            for (var i = 0; i < this.length; i++) {
	                elems = elems.concat(_siblings(this[i].firstChild))
	            }
	            return this._setupOld($((elems)).filter(selector))
	
	        },
	        /**
	        * Returns the siblings of the element based off the selector
	            ```
	            $("#foo").siblings('.bar'); //Selector
	            $("#foo").siblings($('.bar')); //Objects
	            $("#foo").siblings($('.bar').get(0)); //Single element
	            ```
	
	        * @param {String|Array|Object} [selector]
	        * @return {Object} appframework object with _unique siblings
	        * @title $().siblings(selector)
	        */
	        siblings: function(selector) {
	            if (this.length === 0)
	                return this
	            var elems = []
	            for (var i = 0; i < this.length; i++) {
	                if (this[i].parentNode)
	                    elems = elems.concat(_siblings(this[i].parentNode.firstChild, this[i]))
	            }
	            return this._setupOld($(elems).filter(selector))
	        },
	        /**
	        * Returns the closest element based off the selector and optional context
	            ```
	            $("#foo").closest('.bar'); //Selector
	            $("#foo").closest($('.bar')); //Objects
	            $("#foo").closest($('.bar').get(0)); //Single element
	            ```
	
	        * @param {String|Array|Object} selector
	        * @param {Object} [context]
	        * @return {Object} Returns an appframework object with the closest element based off the selector
	        * @title $().closest(selector,[context]);
	        */
	        closest: function(selector, context) {
	            if (this.length === 0)
	                return this
	            var elems = [],
	                cur = this[0]
	
	            var start = $(selector, context)
	            if (start.length === 0)
	                return $()
	            while (cur && start.indexOf(cur) == -1) {
	                cur = cur !== context && cur !== document && cur.parentNode
	            }
	
	            if (this.native) {
	                return $(cur)[0]
	            }
	            
	            return $(cur)
	
	        },
	        /**
	        * Filters elements based off the selector
	            ```
	            $("#foo").filter('.bar'); //Selector
	            $("#foo").filter($('.bar')); //Objects
	            $("#foo").filter($('.bar').get(0)); //Single element
	            ```
	
	        * @param {String|Array|Object} selector
	        * @return {Object} Returns an appframework object after the filter was run
	        * @title $().filter(selector);
	        */
	        filter: function(selector) {
	            if (this.length === 0)
	                return this
	
	            if (selector == undefined)
	                return this
	            var elems = []
	            for (var i = 0; i < this.length; i++) {
	                var val = this[i]
	                if (val.parentNode && $(selector, val.parentNode).indexOf(val) >= 0)
	                    elems.push(val)
	            }
	            return this._setupOld($(_unique(elems)))
	        },
	        /**
	        * Basically the reverse of filter.  Return all elements that do NOT match the selector
	            ```
	            $("#foo").not('.bar'); //Selector
	            $("#foo").not($('.bar')); //Objects
	            $("#foo").not($('.bar').get(0)); //Single element
	            ```
	
	        * @param {String|Array|Object} selector
	        * @return {Object} Returns an appframework object after the filter was run
	        * @title $().not(selector);
	        */
	        not: function(selector) {
	            if (this.length === 0)
	                return this
	            var elems = []
	            for (var i = 0; i < this.length; i++) {
	                var val = this[i]
	                if (val.parentNode && $(selector, val.parentNode).indexOf(val) == -1)
	                    elems.push(val)
	            }
	            return this._setupOld($(_unique(elems)))
	        },
	        /**
	        * Gets or set data-* attribute parameters on elements (when a string)
	        * When used as a getter, it's only the first element
	            ```
	            $().data("foo"); //Gets the data-foo attribute for the first element
	            $().data("foo","bar"); //Sets the data-foo attribute for all elements
	            $().data("foo",{bar:'bar'});//object as the data
	            ```
	
	        * @param {String} key
	        * @param {String|Array|Object} value
	        * @return {String|Object} returns the value or appframework object
	        * @title $().data(key,[value]);
	        */
	        data: function(key, value) {
	            return this.attr('data-' + key, value)
	        },
	        /**
	        * Rolls back the appframework elements when filters were applied
	        * This can be used after .not(), .filter(), .children(), .parent()
	            ```
	            $().filter(".panel").end(); //This will return the collection BEFORE filter is applied
	            ```
	
	        * @return {Object} returns the previous appframework object before filter was applied
	        * @title $().end();
	        */
	        end: function() {
	            return this.oldElement != undefined ? this.oldElement : $()
	        },
	        /**
	        * Clones the nodes in the collection.
	            ```
	            $().clone();// Deep clone of all elements
	            $().clone(false); //Shallow clone
	            ```
	
	        * @param {Boolean} [deep] - do a deep copy or not
	        * @return {Object} appframework object of cloned nodes
	        * @title $().clone();
	        */
	        clone: function(deep) {
	            deep = deep === false ? false : true
	            if (this.length === 0)
	                return this
	            var elems = []
	            for (var i = 0; i < this.length; i++) {
	                elems.push(this[i].cloneNode(deep))
	            }
	
	            return $(elems)
	        },
	        /**
	        * Returns the number of elements in the collection
	            ```
	            $().size();
	            ```
	
	        * @return {Int}
	        * @title $().size();
	        */
	        size: function() {
	            return this.length
	        },
	        /**
	         * Serailizes a form into a query string
	           ```
	           $().serialize();
	           ```
	         * @return {String}
	         * @title $().serialize()
	         */
	        serialize: function() {
	            if (this.length === 0)
	                return "";
	            var params = []
	            for (var i = 0; i < this.length; i++) {
	                this.slice.call(this[i].elements).forEach(function(elem) {
	                    var type = elem.getAttribute("type")
	                    if (elem.nodeName.toLowerCase() != "fieldset" && !elem.disabled && type != "submit" && type != "reset" && type != "button" && ((type != "radio" && type != "checkbox") || elem.checked)) {
	
	                        if (elem.getAttribute("name")) {
	                            if (elem.type == "select-multiple") {
	                                for (var j = 0; j < elem.options.length; j++) {
	                                    if (elem.options[j].selected)
	                                        params.push(elem.getAttribute("name") + "=" + encodeURIComponent(elem.options[j].value))
	                                }
	                            } else
	                                params.push(elem.getAttribute("name") + "=" + encodeURIComponent(elem.value))
	                        }
	                    }
	                })
	            }
	            return params.join("&")
	        },
	
	        /* added in 1.2 */
	        /**
	         * Reduce the set of elements based off index
	            ```
	           $().eq(index)
	           ```
	         * @param {Int} index - Index to filter by. If negative, it will go back from the end
	         * @return {Object} appframework object
	         * @title $().eq(index)
	         */
	        eq: function(ind) {
	            return $(this.get(ind))
	        },
	        /**
	         * Returns the index of the selected element in the collection
	           ```
	           $().index(elem)
	           ```
	         * @param {String|Object} element to look for.  Can be a selector or object
	         * @return integer - index of selected element
	         * @title $().index(elem)
	         */
	        index: function(elem) {
	            return elem ? this.indexOf($(elem)[0]) : this.parent().children().indexOf(this[0])
	        },
	        /**
	          * Returns boolean if the object is a type of the selector
	          ```
	          $().is(selector)
	          ```
	         * param {String|Object} selector to act upon
	         * @return boolean
	         * @title $().is(selector)
	         */
	        is: function(selector) {
	            return !!selector && this.filter(selector).length > 0
	        },
	
	        /**
	          * query transform to native array
	         */
	        toArray: function() {
	            var query = []
	
	            for (var i = 0, l = this.length; i < l; i++) {
	                query.push(this[i])
	            }
	
	            return query
	        }
	
	    };
	
	
	    /**
	    * Helper function to convert XML into  the DOM node representation
	        ```
	        var xmlDoc=$.parseXML("<xml><foo>bar</foo></xml>");
	        ```
	
	    * @param {String} string
	    * @return {Object} DOM nodes
	    * @title $.parseXML(string)
	    */
	    $.parseXML = function(string) {
	            return (new DOMParser()).parseFromString(string, "text/xml")
	    }
	
	    /**
	     * Utility function to create a psuedo GUID
	       ```
	       var id= $.uuid();
	       ```
	     * @title $.uuid
	     */
	    $.uuid = function() {
	        var S4 = function() {
	            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
	        }
	        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4())
	    }
	
	    /**
	     * Gets the css matrix, or creates a fake one
	       ```
	       $.getCssMatrix(domElement)
	       ```
	       @returns matrix with postion
	       */
	    $.getCssMatrix = function(ele) {
	        if ($.is$(ele)) ele = ele.get(0)
	
	        var matrixFn = window.WebKitCSSMatrix || window.MSCSSMatrix || window.CSSMatrix
	
	        if (ele === undefined) {
	            if (matrixFn) {
	                return new matrixFn()
	            }
	            else {
	                return {
	                    a: 0,
	                    b: 0,
	                    c: 0,
	                    d: 0,
	                    e: 0,
	                    f: 0
	                }
	            }
	        }
	
	        var computedStyle = gCS(ele)
	
	        var transform = computedStyle.webkitTransform ||
	                        computedStyle.transform ||
	                        computedStyle[device.feat.cssPrefix + 'Transform']
	
	        if (matrixFn)
	            return new matrixFn(transform)
	        else if (transform) {
	            //fake css matrix
	            var mat = transform.replace(/[^0-9\-.,]/g, '').split(',')
	            return {
	                a: +mat[0],
	                b: +mat[1],
	                c: +mat[2],
	                d: +mat[3],
	                e: +mat[4],
	                f: +mat[5]
	            }
	        }
	        else {
	            return {
	                a: 0,
	                b: 0,
	                c: 0,
	                d: 0,
	                e: 0,
	                f: 0
	            }
	        }
	    }
	
	    /**
	     * $.create - a faster alertnative to $("<div id='main'>this is some text</div>");
	      ```
	      $.create("div",{id:'main',innerHTML:'this is some text'});
	      $.create("<div id='main'>this is some text</div>");
	      ```
	      * @param {String} DOM Element type or html
	      * @param [{Object}] properties to apply to the element
	      * @return {Object} Returns an appframework object
	      * @title $.create(type,[params])
	      */
	    $.create = function(type, props) {
	        var elem
	        var f = new $query()
	        if (props || type[0] !== "<") {
	            if (props.html)
	                props.innerHTML = props.html, delete props.html
	
	            elem = document.createElement(type)
	            for (var j in props) {
	                elem[j] = props[j]
	            }
	            f[f.length++] = elem
	        } else {
	            elem = document.createElement("div")
	            elem.innerHTML = type
	            _shimNodes(elem.childNodes, f)
	        }
	        return f
	    }
	    /**
	     * $.query  - a faster alertnative to $("div");
	      ```
	      $.query(".panel");
	      ```
	      * @param {String} selector
	      * @param {Object} [context]
	      * @return {Object} Returns an appframework object
	      * @title $.query(selector,[context])
	      */
	    $.query = function(sel, what) {
	        if (!sel)
	            return new $query()
	        what = what || document
	        var f = new $query()
	        return f.selector(sel, what)
	    }
	    /**
	     Zepto.js events
	     @api private
	     */
	
	    //The following is modified from Zepto.js / events.js
	    //We've removed depricated  events like .live and allow anonymous functions to be removed
	    var handlers = {},
	        _afmid = 1
	    /**
	     * Gets or sets the expando property on a javascript element
	     * Also increments the internal counter for elements;
	     * @param {Object} element
	     * @return {Int} afmid
	     * @api private
	     */
	
	    function afmid(element) {
	        return element._afmid || (element._afmid = _afmid++)
	    }
	    /**
	     * Searches through a local array that keeps track of event handlers for proxying.
	     * Since we listen for multiple events, we match up the event, function and selector.
	     * This is used to find, execute, remove proxied event functions
	     * @param {Object} element
	     * @param {String} [event]
	     * @param {Function} [function]
	     * @param {String|Object|Array} [selector]
	     * @return {Function|null} handler function or false if not found
	     * @api private
	     */
	
	    function findHandlers(element, event, fn, selector) {
	        event = parse(event)
	        if (event.ns)
	            var matcher = matcherFor(event.ns)
	        return (handlers[afmid(element)] || []).filter(function(handler) {
	            return handler && (!event.e || handler.e == event.e) && (!event.ns || matcher.test(handler.ns)) && (!fn || handler.fn == fn || (typeof handler.fn === 'function' && typeof fn === 'function' && handler.fn === fn)) && (!selector || handler.sel == selector)
	        })
	    }
	    /**
	     * Splits an event name by "." to look for namespaces (e.g touch.click)
	     * @param {String} event
	     * @return {Object} an object with the event name and namespace
	     * @api private
	     */
	
	    function parse(event) {
	        var parts = ('' + event).split('.')
	        return {
	            e: parts[0],
	            ns: parts.slice(1).sort().join(' ')
	        }
	    }
	    /**
	     * Regular expression checker for event namespace checking
	     * @param {String} namespace
	     * @return {Regex} regular expression
	     * @api private
	     */
	
	    function matcherFor(ns) {
	        return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
	    }
	
	    /**
	     * Utility function that will loop through events that can be a hash or space delimited and executes the function
	     * @param {String|Object} events
	     * @param {Function} fn
	     * @param {Iterator} [iterator]
	     * @api private
	     */
	
	    function eachEvent(events, fn, iterator) {
	        // if ($.isObject(events))
	        //     events.each(iterator)
	        // else
	        //     events.split(/\s/).forEach(function(type) {
	        //         iterator(type, fn)
	        //     })
	
	        events = typeof events === "string" ? events.split(/\s/) : events
	
	        events.each(function (i, event) {
	            switch (event) {
	                case 'transitionstart':
	                    this.push('webkitTransitionStart')
	                    this.push('oTransitionStart')
	                    this.push('MSTransitionStart')
	                    this.push('animationstart')
	                    this.push('webkitAnimationStart')
	                    this.push('oAnimationStart')
	                    this.push('MSAnimationStart')
	                break
	                case 'transitionend':
	                    this.push('webkitTransitionEnd')
	                    this.push('oTransitionEnd')
	                    this.push('MSTransitionEnd')
	                    this.push('animationend')
	                    this.push('webkitAnimationEnd')
	                    this.push('oAnimationEnd')
	                    this.push('MSAnimationEnd')
	                break
	            }
	
	            iterator(event, fn)
	        })
	    }
	
	    /**
	     * Helper function for adding an event and creating the proxy handler function.
	     * All event handlers call this to wire event listeners up.  We create proxy handlers so they can be removed then.
	     * This is needed for delegate/on
	     * @param {Object} element
	     * @param {String|Object} events
	     * @param {Function} function that will be executed when event triggers
	     * @param {String|Array|Object} [selector]
	     * @param {Function} [getDelegate]
	     * @api private
	     */
	
	    function add(element, events, fn, selector, getDelegate) {
	
	        var id = afmid(element),
	            set = (handlers[id] || (handlers[id] = []))
	        eachEvent(events, fn, function(event, fn) {
	            var delegate = getDelegate && getDelegate(fn, event),
	                callback = delegate || fn
	            var proxyfn = function(event) {
	                var result = callback.apply(element, [event].concat(event.data))
	                if (result === false)
	                    event.preventDefault()
	                return result
	            }
	            var handler = {}.extend(parse(event), {
	                fn: fn,
	                proxy: proxyfn,
	                sel: selector,
	                del: delegate,
	                i: set.length
	            })
	            set.push(handler)
	            element.addEventListener(handler.e, proxyfn, false)
	        })
	        //element=null;
	    }
	
	    /**
	     * Helper function to remove event listeners.  We look through each event and then the proxy handler array to see if it exists
	     * If found, we remove the listener and the entry from the proxy array.  If no function is specified, we remove all listeners that match
	     * @param {Object} element
	     * @param {String|Object} events
	     * @param {Function} [fn]
	     * @param {String|Array|Object} [selector]
	     * @api private
	     */
	
	    function remove(element, events, fn, selector) {
	
	        var id = afmid(element)
	        eachEvent(events || '', fn, function(event, fn) {
	            findHandlers(element, event, fn, selector).forEach(function(handler) {
	                delete handlers[id][handler.i]
	                element.removeEventListener(handler.e, handler.proxy, false)
	            })
	        })
	    }
	
	    $.event = {
	        add: add,
	        remove: remove
	    }
	
	    /**
	    * Binds an event to each element in the collection and executes the callback
	        ```
	        $().bind('click',function(){console.log('I clicked '+this.id);});
	        ```
	
	    * @param {String|Object} event
	    * @param {Function} callback
	    * @return {Object} appframework object
	    * @title $().bind(event,callback)
	    */
	    $.fn.bind = function(event, callback) {
	        for (var i = 0; i < this.length; i++) {
	            add(this[i], event, callback)
	        }
	        return this
	    }
	    /**
	    * Unbinds an event to each element in the collection.  If a callback is passed in, we remove just that one, otherwise we remove all callbacks for those events
	        ```
	        $().unbind('click'); //Unbinds all click events
	        $().unbind('click',myFunc); //Unbinds myFunc
	        ```
	
	    * @param {String|Object} event
	    * @param {Function} [callback]
	    * @return {Object} appframework object
	    * @title $().unbind(event,[callback]);
	    */
	    $.fn.unbind = function(event, callback) {
	        for (var i = 0; i < this.length; i++) {
	            remove(this[i], event, callback)
	        }
	        return this
	    };
	
	    /**
	    * Binds an event to each element in the collection that will only execute once.  When it executes, we remove the event listener then right away so it no longer happens
	        ```
	        $().one('click',function(){console.log('I was clicked once');});
	        ```
	
	    * @param {String|Object} event
	    * @param {Function} [callback]
	    * @return appframework object
	    * @title $().one(event,callback);
	    */
	    $.fn.one = function(event, callback) {
	        return this.each(function(i, element) {
	            add(this, event, callback, null, function(fn, type) {
	                return function() {
	                    remove(element, type, fn)
	                    if (!fn) return
	                    var result = fn.apply(element, arguments)
	                    return result
	                }
	            })
	        })
	    }
	
	    /**
	     * internal variables
	     * @api private
	     */
	
	    var returnTrue = function() {
	        return true
	    }
	    var returnFalse = function() {
	        return false
	    }
	    var eventMethods = {
	        preventDefault: 'isDefaultPrevented',
	        stopImmediatePropagation: 'isImmediatePropagationStopped',
	        stopPropagation: 'isPropagationStopped'
	    }
	    /**
	     * Creates a proxy function for event handlers.
	     * As "some" browsers dont support event.stopPropagation this call is bypassed if it cant be found on the event object.
	     * @param {String} event
	     * @return {Function} proxy
	     * @api private
	     */
	
	    function createProxy(event) {
	        var proxy = {}.extend({
	            originalEvent: event
	        }, event)
	        eventMethods.each(function(name, predicate) {
	            proxy[name] = function() {
	                this[predicate] = returnTrue
	                if (name == "stopImmediatePropagation" || name == "stopPropagation") {
	                    event.cancelBubble = true
	                    if (!event[name])
	                        return
	                }
	                return event[name].apply(event, arguments)
	            }
	            proxy[predicate] = returnFalse
	        })
	        return proxy
	    }
	
	    /**
	    * Delegate an event based off the selector.  The event will be registered at the parent level, but executes on the selector.
	        ```
	        $("#div").delegate("p",'click',callback);
	        ```
	
	    * @param {String|Array|Object} selector
	    * @param {String|Object} event
	    * @param {Function} callback
	    * @return {Object} appframework object
	    * @title $().delegate(selector,event,callback)
	    */
	    function addDelegate(element,event,callback,selector) {
	        add(element, event, callback, selector, function(fn) {
	                return function(e) {
	                    var evt, match = $(e.target).closest(selector, element).get(0)
	                    if (match) {
	                        evt = {}.extend(createProxy(e), {
	                            currentTarget: match,
	                            liveFired: element
	                        })
	                        return fn.apply(match, [evt].concat([].slice.call(arguments, 1)))
	                    }
	                }
	            })
	    }
	    $.fn.delegate = function(selector, event, callback) {
	
	        for (var i = 0; i < this.length; i++) {
	            addDelegate(this[i],event,callback,selector)
	        }
	        return this
	    };
	
	    /**
	    * Unbinds events that were registered through delegate.  It acts upon the selector and event.  If a callback is specified, it will remove that one, otherwise it removes all of them.
	        ```
	        $("#div").undelegate("p",'click',callback);//Undelegates callback for the click event
	        $("#div").undelegate("p",'click');//Undelegates all click events
	        ```
	
	    * @param {String|Array|Object} selector
	    * @param {String|Object} event
	    * @param {Function} callback
	    * @return {Object} appframework object
	    * @title $().undelegate(selector,event,[callback]);
	    */
	    $.fn.undelegate = function(selector, event, callback) {
	        for (var i = 0; i < this.length; i++) {
	            remove(this[i], event, callback, selector)
	        }
	        return this
	    };
	
	    /**
	    * Similar to delegate, but the function parameter order is easier to understand.
	    * If selector is undefined or a function, we just call .bind, otherwise we use .delegate
	        ```
	        $("#div").on("click","p",callback);
	        ```
	
	    * @param {String|Array|Object} selector
	    * @param {String|Object} event
	    * @param {Function} callback
	    * @return {Object} appframework object
	    * @title $().on(event,selector,callback);
	    */
	    $.fn.on = function(event, selector, callback) {
	        return selector === undefined || $.isFunction(selector) ? this.bind(event, selector) : this.delegate(selector, event, callback)
	    }
	    /**
	    * Removes event listeners for .on()
	    * If selector is undefined or a function, we call unbind, otherwise it's undelegate
	        ```
	        $().off("click","p",callback); //Remove callback function for click events
	        $().off("click","p") //Remove all click events
	        ```
	
	    * @param {String|Object} event
	    * @param {String|Array|Object} selector
	    * @param {Sunction} callback
	    * @return {Object} appframework object
	    * @title $().off(event,selector,[callback])
	    */
	    $.fn.off = function(event, selector, callback) {
	        return selector === undefined || $.isFunction(selector) ? this.unbind(event, selector) : this.undelegate(selector, event, callback)
	    }
	
	    /**
	    This triggers an event to be dispatched.  Usefull for emulating events, etc.
	    ```
	    $().trigger("click",{foo:'bar'});//Trigger the click event and pass in data
	    ```
	
	    * @param {String|Object} event
	    * @param {Object} [data]
	    * @return {Object} appframework object
	    * @title $().trigger(event,data);
	    */
	    $.fn.trigger = function(event, data, props) {
	        if (typeof event == 'string')
	            event = $.Event(event, props)
	        event.data = data
	        for (var i = 0; i < this.length; i++) {
	            this[i].dispatchEvent(event)
	        }
	        return this
	    }
	
	    /**
	     * Creates a custom event to be used internally.
	     * @param {String} type
	     * @param {Object} [properties]
	     * @return {event} a custom event that can then be dispatched
	     * @title $.Event(type,props);
	     */
	
	    $.Event = function(type, props) {
	        var event = document.createEvent('Events'),
	            bubbles = true
	        if (props)
	            for (var name in props)
	                (name == 'bubbles') ? (bubbles = !! props[name]) : (event[name] = props[name])
	        event.initEvent(type, bubbles, true, null, null, null, null, null, null, null, null, null, null, null, null)
	        return event
	    }
	
	    /* The following are for events on objects */
	    /**
	     * Bind an event to an object instead of a DOM Node
	       ```
	       $.bind(this,'event',function(){});
	       ```
	     * @param {Object} object
	     * @param {String} event name
	     * @param {Function} function to execute
	     * @title $.bind(object,event,function);
	     */
	    $.bind = function(obj, ev, f) {
	        if (!obj) return
	        if (!obj.__events) obj.__events = {}
	        if (!$.isArray(ev)) ev = [ev]
	        for (var i = 0; i < ev.length; i++) {
	            if (!obj.__events[ev[i]]) obj.__events[ev[i]] = []
	            obj.__events[ev[i]].push(f)
	        }
	    }
	
	    /**
	     * Trigger an event to an object instead of a DOM Node
	       ```
	       $.trigger(this,'event',arguments);
	       ```
	     * @param {Object} object
	     * @param {String} event name
	     * @param {Array} arguments
	     * @title $.trigger(object,event,argments);
	     */
	    $.trigger = function(obj, ev, args) {
	        if (!obj) return
	        var ret = true
	        if (!obj.__events) return ret
	        if (!$.isArray(ev)) ev = [ev]
	        if (!$.isArray(args)) args = []
	        for (var i = 0; i < ev.length; i++) {
	            if (obj.__events[ev[i]]) {
	                var evts = obj.__events[ev[i]].slice(0)
	                for (var j = 0; j < evts.length; j++)
	                    if ($.isFunction(evts[j]) && evts[j].apply(obj, args) === false)
	                        ret = false
	            }
	        }
	        return ret
	    }
	    /**
	     * Unbind an event to an object instead of a DOM Node
	       ```
	       $.unbind(this,'event',function(){});
	       ```
	     * @param {Object} object
	     * @param {String} event name
	     * @param {Function} function to execute
	     * @title $.unbind(object,event,function);
	     */
	    $.unbind = function(obj, ev, f) {
	        if (!obj.__events) return
	        if (!$.isArray(ev)) ev = [ev]
	        for (var i = 0; i < ev.length; i++) {
	            if (obj.__events[ev[i]]) {
	                var evts = obj.__events[ev[i]]
	                for (var j = 0; j < evts.length; j++) {
	                    if (f == undefined)
	                        delete evts[j]
	                    if (evts[j] == f) {
	                        evts.splice(j, 1)
	                        break
	                    }
	                }
	            }
	        }
	    }
	
	
	    /**
	     * Creates a proxy function so you can change the 'this' context in the function
	     * Update: now also allows multiple argument call or for you to pass your own arguments
	       ```
	        var newObj={foo:bar}
	        $("#main").bind("click",$.proxy(function(evt){console.log(this)},newObj);
	
	        or
	
	        ( $.proxy(function(foo, bar){console.log(this+foo+bar)}, newObj) )('foo', 'bar');
	
	        or
	
	        ( $.proxy(function(foo, bar){console.log(this+foo+bar)}, newObj, ['foo', 'bar']) )();
	       ```
	     * @param {Function} Callback
	     * @param {Object} Context
	     * @title $.proxy(callback,context);
	     */
	    $.proxy = function(f, c, args) {
	        return function() {
	            if (args) return f.apply(c, args) //use provided arguments
	            return f.apply(c, arguments) //use scope function call arguments
	        }
	    }
	
	
	    /**
	     * Removes listeners on a div and its children recursively
	        ```
	         cleanUpNode(node,kill)
	        ```
	     * @param {HTMLDivElement} the element to clean up recursively
	     * @api private
	     */
	
	    function cleanUpNode(node, kill) {
	        //kill it before it lays eggs!
	        if (kill && node.dispatchEvent) {
	            var e = $.Event('destroy', {
	                bubbles: false
	            })
	            node.dispatchEvent(e)
	        }
	        //cleanup itself
	        var id = afmid(node)
	        if (id && handlers[id]) {
	            for (var key in handlers[id])
	                node.removeEventListener(handlers[id][key].e, handlers[id][key].proxy, false)
	            delete handlers[id]
	        }
	    }
	
	    function cleanUpContent(node, kill) {
	        if (!node) return
	        //cleanup children
	        var children = node.childNodes
	        if (children && children.length > 0) {
	            for (var i; i < children.length; i++) {
	                cleanUpContent(children[i], kill)
	            }
	        }
	
	        cleanUpNode(node, kill)
	    }
	    var cleanUpAsap = function(els, kill) {
	        for (var i = 0; i < els.length; i++) {
	            cleanUpContent(els[i], kill)
	        }
	    }
	
	    /**
	     * Function to clean up node content to prevent memory leaks
	       ```
	       $.cleanUpContent(node,itself,kill)
	       ```
	     * @param {HTMLNode} node
	     * @param {Bool} kill itself
	     * @param {bool} Kill nodes
	     * @title $.cleanUpContent(node,itself,kill)
	     */
	    $.cleanUpContent = function(node, itself, kill) {
	        if (!node) return
	        //cleanup children
	        var cn = node.childNodes
	        if (cn && cn.length > 0) {
	            //destroy everything in a few ms to avoid memory leaks
	            //remove them all and copy objs into new array
	            $.asap(cleanUpAsap, {}, [slice.apply(cn, [0]), kill])
	        }
	        //cleanUp this node
	        if (itself) cleanUpNode(node, kill)
	    }
	
	    // Like setTimeout(fn, 0); but much faster
	    var timeouts = []
	    var contexts = []
	    var params = []
	    /**
	     * This adds a command to execute in the JS stack, but is faster then setTimeout
	       ```
	       $.asap(function,context,args)
	       ```
	     * @param {Function} function
	     * @param {Object} context
	     * @param {Array} arguments
	     */
	    $.asap = function(fn, context, args) {
	        if (!$.isFunction(fn)) throw "$.asap - argument is not a valid function"
	        timeouts.push(fn)
	        contexts.push(context ? context : {})
	        params.push(args ? args : [])
	        //post a message to ourselves so we know we have to execute a function from the stack
	        window.postMessage("afm-asap", "*")
	    }
	    window.addEventListener("message", function(event) {
	        if (event.source == window && event.data == "afm-asap") {
	            event.stopPropagation()
	            if (timeouts.length > 0) { //just in case...
	                (timeouts.shift()).apply(contexts.shift(), params.shift())
	            }
	        }
	    }, true)
	
	
	    /**
	    //custom events since people want to do $().click instead of $().bind("click")
	    */
	
	    !["click", "keydown", "keyup", "keypress", "submit", "load", "resize", "change", "select", "error"].forEach(function(event) {
	        $.fn[event] = function(cb) {
	            return cb ? this.bind(event, cb) : this.trigger(event)
	        }
	    })
	
	    // only $query
	
	    !['focus', 'blur'].forEach(function(name) {
	        $.fn[name] = function(callback) {
	            if (this.length === 0) return
	            if (callback)
	                this.bind(name, callback)
	            else
	                for (var i = 0; i < this.length; i++) {
	                    try {
	                        this[i][name]()
	                    } catch (e) {}
	            }
	            return this
	        }
	    })
	
	    /**
	     * End of APIS
	     * @api private
	     */
	    return $
	}

/***/ }),
/* 10 */
/***/ (function(module, exports) {

	// 民不畏威，则大威至。
	
	// Sandbox
	
	function Sandbox (unify, proto, whitebox) {
	    var sandbox, content, context
	
	    this.sandbox = this.iframe = sandbox = document.createElement('iframe')
	
	    // 沙箱拓为明箱及暗箱之别 whitebox && blackbox
	
	    if ( !whitebox ) {
	        sandbox.style.display = 'none'
	        document.head.appendChild(sandbox)
	
	        this.init()
	    }
	}
	
	Sandbox.prototype = {
	    init : function () {
	        var content = this.sandbox.contentDocument
	
	        // init
	
	        content.open()
	        content.write('')
	        content.close()
	
	        this.window = this.sandbox.contentWindow.window
	        this.document = this.sandbox.contentWindow.document
	
	        return this
	    },
	
	    extend : function (un) {
	
	        // 获取被支持的iframe
	
	        __defineUnify__(this.window)
	
	        if ( !un ) {
	            __defineProto__(this.window)
	        }
	
	        return this
	    },
	
	    open : function () {
	        this.sandbox.contentDocument.open()
	
	        return this
	    },
	
	    write : function (style, script) {
	        var context
	
	        if ( style || script ) {
	            context = '<!DOCTYPE html>'
	                + '<html>'
	                + '<head>'
	                + (style ? style : '')
	                + (script ? script : '')
	                + '</head>'
	                + '<body>'
	                + '</body>'
	                + '</html>'
	        } else {
	            context = '<head><meta charset="utf-8"></head>'
	        }
	
	        this.sandbox.contentDocument.write(context)
	        
	
	        return this
	    },
	
	    close : function () {
	        this.sandbox.contentDocument.close()
	    },
	
	    exit : function () {
	        document.head.removeChild(this.sandbox)
	    },
	
	    load : function (files, callback) {
	        files = typeof files == 'object' ? files : [files]
	
	        var html = ''
	        for (var i = files.length - 1; i >= 0; i--) {
	            html += '<object data=' + files[i] + '</object>';
	        }
	
	        this.sandboxWindow.open()
	        this.sandboxWindow.write(html)
	        this.sandboxWindow.close()
	
	        this.sandboxWindow.onload = function () {
	            callback()
	        }
	    }
	}
	
	// SandboxFunction
	
	var sandbox = new Sandbox(),
	    sandboxWindow = sandbox.window,
	    SandboxFunction = sandboxWindow.Function
	
	sandbox.extend(true)
	sandbox.exit()
	
	// shadowRootFunction
	
	var shadowRoot = new Sandbox()
	  , shadowRootWindow = shadowRoot.window
	  , ShadowRootFunction = shadowRootWindow.Function
	
	shadowRoot.extend(true)
	
	export default {
	    sandbox : Sandbox,
	    sandboxWindow : sandboxWindow,
	    SandboxFunction : SandboxFunction,
	    shadowRootWindow : shadowRootWindow,
	    ShadowRootFunction : ShadowRootFunction,
	}

/***/ }),
/* 11 */
/***/ (function(module, exports) {

	// 天下莫柔弱於水，而攻坚强者莫之能胜，以其无以易之。
	
	/**
	 * UI 设备UI描述
	 * @type {Object}
	 */
	var UI = device.ui
	var DPR = devicePixelRatio
	
	/**
	 * 设备属性描述
	 * @type {Object}
	 */
	var FEAT = device.feat
	var PREFIX = FEAT.prefixStyle
	
	/**
	 * EASEING 动画
	 * @type {Object}
	 */
	var EASEING = {
	
		/**
		 * linear
		 * @type {Object}
		 */
		linear: {
			style: 'cubic-bezier(0, 0, 1, 1)',
			fn: function (k) {
				return k
			}
		},
	
		/**
		 * quadratic
		 * @type {Object}
		 */
		quadratic: {
			style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
			fn: function (k) {
				return k * ( 2 - k )
			}
		},
	
		/**
		 * circular
		 * cubic-bezier(0.1, 0.57, 0.1, 1) or cubic-bezier(0, 0, 0.1, 1)
		 * Not properly "circular" but this looks better, it should be (0.075, 0.82, 0.165, 1)
		 * @type {Object}
		 */
		circular: {
			style: 'cubic-bezier(0, 0, 0.165, 1)',
			fn: function (k) {
				return Math.sqrt( 1 - ( --k * k ) )
			}
		},
	
		/**
		 * back
		 * @type {Object}
		 */
		back: {
			style: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
			fn: function (k) {
				var b = 4
				return ( k = k - 1 ) * k * ( ( b + 1 ) * k + b ) + 1
			}
		},
	
		/**
		 * bounce
		 * @type {Object}
		 */
		bounce: {
			style: '',
			fn: function (k) {
				if ( ( k /= 1 ) < ( 1 / 2.75 ) ) {
					return 7.5625 * k * k
				} else if ( k < ( 2 / 2.75 ) ) {
					return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75
				} else if ( k < ( 2.5 / 2.75 ) ) {
					return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375
				} else {
					return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375
				}
			}
		},
	
		/**
		 * elastic
		 * @type {Object}
		 */
		elastic: {
			style: '',
			fn: function (k) {
				var f = 0.22,
					e = 0.4
	
				if ( k === 0 ) { return 0 }
				if ( k == 1 ) { return 1 }
	
				return ( e * Math.pow( 2, - 10 * k ) * Math.sin( ( k - f / 4 ) * ( 2 * Math.PI ) / f ) + 1 )
			}
		}
	}
	
	/**
	 * BROWSER 特性描述
	 * @type {Object}
	 */
	var BROWSER = {
	
		/**
		 * touch 特性支持
		 * @type {[type]}
		 */
	  	touch : FEAT.touch,
	
	  	/**
	  	 * 设备Transition兼容性检测
	  	 * @type {Boolean}
	  	 */
	  	isBadTransition : FEAT.isBadTransition,
	  	supportTransition : FEAT.supportTransition,
	
	  	/**
	  	 * 特性检测
	  	 * @type {Object}
	  	 */
	  	feat : {
			hasObserver : FEAT.observer,
	        hasTransform : PREFIX('transform') !== false,
			hasPerspective : PREFIX('perspective'),
			hasTouch : FEAT.touch,
			hasPointer : navigator.msPointerEnabled,
			hasTransition : PREFIX('transition')
	    },
	
	    /**
	     * get prefixStyle
	     * @type {Object}
	     */
	    prefixStyle : {
	       	transform : PREFIX('transform'),
	       	transition : PREFIX('transition'),
			transitionTimingFunction : PREFIX('transitionTimingFunction'),
			transitionDuration : PREFIX('transitionDuration'),
			transitionDelay : PREFIX('transitionDelay'),
			transformOrigin : PREFIX('transformOrigin')
	    },
	
	    /**
	     * get prefixPointerEvent
	     * @param  {String} pointerEvent
	     * @return {String}
	     */
	    prefixPointerEvent : function (pointerEvent) {
			return window.MSPointerEvent ? 
				'MSPointer' + pointerEvent.charAt(9).toUpperCase() + pointerEvent.substr(10):
				pointerEvent;
		}
	}
	
	/**
	 * METHOD 公共方法
	 * @type {Object}
	 */
	var METHOD = {
	
		/**
		 * 基本事件类型
		 * @type {Object}
		 */
		eventType : {
			touchstart: 1,
			touchmove: 1,
			touchend: 1,
	
			mousedown: 2,
			mousemove: 2,
			mouseup: 2,
	
			MSPointerDown: 3,
			MSPointerMove: 3,
			MSPointerUp: 3
		},
	
		/**
		 * 事件绑定
		 * @param {Element}  el
		 * @param {String}   type    
		 * @param {Function} fn
		 * @param {Boolean}  capture
		 */
		addEvent : function (el, type, fn, capture) {
			el.addEventListener(type, fn, !!capture)
		},
	
		/**
		 * 事件解除
		 * @param {Element}  el
		 * @param {String}   type    
		 * @param {Function} fn
		 * @param {Boolean}  capture
		 */
		removeEvent : function (el, type, fn, capture) {
			el.removeEventListener(type, fn, !!capture)
		},
	
		/**
		 * 获取矩形
		 * @param  {Element/SVGAElement} el
		 * @return {Object} 矩形宽高
		 */
		getRect : function (el) {
			if ( el instanceof SVGElement ) {
				var rect = el.getBoundingClientRect()
				return {
					top : rect.top,
					left : rect.left,
					width : rect.width,
					height : rect.height,
					clientWidth : rect.width,
					clientHeight : rect.height
				}
			} else {
				return {
					top : el.offsetTop,
					left : el.offsetLeft,
					width : el.offsetWidth,
					height : el.offsetHeight,
					clientWidth : el.clientWidth,
					clientHeight : el.clientHeight
				}
			}
		},
	
		/**
		 * 获取位置
		 * @param  {Element} el
		 * @return {Object} 元素位置
		 */
		offset : function (el) {
			var left = -el.offsetLeft,
				top = -el.offsetTop
	
			while (el = el.offsetParent) {
				left -= el.offsetLeft
				top -= el.offsetTop
			}
	
			return {
				left: left,
				top: top
			}
		}
	}
	
	export default function (window, document, Math) {
		'use strict'
	
		var gCS = window.getComputedStyle
	  	var rAF = window.requestAnimationFrame
	  	var rIC = window.requestIdleCallback
	  	var dP  = function (px) { return px * UI.scale }
	
	  	/**
	  	 * 滚动主函数
	  	 * @param {Element} el
	  	 * @param {Object} options
	  	 */
		function Scroll (el, options) {
			this.options = {
	
				history : true,
	
				/**
				 * 默认事件代理
				 * @type {Boolean}
				 */
				bindToWrapper : true,
	
				/**
				 * 显示滚动条
				 * @type {Boolean}
				 */
				scrollbars : true,
	
				/**
				 * 滚动渐变显示滚动条
				 * @type {Boolean}
				 */
				fadeScrollbars : true,
	
				/**
				 * 伸缩弹性滚动条
				 * @type {Boolean}
				 */
				resizeScrollbars : true,
	
				/**
				 * infinite 虚拟滚动 滚动条预测精度
				 * 数值越小越精，刷新频率也越高
				 * @type {Number}
				 */
				scrollbarAccuracy : 10,
	
				/**
				 * 控制器
				 * @type {Boolean}
				 */
				interactive : true,
				indicator : null,
	
				/**
				 * 鼠标事件
				 * @type {Boolean}
				 */
				mouseWheel : true,
				mouseWheelSpeed : 20,
				mouseWheelAction : 'normal',
	
				/**
				 * 异步加载infinite
				 * @type {Boolean}
				 */
				deferred : false,
	
				/**
				 * infinte 缓冲数量
				 * @type {Number}
				 */
				infiniteCacheBuffer : 50,
	
				/**
				 * open momentum
				 * @type {Boolean}
				 */
				
				momentum : true,
	
				/**
				 * deceleration 惯性系数
				 * @type {Number}
				 */
				deceleration : 0.0006,
	
				/**
				 * speedLimit 最大滚动速度
				 * @type {Number}
				 */
				speedLimit : 3,
				speedRate : 1,
				stepLimit : 150,
	
				maxPage : 1000,
	
				/**
				 * 起始位置
				 * @type {Number}
				 */
				startX : 0,
				startY : 0,
	
				/**
				 * 滚动轴向
				 * @type {Boolean}
				 */
				scrollX : false,
				scrollY : true,
	
				/**
				 * 方向锁定值
				 * @type {Number}
				 */
				directionLockThreshold : 5,
				directionLockThresholdX : false,
				directionLockThresholdY : false,
	
				/**
				 * 边缘弹性
				 * @type {Boolean}
				 */
				bounce : true,
	
				/**
				 * 边缘弹性阻力
				 * @type {Number}
				 */
				bounceDrag : 3,
				bounceDragRate : 20,
	
				/**
				 * 边缘弹性动画时长
				 * @type {Number}
				 */
				bounceTime : 400,
	
				/**
				 * 弹性动画
				 * @type {String}
				 */
				bounceEasing : '',
	
				/**
				 * 边缘弹性最大自然惯性边缘
				 * @type {Number}
				 */
				boundariesLimit : 0.6,
	
				/**
				 * 是否阻止自然惯性引起的边缘弹性
				 * @type {Boolean}
				 */
				bounceBreakThrough : true,
	
				/**
				 * pulldown pullup
				 * @type {Boolean}
				 */
				pull : false,
	
				/**
				 * snap 效果
				 * @type {Boolean}
				 */
				snap : false,
				snapEasing : '',
				snapDuration : 400,
				snapThreshold : 0.15,
	
				/**
				 * map 效果
				 * @type {Boolean}
				 */
				zoom : false,
				zoomMin : 1,
				zoomMax : 4, 
				startZoom : 1,
				zoomOrigin : '0 0 0',
	
				/**
				 * 默认事件控制
				 * @type {Boolean}
				 */
				preventDefault : true,
				preventDefaultException : { tagName: /^(INPUT|TEXTAREA|HTMLAREA|BUTTON|SELECT)$/ },
				stopPropagation : 'auto',
	
				// 父滚动时忽略子滚动触发
				
				coverPropagation : true,
	
				/**
				 * 窗口resize
				 * 滚动刷新延时
				 * @type {Number}
				 */
				resizePolling : 60,
	
				/**
				 * 是否启用css3d动画
				 * @type {Boolean}
				 */
				useTransition : true
				
			}.extend(options)
	
			this._options = options
	
			/**
			 * 关键节点
			 * wrapper : 滚动容器scroll
			 * scroller : 滚动内容scrolling
			 * scroll.scrolling属性记录了该滚动的scrolling元素
			 * 当scrolling元素不存在纪律中时会尝试获取scroll中的scrolling元素
			 */
			this.uuid = 'scroll::' + (App.name || 'top') + ':' + App.id + ':' + (el.id || el.uuid)
			this.wrapper = el
			this.scroller = this.scrolling = el.scrolling
	
			this.pullup = el.pullup
			this.pulldown = el.pulldown
			this.pullright = el.pullright
			this.pullleft = el.pullleft
			this.scrollcover = el.scrollcover
	
			if ( this.pullup || this.pulldown || this.pullright || this.pullleft ) {
				this.options.pull = true
			}
	
			/**
			 * 为定义规范的scrolling
			 * 当scroll中不存在scrolling元素时，使用第一个子元素替代，但这是不规范的
			 * @param  {Boolean} !this.scroller
			 * @return false
			 */
			if ( !this.scroller ) {
				
				// 不规范的使用警告
				
				App.console.warn('<scrolling>', 'warn', 'is not defined')
	
				// 获取scroll中的第一个子节点替代scrolling
				
				this.scroller = this.wrapper.children[0]
	
				// 当scroll中不存在任何子元素时，终止滚动
				
				if ( !this.scroller ) return
			}
	
			/**
			 * 自定义指示器
			 * scrollbar为指示器的实例
			 */
			if ( options.indicator ) {
				this.scrollbar = el.scrollbar 
			}
	
			// snap: reset speedLimit
			
			if ( !options.speedLimit && options.snap ) {
				this.options.speedLimit = dP(1)
			}
	
			/**
			 * cache style for better performance
			 */
			this.scrollerStyle = this.scroller.style
	
			/**
			 * 初始化获得滚动区域宽高
			 * get wrapper width & height
			 */
			this.wrapperWidth = this.wrapper.offsetWidth
			this.wrapperHeight = this.wrapper.offsetHeight
	
	
			// Normalize options
	
			this.options.useTransition = BROWSER.feat.hasTransition && this.options.useTransition
			this.options.eventPassthrough = this.options.eventPassthrough === true ? 'vertical' : this.options.eventPassthrough
			this.options.preventDefault = !this.options.eventPassthrough && this.options.preventDefault
	
			// to dp
			
			this.options.startX = dP(this.options.startX)
	        this.options.startY = dP(this.options.startY)
	        this.options.stepLimit = dP(this.options.stepLimit)
	        this.options.speedLimit = dP(this.options.speedLimit)
	
			// If you want eventPassthrough I have to lock one of the axes
	
			this.options.scrollY = this.options.eventPassthrough == 'vertical' ? false : this.options.scrollY
			this.options.scrollX = this.options.eventPassthrough == 'horizontal' ? false : this.options.scrollX
	
			// With eventPassthrough we also need lockDirection mechanism
	
			this.options.freeScroll = this.options.freeScroll && !this.options.eventPassthrough
			this.options.directionLockThreshold = this.options.eventPassthrough ? 0 : this.options.directionLockThreshold
	
			// snap 动画曲线
	
			this.options.snapEasing = typeof this.options.snapEasing == 'string' ? EASEING[this.options.snapEasing] || EASEING.circular : this.options.snapEasing
			
			// bounce 动画曲线
	
			this.options.bounceEasing = typeof this.options.bounceEasing == 'string' ? EASEING[this.options.bounceEasing] || EASEING.quadratic : this.options.bounceEasing
	
			// resizePolling
			
			this.options.resizePolling = this.options.resizePolling === undefined ? 60 : this.options.resizePolling
	
			// 鼠标反向控制
			
			this.options.invertWheelDirection = this.options.invertWheelDirection ? -1 : 1
	
			// 设定指示器
			
			this.options.indicators = this.scrollbar ? { el: this.scrollbar, interactive: options.interactive } : null
			
			// !supportTransition
	
			if ( !BROWSER.supportTransition ) this.options.useTransition = false
	
			// 初始化 scroll wrapper style
	
			if ( this.options.scrollX && this.options.scrollY ) {
	            this.wrapper.setAttribute('flow-free', '')
	        } else if ( this.options.scrollX ) {
	            this.wrapper.setAttribute('flow-x', '')
	        } else if ( this.options.scrollY ) {
	            this.wrapper.setAttribute('flow-y', '')
	        }
	
			// START
	
			this._init()
			this.revert(true, this.options.deferred ? false : true)
		}
	
		/**
		 * Scroll 原型扩展
		 * 下划线_开头的命名为私用方法
		 * @type {Object}
		 */
		Scroll.prototype = {
	
			on : function (types, fn) {
				var that = this
	
	            types.split(' ').each(function (i, type) {
	            	that._events.initial(type, []).push(fn)
	            })
	        },
	
	        one : function (types, fn) {
	        	var that = this
	
	        	function once () {
	        		fn.apply(this, arguments)
	        		this.off(types, once)
	        	}
	
	        	types.split(' ').each(function (i, type) {
	        		that._events.initial(type, []).push(once)
	        	})
	        },
	
	        off : function (types, fn) {
	        	var that = this
	
	            types.split(' ').each(function (i, type) {
	            	if ( !that._events[type] ) return
	
	            	var index = that._events[type].indexOf(fn)
	
	            	if ( index > -1 ) {
	                    that._events[type].splice(index, 1)
	                }
	            })
	        },
	
			disable : function () {
				this.enabled = false
			},
	
			enable : function () {
				this.enabled = true
			},
	
			stop : function () {
				this.isInTransition = false
				this.isAnimating = false
			},
	
			revert : function (reset, sync) {
	
				if ( !sync ) return
					
				this._initKaleidoscope()
	
				this._refresh()
	
				// 重置位置
	
				if ( reset ) {
					this.scrollTo(this.options.startX, this.options.startY, -1)
				}
	
				this.enable()
	
				this._execEvent('revert')
			},
	
			destroy : function () {
				this._initEvents(true)
	
				this._execEvent('destroy')
			},
	
			refresh : function () {
				var that = this
	
				// 当前手指moving时不触发刷新操作
				
				if ( this.isMoving() || this.isScrolling() ) {
					this.one('scrollend', function () {
						rAF(function () {
							that._refresh()
						})
					}.bind(this))
	
					return
				}
	
				rAF(function () {
					that._refresh()
				})
			},
	
			getComputedPosition : function () {
				var matrix = gCS(this.scroller, null),
					x, y
	
				matrix = matrix[BROWSER.prefixStyle.transform].split(')')[0].split(', ')
				x = +(matrix[12] || matrix[4])
				y = +(matrix[13] || matrix[5])
	
				return { x: x, y: y }
			},
	
			drawingEnd : function () {
				return
				if ( this.options.infinite ) return
				if ( (this.options.scrollY && this.scrollerHeight !== this.scroller.offsetHeight) || (this.options.scrollX && this.scrollerWidth !== this.scroller.offsetWidth) ) {
					this.refresh()
				}
			},
	
			isScrolling : function () {
				return this.isInTransition || this.isAnimating || false
			},
	
			isMoving : function () {
				return this.moving
			},
	
			isBounce : function () {
				var x = this.x,
					y = this.y
	
				var bouncing = false
				var bouncpos
	
				if ( !this.hasHorizontalScroll ) {
					x = this.x
				} else {
					if ( this.x > this.minScrollX ) {
						x = this.minScrollX
						bouncing = true
						bouncpos = "left"
					} else if ( this.x < this.maxScrollX ) {
						x = this.maxScrollX
						bouncing = true
						bouncpos = "right"
					}
				}
	
	
				if ( !this.hasVerticalScroll ) {
					y = this.y
				} else {
					if ( this.y > this.minScrollY ) {
						y = this.minScrollY
						bouncing = true
						bouncpos = "top"
					} else if ( this.y < this.maxScrollY ) {
						y = this.maxScrollY
						bouncing = true
						bouncpos = "bottom"
					}
				}
	
				if ( !bouncing ) return false
	
				return {
					x : x,
					y : y,
					pos : bouncpos
				}
			},
	
			resetPosition : function (time) {
				var bouncing = this.isBounce()
	
				time = time || 0
	
				if ( bouncing ) {
					this.scrollTo(bouncing.x, bouncing.y, time, EASEING.quadratic)
					this._execEvent('bouncing', bouncing.pos)
				} else {
					this.bounceDragPhase = 0
				}
	
				// 边缘弹性时触发刷新, 当滑到底部
	
				this.borderBouncing = bouncing
	
				return bouncing
			},
	
			zoom : function (scale, x, y, time) {
				if ( scale < this.options.zoomMin ) {
					scale = this.options.zoomMin
				} else if ( scale > this.options.zoomMax ) {
					scale = this.options.zoomMax
				}
	
				if ( scale == this.scale ) return
	
				var relScale = scale / this.scale
	
				x = x === undefined ? this.wrapperWidth / 2 : x
				y = y === undefined ? this.wrapperHeight / 2 : y
				time = time === undefined ? 300 : time
	
				x = x + this.wrapperOffset.left - this._x
				y = y + this.wrapperOffset.top - this._y
	
				x = x - x * relScale + this._x
				y = y - y * relScale + this._y
	
				this.scale = scale
	
				this._refresh()	// update boundaries
	
				if ( x > 0 ) {
					x = 0
				} else if ( x < this.maxScrollX ) {
					x = this.maxScrollX
				}
	
				if ( y > 0 ) {
					y = 0
				} else if ( y < this.maxScrollY ) {
					y = this.maxScrollY
				}
	
				this.scrollTo(x, y, time)
			},
	
			next : function (time, easing) {
				var x = this.currentPage.pageX,
					y = this.currentPage.pageY
	
				x++
	
				if ( x >= this.pages.length && this.hasVerticalScroll ) {
					x = 0
					y++
				}
	
				this.goToPage(x, y, time, easing)
			},
	
			prev : function (time, easing) {
				var x = this.currentPage.pageX,
					y = this.currentPage.pageY
	
				x--
	
				if ( x < 0 && this.hasVerticalScroll ) {
					x = 0
					y--
				}
	
				this.goToPage(x, y, time, easing)
			},
	
			goToPage : function (x, y, time, easing) {
				easing = easing || this.options.bounceEasing
	
				if ( x >= this.pages.length ) {
					x = this.pages.length - 1
				} else if ( x < 0 ) {
					x = 0
				}
	
				if ( y >= this.pages[x].length ) {
					y = this.pages[x].length - 1
				} else if ( y < 0 ) {
					y = 0
				}
	
				var posX = this.pages[x][y].x,
					posY = this.pages[x][y].y
	
				time = time === undefined ? this.options.snapDuration || Math.max(
					Math.max(
						Math.min(Math.abs(posX - this.x), 1000),
						Math.min(Math.abs(posY - this.y), 1000)
					), 300) : time
	
				this.currentPage = {
					x: posX,
					y: posY,
					pageX: x,
					pageY: y
				}
	
				this.scrollTo(posX, posY, time, easing)
			},
	
			scrollBy : function (x, y, time, easing, bounce) {
				if ( x === 0 && y === 0 ) return
	
				x = this._x + x
				y = this._y + y
				time = time || 0
	
				this.scrollTo(x, y, time, easing, bounce)
			},
	
			scrollTo : function (x, y, time, easing, bounce) {
				time = time || 0
				easing = easing || EASEING.circular
	
				this.isInTransition = this.options.useTransition && time > 0
	
				if ( x === this._x && y === this._y && time !== -1 ) {
					if ( time ) this._execEvent('scrollend', 'end')
					return
				}
	
				if ( bounce === false ) {
					if ( x >= this.minScrollX ) {
						x = this.minScrollX
	                } else if ( x < this.maxScrollX ) {
	                    x = this.maxScrollX
	                }
	
					if ( y >= this.minScrollY ) {
						y = this.minScrollY
	                } else if ( y < this.maxScrollY ) {
	                    y = this.maxScrollY
	                }
				}
	
				if ( time <= 0 ) {
					this._promiseKeyFrame('translate', [x, y], true)
					this._promiseKeyFrame('transitionTime', null, true)
					this._drawing()
	
					return
				}
	
				this.transitionStartTime = Date.now()
				this.transitionCountTime = time
	
				if ( this.options.useTransition && easing.style ) {
					/**
					 * 注意顺序:_transitionScroll置后执行
					 */
					this._promiseKeyFrame('translate', [x, y], true)
					this._promiseKeyFrame('transitionTimingFunction', [easing.style], true)
					this._promiseKeyFrame('transitionTime', [time], true)
					this._drawing()
					this._transitionScroll()
				} else {
					this._animate(x, y, time, easing.fn)
				}
			},
	
			scrollToElement : function (el, time, offsetX, offsetY, easing) {
				el = el.nodeType ? el : this.scroller.querySelector(el)
	
				if ( !el ) {
					return
				}
	
				var pos = METHOD.offset(el)
	
				pos.left -= this.wrapperOffset.left
				pos.top  -= this.wrapperOffset.top
	
				// if offsetX/Y are true we center the element to the screen
	
				var elRect = METHOD.getRect(el)
				var wrapperRect = METHOD.getRect(this.wrapper)
	
				if ( offsetX === true ) {
					offsetX = Math.round(elRect.offsetWidth / 2 - wrapperRect.offsetWidth / 2)
				}
				if ( offsetY === true ) {
					offsetY = Math.round(elRect.offsetHeight / 2 - wrapperRect.offsetHeight / 2)
				}
	
				pos.left -= offsetX || 0
				pos.top  -= offsetY || 0
	
				pos.left = pos.left > this.minScrollX ? this.minScrollX : pos.left < this.maxScrollX ? this.maxScrollX : pos.left
				pos.top  = pos.top  > this.minScrollY ? this.minScrollY : pos.top  < this.maxScrollY ? this.maxScrollY : pos.top
	
				time = time === undefined || time === null || time === 'auto' ? Math.max(Math.abs(this.x-pos.left), Math.abs(this.y-pos.top)) : time
	
				this.scrollTo(pos.left, pos.top, time, easing)
			},
	
			setupFinite : function () {
	
				this.infiniteCache = []
				this.infiniteDataLength = 0
				this.datasetInfiniteLock = false
	
				this.minScrollX = 0
				this.minScrollY = 0
	
				this.turnoverTimes = 0
			},
	
			setupInfinite : function () {
				this.scrollerHeight = 0
	
				this.infiniteCache = []
				this.infinitePhase = 0
				this.infiniteMaxPhase = 0
				this.infiniteContentWidth = 0
				this.infiniteContentHeight = 0
				this.infiniteContentPos = [0, 0]
				this.infiniteContentCenter = 0
				this.infiniteContainerCenter = 0
				this.infiniteElementsEdge = [0, 0]
				this.infiniteElementsPos = []
				this.infiniteUpdatePos = []
				this.infiniteDataLength = 0
				this.datasetInfiniteLock = false
	
				this.minScrollX = 0
				this.minScrollY = 0
	
				this.turnoverTimes = 0
			},
	
			resetInfinite : function () {
				if ( !this.infiniteElements ) this._initInfinite()
	
				this.infiniteElements.each(function (key, element) {
					this.setInfiniteDataFiller(element, element._phase)
				}, this)
	
				this.scrollTo(0, 0)
	
				this.setupInfinite()
				this.reorderInfinite()	
			},
	
			// 加载数据回调
	
			datasetInfinite : function (callback) {
	
				if ( this.datasetInfiniteLock === true ) {
					this._execEvent('infinitedataend')
	
					return
				}
	
				var that = this
				var start = this.infiniteCache.length
				var turnover = this.turnoverTimes
	
				// ajax lock
	
				this.datasetInfiniteLock = true
	
				// getInfiniteDataset
	
				this.getInfiniteDataset.call(this, start, turnover, function (data, end) {
	
					/*
						data [type : Array]
						datasetInfinite.lock: 数据加载完毕，不再尝试更新
					*/
	
					if ( (!data || !data.length) || (that.turnoverTimes > that.options.maxPage) ) {
						that._execEvent('infinitedataend')
						that.datasetInfiniteLock = true
	
						return
					}
	
					that.turnoverTimes++
	
					// 如果数据未至最后
	
					if ( !end ) {
	
						// open lock
	
						that.datasetInfiniteLock = false
					}
	
					// infiniteDataLoaded
					
					that._execEvent('infinitedataready')
	
					// 更新数据缓存
	
					that.updateInfiniteData(start, data)
	
					// 如果first
					
					that._execEvent('infinitedataloaded')
	
					// 修改滚动位置
					
					that._execEvent("modify")
	
					callback && callback.call(that)
	
					// 数据结束
	
					if ( end ) {
						that._execEvent('infinitedataend')
						that.datasetInfiniteLock = true
					}
				})
			},
	
			checkInfiniteDataBuffer : function () {
	
				// 数据缓冲不足
	
				if ( !this.datasetInfiniteLock && this.infiniteSurplusBuffer <= this.options.infiniteCacheBuffer ) {
					this.datasetInfinite()
				}
			},
	
			detectInfiniteBalance : function (trend) {
	
				if ( this.broken || this.moving ) return 0
				if ( trend == 1 && this.infinitePhase < this.infiniteLength ) return -1
				if ( trend == 1 && this.y > -this.wrapperHeight && this.infinitePhase == this.infiniteLength ) return 0
	
				// 记录中心位置
	
				this.infiniteContainerCenter = -this.y + this.wrapperHeight / 2
	
				// 记录内容中心位置
	
				this.infiniteContentCenter = this.infiniteContentPos[0] + this.infiniteContentHeight / 2
	
				// 中心偏离
				
				return this.infiniteContentCenter - this.infiniteContainerCenter - trend * this.wrapperHeight
			},
	
			// TO-DO: clean up the miss
	
			reorderInfinite : function (callback) {
	
				if ( this.updating ) {
					return this.infiniteContentPos = [0, 0]
				}
	
				// 滚动内容高度
	
				this.infiniteContentHeight = this.infiniteContentPos[1] - this.infiniteContentPos[0]
	
				// 剩余容量
	
				this.infiniteSurplusBuffer = this.infiniteDataLength - this.infinitePhase
	
				// 检测剩余容量
	
				this.checkInfiniteDataBuffer()
	
				// 如果没有数据，停止排序
	
				if ( this.infiniteDataLength === 0 ) return
	
				// 重新排序
	
				this.rearrangeInfinite(this.directionY || 1, callback)
			},
	
			rearrangeInfinite : function (supplement, callback) {
	
				if ( this.infiniteRearranging ) return
	
				var that = this
				  , item
				  , pos
				  , size
				  , phase
				  , index
				  , round
				  , i = 0
				  , limit = Math.min(this.infiniteLength, this.infiniteDataLength) / 2
				  
				// lock
	
				this.infiniteRearranging = true
	
				function end (end) {
	
					that.infiniteRearranging = false
	
					// updateInfinitePos
					
					that.updateInfinitePos()
	
					// callback
					
					callback && callback.call(that)
					
					if ( end ) {
						that._execEvent('infinitecachedend')
					}
				}
	
				function subStep () {
					/*
						if > 如果缓冲不足 或者 初始化
						detectInfiniteBalance: 上下缓冲平衡检测 and 初始化
						infinitePhase: 当前step id
						infiniteLength: 循环数量
					*/
	
					if ( that.detectInfiniteBalance(1) >= 0 ) return end()
	
					// infiniteSurplusBuffer: 过剩的缓存数据
	
					that.infiniteSurplusBuffer = that.infiniteDataLength - that.infinitePhase
	
					// 如果数据全部展示完毕则停止
	
					if ( that.infiniteSurplusBuffer <= 0 ) return end(1)
	
					// 当前操作data序列
	
					phase = that.infinitePhase++
	
					// 当前操作dom序列
	
					index = phase % that.infiniteLength
	
					// 循环序列
	
					round = Math.max((phase + 1 - that.infiniteLength) % that.infiniteLength, 0)
					
					// set item
	
					item = that.infiniteElements[index]
					item._index = index
					item.__phase = item._phase || 0
					item._phase = phase
	
					// update item content
	
					that.updateInfiniteContent(item)
	
					// content item size
	
					size = that.infiniteItemSize || item._offsetHeight
	
					// infinite of content border top and bottom pos
	
					pos = that.infiniteContentPos[1]
	
					// update item pos
	
					that.promiseInfinitePos(item, pos)
	
					// mark item pos
	
					that.infiniteElementsPos[index] = [pos, pos + size]
					
					// update infinite of content border top and bottom pos
	
					that.infiniteElementsEdge = [round, index]
					that.infiniteContentPos[0] = that.infiniteElementsPos[round][0]
					that.infiniteContentPos[1] += size
	
					// update maxScrollY and scrollerHeight
	
					that.refreshInfinitePos(phase, pos + size)
	
					// limit
	
					i++
	
					// while
	
					if ( that.updating ) {
						subStep()
					} else {
						rAF(subStep)
					}
				}
	
				function supStep () {
					/*
						if > 如果缓冲不足
						detectInfiniteBalance: 上下缓冲平衡检测
						infinitePhase: 当前step id
						infiniteLength: 循环数量
					*/
					
					if ( that.detectInfiniteBalance(-1) <= 0 ) return end()
	
					// ignore init phase
	
					if ( that.infinitePhase - that.infiniteLength <= 0 ) return end()
	
					// step phase
	
					phase = --that.infinitePhase
	
					// dom of index id
	
					index = phase % that.infiniteLength
	
					// dom of round id
	
					round = (phase - 1) % that.infiniteLength
	
					// set item
	
					item = that.infiniteElements[index]
					item._index = index
					item.__phase = item._phase
					item._phase = phase - that.infiniteLength
	
					// update item content
	
					that.updateInfiniteContent(item)
	
					// content item size
	
					size = that.infiniteItemSize || item._offsetHeight
	
					// infinite of content border top and bottom pos
	
					pos = that.infiniteContentPos[0] - size
	
					// update item content
	
					that.promiseInfinitePos(item, pos)
	
					// mark item pos
	
					that.infiniteElementsPos[index] = [pos, pos + size]
	
					// update infinite of content border top and bottom pos
	
					that.infiniteElementsEdge = [index, round]
					that.infiniteContentPos[0] -= size
					that.infiniteContentPos[1] = that.infiniteElementsPos[round][1]
	
					// update minScrollY and scrollerHeight
	
					if ( item._phase === 0 || pos < that.minScrollY ) {
						that.minScrollY = -pos
					}
	
					// limit
	
					i++
	
					// while
	
					if ( that.updating ) {
						supStep()
					} else {
						rAF(supStep)
					}
				}
	
				switch (supplement) {
					case 1:
						if ( this.updating ) {
							subStep()
						} else {
							rAF(subStep)
						}
					break
	
					case -1:
						if ( this.updating ) {
							supStep()
						} else {
							rAF(supStep)
						}
					break
				}
				
			},
	
			addInfiniteElements : function () {
				var item = document.createElement('infinite')
	
				this.scroller.appendChild(item)
				this.infiniteElements.push(item)
				this.infiniteLength = this.infiniteElements.length
			},
	
			refreshInfinitePos : function (phase, pos) {
	
				phase = phase + 1
	
				// 如果增量没有超出或者不进行强制更新位置
	
				if ( phase < this.infiniteMaxPhase ) return
	
				// 如果还有缓存数据，则增加两倍视图高度的虚拟缓冲区
	
				this.scrollerHeight = pos + (this.infiniteSurplusBuffer - 1) * (pos / phase)
				this.maxScrollY = Math.min(this.wrapperHeight - this.scrollerHeight, this.minScrollY)
	
				// 数据剩余为0或每十次循环刷新一次滚动条
	
				if ( this.infiniteSurplusBuffer === 1 || phase % (this.infiniteLength * this.options.scrollbarAccuracy) === 0 ) {
					this._execEvent("modify")
				}
	
				this.infiniteMaxPhase = phase
			},
	
			refreshInfiniteAllPos : function (start) {
				var i = start || 0,
					l = this.infiniteLength,
					minPhase = this.infiniteElementsEdge[0],
					index,
					item,
					pos,
					size,
					supplement,
					contentHeight = this.infiniteContentPos[1] - this.infiniteContentPos[0]
	
				this.infiniteContentPos[1] = this.infiniteContentPos[0]
	
				for (; i < l; i++) {
					index = (minPhase + i) % this.infiniteLength
					item = this.infiniteElements[index]
					size = item.offsetHeight
	
					// _offsetHeight
	
			    	item._offsetHeight = size
	
					pos = this.infiniteContentPos[1]
					this.promiseInfinitePos(item, pos)
	
					this.infiniteElementsPos[index] = [pos, pos+size]
	
					this.infiniteContentPos[1] += size
				}
	
				this.updateInfinitePos()
	
				// item改变后总高度变化
	
				supplement = this.infiniteContentPos[1] - this.infiniteContentPos[0] - contentHeight
	
				// 修正最大滚动高度受内容改变的影响
	
				this.scrollerHeight += supplement
				this.maxScrollY = Math.min(this.wrapperHeight - this.scrollerHeight, 0)
	
				this._execEvent("modify")
			},
	
			promiseInfinitePos : function (item, pos) {
				this.infiniteUpdatePos.push(arguments)
			},
	
			setInfiniteTranslate : function (item, pos) {
				
				// set item pos
	
				item.style[BROWSER.prefixStyle.transform] = 'translate3d(0px, ' + pos + 'px, 0px)'
			},
	
			updateInfinitePos : function () {
				var that = this
	
				// 可插入贞时排布
				
				rAF(function () {
					that.infiniteUpdatePos.each(function (i, args) {
						that.setInfiniteTranslate.apply(that, args)
					})
					that.infiniteUpdatePos = []
				})
			},
	
			updateInfiniteContent : function (item) {
				/**
			    * dataFiller
			    * @param  element {Object} replace box
			    * @param  index {Number} cur index
			    * @param  oldindex {Number} pre index
			    */
			    
			    item.style[BROWSER.prefixStyle.transform] = 'translate3d(-10000px, -10000px, 0px)'
			    this.getInfiniteDataFiller.call(this, item, item._phase, item.__phase)
	
			    // _offsetHeight
	
			    item._offsetHeight = item.offsetHeight
			},
	
			updateInfiniteData : function (start, data, clear) {
				var that = this
	
				data.each(function (i, scope) {
					that.infiniteCache[start++] = scope
	
					// finite 时全部渲染
					
					if ( that.options.finite ) {
						that.getFiniteCacheBuffer.call(that, scope, start - 1)
					}
				})
	
				// 当前数据总数
				
				this.infiniteDataLength = start
			},
	
			updateInfiniteCache : function (index) {
				return this.getInfiniteCacheBuffer.call(this, this.infiniteCache[index], index)
			},
	
			update : function (callback, keep) {
				this.updating = true
	
				if ( !keep ) {
					this.updated = true
					this.datasetInfiniteLock = false
	
					if ( this.options.finite ) {
						this.setupFinite()
					} else {
						this.setupInfinite()
					}
				} else {
					this.updated = false
				}
	
				this.datasetInfinite(function () {
	
					// finite 时将frag放入视图
				
					if ( this.options.finite ) {
						if ( !keep ) this.scroller.innerHTML = null
						this.scroller.appendChild(this.finiteFragment)
						this.updating = false
					} else {
						this.rearrangeInfinite(1, function () {
							this.updateInfinitePos()
							this.updating = false
						})
					}
	
					callback && callback.call(this)
				})
			}
		}
	
		!(function (proto) {
			proto.extendProperties({
				_execEvent : function (type) {
		        	var that = this,
		        		args = arguments,
		        		events = this._events[type]
	
		            if ( !events ) return
	
		        	for (var i = events.length - 1; i >= 0; i--) {
		        		events[i].apply(that, [].slice.call(args, 1))
		        	}
				},
	
				_refresh : function () {
					var wrapperRect = METHOD.getRect(this.wrapper)
					var scrollerRect = METHOD.getRect(this.scroller)
	
					this.wrapperWidth	= wrapperRect.clientWidth
					this.wrapperHeight	= wrapperRect.clientHeight
					
					// infinite 模式时高度为虚拟值
					
					if ( !this.options.infinite ) {
						this.scrollerWidth	= Math.round(scrollerRect.width * this.scale)
						this.scrollerHeight	= Math.round(scrollerRect.height * this.scale)
	
						this.minScrollX = this.options.minScrollX || 0
						this.minScrollY = this.options.minScrollY || 0
					}
	
					// 最大滚动范围
	
					this.maxScrollX		= this.wrapperWidth - this.scrollerWidth - this.minScrollX
					this.maxScrollY		= this.wrapperHeight - this.scrollerHeight - this.minScrollY
	
					// 事件滚动情况
	
					this.canHorizontalScroll = this.maxScrollX < this.minScrollX
					this.canVerticalScroll   = this.maxScrollY < this.minScrollY
					
					// 重设滚动方向
					
					this.hasHorizontalScroll	= this.options.scrollX == 'auto' ? this.canHorizontalScroll : this.options.scrollX
					this.hasVerticalScroll		= this.options.scrollY == 'auto' ? this.canVerticalScroll : this.options.scrollY
	
					// infinite 模式 始终保持纵向
					
					if ( this.options.infinite ) {
						this.hasVerticalScroll = true
					}
	
					// 无横向滚动时
					
					if ( !this.hasHorizontalScroll ) {
						this.maxScrollX = this.minScrollX
						this.scrollerWidth = this.wrapperWidth
					}
	
					// 无纵向滚动时
	
					if ( !this.hasVerticalScroll ) {
						this.maxScrollY = this.minScrollY
						this.scrollerHeight = this.wrapperHeight
					}
	
					this.endTime = 0
					this.directionX = 0
					this.directionY = 0
	
					this.wrapperOffset = METHOD.offset(this.wrapper)
	
					this._execEvent('refresh')
					this.resetPosition()
				},
	
				_call : function (callback) {
					callback.call(this)
				},
	
				_drawing : function (callback) {
					var that = this
					rAF(function () {
						that._drawKeyFrame.call(that, callback || noop)
					})
				},
	
				_clearKeyFrame : function () {
					this._keyFrame = []
				},
	
				/**
				 * 关键帧promise
				 * @param  {String} property style-property
				 * @param  {Array}  value    style-value   
				 */
				_promiseKeyFrame : function (property, value, join) {
			  		var fs = this._keyFrame
			  		var style = {}
	
					// push to queue
					
					if ( join ) {
						var tail = fs[fs.length-1]
	
						if ( tail ) {
							tail[property] = value
	
							return
						}
					}
	
					style[property] = value
	
					fs.push(style)
				},
	
				_drawKeyFrame : function (callback) {
	
					// shift queue
						
					var frame = this._keyFrame.shift()
					
					// end
					
					if ( !frame ) return callback.call(this)
	
					// apply style
	
					for (var key in frame) {
						this['_' + key].apply(this, frame[key])
					}
	
					// requestAnimationFrame
					
					this._drawing()
				},
	
				_translate : function (x, y, z, s, v) {
					/**
					 * 下一贞位置
					 * 没有位置数据，设位置为下一位置贞
					 */
					if ( x == null ) {
						s = this.getComputedPosition()
						x = s.x + this.dropX
						y = s.y + this.dropY
						s = null
	
						if ( isNaN(x) ) return
					}
	
					x = x || 0
					y = y || 0
					z = z || 0
					s = s || this.options.zoom ? this.scale : null
	
					if ( x === this.x && y === this.y && z === this.z && s === this.s ) return
	
					this.scrollerStyle[BROWSER.prefixStyle.transform] = 'translate3d(' + x + 'px' + ',' + y + 'px' + ', ' + z + 'px' + ')' + (s ? ' scale(' + s + ')' : '')
	
					this.x = x
					this.y = y
					this.z = z
					this.s = s
	
					if ( !v ) {
						this._x = x
						this._y = y
					}
	
					if ( this.indicators ) {
						for ( var i = this.indicators.length; i--; ) {
							this.indicators[i].updatePosition()
						}
					}
				},
	
				_transitionTime : function (time) {
	
					if ( time === this.transitionDuration ) return
	
					this.scrollerStyle[BROWSER.prefixStyle.transitionDuration] = time ? time + 'ms' : ''
	
					this.transitionDuration = time
	
					if ( this.indicators ) {
						for ( var i = this.indicators.length; i--; ) {
							this.indicators[i].transitionTime(time)
						}
					}
	
				},
	
				_transformOrigin : function (postion) {
					this.scrollerStyle[BROWSER.prefixStyle.transformOrigin] = postion || this.options.zoomOrigin
				},
	
				_transitionTimingFunction : function (easing) {
					easing = easing || ''
	
					if ( easing === this.transitionTimingFunction ) return
	
					this.scrollerStyle[BROWSER.prefixStyle.transitionTimingFunction] = easing
					this.transitionTimingFunction = easing
	
					if ( this.indicators ) {
						for ( var i = this.indicators.length; i--; ) {
							this.indicators[i].transitionTimingFunction(easing)
						}
					}
	
				},
	
				_transitionScroll : function (x, y, time) {
					var that = this
	
					// useTransition 的scroll事件
	
					function step () {
	
						if ( !that.isInTransition ) return
						if ( Date.now - that.transitionStartTime > 2 * that.transitionCountTime ) return that._execEvent('scrollend', 'end')
	
						var pos = that.getComputedPosition()
	
						// lost rate
	
						that.dropX = Math.round(pos.x - that.x) || that.dropX || 0
						that.dropY = Math.round(pos.y - that.y) || that.dropY || 0
	
						that.x = Math.round(pos.x)
						that.y = Math.round(pos.y)
						
						that._execEvent('scroll', 'scrolling')
	
						rAF(step)
					}
	
					step()
				},
	
				_checkPerformance : function () {
					this.transitionDelayTime = -this._transitionTimeLeft()
					this.transitionDelayRate = this.transitionDelayTime / this.transitionCountTime
	
					if ( this.transitionDelayRate > 0.15 ) {
						application.console.warn('滚动性能过低，总延迟为' + this.transitionDelayTime + 'ms', '性能警告', '延迟率为' + this.transitionDelayRate)
						application.console.warn('减除无必要的滚动事件绑定', '性能建议', '延迟率应小于0.15')
					}
				},
	
				_transitionTimeLeft : function () {
					return Math.max(this.transitionCountTime - (Date.now() - this.transitionStartTime), 0)
				},
	
				_transitionEnd : function (e) {
					if ( e.target != this.scroller || !this.isInTransition ) return
	
					this._transitionTime()
					this._checkPerformance()
	
					// css3 动画无效自动切换, weixin webview bug
	
					if ( BROWSER.supportTransition && this.transitionDelayTime < 0 ) {
						this.options.useTransition = false
	
						// 设备标记不支持动画过渡
	
						BROWSER.supportTransition = false
						device.feat.supportTransition = false
					}
	
					// 非边缘弹性时进行end
	
					if ( !this.resetPosition(this.options.bounceTime) ) {
						this.isInTransition = false
						this._promiseKeyFrame('translate', [this.x, this.y], true)
						this._drawing()
						this._execEvent('scrollend', 'end')
					}
	
					// drawingEnd
	
					this.drawingEnd()
				},
	
				_animate : function (destX, destY, duration, easingFn) {
					var that = this,
						startX = this._x,
						startY = this._y,
						now = Date.now(),
						fs = 1000/60,
						startTime = now - fs,
						destTime = startTime + duration
	
					if ( this.isAnimating ) return
	
					function step () {
						var timestamp = Date.now(),
							stepTime = timestamp - startTime,
							newX, newY,
							easing
	
						if ( timestamp >= destTime ) {
							that.isAnimating = false
							that._translate(destX, destY)
	
							that._checkPerformance()
							
							if ( !that.resetPosition(that.options.bounceTime) ) {
								that._execEvent('scrollend', 'end')
							}
	
							return
						}
	
						easing = easingFn(stepTime / duration)
						newX = ( destX - startX ) * easing + startX
						newY = ( destY - startY ) * easing + startY
						that._translate(Math.round(newX), Math.round(newY))
	
						if ( that.isAnimating ) rAF(step)
						
						that._execEvent('scroll', 'scrolling')
					}
	
					this.isAnimating = true
	
					step()
				},
	
				/**
				 * 惯性甩出计算
				 * @param  {Number} current    
				 * @param  {Number} start       
				 * @param  {Number} time        
				 * @param  {Number} upperMargin 
				 * @param  {Number} lowerMargin 
				 * @param  {Number} wrapperSize 
				 * @return {Number}             
				 */
				_momentum : function (current, start, time, upperMargin, lowerMargin, wrapperSize) {
					var speed, distance, distances, direction, duration, destination, deceleration
					
					distances = current - start,
					direction = distances < 0 ? -1 : 1
					speed = Math.min(Math.abs(distances) * DPR / time, this.options.speedLimit)
					speed = this.speedM == undefined ? speed : Math.min(this.speedM * DPR, speed)
					deceleration = Math.max(this.options.deceleration - this.acceleration, 0.003)
					distance = speed * speed / deceleration / DPR / 2 * direction
					duration = speed / deceleration * this.options.speedRate
					destination = current + distance
	
					if ( destination < lowerMargin ) {
						destination = wrapperSize ? lowerMargin - (wrapperSize * this.options.boundariesLimit * (speed / dP(8))) : lowerMargin
						distance = Math.abs(destination - current)
						duration = distance / speed
					} else if ( destination > upperMargin ) {
						destination = wrapperSize ? wrapperSize * this.options.boundariesLimit * (speed / dP(8)) : 0
						distance = Math.abs(current) + destination
						duration = distance / speed
					}
	
					return {
						destination: Math.round(destination),
						duration: duration,
						speed: speed
					}
				},
	
				/**
				 * 重力加速度
				 * @param  {Number} scrollTrendX
				 * @param  {Number} scrollTrendY
				 */
				_acceleration : function () {
	
					// 两次连续滚动且两次滚动方向一致则重力加速
						
					if ( this.isScrolling() && this.scrollTrendY != -1 && this.scrollTrendX != -1 ) {
						if ( this.gapTime < 1000 ) {
							this.acceleration = Math.min(this.acceleration + 0.0005, 0.001)
						} else {
							this.acceleration = Math.min(this.acceleration - 0.0005, 0)
						}
					} else {
						this.acceleration = 0
					}
				},
	
				_observer : function (element, callback) {
					var that = this
					var timeid
	
					element.observer({
	                    childList: true,
	                    subtree: true,
	                    characterData: true,
	                    attributeFilter: ["id", "class", "style", "src", "width", "height"]
					}, function (records) {
						clearTimeout(that.observerTimeout)
						if ( records.length ) {
							that.observerTimeout = setTimeout(function () {
								callback.call(that, records)
							}, 300)
						}
					})
				},
	
				_resize : function () {
					var that = this
	
					clearTimeout(this.resizeTimeout)
	
					this.resizeTimeout = setTimeout(function () {
						that.refresh()
					}, this.options.resizePolling)
				},
	
				_directionLocked : function (absDistX, absDistY, deltaX, deltaY) {
	
					// We need to move at least 10 pixels for the scrolling to initiate
	
					if ( this.broken === false && this.moveTime - this.endTime > 200 && (absDistX < dP(10) && absDistY < dP(10)) ) return
	
					// If you are scrolling in one direction lock the other
	
					if ( this.options.directionLockThresholdX ) {
						if ( absDistX > absDistY + dP(this.options.directionLockThresholdX) ) {
							this.directionLocked = 'h'
						} else {
							this.directionLocked = 'v'
						}
					}
	
					if ( this.options.directionLockThresholdY ) {
						if ( absDistY > absDistX + dP(this.options.directionLockThresholdY) ) {
							this.directionLocked = 'v'
						} else {
							this.directionLocked = 'h'
						}
					}
	
					if ( !this.directionLocked && !this.options.freeScroll ) {
						if ( absDistX > absDistY + dP(this.options.directionLockThreshold) ) {
							this.directionLocked = 'h'
						} else if ( absDistY >= absDistX + dP(this.options.directionLockThreshold) ) {
							this.directionLocked = 'v'
						} else {
							this.directionLocked = 'n'
						}
					}
	
					if ( this.directionLocked == 'h' ) {
						if ( this.options.eventPassthrough == 'vertical' ) {
							e.preventDefault()
						} else if ( this.options.eventPassthrough == 'horizontal' ) {
							this.initiated = false
							return
						}
	
						deltaY = 0
					} else if ( this.directionLocked == 'v' ) {
						if ( this.options.eventPassthrough == 'horizontal' ) {
							e.preventDefault()
						} else if ( this.options.eventPassthrough == 'vertical' ) {
							this.initiated = false
							return
						}
	
						deltaX = 0
					}
	
					return { x: deltaX, y : deltaY }
				},
	
		        _initPrevant : function () {
					this.scroller.on('preventscroll', function (e) {
						var scroll = e.data.scroll
						var prevent = e.data.prevent
	
						this.preventscroll = prevent
						
						if ( prevent ) this._execEvent('scrollend', 'end')
	
						if ( scroll.options.coverPropagation && this.isScrolling() ) {
							scroll.stopAnimation = true
							this.preventscroll = false
						}
	
					}.bind(this))
				},
	
				_pieceEvent : function (e) {
					/**
		        	 * 两次的事件类型检测
		        	 * @type {[type]}
		        	 */
					return METHOD.eventType[e.type] === this.initiated
				},
	
				_preventscroll : function (prevent) {
					this.wrapper.trigger('preventscroll', { prevent : prevent, scroll : this })
				},
	
		        _prevent : function (e, order, x, y, ex, ey) {
		        	var prevent = false
	
		        	x = Math.round(x || this._x)
		        	y = Math.round(y || this._y)
	
		        	// enabled
		        	
		        	if ( !this.enabled ) return true
	
					switch ( order ) {
		        		case 1:
		        			if ( this.initiated && !this._pieceEvent(e) ) return true
	
		        			this.preventscroll = false
		        			this.stopAnimation = false
	
							// React to left mouse button only
							
							if ( METHOD.eventType[e.type] != 1 ) {
	
							  	// for button property
							  
							  	var button
						    
							    if ( !e.which ) {
							      
							      	/* IE case */
							      
							      	button = (e.button < 2) ? 0 :
							               	((e.button == 4) ? 1 : 2)
							    } else {
	
							      	/* All others */
							      
							      	button = e.button
							    }
	
								if ( button !== 0 ) {
									return true
								}
							}
	
							break
						case 2:
							if ( !this._pieceEvent(e) ) return true
							if ( this.preventscroll ) return true
	
							break
						case 3:
							if ( !this._pieceEvent(e) ) return true
							if ( e.touches && e.touches.length > 0 ) return true
							
							break
						case 4:
							this.preventscroll = false
	
							break
						case 5:
							e.preventDefault()
							if ( this.preventscroll ) return true
	
							break
						case 6:
	
							break
		        	}
	
	
		        	// preventDefault
					
					if ( this.options.preventDefault && [1,3].consistOf(order) && e.changedTouches && !App.preventDefaultException(e, this.options.preventDefaultException) ) {
						e.preventDefault()
					}
	
					// stopPropagation
	
					if ( this.options.stopPropagation != false ) {
						if ( [2,5].consistOf(order) ) {
							if ( this.options.stopPropagation == true ) {
								e.stopPropagation()
							} else {
								if ( 
									this.options.stopPropagation == "auto"
									&&
									((this.canHorizontalScroll && this.directionLocked == 'h' && !(x >= this.minScrollX || x <= this.maxScrollX)) 
									||
									(this.canVerticalScroll && this.directionLocked == 'v' && !(y >= this.minScrollY || y <= this.maxScrollY)))
								) {
									prevent = true
								}
	
								if ( this.options.stopPropagation == "x" && Math.abs(ex) > Math.abs(ey) ) {
									prevent = true
								} else if ( this.options.stopPropagation == "y" && Math.abs(ey) > Math.abs(ex) ) {
									prevent = true
								}
	
								this._preventscroll(prevent)
	
								// 限制地性能设备的动画线程和边远弹性
							
								if ( this.options.coverPropagation ) {
									if ( order == 1 && this.stopAnimation ) return true					
								}
							}
						}
					}
	
		        	return false
		        },
	
				_start : function (e) {
					
					if ( this._prevent(e, 1) ) return
	
					var point = e.touches ? e.touches[e.touches.length - 1] : e
	
					this.initiated	= METHOD.eventType[e.type]
					this.moved		= false
					this.moving     = false
					this.broken     = false
					this.holding    = true
					this.distX		= 0
					this.distY		= 0
					this.moveTrendX = 0
					this.moveTrendY = 0
					this.directionX = 0
					this.directionY = 0
					this.directionLocked = 0
	
					this._clearKeyFrame()
	
					if ( this.options.useTransition && this.isInTransition ) {
	
						/*
							=== 动画终止锁定 ===
							锁定防止被 scrolling 刷新位置 
							重要－置顶处理
						*/
	
						this.broken = true
						this.isInTransition = false
	
						this._promiseKeyFrame('translate', [null, null, null, null])
						this._promiseKeyFrame('transitionTime', null, true)
	
						/*
							动画积压bug
							当前置动画未执行完时，元素被设置了新的动画，0ms暂停无效时
							后置的动画会积压到gpu内存中，因前置动画时间结束才能被释放
							此时gpu内存则可能溢出，导致gpu性能直线下降，此处采用0.0001ms
							动画进行快速释放gpu内存
						*/
	
						if ( BROWSER.isBadTransition ) {
	
							// 针对 0ms停止无效 做处理
	
							this._promiseKeyFrame('transitionTime', [0.0001], true)
						}
	
						// clear TimingFunction
					
						this._promiseKeyFrame('transitionTimingFunction', null, true)
						this._drawing()
	
						// 动画时间清零
	
						this._execEvent('scrollend', "break")
				
					} else if ( !this.options.useTransition && this.isAnimating ) {
						this.broken = true
						this.isAnimating = false
						this._execEvent('scrollend', "break")
					}
	
					// startTime
					
					this.startTime = Date.now()
	
					this.startX    = this.x
					this.startY    = this.y
					this.absStartX = this.x
					this.absStartY = this.y
					this.pointX    = point.pageX
					this.pointY    = point.pageY
	
					this._execEvent('beforescrollstart', 'hold')
				},
	
				_move : function (e) {
	
					if ( this._prevent(e, 2) ) return
	
					var point		= e.touches ? e.touches[e.touches.length - 1] : e,
						delta       = 0,
						deltaX		= point.pageX - this.pointX,
						deltaY		= point.pageY - this.pointY,
						timestamp	= Date.now(),
						movedTime   = Math.min(timestamp - this.movedTimestamp, 300),
						newX, newY,
						absDistX, absDistY,
						directionX, directionY
	
					
					// 当前Touch move 时间
					
					this.moveTime = timestamp
					
					// 当前移动方向
					
					directionX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0
					directionY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0
					
					// move 偏移值
	
					deltaX = Math.min(Math.abs(deltaX), this.options.stepLimit) * -directionX
					deltaY = Math.min(Math.abs(deltaY), this.options.stepLimit) * -directionY
	
					this.pointX		= point.pageX
					this.pointY		= point.pageY
	
					this.distX		+= Math.round(deltaX)
					this.distY		+= Math.round(deltaY)
					absDistX		= Math.abs(this.distX)
					absDistY		= Math.abs(this.distY)
	
					this.speedX     = Math.abs(deltaX) / movedTime
					this.speedY     = Math.abs(deltaY) / movedTime
					this.speedM     = Math.max(this.speedX, this.speedY)
	
					this.bounceDragPhase++
	
					delta = this._directionLocked(absDistX, absDistY, deltaX, deltaY)
	
					if ( !delta ) return
	
					deltaX = this.hasHorizontalScroll ? delta.x : 0
					deltaY = this.hasVerticalScroll ? delta.y : 0
	
					newX = this._x + deltaX
					newY = this._y + deltaY
	
					// Slow down if outside of the boundaries
	
					if ( newX > this.minScrollX || newX < this.maxScrollX ) {
						this.bounceDragPhase++
						newX = this.options.bounce ? this._x + deltaX / (this.options.bounceDrag + this.bounceDragPhase / this.options.bounceDragRate) : newX > this.minScrollX ? this.minScrollX : this.maxScrollX
					}
					if ( newY > this.minScrollY || newY < this.maxScrollY ) {
						this.bounceDragPhase++
						newY = this.options.bounce ? this._y + deltaY / (this.options.bounceDrag + this.bounceDragPhase / this.options.bounceDragRate) : newY > this.minScrollY ? this.minScrollY : this.maxScrollY
					}
	
					this.moveTrendX = this.hasHorizontalScroll ? (this.directionX == directionX ? 1 : -1) : 0
					this.moveTrendY = this.hasVerticalScroll ? (this.directionY == directionY ? 1 : -1) : 0
	
					// 反向趋势时清除关键帧
	
					if ( this.moveTrendX == -1 || this.moveTrendY == -1 ) {
						this._clearKeyFrame()
					}
	
					this.directionX = directionX
					this.directionY = directionY
	
	
					if ( this._prevent(e, 2, newX, newY, delta.x, delta.y) ) return
	
					// 是否有效的move
	
					if ( this._x !== newX || this._y !== newY ) {
						if ( !this.moved ) {
							this._execEvent('scrollstart')
	
							// startTime 防止事件造成延时过长
	
							this.startTime = Date.now()
						}
	
						this.moved = true
						this.moving = true
						this.broken = false
						this.holding = false
	
						this._x = newX
						this._y = newY
						
						this._promiseKeyFrame('translate', [newX, newY, null, null, true])
						this._promiseKeyFrame('transitionTime', null, true)
						this._drawing()
					}
	
					this.movedTimestamp = timestamp
	
					if ( timestamp - this.startTime > 300 ) {
						this.startTime = timestamp
						this.startX = this._x
						this.startY = this._y
	
						return this._execEvent('scroll', 'movestep')
					}
					
					this._execEvent('scroll', 'moving')
				},
	
				_end : function (e) {
	
					if ( this._prevent(e, 3) ) return
	
					var changedTouches = e.changedTouches ? e.changedTouches.length : 0,
						point = changedTouches ? e.changedTouches[changedTouches] : e,
						momentumX,
						momentumY,
						duration = Date.now() - this.startTime,
						newX = Math.round(this._x),
						newY = Math.round(this._y),
						stepX = newX - this.startX,
						stepY = newY - this.startY,
						distanceX = Math.abs(stepX),
						distanceY = Math.abs(stepY),
						directionX = stepX > 0 ? -1 : stepX < 0 ? 1 : 0,
						directionY = stepY > 0 ? -1 : stepY < 0 ? 1 : 0,
						time = 0,
						easing = ''
	
					this.moving = false
					this.isInTransition = false
					this.initiated = 0
					this.gapTime = Date.now() - this.endTime
					this.endTime = Date.now()
	
					// reset if we are outside of the boundaries
	
					if ( this.resetPosition(this.options.bounceTime) ) return
	
					// we scrolled less than 10 pixels
	
					if ( !this.moved && !this.options.snap ) return this._execEvent('scrollcancel')
		
					// start momentum animation if needed
	
					if ( this.options.momentum && duration < 300 ) {
						momentumX = this.hasHorizontalScroll ? this._momentum(this._x, this.startX, duration, this.minScrollX, this.maxScrollX, this.options.bounce && this.options.bounceBreakThrough ? this.wrapperWidth : 0) : { destination: newX, duration: 0 }
						momentumY = this.hasVerticalScroll ? this._momentum(this._y, this.startY, duration, this.minScrollY, this.maxScrollY, this.options.bounce && this.options.bounceBreakThrough ? this.wrapperHeight : 0) : { destination: newY, duration: 0 }
						newX = momentumX.destination
						newY = momentumY.destination
						time = Math.max(momentumX.duration, momentumY.duration)
	
						this.speed = Math.max(momentumX.speed || 0, momentumY.speed || 0)
	
						this.isInTransition = true
					}
	
					if ( this.options.snap ) {
						var snap = this._nearestSnap(newX, newY)
						this.currentPage = snap
						time = this.options.snapDuration || Math.max(
								Math.max(
									Math.min(Math.abs(newX - snap.x), 1000),
									Math.min(Math.abs(newY - snap.y), 1000)
								), 300)
						newX = snap.x
						newY = snap.y
	
						this.directionX = 0
						this.directionY = 0
						easing = this.options.snapEasing
					}
	
					if ( newX != this._x || newY != this._y ) {
	
						// change easing function when scroller goes out of the boundaries
	
						if ( newX > this.minScrollY || newX < this.maxScrollX || newY > this.minScrollY || newY < this.maxScrollY ) {
							easing = EASEING.quadratic
						}
	
						this.scrollTrendX = this.hasHorizontalScroll ? (this._directionX == directionX ? 1 : -1) : 0
						this.scrollTrendY = this.hasVerticalScroll ? (this._directionY == directionY ? 1 : -1) : 0
	
						this._acceleration()
	
						// direction 手指的每次走向记录
	
						this.directionX = directionX
						this.directionY = directionY
						this._directionX = directionX
						this._directionY = directionY
	
						this.moved = false
						this.moving = false
	
						this.scrollTo(newX, newY, time, easing)
						
						return
					}
	
					// def event
	
					this._execEvent('scrollend', 'end')
				},
	
				_zoomStart : function (e) {
					var c1 = Math.abs( e.touches[0].pageX - e.touches[1].pageX ),
						c2 = Math.abs( e.touches[0].pageY - e.touches[1].pageY )
	
					this.touchesDistanceStart = Math.sqrt(c1 * c1 + c2 * c2)
					this.startScale = this.scale
	
					this.originX = Math.abs(e.touches[0].pageX + e.touches[1].pageX) / 2 - this.x
					this.originY = Math.abs(e.touches[0].pageY + e.touches[1].pageY) / 2 - this.y
	
					this._execEvent('zoomStart')
				},
	
				_zoom : function (e) {
	
					if ( this._prevent(e, 2) ) return
	
					var c1 = Math.abs( e.touches[0].pageX - e.touches[1].pageX ),
						c2 = Math.abs( e.touches[0].pageY - e.touches[1].pageY ),
						distance = Math.sqrt( c1 * c1 + c2 * c2 ),
						scale = 1 / this.touchesDistanceStart * distance * this.startScale,
						lastScale,
						x, y
	
					this.scaled = true
	
					if ( scale < this.options.zoomMin ) {
						scale = 0.5 * this.options.zoomMin * Math.pow(2.0, scale / this.options.zoomMin)
					} else if ( scale > this.options.zoomMax ) {
						scale = 2.0 * this.options.zoomMax * Math.pow(0.5, this.options.zoomMax / scale)
					}
	
					lastScale = scale / this.startScale
					x = this.originX - this.originX * lastScale + this.startX
					y = this.originY - this.originY * lastScale + this.startY
	
					this.scale = scale
	
					this.scrollTo(x, y, 0)
				},
	
				_zoomEnd : function (e) {
	
					if ( this._prevent(e, 3) ) return
	
					var newX, newY,
						lastScale
	
					this.isInTransition = 0
					this.initiated = 0
	
					if ( this.scale > this.options.zoomMax ) {
						this.scale = this.options.zoomMax
					} else if ( this.scale < this.options.zoomMin ) {
						this.scale = this.options.zoomMin
					}
	
					// Update boundaries
					
					this._refresh()
	
					lastScale = this.scale / this.startScale
	
					newX = this.originX - this.originX * lastScale + this.startX
					newY = this.originY - this.originY * lastScale + this.startY
	
					if ( newX > 0 ) {
						newX = 0
					} else if ( newX < this.maxScrollX ) {
						newX = this.maxScrollX
					}
	
					if ( newY > 0 ) {
						newY = 0
					} else if ( newY < this.maxScrollY ) {
						newY = this.maxScrollY
					}
	
					if ( this._x != newX || this._y != newY ) {
						this.scrollTo(newX, newY, this.options.bounceTime)
					}
	
					this.scaled = false
	
					this._execEvent('zoomEnd')
				},
	
				_wheelZoom : function (e) {
					var wheelDeltaY,
						deltaScale,
						that = this
	
					if ( this.wheelTimeout === undefined ) {
						if ( this._prevent(e, 4) ) return
						that._execEvent('scrollstart')
					}
	
					if ( this._prevent(e, 5) ) return
	
					// Execute the zoomEnd event after 400ms the wheel stopped scrolling
					
					clearTimeout(this.wheelTimeout)
					this.wheelTimeout = setTimeout(function () {
						if ( that._prevent(e, 6) ) return
	
						that._execEvent('zoomEnd')
					}, 400)
	
					if ( 'deltaX' in e ) {
						wheelDeltaY = -e.deltaY / Math.abs(e.deltaY)
					} else if ('wheelDeltaX' in e) {
						wheelDeltaY = e.wheelDeltaY / Math.abs(e.wheelDeltaY)
					} else if('wheelDelta' in e) {
						wheelDeltaY = e.wheelDelta / Math.abs(e.wheelDelta)
					} else if ('detail' in e) {
						wheelDeltaY = -e.detail / Math.abs(e.wheelDelta)
					} else {
						return
					}
	
					deltaScale = this.scale + (wheelDeltaY || 0) / 5
	
					this.zoom(deltaScale, e.pageX, e.pageY, 0)
				},
	
				_wheel : function (e) {
	
					var wheelDeltaX, wheelDeltaY,
						absWheelDeltaX, absWheelDeltaY,
						newX, newY,
						deltaX, deltaY,
						delta = 0,
						that = this
	
					if ( this.preventWheel ) return
					if ( this.wheelTimeout === undefined ) {
						if ( this._prevent(e, 4) ) return
						this._execEvent('scrollstart')
					}
	
					if ( this._prevent(e, 5) ) return
					if ( this.bounceDragPhase > 10 ) {
						this.preventWheel = true
						setTimeout(function () {
							that.preventWheel = false
						}, 1200)
						return
					}
	
					// Execute the scrollend event after 400ms the wheel stopped scrolling
	
					clearTimeout(this.wheelTimeout)
					this.wheelTimeout = setTimeout(function () {
						if ( that._prevent(e, 6) ) return
	
						if ( that.resetPosition(that.options.bounceTime) ) return
	
						that._promiseKeyFrame('translate', [that._x, that._y])
						that._drawing()
						that._execEvent('scrollend', 'end')
						that.wheeling = false
						that.borderBouncing = false
						that.directionLocked = undefined
						that.wheelTimeout = undefined
					}, 400)
	
					if ( 'deltaX' in e ) {
						wheelDeltaX = -e.deltaX
						wheelDeltaY = -e.deltaY
					} else if ( 'wheelDeltaX' in e ) {
						wheelDeltaX = e.wheelDeltaX / 120 * this.options.mouseWheelSpeed
						wheelDeltaY = e.wheelDeltaY / 120 * this.options.mouseWheelSpeed
					} else if ( 'wheelDelta' in e ) {
						wheelDeltaX = wheelDeltaY = e.wheelDelta / 120 * this.options.mouseWheelSpeed
					} else if ( 'detail' in e ) {
						wheelDeltaX = wheelDeltaY = -e.detail / 3 * this.options.mouseWheelSpeed
					} else {
						return
					}
	
					wheelDeltaX *= this.options.invertWheelDirection
					wheelDeltaY *= this.options.invertWheelDirection
					absWheelDeltaX = Math.abs(wheelDeltaX)
					absWheelDeltaY = Math.abs(wheelDeltaY)
	
					if ( this.options.snap ) {
						newX = this.currentPage.pageX
						newY = this.currentPage.pageY
	
						if ( wheelDeltaX > 0 ) {
							newX--
						} else if ( wheelDeltaX < 0 ) {
							newX++
						}
	
						if ( wheelDeltaY > 0 ) {
							newY--
						} else if ( wheelDeltaY < 0 ) {
							newY++
						}
	
						this.goToPage(newX, newY)
	
						return
					}
	
					if ( !this.hasWheelDeltaX && wheelDeltaX ) {
						this.hasWheelDeltaX = true
					}
	
					if ( !this.hasVerticalScroll && !this.hasWheelDeltaX && absWheelDeltaX < absWheelDeltaY ) {
						wheelDeltaX = wheelDeltaY
						wheelDeltaY = 0
	
						this.directionLocked == 'h'
					}
	
					delta = this._directionLocked(absWheelDeltaX, absWheelDeltaY, wheelDeltaX, wheelDeltaY)
	
					if ( !delta ) return
	
					deltaX = this.hasHorizontalScroll ? delta.x : 0
					deltaY = this.hasVerticalScroll ? delta.y : 0
	
					newX = this._x + deltaX
					newY = this._y + deltaY
	
					// Slow down if outside of the boundaries
	
					if ( newX > this.minScrollX || newX < this.maxScrollX ) {
						if ( this.options.bounce === 'all' ) {
							this.bounceDragPhase++
							newX = this._x + wheelDeltaX / (this.options.bounceDrag + this.bounceDragPhase)
						} else {
							newX = newX > this.minScrollX ? this.minScrollX : this.maxScrollX
						}
					}
					if ( newY > this.minScrollY || newY < this.maxScrollY ) {
						if ( this.options.bounce === 'all' ) {
							this.bounceDragPhase++
							newY = this._y + wheelDeltaY / (this.options.bounceDrag + this.bounceDragPhase) 
						} else {
							newY = newY > this.minScrollY ? this.minScrollY : this.maxScrollY
						}
					}
	
					this.directionX = this.hasHorizontalScroll ? (this._x - newX > 0 ? 1 : -1) : 0
					this.directionY = this.hasVerticalScroll ? (this._y - newY > 0 ? 1 : -1) : 0
	
					this.wheeling = true
					this.scrollTo(newX, newY, 0)
	
					this._execEvent('scroll', 'wheel')
					this._execEvent('wheel', 'wheel')
				},
	
				_key : function (e) {
					if ( !this.enabled ) {
						return
					}
	
					var snap = this.options.snap,	// we are using this alot, better to cache it
						newX = snap ? this.currentPage.pageX : this._x,
						newY = snap ? this.currentPage.pageY : this._y,
						now = Date.now(),
						prevTime = this.keyTime || 0,
						acceleration = 0.250,
						pos
	
					if ( this.options.useTransition && this.isInTransition ) {
						pos = this.getComputedPosition()
	
						this._promiseKeyFrame('translate', [Math.round(pos.x), Math.round(pos.y)])
						this._drawing()
						this.isInTransition = false
					}
	
					this.keyAcceleration = now - prevTime < 200 ? Math.min(this.keyAcceleration + acceleration, 50) : 0
	
					switch ( e.keyCode ) {
						case this.options.keyBindings.pageUp:
							if ( this.hasHorizontalScroll && !this.hasVerticalScroll ) {
								newX += snap ? 1 : this.wrapperWidth
							} else {
								newY += snap ? 1 : this.wrapperHeight
							}
							break
						case this.options.keyBindings.pageDown:
							if ( this.hasHorizontalScroll && !this.hasVerticalScroll ) {
								newX -= snap ? 1 : this.wrapperWidth
							} else {
								newY -= snap ? 1 : this.wrapperHeight
							}
							break
						case this.options.keyBindings.end:
							newX = snap ? this.pages.length-1 : this.maxScrollX
							newY = snap ? this.pages[0].length-1 : this.maxScrollY
							break
						case this.options.keyBindings.home:
							newX = this.minScrollX
							newY = this.minScrollY
							break
						case this.options.keyBindings.left:
							newX += snap ? -1 : 5 + this.keyAcceleration>>0
							break
						case this.options.keyBindings.up:
							newY += snap ? 1 : 5 + this.keyAcceleration>>0
							break
						case this.options.keyBindings.right:
							newX -= snap ? -1 : 5 + this.keyAcceleration>>0
							break
						case this.options.keyBindings.down:
							newY -= snap ? 1 : 5 + this.keyAcceleration>>0
							break
						default:
							return
					}
	
					if ( snap ) {
						this.goToPage(newX, newY)
						return
					}
	
					if ( newX > this.minScrollX ) {
						newX = this.minScrollX
						this.keyAcceleration = 0
					} else if ( newX < this.maxScrollX ) {
						newX = this.maxScrollX
						this.keyAcceleration = 0
					}
	
					if ( newY > this.minScrollY ) {
						newY = this.minScrollY
						this.keyAcceleration = 0
					} else if ( newY < this.maxScrollY ) {
						newY = this.maxScrollY
						this.keyAcceleration = 0
					}
	
					this.scrollTo(newX, newY)
	
					this.keyTime = now
				},
	
				_nearestSnap : function (x, y) {
					if ( !this.pages.length ) {
						return { x: 0, y: 0, pageX: 0, pageY: 0 }
					}
	
					var i = 0,
						l = this.pages.length,
						m = 0
	
					// Check if we exceeded the snap threshold
	
					if ( Math.abs(x - this.absStartX) < this.snapThresholdX &&
						Math.abs(y - this.absStartY) < this.snapThresholdY ) {
						return this.currentPage
					}
	
					if ( x > this.minScrollX ) {
						x = this.minScrollX
					} else if ( x < this.maxScrollX ) {
						x = this.maxScrollX
					}
	
					if ( y > this.minScrollY ) {
						y = this.minScrollY
					} else if ( y < this.maxScrollY ) {
						y = this.maxScrollY
					}
	
					for ( ; i < l; i++ ) {
						if ( x >= this.pages[i][0].cx ) {
							x = this.pages[i][0].x
							break
						}
					}
	
					l = this.pages[i] ? this.pages[i].length : 0
	
					for ( ; m < l; m++ ) {
						if ( y >= this.pages[0][m].cy ) {
							y = this.pages[0][m].y
							break
						}
					}
	
					if ( i == this.currentPage.pageX ) {
						i += this.directionX
	
						if ( i < 0 ) {
							i = 0
						} else if ( i >= this.pages.length ) {
							i = this.pages.length - 1
						}
	
						x = this.pages[i][0].x
					}
	
					if ( m == this.currentPage.pageY ) {
						m += this.directionY
	
						if ( m < 0 ) {
							m = 0
						} else if ( m >= this.pages[0].length ) {
							m = this.pages[0].length - 1
						}
	
						y = this.pages[0][m].y
					}
	
					return {
						x: x,
						y: y,
						pageX: i,
						pageY: m
					}
				},
	
				_pulling : function (el, r) {
					var that = this
					var u = 1
					var pos = 0
					var upos = 0
					var status = 0
					var style = el.style
					var threshold = -dP(el.getAttribute('threshold') || 50)
					var riseOffset = -dP(el.getAttribute('rise') || threshold)
					var autoControl = el.attributes.getNamedItem('auto') ? true : false
					var eventTarget = el.getAttribute('event-target') || 'scroll'
					var preventDefault = el.getAttribute('prevent-default') || (!this.options.finite && !this.options.infinite)
	
					if ( eventTarget !== 'scroll' ) {
						preventDefault = true
					}
	
					switch (r) {
						case -1:
							r = "minScrollX"
							u = -1
						break
	
						case 1:
							r = "maxScrollX"
							u = 1
						break
	
						case -2:
							r = "minScrollY"
							u = -1
						break
	
						case 2:
							r = "maxScrollY"
							u = 1
						break
					}
	
					this.on('scroll', function (type) {
						pos = (this.y - this[r] + (status > 3 ? u*threshold : 0))
						upos = u*pos
	
						if ( upos <= 0 ) {
							if ( status == 0 || (this.updated && status == -2) ) status = 1
	
							if ( status == 1 ) {
								status = 2
								el.removeAttribute('pullend')
								el.removeAttribute('pullover')
								el.setAttribute('pullstart', '')
							}
	
							if ( status == 2 ) {
								status = 3
								this._execEvent('pullstart', null)
							}
	
							if ( status == 3 && upos < threshold && (autoControl ? true : type == 'moving') ) {
								status = 4
	
								this.pulling = true
								this._execEvent('pulling', null)
								el.removeAttribute('pullstart')
								el.setAttribute('pulling', '')
								this[r] += u*threshold
	
								if ( preventDefault ) {
									this.one('scrollend', function () {
										status = -1
										el.removeAttribute('pulling')
										el.setAttribute('pullend', '')
										this._execEvent('pulling', null)
	
										switch (eventTarget) {
											case 'module':
												application.modules[application.id].refresh(null, function (render) {
													that.one('scrollend', function () {
														status = 0
														el.removeAttribute('pullend')
														render()
													})
	
													that.pulling = false
													that._execEvent('pullend', null)
													that._refresh()
													that.resetPosition(that.options.bounceTime)
	
													if ( that.isBounce() == false ) that._execEvent('scrollend', null)
												})
											break
										}
									})
	
								} else {
									this.one('scrollend', function () {
										if ( u < 0 ) status = -1
	
										el.removeAttribute('pulling')
										el.setAttribute('pullend', '')
										this._execEvent('pulling', null)
	
										this.update(function () {
											
											this.one('scrollend', function () {
												if ( u < 0 ? status == -1 : status == 4 ) status = 0
												el.removeAttribute('pullend')
											})
	
											this.pulling = false
											this._execEvent('pullend', null)
											this._refresh()
											if ( u > 0 ) {
												this.scrollBy(this.hasHorizontalScroll ? riseOffset : 0, this.hasVerticalScroll ? riseOffset : 0, this.options.bounceTime)
											} else {
												this.resetPosition(this.options.bounceTime)
											}
										}, u > 0)
									})
	
									if ( u > 0 ) {
										this.one('infinitedataend', function () {
											status = -1
											this.one('scrollend', function () {
												status = -2
											})
	
											el.removeAttribute('pulling')
											el.removeAttribute('pullend')
											el.setAttribute('pullover', '')
	
											this.pulling = false
											this._execEvent('pullover', null)
											this._refresh()
											this.resetPosition(this.options.bounceTime)
										})
									}
								}
							}
	
						}
	
						if ( status ) {
							style[BROWSER.prefixStyle.transform] = 'translate3d(0px' + ',' + pos + 'px' + ', 0px)'
	
							el.trigger('pull', {
								pos : pos
							})
						}
					})
				}
			})
		})(Scroll.prototype)
	
		// 初始化相关
		
		!(function (proto) {
			proto.extendProperties({
				handleEvent : function (e) {
					switch (e.type) {
						case 'touchstart':
						case 'MSPointerDown':
						case 'mousedown':
							this._start(e)
	
							// zoom start
							
							if ( this.options.zoom && e.touches && e.touches.length > 1 ) this._zoomStart(e)
	
							break
						case 'touchmove':
						case 'MSPointerMove':
						case 'mousemove':
	
							if ( this.options.zoom && e.touches && e.touches[1] ) {
								this._zoom(e)
								return
							}
	
							this._move(e)
							break
						case 'touchend':
						case 'MSPointerUp':
						case 'mouseup':
						case 'touchcancel':
						case 'MSPointerCancel':
						case 'mousecancel':
							if ( this.scaled ) {
								this._zoomEnd(e)
								return
							}
	
							this._end(e)
							break
						case 'orientationchange':
						case 'resize':
							this._resize()
							break
						case 'transitionend':
						case 'webkitTransitionEnd':
						case 'oTransitionEnd':
						case 'MSTransitionEnd':
							this._transitionEnd(e)
							break
						case 'wheel':
						case 'DOMMouseScroll':
						case 'mousewheel':
							if ( this.options.mouseWheelAction == 'zoom' ) {
								this._wheelZoom(e)
								return
							}
	
							this._wheel(e)
							break
						case 'keydown':
							this._key(e)
							break
						case 'click':
							if ( !e._constructed ) {
								e.preventDefault()
								e.stopPropagation()
							}
							break
					}
				},
	
				_init : function () {
					this._initBase()
					this._initEvents()
					this._initPrevant()
					this._initHistory()
					this._initObserver()
				},
	
				_initBase : function () {
					// event
	
					this._events = {}
	
					// 被卸载后的重置项
	
					this.initiated = false
	
					// Some defaults	
	
					this.x = 0
					this.y = 0
					this._x = 0
					this._y = 0
					this.minScrollX = 0
					this.minScrollY = 0
					this.maxScrollX = 0
					this.maxScrollY = 0
					this.scale = Math.min(Math.max(this.options.startZoom, this.options.zoomMin), this.options.zoomMax)
					this.directionX = 0
					this.directionY = 0
					this.acceleration = 0
					this.bounceDragPhase = 0
	
					this.transitionDelayRate = 0
					this.transitionDelayTime = 0
	
					// 贞队列
					
					this._keyFrame = []
				},
	
				_initHistory : function () {
					var uuid = this.uuid
					var sessionPosition
					if ( this.options.history == true ) {
		            	try {
							sessionPosition = sessionStorage.getItem(uuid)
							sessionPosition = sessionPosition.split(',')
	
							if ( sessionPosition.length == 2 ) {
								this.options.startX = Number(sessionPosition[0])
								this.options.startY = Number(sessionPosition[1])
							}
						} catch (e) {}
		            }
	
					this.on('scrollend', function () {
						try {
							sessionStorage.setItem(uuid, this.x + ',' + this.y)
	
							// remove
					
							App.on('transformstart background', function () {
								sessionStorage.removeItem(uuid)
							})
	
						} catch (e) {}
					})
				},
	
				_initKaleidoscope : function () {
	
					if ( this.options.zoom ) {
						this._initZoom()
					}
	
					if ( this.options.mouseWheel ) {
						this._initWheel()
					}
	
					if ( this.options.keyBindings ) {
						this._initKeys()
					}
	
					if ( this.options.snap ) {
						this._initSnap()
					}
	
					if ( this.options.pull ) {
						this._initPull()
					}
	
					if ( this.options.finite ) {
						this._initFinite()
					}
	
					if ( this.options.infinite ) {
						this._initInfinite()
					}
	
					if ( this.options.scrollbars || this.options.indicators ) {
						this._initIndicators()
					}
				},
	
				/**
				 * 事件初始化
				 * @param  {Boolean} remove 事件类型 add / remove
				 */
				_initEvents : function (remove) {
					var bind = remove ? METHOD.removeEvent : METHOD.addEvent
					var target = this.options.bindToWrapper ? this.wrapper : window
	
					bind(window, 'orientationchange', this)
					bind(window, 'resize', this)
	
					if ( !this.options.disableMouse ) {
						bind(this.wrapper, 'mousedown', this)
						bind(target, 'mousemove', this)
						bind(target, 'mousecancel', this)
						bind(target, 'mouseup', this)
					}
	
					if ( BROWSER.feat.hasPointer && !this.options.disablePointer ) {
						bind(this.wrapper, BROWSER.prefixPointerEvent('pointerdown'), this)
						bind(target, BROWSER.prefixPointerEvent('pointermove'), this)
						bind(target, BROWSER.prefixPointerEvent('pointercancel'), this)
						bind(target, BROWSER.prefixPointerEvent('pointerup'), this)
					}
	
					if ( BROWSER.feat.hasTouch && !this.options.disableTouch ) {
						bind(this.wrapper, 'touchstart', this)
						bind(target, 'touchmove', this)
						bind(target, 'touchcancel', this)
						bind(target, 'touchend', this)
					}
	
					bind(this.scroller, 'transitionend', this)
					bind(this.scroller, 'webkitTransitionEnd', this)
					bind(this.scroller, 'oTransitionEnd', this)
					bind(this.scroller, 'MSTransitionEnd', this)
				},
	
				/**
				 * 初始化Observer
				 * 高度改变时执行刷新
				 */
				_initObserver : function () {
	
					// set refresh event
	
					if ( !this.options.infinite ) {
						this._observer(this.scroller, function (records) {
							if ( this.updating ) return
							if ( 
								this.hasVerticalScroll && this.scroller.offsetHeight !== this.scrollerHeight 
								|| 
								this.hasHorizontalScroll && this.scroller.offsetWidth !== this.scrollerWidth 
							) this.refresh()
						})
					}
				},
	
				_indicatorsMap : function (fn) {
					if ( this.indicators ) {	
						for ( var i = this.indicators.length; i--; ) {
							fn.call(this.indicators[i])
						}
					}
				},
	
				_initIndicators : function () {
					var interactive = this.options.interactive,
						customStyle = typeof this.options.scrollbars != 'string',
						indicators = [],
						indicator
	
					var that = this
	
					this.indicators = []
	
					if ( this.options.scrollbars ) {
	
						// Vertical scrollbar
	
						if ( this.options.scrollY ) {
							indicator = {
								el: createDefaultScrollbar('v', interactive, this.options.scrollbars),
								interactive: interactive,
								defaultScrollbars: true,
								customStyle: customStyle,
								resize: this.options.resizeScrollbars,
								drag: this.options.bounceDrag,
								fade: this.options.fadeScrollbars,
								listenX: false
							}
	
							this.wrapper.appendChild(indicator.el)
							indicators.push(indicator)
						}
	
						// Horizontal scrollbar
	
						if ( this.options.scrollX ) {
							indicator = {
								el: createDefaultScrollbar('h', interactive, this.options.scrollbars),
								interactive: interactive,
								defaultScrollbars: true,
								customStyle: customStyle,
								resize: this.options.resizeScrollbars,
								drag: this.options.bounceDrag,
								fade: this.options.fadeScrollbars,
								listenY: false
							}
	
							this.wrapper.appendChild(indicator.el)
							indicators.push(indicator)
						}
					}
	
					if ( this.options.indicators ) {
	
						// TODO: check concat compatibility
	
						indicators = indicators.concat(this.options.indicators)
					}
	
					for ( var i = indicators.length; i--; ) {
						this.indicators.push( new Indicator(this, indicators[i]) )
					}
	
					// init event
					
					if ( this.options.fadeScrollbars ) {
						this.on('scrollend scrollcancel', function (type) {
							if ( type === 'break' ) return
							this._indicatorsMap(function () {
								this.fade()
							})
						})
	
						this.on('scrollstart beforescrollstart', function (type) {
							this._indicatorsMap(function () {
								this.fade(1, type === 'hold')
							})
						})
					}
	
					this.on('refresh', function () {
						this._indicatorsMap(function () {
							this.refresh()
						})
					})
	
					this.on('modify', function () {
						this._indicatorsMap(function () {
							this.refresh()
						})
					})
	
					this.on('destroy', function () {
						this._indicatorsMap(function () {
							this.destroy()
						})
	
						delete this.indicators
					})
				},
	
				_initWheel : function () {
					METHOD.addEvent(this.wrapper, 'wheel', this)
					METHOD.addEvent(this.wrapper, 'mousewheel', this)
					METHOD.addEvent(this.wrapper, 'DOMMouseScroll', this)
	
					this.on('destroy', function () {
						METHOD.removeEvent(this.wrapper, 'wheel', this)
						METHOD.removeEvent(this.wrapper, 'mousewheel', this)
						METHOD.removeEvent(this.wrapper, 'DOMMouseScroll', this)
					})
				},
	
				_initKeys : function (e) {
	
					// default key bindings
	
					var keys = {
						pageUp: 33,
						pageDown: 34,
						end: 35,
						home: 36,
						left: 37,
						up: 38,
						right: 39,
						down: 40
					}
					var i
	
					// if you give me characters I give you keycode
	
					if ( typeof this.options.keyBindings == 'object' ) {
						for ( i in this.options.keyBindings ) {
							if ( typeof this.options.keyBindings[i] == 'string' ) {
								this.options.keyBindings[i] = this.options.keyBindings[i].toUpperCase().charCodeAt(0)
							}
						}
					} else {
						this.options.keyBindings = {}
					}
	
					for ( i in keys ) {
						this.options.keyBindings[i] = this.options.keyBindings[i] || keys[i]
					}
	
					METHOD.addEvent(window, 'keydown', this)
	
					this.on('destroy', function () {
						METHOD.removeEvent(window, 'keydown', this)
					})
				},
	
				_initSnap : function () {
					if ( this._options.mouseWheel == undefined ) {
						this.options.mouseWheel = false
					}
	
					if ( this._options.speedLimit == undefined ) {
						this.options.speedLimit = dP(.5)
					}
	
					if ( this._options.fadeScrollbars == undefined ) {
						this.options.fadeScrollbars = false
					}
	
					if ( this.options.indicators ) {
						if ( this._options.resizeScrollbars == undefined ) {
							this.options.indicators.resize = false
						}
					}
	
					this.currentPage = {}
	
					if ( typeof this.options.snap === 'string' ) {
						this.options.snap = this.scroller.querySelectorAll(this.options.snap)
					}
	
					this.on('refresh', function () {
						var i = 0, l,
							m = 0, n,
							cx, cy,
							x = 0, y,
							stepX = this.options.snapStepX || this.wrapperWidth,
							stepY = this.options.snapStepY || this.wrapperHeight,
							el,
							rect
	
						this.pages = []
	
						if ( !this.wrapperWidth || !this.wrapperHeight || !this.scrollerWidth || !this.scrollerHeight ) {
							return
						}
	
						if ( this.options.snap === true ) {
							cx = Math.round( stepX / 2 )
							cy = Math.round( stepY / 2 )
	
							while ( x > -this.scrollerWidth ) {
								this.pages[i] = []
								l = 0
								y = 0
	
								while ( y > -this.scrollerHeight ) {
									this.pages[i][l] = {
										x: Math.max(x, this.maxScrollX),
										y: Math.max(y, this.maxScrollY),
										width: stepX,
										height: stepY,
										cx: x - cx,
										cy: y - cy
									}
	
									y -= stepY
									l++
								}
	
								x -= stepX
								i++
							}
						} else {
							el = this.options.snap
							l = el.length
							n = -1
	
							for ( ; i < l; i++ ) {
								rect = METHOD.getRect(el[i])
								if ( i === 0 || rect.left <= METHOD.getRect(el[i-1]).left ) {
									m = 0
									n++
								}
	
								if ( !this.pages[m] ) {
									this.pages[m] = []
								}
	
								x = Math.max(-rect.left, this.maxScrollX)
								y = Math.max(-rect.top, this.maxScrollY)
								cx = x - Math.round(rect.width / 2)
								cy = y - Math.round(rect.height / 2)
	
								this.pages[m][n] = {
									x: x,
									y: y,
									width: rect.width,
									height: rect.height,
									cx: cx,
									cy: cy
								}
	
								if ( x > this.maxScrollX ) {
									m++
								}
							}
						}
	
						this.goToPage(this.currentPage.pageX || 0, this.currentPage.pageY || 0, 0)
	
						// Update snap threshold if needed
	
						if ( this.options.snapThreshold % 1 === 0 ) {
							this.snapThresholdX = this.options.snapThreshold
							this.snapThresholdY = this.options.snapThreshold
						} else {
							this.snapThresholdX = Math.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].width * this.options.snapThreshold)
							this.snapThresholdY = Math.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].height * this.options.snapThreshold)
						}
					})
				},
	
				_initZoom : function () {
					this._transformOrigin('0 0')
				},
	
				_initPull : function () {
					
					// 下拉加载更多
					
					if ( this.pullup ) {
						this._pulling(this.pullup, 2)
					}
	
					// 上拉刷新页面
	
					if ( this.pulldown ) {
						this._pulling(this.pulldown, -2)
					}
	
					// 下拉加载更多
					
					if ( this.pullright ) {
						this._pulling(this.pullright, 1)
					}
	
					// 上拉刷新页面
	
					if ( this.pullleft ) {
						this._pulling(this.pullleft, -1)
					}
				},
	
				_initFinite : function () {
					this.minScrollX = 0
					this.minScrollY = 0
	
					this.fragments = {}
					this.infiniteCache = []
					this.turnoverTimes = 0
					this.finiteFragment = this.options.finiteFragment
	
					// data filler & cache buffer
	
					this.getInfiniteDataset = this.options.getInfiniteDataset
					this.getFiniteCacheBuffer = this.options.getFiniteCacheBuffer
	
					// 开始infinite >> 获取数据 >> 排序
	
					this.update(function () {
	
						// 移除封面
					
						if ( this.scrollcover ) {
							this.scrollcover = this.scrollcover.remove()
						}
	
						this._refresh()
					})
				},
	
				_initInfinite : function () {
					var that = this
	
					this.minScrollX = 0
					this.minScrollY = 0
	
				    this.infiniteElements = this.options.infiniteElements
					this.infiniteLength = this.infiniteElements.length
					this.infiniteCache = []
					this.turnoverTimes = 0
					this.infiniteDataLength = 0
					this.scrollerHeight = 0
	
					this.preReorderInfiniteY = this.options.startY
	
					this.infiniteItemSize = this.options.infiniteItemSize ? dP(this.options.infiniteItemSize) : false
	
					// data filler & cache buffer
	
					this.getInfiniteDataset = this.options.getInfiniteDataset
					this.setInfiniteDataFiller = this.options.setInfiniteDataFiller
				    this.getInfiniteDataFiller = this.options.getInfiniteDataFiller
				    this.getInfiniteCacheBuffer = this.options.getInfiniteCacheBuffer
	
				    // setup
	
					this.setupInfinite()
	
					// !important : this.infiniteLength - item._index
					// Element has a sibling with a lower z-index which has a compositing layer (in other words the it’s rendered on top of a composited layer)
					// 向下 z-index 递减
	
					this.infiniteElements.each(function (i, item) {
						item.style["z-index"] = i + 1
					}.bind(this))
	
					// 默认节点不可见
	
					this.one('infinitedataloaded', function () {
						that._refresh()
					})
	
					// 滚动事件触发排序
	
					this.on('scroll scrollend', function (type) {
						if ( this.borderBouncing ) return
						if ( type == "scrolling" && this.scrollTrendY === 1 && this.transitionCountTime - this._transitionTimeLeft() > this.transitionCountTime * .6 ) return
	
						this.reorderInfinite()
					})
	
					// 开始infinite >> 获取数据 >> 排序
	
					this.update(function () {
						if ( this.scrollcover ) {
							this.scrollcover.remove()
						}
	
						// scroll刷新后更新计算数据
	
						this.on('refresh', function () {
							this.refreshInfiniteAllPos()
							this.reorderInfinite()
						})
	
						// 监听节点变化后刷新
	
						this.infiniteElements.each(function (i, item) {
							that._observer(item, function () {
								if ( this.infiniteRearranging !== true && item.offsetHeight !== item._offsetHeight ) {
									this.refreshInfiniteAllPos()
									this.reorderInfinite()
								}
							})
						})
	
						this._refresh()
					})
				}
			})
		})(Scroll.prototype)
	
		
		/**
		 * createDefaultScrollbar
		 * @param  {String} 方向
		 * @param  {Boolen} 可控
		 * @param  {Boolen} type
		 * @return {Object}
		 */
		function createDefaultScrollbar (direction, interactive, type) {
			var scrollbar = document.createElement('scrollbar'),
				indicator = document.createElement('indicator')
	
			if ( direction == 'h' ) {
				if ( type === true ) {
					scrollbar.css({
						"height": "3dp",
						"right": "2dp",
						"bottom": "3dp",
						"left": "2dp"
					})
	
					indicator.css({
						"height": "100%"
					})
				}
				scrollbar.setAttribute('x', '')
			} else {
				if ( type === true ) {
					scrollbar.css({
						"width": "3dp",
						"top": "2dp",
						"right": "3dp",
						"bottom": "2dp"
					})
	
					indicator.css({
						"width": "100%"
					})
				}
				scrollbar.setAttribute('y', '')
			}
	
			if ( !interactive ) {
				scrollbar.style.pointerEvents = 'none'
			}
	
			scrollbar.appendChild(indicator)
	
			return scrollbar
		}
	
		/**
		 * Indicator 指示器
		 * @param {Object} scroller
		 * @param {Object} options
		 */
		function Indicator (scroller, options) {
			this.wrapper = typeof options.el == 'string' ? document.querySelector(options.el) : options.el
			this.wrapperStyle = this.wrapper.style
			this.indicator = this.wrapper.children[0]
			this.indicatorStyle = this.indicator.style
			this.scroller = scroller
	
			this.options = {
				listenX: true,
				listenY: true,
				interactive: false,
				resize: true,
				defaultScrollbars: false,
				drag: 3,
				fade: false,
				speedRatioX: 0,
				speedRatioY: 0
			}
	
			for ( var i in options ) {
				this.options[i] = options[i]
			}
	
			this.sizeRatioX = 1
			this.sizeRatioY = 1
			this.maxPosX = 0
			this.maxPosY = 0
	
			if ( this.options.interactive ) {
				if ( !this.options.disableTouch ) {
					METHOD.addEvent(this.indicator, 'touchstart', this)
					METHOD.addEvent(window, 'touchend', this)
				}
				if ( !this.options.disablePointer ) {
					METHOD.addEvent(this.indicator, 'MSPointerDown', this)
					METHOD.addEvent(window, 'MSPointerUp', this)
				}
				if ( !this.options.disableMouse ) {
					METHOD.addEvent(this.indicator, 'mousedown', this)
					METHOD.addEvent(window, 'mouseup', this)
				}
			}
	
			if ( this.options.fade ) {
				this.wrapperStyle[BROWSER.prefixStyle.transitionDuration] = '0ms'
				this.wrapperStyle.opacity = '0'
			}
		}
	
		Indicator.prototype = {
			
			destroy : function () {
				if ( this.options.interactive ) {
					METHOD.removeEvent(this.indicator, 'touchstart', this)
					METHOD.removeEvent(this.indicator, 'MSPointerDown', this)
					METHOD.removeEvent(this.indicator, 'mousedown', this)
	
					METHOD.removeEvent(window, 'touchmove', this)
					METHOD.removeEvent(window, 'MSPointerMove', this)
					METHOD.removeEvent(window, 'mousemove', this)
	
					METHOD.removeEvent(window, 'touchend', this)
					METHOD.removeEvent(window, 'MSPointerUp', this)
					METHOD.removeEvent(window, 'mouseup', this)
				}
	
				if ( this.options.defaultScrollbars ) {
					this.wrapper.remove()
				}
			},
	
			fade : function (val, hold) {
				if ( (val && this.visible) || (!val && !this.visible) ) return
				if ( hold && !this.visible ) return
	
				var that = this
	
				/**
				 * clearTimeout
				 */
				clearTimeout(this.fadeTimeout)
				this.fadeTimeout = null
	
				var time = val ? 0 : 250
				var delay = val ? 0 : 100
	
				/**
				 * 剪掉滚动条的fade效果
				 * 设定最小事件消除之前动画
				 * 因为某些机型不接受0ms动画的终止
				 * @param  {Boolean} BROWSER.isBadTransition
				 */
				if ( BROWSER.isBadTransition ) {
					time = 0.0001
				}
	
				this.wrapperStyle[BROWSER.prefixStyle.transitionDuration] = time + 'ms'
	
				this.fadeTimeout = setTimeout(function () {
					rAF(function () {
						val = val ? '1' : '0'
						that.wrapperStyle.opacity = val
						that.visible = +val
					})
				}, delay)
			},
	
			transitionTime : function (time) {
				this.indicatorStyle[BROWSER.prefixStyle.transitionDuration] = time ? time + 'ms' : ''
			},
	
			transitionTimingFunction : function (easing) {
				this.indicatorStyle[BROWSER.prefixStyle.transitionTimingFunction] = easing
			},
	
			updatePosition : function () {
				var scroll = this.scroller,
					_x = scroll._x,
					_y = scroll._y,
					x = this.options.listenX && Math.round(this.sizeRatioX * (_x - scroll.minScrollX)) || 0,
					y = this.options.listenY && Math.round(this.sizeRatioY * (_y - scroll.minScrollY)) || 0
	
				if ( !this.options.ignoreBoundaries ) {
					if ( _x > scroll.minScrollX ) {
						x = this.options.resize ? Math.max(x - _x, dP(8) - this.indicatorWidth) : this.minBoundaryX
					} else if ( _x < scroll.maxScrollX ) {
						x = this.options.resize ? Math.min(x + (scroll.maxScrollX - _x), this.maxBoundaryX - dP(8)) : this.maxBoundaryX
					}
	
					if ( _y > scroll.minScrollY ) {
						y = this.options.resize ? Math.max(y - _y, dP(8) - this.indicatorHeight) : this.minBoundaryY
					} else if ( _y < scroll.maxScrollY ) {
						y = this.options.resize ? Math.min(y + (scroll.maxScrollY - _y), this.maxBoundaryY - dP(8)) : this.maxBoundaryY
					}
				}
	
				this.x = x
				this.y = y
	
				this.indicatorStyle[BROWSER.prefixStyle.transform] = 'translate3d(' + x + 'px,' + y + 'px, 0)'
			},
	
			refresh : function () {
				var scroll = this.scroller
	
				this.transitionTime()
	
				if ( this.options.listenX && !this.options.listenY ) {
					this.indicatorStyle.display = scroll.hasHorizontalScroll ? 'block' : 'none'
				} else if ( this.options.listenY && !this.options.listenX ) {
					this.indicatorStyle.display = scroll.hasVerticalScroll ? 'block' : 'none'
				} else {
					this.indicatorStyle.display = scroll.hasHorizontalScroll || scroll.hasVerticalScroll ? 'block' : 'none'
				}
	
				if ( scroll.hasHorizontalScroll && scroll.hasVerticalScroll ) {
					this.wrapper.removeAttribute('lone')
					this.wrapper.setAttribute('both', '')
	
					if ( this.options.defaultScrollbars && this.options.customStyle ) {
						if ( this.options.listenX ) {
							this.wrapper.style.right = dP(8) + 'px'
						} else {
							this.wrapper.style.bottom = dP(8) + 'px'
						}
					}
				} else {
					this.wrapper.removeAttribute('both')
					this.wrapper.setAttribute('lone', '')
	
					if ( this.options.defaultScrollbars && this.options.customStyle ) {
						if ( this.options.listenX ) {
							this.wrapper.style.right = dP(2) + 'px'
						} else {
							this.wrapper.style.bottom = dP(2) + 'px'
						}
					}
				}
	
				// snap pos
	
				this.minIndicatorWidth = scroll.options.snap ? this.indicator.offsetWidth : dP(4)
				this.minIndicatorHeight = scroll.options.snap ? this.indicator.offsetHeight : dP(4)
	
				var r = this.wrapper.offsetHeight	// force refresh
	
				if ( this.options.listenX ) {
					this.wrapperWidth = this.wrapper.offsetWidth
					if ( this.options.resize ) {
						this.indicatorWidth = Math.max(Math.round(this.wrapperWidth * this.wrapperWidth / (scroll.scrollerWidth || this.wrapperWidth || dP(1))), this.minIndicatorWidth)
						this.indicatorStyle.width = this.indicatorWidth + 'px'
					} else {
						this.indicatorWidth = this.indicator.offsetWidth
					}
	
					this.maxPosX = this.wrapperWidth - this.indicatorWidth
	
					this.minBoundaryX = -this.indicatorWidth + dP(4)
					this.maxBoundaryX = this.wrapperWidth - dP(4)
	
					this.sizeRatioX = this.options.speedRatioX || (scroll.maxScrollX && (this.maxPosX / (scroll.maxScrollX - scroll.minScrollX)))
				}
	
				if ( this.options.listenY ) {
					this.wrapperHeight = this.wrapper.offsetHeight
					if ( this.options.resize ) {
						this.indicatorHeight = Math.max(Math.round(this.wrapperHeight * this.wrapperHeight / (scroll.scrollerHeight || this.wrapperHeight || dP(1))), this.minIndicatorHeight)
						this.indicatorStyle.height = this.indicatorHeight + 'px'
					} else {
						this.indicatorHeight = this.indicator.offsetHeight
					}
	
					this.maxPosY = this.wrapperHeight - this.indicatorHeight
	
					this.minBoundaryY = -this.indicatorHeight + dP(4)
					this.maxBoundaryY = this.wrapperHeight - dP(4)
	
					this.maxPosY = this.wrapperHeight - this.indicatorHeight
					this.sizeRatioY = this.options.speedRatioY || (scroll.maxScrollY && (this.maxPosY / (scroll.maxScrollY - scroll.minScrollY)))
				}
	
				this.updatePosition()
			}
		}
	
		!(function (proto) {
			proto.extendProperties({
				handleEvent : function (e) {
					switch (e.type) {
						case 'touchstart':
						case 'MSPointerDown':
						case 'mousedown':
							this._start(e)
							break
						case 'touchmove':
						case 'MSPointerMove':
						case 'mousemove':
							this._move(e)
							break
						case 'touchend':
						case 'MSPointerUp':
						case 'mouseup':
						case 'touchcancel':
						case 'MSPointerCancel':
						case 'mousecancel':
							this._end(e)
							break
					}
				},
	
				_start : function (e) {
					var point = e.touches ? e.touches[0] : e
	
					e.preventDefault()
					e.stopPropagation()
	
					this.transitionTime()
	
					this.initiated = true
					this.moved = false
					this.lastPointX	= point.pageX
					this.lastPointY	= point.pageY
	
					this.startTime	= Date.now()
	
					if ( !this.options.disableTouch ) {
						METHOD.addEvent(window, 'touchmove', this)
					}
					if ( !this.options.disablePointer ) {
						METHOD.addEvent(window, 'MSPointerMove', this)
					}
					if ( !this.options.disableMouse ) {
						METHOD.addEvent(window, 'mousemove', this)
					}
	
					this.scroller._execEvent('beforescrollstart', 'hold')
				},
	
				_move : function (e) {
					var point = e.touches ? e.touches[0] : e,
						deltaX, deltaY,
						newX, newY,
						timestamp = Date.now()
	
					if ( !this.moved ) {
						this.scroller._execEvent('scrollstart')
					}
	
					this.moved = true
	
					deltaX = point.pageX - this.lastPointX
					this.lastPointX = point.pageX
	
					deltaY = point.pageY - this.lastPointY
					this.lastPointY = point.pageY
	
					newX = this.x + deltaX
					newY = this.y + deltaY
	
					this._pos(newX, newY)
	
			// INSERT POINT: indicator._move
	
					e.preventDefault()
					e.stopPropagation()
				},
	
				_end : function (e) {
					if ( !this.initiated ) {
						return
					}
	
					this.initiated = false
	
					e.preventDefault()
					e.stopPropagation()
	
					METHOD.removeEvent(window, 'touchmove', this)
					METHOD.removeEvent(window, 'MSPointerMove', this)
					METHOD.removeEvent(window, 'mousemove', this)
	
					var scroll = this.scroller
	
					if ( scroll.options.snap ) {
						var _x = scroll._x
						var _y = scroll._y
	
						var snap = scroll._nearestSnap(_x, _y)
	
						var time = this.options.snapDuration || Math.max(
								Math.max(
									Math.min(Math.abs(_x - snap.x), 1000),
									Math.min(Math.abs(_y - snap.y), 1000)
								), 300)
	
						if ( _x != snap.x || _y != snap.y ) {
							scroll.directionX = 0
							scroll.directionY = 0
							scroll.currentPage = snap
							scroll.scrollTo(snap.x, snap.y, time, scroll.options.snapEasing)
						}
					}
	
					if ( this.moved ) {
						scroll._execEvent('scrollend')
					}
				},
	
				_pos : function (x, y) {
					var scroll = this.scroller
					var _x = scroll._x
					var _y = scroll._y
	
					if ( x < 0 ) {
						x = 0
					} else if ( x > this.maxPosX ) {
						x = this.maxPosX
					}
	
					if ( y < 0 ) {
						y = 0
					} else if ( y > this.maxPosY ) {
						y = this.maxPosY
					}
	
					x = this.options.listenX ? Math.round(x / this.sizeRatioX) : _x
					y = this.options.listenY ? Math.round(y / this.sizeRatioY) : _y
	
					scroll.scrollTo(x, y)
				}
			})
		})(Indicator.prototype)
	
		// extend
	
		Scroll.METHOD = METHOD
		Scroll.BROWSER = BROWSER
		Scroll.EASEING = EASEING
	
		return Scroll
	}

/***/ }),
/* 12 */
/***/ (function(module, exports) {

	// 有无相生，难易相成，长短相形，高下相盈，音声相和，前後相随。恒也。
	
	import CSS from './css.js'
	import DOM from './dom.js'
	
	function Template (id) {
	
	    if ( !(this instanceof Template) ) {
	        return new Template(id)
	    }
	
	    if ( !id ) return
	
	    this.init(id)
	}
	
	Template.prototype = {
	    init : function (id) {
	
	        // include lib
	        
	        this.id = id
	
	        this.css = new CSS()
	        this.dom = new DOM()
	
	        this.module = App.modules[id]
	        this.config = this.module.config
	        this.target = this.module.elements.container
	
	        // first error
	        
	        this.module.one('failedtoload', function (e) {
	            this.errored(this.module)
	            this.errored = noop
	        }.bind(this))
	    },
	
	    render : function (id, module, source) {
	        var that = this
	        
	        /*
	         * dimension 确保多个异步数据完成后执行当前到达的dimension模块
	         */
	
	        if ( id && source ) {
	
	            /**
	             * appcache + 本地数据缓存，造成无异步加载
	             * 模版解析的过程导致loading被阻塞
	             * 认为产生异步加载，第一时间展示loading
	             * transform.to().then() then依赖于to函数异步 
	            */
	            
	            // module onprefetch
	            
	            source[2] = typeof module.onprefetch == 'function' ? (module.onprefetch(source[2]) || source[2]) : source[2]
	            
	            // prefetch callback
	
	            this.fetched(module, function () {
	                that.write(that.compile(id, source[0], source[1], source[2]))
	            })
	        }
	
	        return this
	    },
	
	    write : function (source) {
	        this.config.sandbox ? this.sandbox(source[0], source[1]) : this.embed(source[0], source[1])
	    },
	
	    compile : function (id, sids, suri, data) {
	
	        this.module.scope = data.data = {}.extend(
	            App.modules.frameworks.scope || {},
	            {
	                module : this.module,
	                config : this.config,
	                params : this.module.param,
	                device : device
	            },
	            data.data)
	        
	        this.css.init(id, this.module).setup({
	            data : {
	                module     : this.module,
	                config     : this.config,
	                params     : this.module.param,
	                scope      : data.data,
	                device     : device,
	                os         : device.os,
	                dpi        : device.ui.dpi,
	                feat       : device.feat,
	                prefix     : device.feat.prefix
	            },
	            descendant : (this.config.sandbox || this.config.shadowbox || ["frameworks", "system"].consistOf(id)) ? null : "module-container[name='" + id + "']"
	        })
	
	        // init 清除 Dom 的未完成异步回调
	
	        this.dom.init(this.module, App.sandbox, {}.extend(App.modules.frameworks.helper, this.module.helper), this.css).setup({
	            suri       : suri,
	            dids       : sids.data,
	            sids       : sids.source,
	            parallel   : this.config.mirroring
	        })
	
	        return [
	            this.css.render(this.config.style, sids.style, data.style), 
	            this.dom.render(this.config.source[0], data.source, data.data)
	        ]
	    },
	
	    include : function (id) {
	        var that = this
	        var module = this.module
	        var config = this.config
	        var dimension = module.dimension
	        var prefetched = module.prefetch[dimension]
	
	        // new app
	
	        if ( module.remoteframe ) {
	            return this.frame(module)
	        }
	
	        // 如果存在缓存并且没有被定义为强制刷新模块
	
	        if ( prefetched ) {
	            return this.render(id, module, prefetched)
	        }
	
	        App.async.fetch(id, config, module.param, function () {
	
	            // render
	
	            that.render(id, module, arguments)
	
	            if ( module.config.cache && !module.config.update ) {
	                module.prefetch[module.dimension] = arguments
	                module.updatetime[module.dimension] = Date.now()
	            }
	        }, function () {
	            that.errored(module)
	        })
	    },
	
	    scope : function (sandbox, context, content) {
	        var id = this.id
	        var dom = this.dom
	        var config = this.config
	        var module = this.module
	        var scopeWindow = sandbox.window
	        var scopeDocument = sandbox.document
	
	        // set sandbox
	
	        scopeWindow.module = this.module
	        scopeWindow.App = scopeWindow.application = App
	
	        // valid window
	
	        scopeWindow.validWindow = scopeWindow
	
	        // react DATA ROOT
	
	        scopeWindow.TOP = window
	        scopeWindow.DOM = scopeWindow.DOMS = dom.DOM[0]
	        scopeWindow.DATA = scopeWindow.SCOPE = scopeWindow.scope = dom.DATA
	        scopeWindow.root = context
	        scopeWindow.node = dom.getElementById
	
	        // set application
	
	        module.addElement('sandbox', sandbox)
	        module.addElement('context', context)
	        module.addElement('content', content)
	
	        // 模块错误收集
	
	        scopeWindow.onerror = function () {
	            App.trigger('error', {
	                id : id,
	                module : module
	            })
	        }
	
	        if ( sandbox.window !== window ) {
	            
	            // compatible window
	
	            __defineUnify__(sandbox.window)
	            __defineProto__(sandbox.window)
	
	        }
	    },
	
	    trick : function (sandbox, context) {
	        if ( sandbox.window === window ) return
	
	        var that = this
	
	        // valid window
	
	        sandbox.window.validWindow = sandbox.window.vwindow = window
	        sandbox.window.validDocument = sandbox.window.vdocument = window.document
	
	
	        sandbox.window.document.extendProperty("getElementById", function (id) { return that.dom.DOM[0][id] || context.find('#' + id)[0] || window.document.getElementById(id) })
	        sandbox.window.document.extendProperty("getElementsByName", function (name) { return context.find('*[name=' + name + ']').toArray() || window.document.getElementsByName(name) })
	        sandbox.window.document.extendProperty("getElementsByClassName", function (name) { return context.find('.' + name).toArray() || window.document.getElementsByClassName(name) })
	        sandbox.window.document.extendProperty("getElementsByTagName", function (name) { return context.find(name).toArray() || window.document.getElementsByTagName(name) })
	        sandbox.window.document.extendProperty("getElementsByTagNameNS", function (name, namespace) { return window.document.getElementsByTagNameNS(name, namespace) })
	        
	    },
	
	    wrap : function (id, style, dom, type) {
	
	        // creat css
	
	        var css = document.createElement('style')
	            css.name = id
	            css.innerHTML = style
	
	        var body = document.createElement("module-context")
	            body.name = id
	            body.className = "module-context"
	
	        // inset style
	
	        id == "frameworks" && type == 0 && !this.config.shadowbox 
	            ? document.head.appendChild(css) 
	            : body.appendChild(css)
	
	        body.appendChild(dom)
	
	        return body
	    },
	
	    script : function () {
	        var id = this.id
	        var module = this.module
	        var config = module.config
	        var path = ''
	        var script = '' 
	          
	        config.script.each(function (i, name) {
	            path = module.resources.script[name]
	
	            if ( path ) {
	                script += '<script src=' + App.realpath(id, null, path) + '></script> \n'
	            } else {
	                App.console.error('resources.script["' + name + '"]', 'Config error' ,'is not definde')
	            }
	        })
	
	        return script
	    },
	
	    style : function (style) {
	        return '<style>' + style + '</style>'
	    },
	
	    blakbox : function (target, style, script, content, puppet) {
	        var sandbox = new Sandbox(true, true, true)
	        var module = this.module
	        var config = module.config
	
	        sandbox.iframe.attr({
	            "name"     : this.id, 
	            "src"      : "about:blank",
	            "seamless" : "seamless"
	        }).css(content ? {
	            "display"  : "none"
	        } : {
	            "display" : "block", 
	            "position" : "absolute", 
	            "z-index" : "0",
	            "width" : "100%", 
	            "height" : "100%", 
	            "border" : "0"
	        })
	
	        // set sandbox
	        
	        if ( puppet ) {
	            sandbox.iframe.attr("sandbox", "allow-same-origin")
	        } 
	        else {
	            if ( typeof config.sandbox === "string" && !(config.sandbox.indexOf("allow-same-origin") !== -1 && config.sandbox.indexOf("allow-scripts") !== -1) ) {
	                sandbox.iframe.attr("sandbox", config.sandbox)
	            }
	        }
	
	        // append sandbox
	
	        target.appendChild(sandbox.iframe)
	
	        // puppet
	
	        if ( puppet ) {
	            sandbox.init().open().write(style).close()
	
	            return sandbox
	        }
	
	        // init sandbox
	
	        sandbox.init().extend()
	
	        // end sandbox
	
	        sandbox.open()
	
	        // reload App
	
	        sandbox.window.addEventListener('beforeunload', function (e) {
	            if ( App._EXISTS !== -1 ) {
	                App._EXISTS = -1
	                setTimeout(function () {
	                    top.location.reload() 
	                }, 0)
	            }
	        })
	
	        // scope sandbox, order: open then scope
	
	        this.scope(sandbox, content || sandbox.document, content || sandbox.iframe)
	
	        sandbox.write(style, script)
	        sandbox.close()
	
	        // sandbox writed
	
	        sandbox.window.addEventListener('touchmove', preventDefaultEvent, false)
	
	        return sandbox
	    },
	
	    mirroring : function (style, dom) {
	        var mirroring = this.config.mirroring
	
	        if ( !mirroring ) return
	
	        var that = this
	        var module = this.module
	        var sandbox = this.blakbox(this.target, this.style(style), null, null, true)
	
	        sandbox.iframe.css({
	            "z-index"   : "-1",
	            "filter"    : mirroring.filter || "none"
	        })
	
	        // insert dom to body
	
	        sandbox.document.body.appendChild(dom)
	
	        module.addElement('mirroring', sandbox.iframe)
	    },
	
	    container : function () {
	        var view
	          , mask
	          , clip
	          , mirroring
	
	        if ( ["frameworks", "system"].consistOf(this.id) ) {
	            view = this.target
	        } else {
	            mirroring = this.config.mirroring
	            clip = mirroring ? mirroring.clip : false
	
	            mask = document.createElement('mask')
	            view = document.createElement('view')
	
	            mask.appendChild(view)
	
	            // in module
	            
	            this.target.appendChild(mask)
	            this.module.addElement('mask', mask)
	            this.module.addElement('view', view)
	            this.module.clipView(clip)
	        }
	
	        return this.config.shadowbox && view.createShadowRoot ? view.createShadowRoot() : view
	    },
	
	    frame : function (module) {
	        var that = this
	        var frame = document.createElement('iframe')
	
	        frame.src = module.config.source
	        frame.setAttribute('app', true)
	
	        this.target.appendChild(frame)
	
	        // remoteframe
	
	        module.remoteframe = frame.contentWindow
	
	        module.addElement('context', frame.contentWindow.document)
	        module.addElement('content', frame)
	
	        // fetched
	
	        this.fetched(module, noop)
	
	        // loaded
	
	        frame.contentWindow.addEventListener("load", function () {
	            if ( this.App ) {
	                
	                // set name
	                    
	                this.App = module.id
	
	                // load
	                
	                this.addEventListener(module.config.preview === 2 ? "frameworksload" : "frameworksready", function () {
	                    that.readied(module, noop)
	
	                    setTimeout(function () {
	                        that.loaded(module, noop)
	                    }, 0)
	                }, false)
	            } else {
	                that.readied(module, noop)
	                setTimeout(function () {
	                    that.loaded(module, noop)
	                }, 0)
	            }
	        }, false)
	
	        frame.onerror = function () {
	            that.errored(module)
	        }
	    },
	
	    sandbox : function (style, dom) {
	        var that = this
	        var module = this.module
	        var container = this.container()
	        var sandbox = this.blakbox(container, this.style(style), this.script())
	
	        // ready event
	
	        sandbox.document.ready(function () {
	
	            // insert dom to body
	
	            sandbox.document.body.appendChild(dom[0])
	
	            // over
	
	            that.over(module, sandbox.window, sandbox.document.body)
	
	            // creat mirroring
	
	            that.mirroring(style, dom[1])
	        })
	    },
	
	    embed : function (style, dom) {
	        var id = this.id
	        var module = this.module
	        var config = this.config
	        var content = this.wrap(id, style, dom[0], 0)
	        var container = this.container()
	        var sandbox = this.blakbox(container, null, this.script(), content)
	
	        // append context
	
	        container.appendChild(content)
	
	        // trick 移形幻影 乾坤大挪移
	
	        this.trick(sandbox, content)
	
	        // over
	            
	        this.over(module, sandbox.window, content)
	
	        // creat mirroring
	
	        this.mirroring(style, dom[1])
	    },
	
	    over : function (module, window, content) {
	
	        var that = this
	
	        // readied
	
	        this.readied(module, function () {
	
	            // trigger dom is ready
	
	            that.dom.space(window, content)
	                    .load(function () { 
	                        that.loaded(module)
	                    })
	                    .end(0)
	        })
	    },
	
	    prefetch : function (callback) {
	        this.fetched = callback
	
	        return this
	    },
	
	    then : function (callback) {
	        this.readied = callback
	
	        return this
	    },
	
	    get : function (callback) {
	        this.loaded = callback
	
	        this.include(this.id)
	
	        return this
	    },
	
	    error : function (callback) {
	        this.errored = callback
	
	        return this
	    }
	
	}
	
	export default Template

/***/ }),
/* 13 */
/***/ (function(module, exports) {

	// “天地之间其犹橐龠呼？” 虚而不屈，动而愈出，多言数穷，不如守中
	
	export default function (window, document, undefined) {
	    'use strict';
	
	    var scale = device.ui.scale || 1;
	
	    var VENDOR_PREFIXES = ['', 'webkit', 'moz', 'MS', 'ms', 'o'];
	    var TEST_ELEMENT = document.createElement('div');
	
	    var TYPE_FUNCTION = 'function';
	
	    var round = Math.round;
	    var abs = Math.abs;
	    var now = Date.now;
	
	    /**
	     * set a timeout with a given scope
	     * @param {Function} fn
	     * @param {Number} timeout
	     * @param {Object} context
	     * @returns {number}
	     */
	    function setTimeoutContext(fn, timeout, context) {
	        return setTimeout(bindFn(fn, context), timeout);
	    }
	
	    /**
	     * if the argument is an array, we want to execute the fn on each entry
	     * if it aint an array we don't want to do a thing.
	     * this is used by all the methods that accept a single and array argument.
	     * @param {*|Array} arg
	     * @param {String} fn
	     * @param {Object} [context]
	     * @returns {Boolean}
	     */
	    function invokeArrayArg(arg, fn, context) {
	        if (Array.isArray(arg)) {
	            each(arg, context[fn], context);
	            return true;
	        }
	        return false;
	    }
	
	    /**
	     * walk objects and arrays
	     * @param {Object} obj
	     * @param {Function} iterator
	     * @param {Object} context
	     */
	    function each(obj, iterator, context) {
	        var i;
	
	        if (!obj) {
	            return;
	        }
	
	        if (obj.forEach) {
	            obj.forEach(iterator, context);
	        } else if (obj.length !== undefined) {
	            i = 0;
	            while (i < obj.length) {
	                iterator.call(context, obj[i], i, obj);
	                i++;
	            }
	        } else {
	            for (i in obj) {
	                obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj);
	            }
	        }
	    }
	
	    /**
	     * extend object.
	     * means that properties in dest will be overwritten by the ones in src.
	     * @param {Object} dest
	     * @param {Object} src
	     * @param {Boolean} [merge]
	     * @returns {Object} dest
	     */
	    function extend(dest, src, merge) {
	        var keys = Object.keys(src);
	        var i = 0;
	        while (i < keys.length) {
	            if (!merge || (merge && dest[keys[i]] === undefined)) {
	                dest[keys[i]] = src[keys[i]];
	            }
	            i++;
	        }
	        return dest;
	    }
	
	    /**
	     * merge the values from src in the dest.
	     * means that properties that exist in dest will not be overwritten by src
	     * @param {Object} dest
	     * @param {Object} src
	     * @returns {Object} dest
	     */
	    function merge(dest, src) {
	        return extend(dest, src, true);
	    }
	
	    /**
	     * simple class inheritance
	     * @param {Function} child
	     * @param {Function} base
	     * @param {Object} [properties]
	     */
	    function inherit(child, base, properties) {
	        var baseP = base.prototype,
	            childP;
	
	        childP = child.prototype = Object.create(baseP);
	        childP.constructor = child;
	        childP._super = baseP;
	
	        if (properties) {
	            extend(childP, properties);
	        }
	    }
	
	    /**
	     * simple function bind
	     * @param {Function} fn
	     * @param {Object} context
	     * @returns {Function}
	     */
	    function bindFn(fn, context) {
	        return function boundFn() {
	            return fn.apply(context, arguments);
	        };
	    }
	
	    /**
	     * let a boolean value also be a function that must return a boolean
	     * this first item in args will be used as the context
	     * @param {Boolean|Function} val
	     * @param {Array} [args]
	     * @returns {Boolean}
	     */
	    function boolOrFn(val, args) {
	        if (typeof val == TYPE_FUNCTION) {
	            return val.apply(args ? args[0] || undefined : undefined, args);
	        }
	        return val;
	    }
	
	    /**
	     * use the val2 when val1 is undefined
	     * @param {*} val1
	     * @param {*} val2
	     * @returns {*}
	     */
	    function ifUndefined(val1, val2) {
	        return (val1 === undefined) ? val2 : val1;
	    }
	
	    /**
	     * addEventListener with multiple events at once
	     * @param {EventTarget} target
	     * @param {String} types
	     * @param {Function} handler
	     */
	    function addEventListeners(target, types, handler) {
	        each(splitStr(types), function(type) {
	            target.addEventListener(type, handler, false);
	        });
	    }
	
	    /**
	     * removeEventListener with multiple events at once
	     * @param {EventTarget} target
	     * @param {String} types
	     * @param {Function} handler
	     */
	    function removeEventListeners(target, types, handler) {
	        each(splitStr(types), function(type) {
	            target.removeEventListener(type, handler, false);
	        });
	    }
	
	    /**
	     * find if a node is in the given parent
	     * @method hasParent
	     * @param {HTMLElement} node
	     * @param {HTMLElement} parent
	     * @return {Boolean} found
	     */
	    function hasParent(node, parent) {
	        while (node) {
	            if (node == parent) {
	                return true;
	            }
	            node = node.parentNode;
	        }
	        return false;
	    }
	
	    /**
	     * small indexOf wrapper
	     * @param {String} str
	     * @param {String} find
	     * @returns {Boolean} found
	     */
	    function inStr(str, find) {
	        return str.indexOf(find) > -1;
	    }
	
	    /**
	     * split string on whitespace
	     * @param {String} str
	     * @returns {Array} words
	     */
	    function splitStr(str) {
	        return str.trim().split(/\s+/g);
	    }
	
	    /**
	     * find if a array contains the object using indexOf or a simple polyFill
	     * @param {Array} src
	     * @param {String} find
	     * @param {String} [findByKey]
	     * @return {Boolean|Number} false when not found, or the index
	     */
	    function inArray(src, find, findByKey) {
	        if (src.indexOf && !findByKey) {
	            return src.indexOf(find);
	        } else {
	            var i = 0;
	            while (i < src.length) {
	                if ((findByKey && src[i][findByKey] == find) || (!findByKey && src[i] === find)) {
	                    return i;
	                }
	                i++;
	            }
	            return -1;
	        }
	    }
	
	    /**
	     * convert array-like objects to real arrays
	     * @param {Object} obj
	     * @returns {Array}
	     */
	    function toArray(obj) {
	        return Array.prototype.slice.call(obj, 0);
	    }
	
	    /**
	     * unique array with objects based on a key (like 'id') or just by the array's value
	     * @param {Array} src [{id:1},{id:2},{id:1}]
	     * @param {String} [key]
	     * @param {Boolean} [sort=False]
	     * @returns {Array} [{id:1},{id:2}]
	     */
	    function uniqueArray(src, key, sort) {
	        var results = [];
	        var values = [];
	        var i = 0;
	
	        while (i < src.length) {
	            var val = key ? src[i][key] : src[i];
	            if (inArray(values, val) < 0) {
	                results.push(src[i]);
	            }
	            values[i] = val;
	            i++;
	        }
	
	        if (sort) {
	            if (!key) {
	                results = results.sort();
	            } else {
	                results = results.sort(function sortUniqueArray(a, b) {
	                    return a[key] > b[key];
	                });
	            }
	        }
	
	        return results;
	    }
	
	    /**
	     * get the prefixed property
	     * @param {Object} obj
	     * @param {String} property
	     * @returns {String|Undefined} prefixed
	     */
	    function prefixed(obj, property) {
	        var prefix, prop;
	        var camelProp = property[0].toUpperCase() + property.slice(1);
	
	        var i = 0;
	        while (i < VENDOR_PREFIXES.length) {
	            prefix = VENDOR_PREFIXES[i];
	            prop = (prefix) ? prefix + camelProp : property;
	
	            if (prop in obj) {
	                return prop;
	            }
	            i++;
	        }
	        return undefined;
	    }
	
	    /**
	     * get a unique id
	     * @returns {number} uniqueId
	     */
	    var _uniqueId = 1;
	    function uniqueId() {
	        return _uniqueId++;
	    }
	
	    /**
	     * get the window object of an element
	     * @param {HTMLElement} element
	     * @returns {DocumentView|Window}
	     */
	    function getWindowForElement(element) {
	        var doc = element.ownerDocument;
	        return (doc.defaultView || doc.parentWindow);
	    }
	
	    var MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;
	
	    var SUPPORT_TOUCH = ('ontouchstart' in window);
	    var SUPPORT_POINTER_EVENTS = prefixed(window, 'PointerEvent') !== undefined;
	    var SUPPORT_ONLY_TOUCH = SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent);
	
	    var INPUT_TYPE_TOUCH = 'touch';
	    var INPUT_TYPE_PEN = 'pen';
	    var INPUT_TYPE_MOUSE = 'mouse';
	    var INPUT_TYPE_KINECT = 'kinect';
	
	    var COMPUTE_INTERVAL = 25;
	
	    var INPUT_START = 1;
	    var INPUT_MOVE = 2;
	    var INPUT_END = 4;
	    var INPUT_CANCEL = 8;
	
	    var DIRECTION_NONE = 1;
	    var DIRECTION_LEFT = 2;
	    var DIRECTION_RIGHT = 4;
	    var DIRECTION_UP = 8;
	    var DIRECTION_DOWN = 16;
	
	    var DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT;
	    var DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN;
	    var DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL;
	
	    var PROPS_XY = ['x', 'y'];
	    var PROPS_CLIENT_XY = ['clientX', 'clientY'];
	
	    /**
	     * create new input type manager
	     * @param {Manager} manager
	     * @param {Function} callback
	     * @returns {Input}
	     * @constructor
	     */
	    function Input(manager, callback) {
	        var self = this;
	        this.manager = manager;
	        this.callback = callback;
	        this.element = manager.element;
	        this.target = manager.options.inputTarget;
	
	        // smaller wrapper around the handler, for the scope and the enabled state of the manager,
	        // so when disabled the input events are completely bypassed.
	        this.domHandler = function(ev) {
	            if (boolOrFn(manager.options.enable, [manager])) {
	                self.handler(ev);
	            }
	        };
	
	        this.init();
	
	    }
	
	    Input.prototype = {
	        /**
	         * should handle the inputEvent data and trigger the callback
	         * @virtual
	         */
	        handler: function() { },
	
	        /**
	         * bind the events
	         */
	        init: function() {
	            this.evEl && addEventListeners(this.element, this.evEl, this.domHandler);
	            this.evTarget && addEventListeners(this.target, this.evTarget, this.domHandler);
	            this.evWin && addEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
	        },
	
	        /**
	         * unbind the events
	         */
	        destroy: function() {
	            this.evEl && removeEventListeners(this.element, this.evEl, this.domHandler);
	            this.evTarget && removeEventListeners(this.target, this.evTarget, this.domHandler);
	            this.evWin && removeEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
	        }
	    };
	
	    /**
	     * create new input type manager
	     * called by the Manager constructor
	     * @param {Touch} manager
	     * @returns {Input}
	     */
	    function createInputInstance(manager) {
	        var Type;
	        var inputClass = manager.options.inputClass;
	
	        if (inputClass) {
	            Type = inputClass;
	        } else if (SUPPORT_POINTER_EVENTS) {
	            Type = PointerEventInput;
	        } else if (SUPPORT_ONLY_TOUCH) {
	            Type = TouchInput;
	        } else if (!SUPPORT_TOUCH) {
	            Type = MouseInput;
	        } else {
	            Type = TouchMouseInput;
	        }
	        return new (Type)(manager, inputHandler);
	    }
	
	    /**
	     * handle input events
	     * @param {Manager} manager
	     * @param {String} eventType
	     * @param {Object} input
	     */
	    function inputHandler(manager, eventType, input) {
	        var pointersLen = input.pointers.length;
	        var changedPointersLen = input.changedPointers.length;
	        var isFirst = (eventType & INPUT_START && (pointersLen - changedPointersLen === 0));
	        var isFinal = (eventType & (INPUT_END | INPUT_CANCEL) && (pointersLen - changedPointersLen === 0));
	
	        input.isFirst = !!isFirst;
	        input.isFinal = !!isFinal;
	
	        if (isFirst) {
	            manager.session = {};
	        }
	
	        // source event is the normalized value of the domEvents
	        // like 'touchstart, mouseup, pointerdown'
	        input.eventType = eventType;
	
	        // compute scale, rotation etc
	        computeInputData(manager, input);
	
	        // emit secret event
	        manager.emit('Touch.input', input);
	
	        manager.recognize(input);
	        manager.session.prevInput = input;
	    }
	
	    /**
	     * extend the data with some usable properties like scale, rotate, velocity etc
	     * @param {Object} manager
	     * @param {Object} input
	     */
	    function computeInputData(manager, input) {
	        var session = manager.session;
	        var pointers = input.pointers;
	        var pointersLength = pointers.length;
	
	        // store the first input to calculate the distance and direction
	        if (!session.firstInput) {
	            session.firstInput = simpleCloneInputData(input);
	        }
	
	        // to compute scale and rotation we need to store the multiple touches
	        if (pointersLength > 1 && !session.firstMultiple) {
	            session.firstMultiple = simpleCloneInputData(input);
	        } else if (pointersLength === 1) {
	            session.firstMultiple = false;
	        }
	
	        var firstInput = session.firstInput;
	        var firstMultiple = session.firstMultiple;
	        var offsetCenter = firstMultiple ? firstMultiple.center : firstInput.center;
	
	        var center = input.center = getCenter(pointers);
	        input.timeStamp = now();
	        input.deltaTime = input.timeStamp - firstInput.timeStamp;
	
	        input.angle = getAngle(offsetCenter, center);
	        input.distance = getDistance(offsetCenter, center);
	
	        computeDeltaXY(session, input);
	        input.offsetDirection = getDirection(input.deltaX, input.deltaY);
	
	        input.scale = firstMultiple ? getScale(firstMultiple.pointers, pointers) : 1;
	        input.rotation = firstMultiple ? getRotation(firstMultiple.pointers, pointers) : 0;
	
	        computeIntervalInputData(session, input);
	
	        // find the correct target
	        var target = manager.element;
	        if (hasParent(input.srcEvent.target, target)) {
	            target = input.srcEvent.target;
	        }
	        input.target = target;
	    }
	
	    function computeDeltaXY(session, input) {
	        var center = input.center;
	        var offset = session.offsetDelta || {};
	        var prevDelta = session.prevDelta || {};
	        var prevInput = session.prevInput || {};
	
	        if (input.eventType === INPUT_START || prevInput.eventType === INPUT_END) {
	            prevDelta = session.prevDelta = {
	                x: prevInput.deltaX || 0,
	                y: prevInput.deltaY || 0
	            };
	
	            offset = session.offsetDelta = {
	                x: center.x,
	                y: center.y
	            };
	        }
	
	        input.deltaX = prevDelta.x + (center.x - offset.x);
	        input.deltaY = prevDelta.y + (center.y - offset.y);
	    }
	
	    /**
	     * velocity is calculated every x ms
	     * @param {Object} session
	     * @param {Object} input
	     */
	    function computeIntervalInputData(session, input) {
	        var last = session.lastInterval || input,
	            deltaTime = input.timeStamp - last.timeStamp,
	            velocity, velocityX, velocityY, direction;
	
	        if (input.eventType != INPUT_CANCEL && (deltaTime > COMPUTE_INTERVAL || last.velocity === undefined)) {
	            var deltaX = last.deltaX - input.deltaX;
	            var deltaY = last.deltaY - input.deltaY;
	
	            var v = getVelocity(deltaTime, deltaX, deltaY);
	            velocityX = v.x;
	            velocityY = v.y;
	            velocity = (abs(v.x) > abs(v.y)) ? v.x : v.y;
	            direction = getDirection(deltaX, deltaY);
	
	            session.lastInterval = input;
	        } else {
	            // use latest velocity info if it doesn't overtake a minimum period
	            velocity = last.velocity;
	            velocityX = last.velocityX;
	            velocityY = last.velocityY;
	            direction = last.direction;
	        }
	
	        input.velocity = velocity;
	        input.velocityX = velocityX;
	        input.velocityY = velocityY;
	        input.direction = direction;
	    }
	
	    /**
	     * create a simple clone from the input used for storage of firstInput and firstMultiple
	     * @param {Object} input
	     * @returns {Object} clonedInputData
	     */
	    function simpleCloneInputData(input) {
	        // make a simple copy of the pointers because we will get a reference if we don't
	        // we only need clientXY for the calculations
	        var pointers = [];
	        var i = 0;
	        while (i < input.pointers.length) {
	            pointers[i] = {
	                clientX: round(input.pointers[i].clientX),
	                clientY: round(input.pointers[i].clientY)
	            };
	            i++;
	        }
	
	        return {
	            timeStamp: now(),
	            pointers: pointers,
	            center: getCenter(pointers),
	            deltaX: input.deltaX,
	            deltaY: input.deltaY
	        };
	    }
	
	    /**
	     * get the center of all the pointers
	     * @param {Array} pointers
	     * @return {Object} center contains `x` and `y` properties
	     */
	    function getCenter(pointers) {
	        var pointersLength = pointers.length;
	
	        // no need to loop when only one touch
	        if (pointersLength === 1) {
	            return {
	                x: round(pointers[0].clientX),
	                y: round(pointers[0].clientY)
	            };
	        }
	
	        var x = 0,
	            y = 0,
	            i = 0;
	        while (i < pointersLength) {
	            x += pointers[i].clientX;
	            y += pointers[i].clientY;
	            i++;
	        }
	
	        return {
	            x: round(x / pointersLength),
	            y: round(y / pointersLength)
	        };
	    }
	
	    /**
	     * calculate the velocity between two points. unit is in px per ms.
	     * @param {Number} deltaTime
	     * @param {Number} x
	     * @param {Number} y
	     * @return {Object} velocity `x` and `y`
	     */
	    function getVelocity(deltaTime, x, y) {
	        return {
	            x: x / deltaTime || 0,
	            y: y / deltaTime || 0
	        };
	    }
	
	    /**
	     * get the direction between two points
	     * @param {Number} x
	     * @param {Number} y
	     * @return {Number} direction
	     */
	    function getDirection(x, y) {
	        if (x === y) {
	            return DIRECTION_NONE;
	        }
	
	        if (abs(x) >= abs(y)) {
	            return x > 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
	        }
	        return y > 0 ? DIRECTION_UP : DIRECTION_DOWN;
	    }
	
	    /**
	     * calculate the absolute distance between two points
	     * @param {Object} p1 {x, y}
	     * @param {Object} p2 {x, y}
	     * @param {Array} [props] containing x and y keys
	     * @return {Number} distance
	     */
	    function getDistance(p1, p2, props) {
	        if (!props) {
	            props = PROPS_XY;
	        }
	        var x = p2[props[0]] - p1[props[0]],
	            y = p2[props[1]] - p1[props[1]];
	
	        return Math.sqrt((x * x) + (y * y));
	    }
	
	    /**
	     * calculate the angle between two coordinates
	     * @param {Object} p1
	     * @param {Object} p2
	     * @param {Array} [props] containing x and y keys
	     * @return {Number} angle
	     */
	    function getAngle(p1, p2, props) {
	        if (!props) {
	            props = PROPS_XY;
	        }
	        var x = p2[props[0]] - p1[props[0]],
	            y = p2[props[1]] - p1[props[1]];
	        return Math.atan2(y, x) * 180 / Math.PI;
	    }
	
	    /**
	     * calculate the rotation degrees between two pointersets
	     * @param {Array} start array of pointers
	     * @param {Array} end array of pointers
	     * @return {Number} rotation
	     */
	    function getRotation(start, end) {
	        return getAngle(end[1], end[0], PROPS_CLIENT_XY) - getAngle(start[1], start[0], PROPS_CLIENT_XY);
	    }
	
	    /**
	     * calculate the scale factor between two pointersets
	     * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
	     * @param {Array} start array of pointers
	     * @param {Array} end array of pointers
	     * @return {Number} scale
	     */
	    function getScale(start, end) {
	        return getDistance(end[0], end[1], PROPS_CLIENT_XY) / getDistance(start[0], start[1], PROPS_CLIENT_XY);
	    }
	
	    var MOUSE_INPUT_MAP = {
	        mousedown: INPUT_START,
	        mousemove: INPUT_MOVE,
	        mouseup: INPUT_END
	    };
	
	    var MOUSE_ELEMENT_EVENTS = 'mousedown';
	    var MOUSE_WINDOW_EVENTS = 'mousemove mouseup';
	
	    /**
	     * Mouse events input
	     * @constructor
	     * @extends Input
	     */
	    function MouseInput() {
	        this.evEl = MOUSE_ELEMENT_EVENTS;
	        this.evWin = MOUSE_WINDOW_EVENTS;
	
	        this.allow = true; // used by Input.TouchMouse to disable mouse events
	        this.pressed = false; // mousedown state
	
	        Input.apply(this, arguments);
	    }
	
	    inherit(MouseInput, Input, {
	        /**
	         * handle mouse events
	         * @param {Object} ev
	         */
	        handler: function MEhandler(ev) {
	            var eventType = MOUSE_INPUT_MAP[ev.type];
	
	            // on start we want to have the left mouse button down
	            if (eventType & INPUT_START && ev.button === 0) {
	                this.pressed = true;
	            }
	
	            if (eventType & INPUT_MOVE && ev.which !== 1) {
	                eventType = INPUT_END;
	            }
	
	            // mouse must be down, and mouse events are allowed (see the TouchMouse input)
	            if (!this.pressed || !this.allow) {
	                return;
	            }
	
	            if (eventType & INPUT_END) {
	                this.pressed = false;
	            }
	
	            this.callback(this.manager, eventType, {
	                pointers: [ev],
	                changedPointers: [ev],
	                pointerType: INPUT_TYPE_MOUSE,
	                srcEvent: ev
	            });
	        }
	    });
	
	    var POINTER_INPUT_MAP = {
	        pointerdown: INPUT_START,
	        pointermove: INPUT_MOVE,
	        pointerup: INPUT_END,
	        pointercancel: INPUT_CANCEL,
	        pointerout: INPUT_CANCEL
	    };
	
	    // in IE10 the pointer types is defined as an enum
	    var IE10_POINTER_TYPE_ENUM = {
	        2: INPUT_TYPE_TOUCH,
	        3: INPUT_TYPE_PEN,
	        4: INPUT_TYPE_MOUSE,
	        5: INPUT_TYPE_KINECT // see https://twitter.com/jacobrossi/status/480596438489890816
	    };
	
	    var POINTER_ELEMENT_EVENTS = 'pointerdown';
	    var POINTER_WINDOW_EVENTS = 'pointermove pointerup pointercancel';
	
	    // IE10 has prefixed support, and case-sensitive
	    if (window.MSPointerEvent) {
	        POINTER_ELEMENT_EVENTS = 'MSPointerDown';
	        POINTER_WINDOW_EVENTS = 'MSPointerMove MSPointerUp MSPointerCancel';
	    }
	
	    /**
	     * Pointer events input
	     * @constructor
	     * @extends Input
	     */
	    function PointerEventInput() {
	        this.evEl = POINTER_ELEMENT_EVENTS;
	        this.evWin = POINTER_WINDOW_EVENTS;
	
	        Input.apply(this, arguments);
	
	        this.store = (this.manager.session.pointerEvents = []);
	    }
	
	    inherit(PointerEventInput, Input, {
	        /**
	         * handle mouse events
	         * @param {Object} ev
	         */
	        handler: function PEhandler(ev) {
	            var store = this.store;
	            var removePointer = false;
	
	            var eventTypeNormalized = ev.type.toLowerCase().replace('ms', '');
	            var eventType = POINTER_INPUT_MAP[eventTypeNormalized];
	            var pointerType = IE10_POINTER_TYPE_ENUM[ev.pointerType] || ev.pointerType;
	
	            var isTouch = (pointerType == INPUT_TYPE_TOUCH);
	
	            // start and mouse must be down
	            if (eventType & INPUT_START && (ev.button === 0 || isTouch)) {
	                store.push(ev);
	            } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
	                removePointer = true;
	            }
	
	            // get index of the event in the store
	            // it not found, so the pointer hasn't been down (so it's probably a hover)
	            var storeIndex = inArray(store, ev.pointerId, 'pointerId');
	            if (storeIndex < 0) {
	                return;
	            }
	
	            // update the event in the store
	            store[storeIndex] = ev;
	
	            this.callback(this.manager, eventType, {
	                pointers: store,
	                changedPointers: [ev],
	                pointerType: pointerType,
	                srcEvent: ev
	            });
	
	            if (removePointer) {
	                // remove from the store
	                store.splice(storeIndex, 1);
	            }
	        }
	    });
	
	    var TOUCH_INPUT_MAP = {
	        touchstart: INPUT_START,
	        touchmove: INPUT_MOVE,
	        touchend: INPUT_END,
	        touchcancel: INPUT_CANCEL
	    };
	
	    var TOUCH_TARGET_EVENTS = 'touchstart touchmove touchend touchcancel';
	
	    /**
	     * Touch events input
	     * @constructor
	     * @extends Input
	     */
	    function TouchInput() {
	        this.evTarget = TOUCH_TARGET_EVENTS;
	        this.targetIds = {};
	
	        Input.apply(this, arguments);
	    }
	
	    inherit(TouchInput, Input, {
	        /**
	         * handle touch events
	         * @param {Object} ev
	         */
	        handler: function TEhandler(ev) {
	            var type = TOUCH_INPUT_MAP[ev.type];
	            var touches = getTouches.call(this, ev, type);
	            if (!touches) {
	                return;
	            }
	
	            this.callback(this.manager, type, {
	                pointers: touches[0],
	                changedPointers: touches[1],
	                pointerType: INPUT_TYPE_TOUCH,
	                srcEvent: ev
	            });
	        }
	    });
	
	    /**
	     * @this {TouchInput}
	     * @param {Object} ev
	     * @param {Number} type flag
	     * @returns {undefined|Array} [all, changed]
	     */
	    function getTouches(ev, type) {
	        var allTouches = toArray(ev.touches);
	        var targetIds = this.targetIds;
	
	        // when there is only one touch, the process can be simplified
	        if (type & (INPUT_START | INPUT_MOVE) && allTouches.length === 1) {
	            targetIds[allTouches[0].identifier] = true;
	            return [allTouches, allTouches];
	        }
	
	        var i,
	            targetTouches = toArray(ev.targetTouches),
	            changedTouches = toArray(ev.changedTouches),
	            changedTargetTouches = [];
	
	        // collect touches
	        if (type === INPUT_START) {
	            i = 0;
	            while (i < targetTouches.length) {
	                targetIds[targetTouches[i].identifier] = true;
	                i++;
	            }
	        }
	
	        // filter changed touches to only contain touches that exist in the collected target ids
	        i = 0;
	        while (i < changedTouches.length) {
	            if (targetIds[changedTouches[i].identifier]) {
	                changedTargetTouches.push(changedTouches[i]);
	            }
	
	            // cleanup removed touches
	            if (type & (INPUT_END | INPUT_CANCEL)) {
	                delete targetIds[changedTouches[i].identifier];
	            }
	            i++;
	        }
	
	        if (!changedTargetTouches.length) {
	            return;
	        }
	
	        return [
	            // merge targetTouches with changedTargetTouches so it contains ALL touches, including 'end' and 'cancel'
	            uniqueArray(targetTouches.concat(changedTargetTouches), 'identifier', true),
	            changedTargetTouches
	        ];
	    }
	
	    /**
	     * Combined touch and mouse input
	     *
	     * Touch has a higher priority then mouse, and while touching no mouse events are allowed.
	     * This because touch devices also emit mouse events while doing a touch.
	     *
	     * @constructor
	     * @extends Input
	     */
	    function TouchMouseInput() {
	        Input.apply(this, arguments);
	
	        var handler = bindFn(this.handler, this);
	        this.touch = new TouchInput(this.manager, handler);
	        this.mouse = new MouseInput(this.manager, handler);
	    }
	
	    inherit(TouchMouseInput, Input, {
	        /**
	         * handle mouse and touch events
	         * @param {Touch} manager
	         * @param {String} inputEvent
	         * @param {Object} inputData
	         */
	        handler: function TMEhandler(manager, inputEvent, inputData) {
	            var isTouch = (inputData.pointerType == INPUT_TYPE_TOUCH),
	                isMouse = (inputData.pointerType == INPUT_TYPE_MOUSE);
	
	            // when we're in a touch event, so  block all upcoming mouse events
	            // most mobile browser also emit mouseevents, right after touchstart
	            if (isTouch) {
	                this.mouse.allow = false;
	            } else if (isMouse && !this.mouse.allow) {
	                return;
	            }
	
	            // reset the allowMouse when we're done
	            if (inputEvent & (INPUT_END | INPUT_CANCEL)) {
	                this.mouse.allow = true;
	            }
	
	            this.callback(manager, inputEvent, inputData);
	        },
	
	        /**
	         * remove the event listeners
	         */
	        destroy: function destroy() {
	            this.touch.destroy();
	            this.mouse.destroy();
	        }
	    });
	
	    var PREFIXED_TOUCH_ACTION = prefixed(TEST_ELEMENT.style, 'touchAction');
	    var NATIVE_TOUCH_ACTION = PREFIXED_TOUCH_ACTION !== undefined;
	
	    // magical touchAction value
	    var TOUCH_ACTION_COMPUTE = 'compute';
	    var TOUCH_ACTION_AUTO = 'auto';
	    var TOUCH_ACTION_MANIPULATION = 'manipulation'; // not implemented
	    var TOUCH_ACTION_NONE = 'none';
	    var TOUCH_ACTION_PAN_X = 'pan-x';
	    var TOUCH_ACTION_PAN_Y = 'pan-y';
	
	    /**
	     * Touch Action
	     * sets the touchAction property or uses the js alternative
	     * @param {Manager} manager
	     * @param {String} value
	     * @constructor
	     */
	    function TouchAction(manager, value) {
	        this.manager = manager;
	        this.set(value);
	    }
	
	    TouchAction.prototype = {
	        /**
	         * set the touchAction value on the element or enable the polyfill
	         * @param {String} value
	         */
	        set: function(value) {
	            // find out the touch-action by the event handlers
	            if (value == TOUCH_ACTION_COMPUTE) {
	                value = this.compute();
	            }
	
	            if (NATIVE_TOUCH_ACTION) {
	                this.manager.element.style[PREFIXED_TOUCH_ACTION] = value;
	            }
	            this.actions = value.toLowerCase().trim();
	        },
	
	        /**
	         * just re-set the touchAction value
	         */
	        update: function() {
	            this.set(this.manager.options.touchAction);
	        },
	
	        /**
	         * compute the value for the touchAction property based on the recognizer's settings
	         * @returns {String} value
	         */
	        compute: function() {
	            var actions = [];
	            each(this.manager.recognizers, function(recognizer) {
	                if (boolOrFn(recognizer.options.enable, [recognizer])) {
	                    actions = actions.concat(recognizer.getTouchAction());
	                }
	            });
	            return cleanTouchActions(actions.join(' '));
	        },
	
	        /**
	         * this method is called on each input cycle and provides the preventing of the browser behavior
	         * @param {Object} input
	         */
	        preventDefaults: function(input) {
	            // not needed with native support for the touchAction property
	            if (NATIVE_TOUCH_ACTION) {
	                return;
	            }
	
	            var srcEvent = input.srcEvent;
	            var direction = input.offsetDirection;
	
	            // if the touch action did prevented once this session
	            if (this.manager.session.prevented) {
	                srcEvent.preventDefault();
	                return;
	            }
	
	            var actions = this.actions;
	            var hasNone = inStr(actions, TOUCH_ACTION_NONE);
	            var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);
	            var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);
	
	            if (hasNone ||
	                (hasPanY && direction & DIRECTION_HORIZONTAL) ||
	                (hasPanX && direction & DIRECTION_VERTICAL)) {
	                return this.preventSrc(srcEvent);
	            }
	        },
	
	        /**
	         * call preventDefault to prevent the browser's default behavior (scrolling in most cases)
	         * @param {Object} srcEvent
	         */
	        preventSrc: function(srcEvent) {
	            this.manager.session.prevented = true;
	            srcEvent.preventDefault();
	        }
	    };
	
	    /**
	     * when the touchActions are collected they are not a valid value, so we need to clean things up. *
	     * @param {String} actions
	     * @returns {*}
	     */
	    function cleanTouchActions(actions) {
	        // none
	        if (inStr(actions, TOUCH_ACTION_NONE)) {
	            return TOUCH_ACTION_NONE;
	        }
	
	        var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);
	        var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);
	
	        // pan-x and pan-y can be combined
	        if (hasPanX && hasPanY) {
	            return TOUCH_ACTION_PAN_X + ' ' + TOUCH_ACTION_PAN_Y;
	        }
	
	        // pan-x OR pan-y
	        if (hasPanX || hasPanY) {
	            return hasPanX ? TOUCH_ACTION_PAN_X : TOUCH_ACTION_PAN_Y;
	        }
	
	        // manipulation
	        if (inStr(actions, TOUCH_ACTION_MANIPULATION)) {
	            return TOUCH_ACTION_MANIPULATION;
	        }
	
	        return TOUCH_ACTION_AUTO;
	    }
	
	    /**
	     * Recognizer flow explained; *
	     * All recognizers have the initial state of POSSIBLE when a input session starts.
	     * The definition of a input session is from the first input until the last input, with all it's movement in it. *
	     * Example session for mouse-input: mousedown -> mousemove -> mouseup
	     *
	     * On each recognizing cycle (see Manager.recognize) the .recognize() method is executed
	     * which determines with state it should be.
	     *
	     * If the recognizer has the state FAILED, CANCELLED or RECOGNIZED (equals ENDED), it is reset to
	     * POSSIBLE to give it another change on the next cycle.
	     *
	     *               Possible
	     *                  |
	     *            +-----+---------------+
	     *            |                     |
	     *      +-----+-----+               |
	     *      |           |               |
	     *   Failed      Cancelled          |
	     *                          +-------+------+
	     *                          |              |
	     *                      Recognized       Began
	     *                                         |
	     *                                      Changed
	     *                                         |
	     *                                  Ended/Recognized
	     */
	    var STATE_POSSIBLE = 1;
	    var STATE_BEGAN = 2;
	    var STATE_CHANGED = 4;
	    var STATE_ENDED = 8;
	    var STATE_RECOGNIZED = STATE_ENDED;
	    var STATE_CANCELLED = 16;
	    var STATE_FAILED = 32;
	
	    /**
	     * Recognizer
	     * Every recognizer needs to extend from this class.
	     * @constructor
	     * @param {Object} options
	     */
	    function Recognizer(options) {
	        this.id = uniqueId();
	
	        this.manager = null;
	        this.options = merge(options || {}, this.defaults);
	
	        // default is enable true
	        this.options.enable = ifUndefined(this.options.enable, true);
	
	        this.state = STATE_POSSIBLE;
	
	        this.simultaneous = {};
	        this.requireFail = [];
	    }
	
	    Recognizer.prototype = {
	        /**
	         * @virtual
	         * @type {Object}
	         */
	        defaults: {},
	
	        /**
	         * set options
	         * @param {Object} options
	         * @return {Recognizer}
	         */
	        set: function(options) {
	            extend(this.options, options);
	
	            // also update the touchAction, in case something changed about the directions/enabled state
	            this.manager && this.manager.touchAction.update();
	            return this;
	        },
	
	        /**
	         * recognize simultaneous with an other recognizer.
	         * @param {Recognizer} otherRecognizer
	         * @returns {Recognizer} this
	         */
	        recognizeWith: function(otherRecognizer) {
	            if (invokeArrayArg(otherRecognizer, 'recognizeWith', this)) {
	                return this;
	            }
	
	            var simultaneous = this.simultaneous;
	            otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
	            if (!simultaneous[otherRecognizer.id]) {
	                simultaneous[otherRecognizer.id] = otherRecognizer;
	                otherRecognizer.recognizeWith(this);
	            }
	            return this;
	        },
	
	        /**
	         * drop the simultaneous link. it doesnt remove the link on the other recognizer.
	         * @param {Recognizer} otherRecognizer
	         * @returns {Recognizer} this
	         */
	        dropRecognizeWith: function(otherRecognizer) {
	            if (invokeArrayArg(otherRecognizer, 'dropRecognizeWith', this)) {
	                return this;
	            }
	
	            otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
	            delete this.simultaneous[otherRecognizer.id];
	            return this;
	        },
	
	        /**
	         * recognizer can only run when an other is failing
	         * @param {Recognizer} otherRecognizer
	         * @returns {Recognizer} this
	         */
	        requireFailure: function(otherRecognizer) {
	            if (invokeArrayArg(otherRecognizer, 'requireFailure', this)) {
	                return this;
	            }
	
	            var requireFail = this.requireFail;
	            otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
	            if (inArray(requireFail, otherRecognizer) === -1) {
	                requireFail.push(otherRecognizer);
	                otherRecognizer.requireFailure(this);
	            }
	            return this;
	        },
	
	        /**
	         * drop the requireFailure link. it does not remove the link on the other recognizer.
	         * @param {Recognizer} otherRecognizer
	         * @returns {Recognizer} this
	         */
	        dropRequireFailure: function(otherRecognizer) {
	            if (invokeArrayArg(otherRecognizer, 'dropRequireFailure', this)) {
	                return this;
	            }
	
	            otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
	            var index = inArray(this.requireFail, otherRecognizer);
	            if (index > -1) {
	                this.requireFail.splice(index, 1);
	            }
	            return this;
	        },
	
	        /**
	         * has require failures boolean
	         * @returns {boolean}
	         */
	        hasRequireFailures: function() {
	            return this.requireFail.length > 0;
	        },
	
	        /**
	         * if the recognizer can recognize simultaneous with an other recognizer
	         * @param {Recognizer} otherRecognizer
	         * @returns {Boolean}
	         */
	        canRecognizeWith: function(otherRecognizer) {
	            return !!this.simultaneous[otherRecognizer.id];
	        },
	
	        /**
	         * You should use `tryEmit` instead of `emit` directly to check
	         * that all the needed recognizers has failed before emitting.
	         * @param {Object} input
	         */
	        emit: function(input) {
	            var self = this;
	            var state = this.state;
	
	            function emit(withState) {
	                self.manager.emit(self.options.event + (withState ? stateStr(state) : ''), input);
	            }
	
	            // 'panstart' and 'panmove'
	            if (state < STATE_ENDED) {
	                emit(true);
	            }
	
	            emit(); // simple 'eventName' events
	
	            // panend and pancancel
	            if (state >= STATE_ENDED) {
	                emit(true);
	            }
	        },
	
	        /**
	         * Check that all the require failure recognizers has failed,
	         * if true, it emits a gesture event,
	         * otherwise, setup the state to FAILED.
	         * @param {Object} input
	         */
	        tryEmit: function(input) {
	            if (this.canEmit()) {
	                return this.emit(input);
	            }
	            // it's failing anyway
	            this.state = STATE_FAILED;
	        },
	
	        /**
	         * can we emit?
	         * @returns {boolean}
	         */
	        canEmit: function() {
	            var i = 0;
	            while (i < this.requireFail.length) {
	                if (!(this.requireFail[i].state & (STATE_FAILED | STATE_POSSIBLE))) {
	                    return false;
	                }
	                i++;
	            }
	            return true;
	        },
	
	        /**
	         * update the recognizer
	         * @param {Object} inputData
	         */
	        recognize: function(inputData) {
	            // make a new copy of the inputData
	            // so we can change the inputData without messing up the other recognizers
	            var inputDataClone = extend({}, inputData);
	
	            // is is enabled and allow recognizing?
	            if (!boolOrFn(this.options.enable, [this, inputDataClone])) {
	                this.reset();
	                this.state = STATE_FAILED;
	                return;
	            }
	
	            // reset when we've reached the end
	            if (this.state & (STATE_RECOGNIZED | STATE_CANCELLED | STATE_FAILED)) {
	                this.state = STATE_POSSIBLE;
	            }
	
	            this.state = this.process(inputDataClone);
	
	            // the recognizer has recognized a gesture
	            // so trigger an event
	            if (this.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED | STATE_CANCELLED)) {
	                this.tryEmit(inputDataClone);
	            }
	        },
	
	        /**
	         * return the state of the recognizer
	         * the actual recognizing happens in this method
	         * @virtual
	         * @param {Object} inputData
	         * @returns {Const} STATE
	         */
	        process: function(inputData) { }, // jshint ignore:line
	
	        /**
	         * return the preferred touch-action
	         * @virtual
	         * @returns {Array}
	         */
	        getTouchAction: function() { },
	
	        /**
	         * called when the gesture isn't allowed to recognize
	         * like when another is being recognized or it is disabled
	         * @virtual
	         */
	        reset: function() { }
	    };
	
	    /**
	     * get a usable string, used as event postfix
	     * @param {Const} state
	     * @returns {String} state
	     */
	    function stateStr(state) {
	        if (state & STATE_CANCELLED) {
	            return 'cancel';
	        } else if (state & STATE_ENDED) {
	            return 'end';
	        } else if (state & STATE_CHANGED) {
	            return 'move';
	        } else if (state & STATE_BEGAN) {
	            return 'start';
	        }
	        return '';
	    }
	
	    /**
	     * direction cons to string
	     * @param {Const} direction
	     * @returns {String}
	     */
	    function directionStr(direction) {
	        if (direction == DIRECTION_DOWN) {
	            return 'down';
	        } else if (direction == DIRECTION_UP) {
	            return 'up';
	        } else if (direction == DIRECTION_LEFT) {
	            return 'left';
	        } else if (direction == DIRECTION_RIGHT) {
	            return 'right';
	        }
	        return '';
	    }
	
	    /**
	     * get a recognizer by name if it is bound to a manager
	     * @param {Recognizer|String} otherRecognizer
	     * @param {Recognizer} recognizer
	     * @returns {Recognizer}
	     */
	    function getRecognizerByNameIfManager(otherRecognizer, recognizer) {
	        var manager = recognizer.manager;
	        if (manager) {
	            return manager.get(otherRecognizer);
	        }
	        return otherRecognizer;
	    }
	
	    /**
	     * This recognizer is just used as a base for the simple attribute recognizers.
	     * @constructor
	     * @extends Recognizer
	     */
	    function AttrRecognizer() {
	        Recognizer.apply(this, arguments);
	    }
	
	    inherit(AttrRecognizer, Recognizer, {
	        /**
	         * @namespace
	         * @memberof AttrRecognizer
	         */
	        defaults: {
	            /**
	             * @type {Number}
	             * @default 1
	             */
	            pointers: 1
	        },
	
	        /**
	         * Used to check if it the recognizer receives valid input, like input.distance > 10.
	         * @memberof AttrRecognizer
	         * @param {Object} input
	         * @returns {Boolean} recognized
	         */
	        attrTest: function(input) {
	            var optionPointers = this.options.pointers;
	            return optionPointers === 0 || input.pointers.length === optionPointers;
	        },
	
	        /**
	         * Process the input and return the state for the recognizer
	         * @memberof AttrRecognizer
	         * @param {Object} input
	         * @returns {*} State
	         */
	        process: function(input) {
	            var state = this.state;
	            var eventType = input.eventType;
	
	            var isRecognized = state & (STATE_BEGAN | STATE_CHANGED);
	            var isValid = this.attrTest(input);
	
	            // on cancel input and we've recognized before, return STATE_CANCELLED
	            if (isRecognized && (eventType & INPUT_CANCEL || !isValid)) {
	                return state | STATE_CANCELLED;
	            } else if (isRecognized || isValid) {
	                if (eventType & INPUT_END) {
	                    return state | STATE_ENDED;
	                } else if (!(state & STATE_BEGAN)) {
	                    return STATE_BEGAN;
	                }
	                return state | STATE_CHANGED;
	            }
	            return STATE_FAILED;
	        }
	    });
	
	    /**
	     * Pan
	     * Recognized when the pointer is down and moved in the allowed direction.
	     * @constructor
	     * @extends AttrRecognizer
	     */
	    function PanRecognizer() {
	        AttrRecognizer.apply(this, arguments);
	
	        this.pX = null;
	        this.pY = null;
	    }
	
	    inherit(PanRecognizer, AttrRecognizer, {
	        /**
	         * @namespace
	         * @memberof PanRecognizer
	         */
	        defaults: {
	            event: 'pan',
	            threshold: 10 * scale,
	            pointers: 1,
	            direction: DIRECTION_ALL
	        },
	
	        getTouchAction: function() {
	            var direction = this.options.direction;
	            var actions = [];
	            if (direction & DIRECTION_HORIZONTAL) {
	                actions.push(TOUCH_ACTION_PAN_Y);
	            }
	            if (direction & DIRECTION_VERTICAL) {
	                actions.push(TOUCH_ACTION_PAN_X);
	            }
	            return actions;
	        },
	
	        directionTest: function(input) {
	            var options = this.options;
	            var hasMoved = true;
	            var distance = input.distance;
	            var direction = input.direction;
	            var x = input.deltaX;
	            var y = input.deltaY;
	
	            // lock to axis?
	            if (!(direction & options.direction)) {
	                if (options.direction & DIRECTION_HORIZONTAL) {
	                    direction = (x === 0) ? DIRECTION_NONE : (x < 0) ? DIRECTION_LEFT : DIRECTION_RIGHT;
	                    hasMoved = x != this.pX;
	                    distance = Math.abs(input.deltaX);
	                } else {
	                    direction = (y === 0) ? DIRECTION_NONE : (y < 0) ? DIRECTION_UP : DIRECTION_DOWN;
	                    hasMoved = y != this.pY;
	                    distance = Math.abs(input.deltaY);
	                }
	            }
	            input.direction = direction;
	            return hasMoved && distance > options.threshold && direction & options.direction;
	        },
	
	        attrTest: function(input) {
	            return AttrRecognizer.prototype.attrTest.call(this, input) &&
	                (this.state & STATE_BEGAN || (!(this.state & STATE_BEGAN) && this.directionTest(input)));
	        },
	
	        emit: function(input) {
	            this.pX = input.deltaX;
	            this.pY = input.deltaY;
	
	            var direction = directionStr(input.direction);
	            if (direction) {
	                this.manager.emit(this.options.event + direction, input);
	            }
	
	            this._super.emit.call(this, input);
	        }
	    });
	
	    /**
	     * Pinch
	     * Recognized when two or more pointers are moving toward (zoom-in) or away from each other (zoom-out).
	     * @constructor
	     * @extends AttrRecognizer
	     */
	    function PinchRecognizer() {
	        AttrRecognizer.apply(this, arguments);
	    }
	
	    inherit(PinchRecognizer, AttrRecognizer, {
	        /**
	         * @namespace
	         * @memberof PinchRecognizer
	         */
	        defaults: {
	            event: 'pinch',
	            threshold: 0,
	            pointers: 2
	        },
	
	        getTouchAction: function() {
	            return [TOUCH_ACTION_NONE];
	        },
	
	        attrTest: function(input) {
	            return this._super.attrTest.call(this, input) &&
	                (Math.abs(input.scale - 1) > this.options.threshold || this.state & STATE_BEGAN);
	        },
	
	        emit: function(input) {
	            this._super.emit.call(this, input);
	            if (input.scale !== 1) {
	                var inOut = input.scale < 1 ? 'in' : 'out';
	                this.manager.emit(this.options.event + inOut, input);
	            }
	        }
	    });
	
	    /**
	     * Press
	     * Recognized when the pointer is down for x ms without any movement.
	     * @constructor
	     * @extends Recognizer
	     */
	    function PressRecognizer() {
	        Recognizer.apply(this, arguments);
	
	        this._timer = null;
	        this._input = null;
	    }
	
	    inherit(PressRecognizer, Recognizer, {
	        /**
	         * @namespace
	         * @memberof PressRecognizer
	         */
	        defaults: {
	            event: 'press',
	            pointers: 1,
	            time: 500, // minimal time of the pointer to be pressed
	            threshold: 5 * scale // a minimal movement is ok, but keep it low
	        },
	
	        getTouchAction: function() {
	            return [TOUCH_ACTION_AUTO];
	        },
	
	        process: function(input) {
	            var options = this.options;
	            var validPointers = input.pointers.length === options.pointers;
	            var validMovement = input.distance < options.threshold;
	            var validTime = input.deltaTime > options.time;
	
	            this._input = input;
	
	            // we only allow little movement
	            // and we've reached an end event, so a tap is possible
	            if (!validMovement || !validPointers || (input.eventType & (INPUT_END | INPUT_CANCEL) && !validTime)) {
	                this.reset();
	            } else if (input.eventType & INPUT_START) {
	                this.reset();
	                this._timer = setTimeoutContext(function() {
	                    this.state = STATE_RECOGNIZED;
	                    this.tryEmit();
	                }, options.time, this);
	            } else if (input.eventType & INPUT_END) {
	                return STATE_RECOGNIZED;
	            }
	            return STATE_FAILED;
	        },
	
	        reset: function() {
	            clearTimeout(this._timer);
	        },
	
	        emit: function(input) {
	            if (this.state !== STATE_RECOGNIZED) {
	                return;
	            }
	
	            if (input && (input.eventType & INPUT_END)) {
	                this.manager.emit(this.options.event + 'up', input);
	            } else {
	                this._input.timeStamp = now();
	                this.manager.emit(this.options.event, this._input);
	            }
	        }
	    });
	
	    /**
	     * Rotate
	     * Recognized when two or more pointer are moving in a circular motion.
	     * @constructor
	     * @extends AttrRecognizer
	     */
	    function RotateRecognizer() {
	        AttrRecognizer.apply(this, arguments);
	    }
	
	    inherit(RotateRecognizer, AttrRecognizer, {
	        /**
	         * @namespace
	         * @memberof RotateRecognizer
	         */
	        defaults: {
	            event: 'rotate',
	            threshold: 0,
	            pointers: 2
	        },
	
	        getTouchAction: function() {
	            return [TOUCH_ACTION_NONE];
	        },
	
	        attrTest: function(input) {
	            return this._super.attrTest.call(this, input) &&
	                (Math.abs(input.rotation) > this.options.threshold || this.state & STATE_BEGAN);
	        }
	    });
	
	    /**
	     * Swipe
	     * Recognized when the pointer is moving fast (velocity), with enough distance in the allowed direction.
	     * @constructor
	     * @extends AttrRecognizer
	     */
	    function SwipeRecognizer() {
	        AttrRecognizer.apply(this, arguments);
	    }
	
	    inherit(SwipeRecognizer, AttrRecognizer, {
	        /**
	         * @namespace
	         * @memberof SwipeRecognizer
	         */
	        defaults: {
	            event: 'swipe',
	            threshold: 10 * scale,
	            velocity: 0.65,
	            direction: DIRECTION_HORIZONTAL | DIRECTION_VERTICAL,
	            pointers: 1
	        },
	
	        getTouchAction: function() {
	            return PanRecognizer.prototype.getTouchAction.call(this);
	        },
	
	        attrTest: function(input) {
	            var direction = this.options.direction;
	            var velocity;
	
	            if (direction & (DIRECTION_HORIZONTAL | DIRECTION_VERTICAL)) {
	                velocity = input.velocity;
	            } else if (direction & DIRECTION_HORIZONTAL) {
	                velocity = input.velocityX;
	            } else if (direction & DIRECTION_VERTICAL) {
	                velocity = input.velocityY;
	            }
	
	            return this._super.attrTest.call(this, input) &&
	                direction & input.direction &&
	                input.distance > this.options.threshold &&
	                abs(velocity) > this.options.velocity && input.eventType & INPUT_END;
	        },
	
	        emit: function(input) {
	            var direction = directionStr(input.direction);
	            if (direction) {
	                this.manager.emit(this.options.event + direction, input);
	            }
	
	            this.manager.emit(this.options.event, input);
	        }
	    });
	
	    /**
	     * A tap is ecognized when the pointer is doing a small tap/click. Multiple taps are recognized if they occur
	     * between the given interval and position. The delay option can be used to recognize multi-taps without firing
	     * a single tap.
	     *
	     * The eventData from the emitted event contains the property `tapCount`, which contains the amount of
	     * multi-taps being recognized.
	     * @constructor
	     * @extends Recognizer
	     */
	    function TapRecognizer() {
	        Recognizer.apply(this, arguments);
	
	        // previous time and center,
	        // used for tap counting
	        this.pTime = false;
	        this.pCenter = false;
	
	        this._timer = null;
	        this._input = null;
	        this.count = 0;
	    }
	
	    inherit(TapRecognizer, Recognizer, {
	        /**
	         * @namespace
	         * @memberof PinchRecognizer
	         */
	        defaults: {
	            event: 'tap',
	            pointers: 1,
	            taps: 1,
	            interval: 300, // max time between the multi-tap taps
	            time: 250, // max time of the pointer to be down (like finger on the screen)
	            threshold: 10 * scale, // a minimal movement is ok, but keep it low
	            posThreshold: 10 * scale // a multi-tap can be a bit off the initial position
	        },
	
	        getTouchAction: function() {
	            return [TOUCH_ACTION_MANIPULATION];
	        },
	
	        process: function(input) {
	            var options = this.options;
	
	            var validPointers = input.pointers.length === options.pointers;
	            var validMovement = input.distance < options.threshold;
	            var validTouchTime = input.deltaTime < options.time;
	
	            this.reset();
	
	            if ((input.eventType & INPUT_START) && (this.count === 0)) {
	                return this.failTimeout();
	            }
	
	            // we only allow little movement
	            // and we've reached an end event, so a tap is possible
	            if (validMovement && validTouchTime && validPointers) {
	                if (input.eventType != INPUT_END) {
	                    return this.failTimeout();
	                }
	
	                var validInterval = this.pTime ? (input.timeStamp - this.pTime < options.interval) : true;
	                var validMultiTap = !this.pCenter || getDistance(this.pCenter, input.center) < options.posThreshold;
	
	                this.pTime = input.timeStamp;
	                this.pCenter = input.center;
	
	                if (!validMultiTap || !validInterval) {
	                    this.count = 1;
	                } else {
	                    this.count += 1;
	                }
	
	                this._input = input;
	
	                // if tap count matches we have recognized it,
	                // else it has began recognizing...
	                var tapCount = this.count % options.taps;
	                if (tapCount === 0) {
	                    // no failing requirements, immediately trigger the tap event
	                    // or wait as long as the multitap interval to trigger
	                    if (!this.hasRequireFailures()) {
	                        return STATE_RECOGNIZED;
	                    } else {
	                        this._timer = setTimeoutContext(function() {
	                            this.state = STATE_RECOGNIZED;
	                            this.tryEmit();
	                        }, options.interval, this);
	                        return STATE_BEGAN;
	                    }
	                }
	            }
	            return STATE_FAILED;
	        },
	
	        failTimeout: function() {
	            this._timer = setTimeoutContext(function() {
	                this.state = STATE_FAILED;
	            }, this.options.interval, this);
	            return STATE_FAILED;
	        },
	
	        reset: function() {
	            clearTimeout(this._timer);
	        },
	
	        emit: function() {
	            if (this.state == STATE_RECOGNIZED ) {
	                this._input.tapCount = this.count;
	                this.manager.emit(this.options.event, this._input);
	            }
	        }
	    });
	
	    /**
	     * Simple way to create an manager with a default set of recognizers.
	     * @param {HTMLElement} element
	     * @param {Object} [options]
	     * @constructor
	     */
	    function Touch(element, options) {
	        options = options || {};
	        options.recognizers = ifUndefined(options.recognizers, Touch.defaults.preset);
	        return new Manager(element, options);
	    }
	
	    /**
	     * @const {string}
	     */
	    Touch.VERSION = '2.0.3';
	
	    /**
	     * default settings
	     * @namespace
	     */
	    Touch.defaults = {
	        /**
	         * set if DOM events are being triggered.
	         * But this is slower and unused by simple implementations, so disabled by default.
	         * @type {Boolean}
	         * @default false
	         */
	        domEvents: false,
	
	        /**
	         * The value for the touchAction property/fallback.
	         * When set to `compute` it will magically set the correct value based on the added recognizers.
	         * @type {String}
	         * @default compute
	         */
	        touchAction: TOUCH_ACTION_COMPUTE,
	
	        /**
	         * @type {Boolean}
	         * @default true
	         */
	        enable: true,
	
	        /**
	         * EXPERIMENTAL FEATURE -- can be removed/changed
	         * Change the parent input target element.
	         * If Null, then it is being set the to main element.
	         * @type {Null|EventTarget}
	         * @default null
	         */
	        inputTarget: null,
	
	        /**
	         * force an input class
	         * @type {Null|Function}
	         * @default null
	         */
	        inputClass: null,
	
	        /**
	         * Default recognizer setup when calling `Touch()`
	         * When creating a new Manager these will be skipped.
	         * @type {Array}
	         */
	        preset: [
	            // RecognizerClass, options, [recognizeWith, ...], [requireFailure, ...]
	            [RotateRecognizer, { enable: false }],
	            [PinchRecognizer, { enable: false }, ['rotate']],
	            [SwipeRecognizer,{ direction: DIRECTION_HORIZONTAL }],
	            [PanRecognizer, { direction: DIRECTION_HORIZONTAL }, ['swipe']],
	            [TapRecognizer],
	            [TapRecognizer, { event: 'doubletap', taps: 2 }, ['tap']],
	            [PressRecognizer]
	        ],
	
	        /**
	         * Some CSS properties can be used to improve the working of Touch.
	         * Add them to this method and they will be set when creating a new Manager.
	         * @namespace
	         */
	        cssProps: {
	            /**
	             * Disables text selection to improve the dragging gesture. Mainly for desktop browsers.
	             * @type {String}
	             * @default 'none'
	             */
	            userSelect: 'none',
	
	            /**
	             * Disable the Windows Phone grippers when pressing an element.
	             * @type {String}
	             * @default 'none'
	             */
	            touchSelect: 'none',
	
	            /**
	             * Disables the default callout shown when you touch and hold a touch target.
	             * On iOS, when you touch and hold a touch target such as a link, Safari displays
	             * a callout containing information about the link. This property allows you to disable that callout.
	             * @type {String}
	             * @default 'none'
	             */
	            touchCallout: 'none',
	
	            /**
	             * Specifies whether zooming is enabled. Used by IE10>
	             * @type {String}
	             * @default 'none'
	             */
	            contentZooming: 'none',
	
	            /**
	             * Specifies that an entire element should be draggable instead of its contents. Mainly for desktop browsers.
	             * @type {String}
	             * @default 'none'
	             */
	            userDrag: 'none',
	
	            /**
	             * Overrides the highlight color shown when the user taps a link or a JavaScript
	             * clickable element in iOS. This property obeys the alpha value, if specified.
	             * @type {String}
	             * @default 'rgba(0,0,0,0)'
	             */
	            tapHighlightColor: 'rgba(0,0,0,0)'
	        }
	    };
	
	    var STOP = 1;
	    var FORCED_STOP = 2;
	
	    /**
	     * Manager
	     * @param {HTMLElement} element
	     * @param {Object} [options]
	     * @constructor
	     */
	    function Manager(element, options) {
	        options = options || {};
	
	        this.options = merge(options, Touch.defaults);
	        this.options.inputTarget = this.options.inputTarget || element;
	
	        this.handlers = {};
	        this.session = {};
	        this.recognizers = [];
	
	        this.element = element;
	        this.input = createInputInstance(this);
	        this.touchAction = new TouchAction(this, this.options.touchAction);
	
	        toggleCssProps(this, true);
	
	        each(options.recognizers, function(item) {
	            var recognizer = this.add(new (item[0])(item[1]));
	            item[2] && recognizer.recognizeWith(item[2]);
	            item[3] && recognizer.requireFailure(item[3]);
	        }, this);
	    }
	
	    Manager.prototype = {
	        /**
	         * set options
	         * @param {Object} options
	         * @returns {Manager}
	         */
	        set: function(options) {
	            extend(this.options, options);
	
	            // Options that need a little more setup
	            if (options.touchAction) {
	                this.touchAction.update();
	            }
	            if (options.inputTarget) {
	                // Clean up existing event listeners and reinitialize
	                this.input.destroy();
	                this.input.target = options.inputTarget;
	                this.input.init();
	            }
	            return this;
	        },
	
	        /**
	         * stop recognizing for this session.
	         * This session will be discarded, when a new [input]start event is fired.
	         * When forced, the recognizer cycle is stopped immediately.
	         * @param {Boolean} [force]
	         */
	        stop: function(force) {
	            this.session.stopped = force ? FORCED_STOP : STOP;
	        },
	
	        /**
	         * run the recognizers!
	         * called by the inputHandler function on every movement of the pointers (touches)
	         * it walks through all the recognizers and tries to detect the gesture that is being made
	         * @param {Object} inputData
	         */
	        recognize: function(inputData) {
	            var session = this.session;
	            if (session.stopped) {
	                return;
	            }
	
	            // run the touch-action polyfill
	            this.touchAction.preventDefaults(inputData);
	
	            var recognizer;
	            var recognizers = this.recognizers;
	
	            // this holds the recognizer that is being recognized.
	            // so the recognizer's state needs to be BEGAN, CHANGED, ENDED or RECOGNIZED
	            // if no recognizer is detecting a thing, it is set to `null`
	            var curRecognizer = session.curRecognizer;
	
	            // reset when the last recognizer is recognized
	            // or when we're in a new session
	            if (!curRecognizer || (curRecognizer && curRecognizer.state & STATE_RECOGNIZED)) {
	                curRecognizer = session.curRecognizer = null;
	            }
	
	            var i = 0;
	            while (i < recognizers.length) {
	                recognizer = recognizers[i];
	
	                // find out if we are allowed try to recognize the input for this one.
	                // 1.   allow if the session is NOT forced stopped (see the .stop() method)
	                // 2.   allow if we still haven't recognized a gesture in this session, or the this recognizer is the one
	                //      that is being recognized.
	                // 3.   allow if the recognizer is allowed to run simultaneous with the current recognized recognizer.
	                //      this can be setup with the `recognizeWith()` method on the recognizer.
	                if (session.stopped !== FORCED_STOP && ( // 1
	                        !curRecognizer || recognizer == curRecognizer || // 2
	                        recognizer.canRecognizeWith(curRecognizer))) { // 3
	                    recognizer.recognize(inputData);
	                } else {
	                    recognizer.reset();
	                }
	
	                // if the recognizer has been recognizing the input as a valid gesture, we want to store this one as the
	                // current active recognizer. but only if we don't already have an active recognizer
	                if (!curRecognizer && recognizer.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED)) {
	                    curRecognizer = session.curRecognizer = recognizer;
	                }
	                i++;
	            }
	        },
	
	        /**
	         * get a recognizer by its event name.
	         * @param {Recognizer|String} recognizer
	         * @returns {Recognizer|Null}
	         */
	        get: function(recognizer) {
	            if (recognizer instanceof Recognizer) {
	                return recognizer;
	            }
	
	            var recognizers = this.recognizers;
	            for (var i = 0; i < recognizers.length; i++) {
	                if (recognizers[i].options.event == recognizer) {
	                    return recognizers[i];
	                }
	            }
	            return null;
	        },
	
	        /**
	         * add a recognizer to the manager
	         * existing recognizers with the same event name will be removed
	         * @param {Recognizer} recognizer
	         * @returns {Recognizer|Manager}
	         */
	        add: function(recognizer) {
	            if (invokeArrayArg(recognizer, 'add', this)) {
	                return this;
	            }
	
	            // remove existing
	            var existing = this.get(recognizer.options.event);
	            if (existing) {
	                this.remove(existing);
	            }
	
	            this.recognizers.push(recognizer);
	            recognizer.manager = this;
	
	            this.touchAction.update();
	            return recognizer;
	        },
	
	        /**
	         * remove a recognizer by name or instance
	         * @param {Recognizer|String} recognizer
	         * @returns {Manager}
	         */
	        remove: function(recognizer) {
	            if (invokeArrayArg(recognizer, 'remove', this)) {
	                return this;
	            }
	
	            var recognizers = this.recognizers;
	            recognizer = this.get(recognizer);
	            recognizers.splice(inArray(recognizers, recognizer), 1);
	
	            this.touchAction.update();
	            return this;
	        },
	
	        /**
	         * bind event
	         * @param {String} events
	         * @param {Function} handler
	         * @returns {EventEmitter} this
	         */
	        on: function(events, handler) {
	            var handlers = this.handlers;
	            each(splitStr(events), function(event) {
	                handlers[event] = handlers[event] || [];
	                handlers[event].push(handler);
	            });
	            return this;
	        },
	
	        /**
	         * unbind event, leave emit blank to remove all handlers
	         * @param {String} events
	         * @param {Function} [handler]
	         * @returns {EventEmitter} this
	         */
	        off: function(events, handler) {
	            var handlers = this.handlers;
	            each(splitStr(events), function(event) {
	                if (!handler) {
	                    delete handlers[event];
	                } else {
	                    handlers[event].splice(inArray(handlers[event], handler), 1);
	                }
	            });
	            return this;
	        },
	
	        /**
	         * emit event to the listeners
	         * @param {String} event
	         * @param {Object} data
	         */
	        emit: function(event, data) {
	            // we also want to trigger dom events
	            if (this.options.domEvents) {
	                triggerDomEvent(event, data);
	            }
	
	            // no handlers, so skip it all
	            var handlers = this.handlers[event] && this.handlers[event].slice();
	            if (!handlers || !handlers.length) {
	                return;
	            }
	
	            data.type = event;
	            data.preventDefault = function() {
	                data.srcEvent.preventDefault();
	            };
	            data.stopPropagation = function() {
	                data.srcEvent.stopPropagation();
	            };
	
	            var i = 0;
	            while (i < handlers.length) {
	                handlers[i](data);
	                i++;
	            }
	        },
	
	        /**
	         * destroy the manager and unbinds all events
	         * it doesn't unbind dom events, that is the user own responsibility
	         */
	        destroy: function() {
	            this.element && toggleCssProps(this, false);
	
	            this.handlers = {};
	            this.session = {};
	            this.input.destroy();
	            this.element = null;
	        }
	    };
	
	    /**
	     * add/remove the css properties as defined in manager.options.cssProps
	     * @param {Manager} manager
	     * @param {Boolean} add
	     */
	    function toggleCssProps(manager, add) {
	        var element = manager.element;
	        each(manager.options.cssProps, function(value, name) {
	            element.style[prefixed(element.style, name)] = add ? value : '';
	        });
	    }
	
	    /**
	     * trigger dom event
	     * @param {String} event
	     * @param {Object} data
	     */
	    function triggerDomEvent(event, data) {
	        var gestureEvent = document.createEvent('Event');
	        gestureEvent.initEvent(event, true, true);
	        gestureEvent.gesture = data;
	        data.target.dispatchEvent(gestureEvent);
	    }
	
	    extend(Touch, {
	        INPUT_START: INPUT_START,
	        INPUT_MOVE: INPUT_MOVE,
	        INPUT_END: INPUT_END,
	        INPUT_CANCEL: INPUT_CANCEL,
	
	        STATE_POSSIBLE: STATE_POSSIBLE,
	        STATE_BEGAN: STATE_BEGAN,
	        STATE_CHANGED: STATE_CHANGED,
	        STATE_ENDED: STATE_ENDED,
	        STATE_RECOGNIZED: STATE_RECOGNIZED,
	        STATE_CANCELLED: STATE_CANCELLED,
	        STATE_FAILED: STATE_FAILED,
	
	        DIRECTION_NONE: DIRECTION_NONE,
	        DIRECTION_LEFT: DIRECTION_LEFT,
	        DIRECTION_RIGHT: DIRECTION_RIGHT,
	        DIRECTION_UP: DIRECTION_UP,
	        DIRECTION_DOWN: DIRECTION_DOWN,
	        DIRECTION_HORIZONTAL: DIRECTION_HORIZONTAL,
	        DIRECTION_VERTICAL: DIRECTION_VERTICAL,
	        DIRECTION_ALL: DIRECTION_ALL,
	
	        Manager: Manager,
	        Input: Input,
	        TouchAction: TouchAction,
	
	        TouchInput: TouchInput,
	        MouseInput: MouseInput,
	        PointerEventInput: PointerEventInput,
	        TouchMouseInput: TouchMouseInput,
	
	        Recognizer: Recognizer,
	        AttrRecognizer: AttrRecognizer,
	        Tap: TapRecognizer,
	        Pan: PanRecognizer,
	        Swipe: SwipeRecognizer,
	        Pinch: PinchRecognizer,
	        Rotate: RotateRecognizer,
	        Press: PressRecognizer,
	
	        on: addEventListeners,
	        off: removeEventListeners,
	        each: each,
	        merge: merge,
	        extend: extend,
	        inherit: inherit,
	        bindFn: bindFn,
	        prefixed: prefixed
	    });
	
	    return Touch;
	
	};

/***/ }),
/* 14 */
/***/ (function(module, exports) {

	// 天下皆知美之为美，斯恶已。皆知善之为善，斯不善已
	
	var rAF = window.requestAnimationFrame
	
	// Trans to this module
	
	function Transform () {
	
	    if ( !(this instanceof Transform) ) {
	        return new Transform()
	    }
	
	}
	
	Transform.prototype = {
	    init : function (DNA) {
	
	        var that = this
	
	        this.DNA = DNA
	        this.LIMIT = []
	        this.queue = []
	        this.singleflowtimes = 0
	
	        // go to history
	
	        window.on("hashchange popstate", function (event) {
	
	            // hashchange popstate
	
	            if ( !App.id || App.equalsParam(that.prehistory, window.location.hash) ) return
	
	            // pre history
	
	            that.prehistory = window.location.hash
	
	            // EXISTS
	
	            that.back()
	
	            // unique
	
	            setTimeout(function () {
	                that.prehistory = null
	            }, 0)
	        })
	
	        // creat relative view
	
	        var relativeViewport = document.createElement('relative-windows')
	            relativeViewport.id = "relative-viewport"
	            relativeViewport.style.position = "absolute"
	            relativeViewport.style.zIndex = 1
	            relativeViewport.style.width = relativeViewport.style.height = "100%"
	            relativeViewport.style.overflow = "hidden"
	
	            // set DNA
	
	            DNA(relativeViewport)
	
	        App.relativeViewport = relativeViewport
	
	        // creat absolute view
	
	        var absoluteViewport = document.createElement('absolute-windows')
	            absoluteViewport.id = "absolute-viewport"
	            absoluteViewport.style.position = "absolute"
	            absoluteViewport.style.zIndex = 10000
	            absoluteViewport.style.width = absoluteViewport.style.height = "100%"
	            absoluteViewport.style.overflow = "hidden"
	
	            // set DNA
	
	            DNA(absoluteViewport)
	
	        App.absoluteViewport = absoluteViewport
	
	        // creat fixed view
	
	        var fixedViewport = document.createElement('fixed-windows')
	            fixedViewport.id = "fixed-viewport"
	            fixedViewport.style.position = "fixed"
	            fixedViewport.style.zIndex = 999999
	            fixedViewport.style.width = "100%"
	            absoluteViewport.style.height = "0"
	            fixedViewport.style.overflow = "visible"
	
	            // set DNA
	
	            DNA(fixedViewport)
	
	        App.fixedViewport = fixedViewport
	
	        // append to document
	
	        document.body.appendChild(App.relativeViewport)
	        document.body.appendChild(App.absoluteViewport)
	        document.body.appendChild(App.fixedViewport)
	    },
	
	    setup : function (options) {
	
	        this.options = options
	
	        var currpage = options.currpage
	        var homepage = options.homepage || "frameworks"
	        var exists = options.exists
	        var singleflow = options.singleflow
	        var singlelocking = options.singlelocking
	
	        if ( singleflow ) {
	
	            // inset homepage history
	            
	            if ( !exists && currpage !== homepage ) {
	                this.hash(homepage, null, 0)
	            }
	
	            if ( singlelocking != null && homepage ) {
	                this.hash(homepage, null, 1)
	            }
	        }
	    },
	
	    back : function () {
	
	        // Target module id & param
	
	        var route = App.route()
	        var id = route.id || this.options.homepage || 'frameworks'
	        var param = route.param
	        var module = App.modules[id]
	
	        // level == 0 return
	
	        if ( this.options.singlelocking == 1 && (this.id === "frameworks" || this.module.config.level === 0) ) {
	
	            this.singleflowtimes++
	
	            this.hash(this.id, this.param, 1)
	
	            // exit App
	
	            App.trigger('exit', { singleflow : this.singleflowtimes })
	
	            return
	        }
	
	        this.singleflowtimes = 0
	
	        // no module or no hashchange block trans
	        
	        if ( this.id === id && App.equalsParam(this.param, param) ) return
	        
	        // continuity back or trans to module
	
	        if ( this.options.singleflow && module && module.config.level !== 0 && module.config.level >= this.module.config.level ) {
	
	            // back to >> 0 
	
	            return window.history.back()
	        }
	
	        // to
	
	        this.to(id, param, -1)
	
	        // history back event
	
	        App.trigger('back', { id : id, module : module })
	    },
	
	    hash : function (id, param, prepush) {
	
	        id = id || this.id
	
	        // prepush
	
	        prepush = prepush === undefined ? true : prepush
	
	        // remot module id
	        
	        id = this.reid(id)
	
	        // param trim all \s
	
	        param = param ? '/' + param.replace(/\s/g, '') : ''
	
	        switch (prepush) {
	            case 0:
	                window.history.replaceState({ id : id }, null, '#' + id + param)
	
	                break
	            case 1:
	                window.history.pushState({ id : id }, null, '#' + id + param)
	
	                break
	            default:
	                window.location.hash = id + param
	
	                break
	        }
	        
	        // mark EXISTS
	
	        App.exists(true)
	    },
	
	    status : function (id, param, push) {
	        // param = (this.module.param || this.param || {}).extend(param).objectToParams()
	
	        id = id || this.id
	        param = param.objectToParams()
	
	        // push or replace
	
	        if ( push ) {
	            this.hash(id, param)
	        } else {
	
	            // remot module id
	        
	            window.history.replaceState({}, null, '#' + this.reid(id) + (param ? '/' + param.replace(/\s/g, '') : ''))
	        }
	
	        this.module.setParam(param)
	    },
	
	    reid : function (id) {
	        
	        // remot module id
	        
	        return /\//.test(id) && id.indexOf('[') !== 0 ? '%' + id + '%' : id
	    },
	
	    get : function (id, od, param, history, events, callback) {
	        var that = this
	        var nofind = that.options.nofindpage || '404'
	
	        // open loading
	
	        this.loading(od, 1)
	
	        App.get(id, function (module) {
	
	            if ( !App.modules[id] && id !== module.id ) {
	                App.modules[id] = module.cloneAsNew(id)
	            }
	            
	            // close loading
	
	            that.loading(od, 0)
	
	            // RE
	
	            that.to.apply(that, [id, param, history, events, that.callback])
	        }, function () {
	            if ( id === nofind ) return
	            that.loading(od, 0)
	            that.to(nofind)
	        })
	
	        return this
	    },
	
	    to : function (id, param, history, events, callback) {
	        var that = this
	
	        // filter
	        
	        if ( this.inProcess === 0 ) {
	
	            if ( history === -1 ) this.queue.push(arguments)
	
	            return this
	        }
	
	        // in the process
	
	        this.inProcess = 0
	
	        // clear again back
	
	        this.singleflowtimes = 0
	
	        // is number ? go to history
	
	        if ( !isNaN(id) ) {
	            that.inProcess = -1
	
	            switch (Number(id)) {
	                case -1:
	                    window.history.back()
	                    return this
	                break
	                case 0:
	                    return this
	                break
	            }
	        }
	
	        // check module config
	
	        if ( App.modules[id] === undefined ) {
	            this.inProcess = -1
	            return this.get(id, od, param, history, events)
	        }
	
	        // nomal param url
	
	        param = App.getParam(param)
	
	        // this extend
	
	        this.id = id
	        this.param = param
	        this.events = events
	        this.callback = callback || noop  // reset callback
	
	        // od & id
	
	        var od = this.od || (App._EXISTS ? "frameworks" : null)
	        var ids = od ? [id, od] : [id]
	        var module = App.modules[id]
	        var modulu = App.modules[od]
	        var moduli = od ? [module, modulu] : [module]
	
	        // update events
	        
	        if ( events ) {
	            module.events = events
	        }
	
	        // all back frameworks
	
	        if ( id === "frameworks" ) {
	            history = -1
	        }
	
	        // self module
	
	        this.self = id == od
	
	        // close pre loading
	
	        this.loading(od, 0)
	
	        // check fetch
	
	        this.fetch(module, param)
	
	        // activity page = this page ? return
	
	        if ( od && this.self && module.dimension === param && module.loaded && !module.update ) {
	            that.inProcess = -1
	            return this
	        }
	
	        // module cheak end then apply this
	
	        this.ids = ids
	        this.module = module
	        this.modulu = modulu
	        this.moduli = moduli
	
	        // set param && update
	        
	        module.rsetParam().setParam(param, true)
	
	        // get animation
	
	        this.animation = (this.self || !od) 
	                            ? false
	                            : (history == -1 ? modulu : module).config.animation
	
	        if ( this.animation == true || this.animation == "inherit" ) {
	            this.animation = App.frameworks.config.animation
	        }
	
	        if ( typeof this.animation == "string" ) {
	            this.animation = this.animations(this.animation)
	        }
	
	        this.cutting = od && module.config.absolute != modulu.config.absolute ? true : false
	
	        // module is infinite or module Ele ? creat new elements
	
	        if ( !module.elements.container ) this.container(id)
	
	
	        // 初始化模块
	
	        // transform start
	
	        this.start(function () {
	
	            // return trans to
	
	            if ( that.module !== module ) return
	
	            // first page
	
	            if ( !od ) {
	                that.cut()
	                that.end()
	            }
	
	            // history -1 ? 0 : ++
	            /**
	             * push history build pre view
	             * hashchange 应该在试图转换之前插入，因为右滑会退效果会记录hashchange后的dom改变视图
	            */
	
	            if ( history !== -1 ) that.hash(id, param, history)
	
	            // pre module
	
	            App.id = that.od = !App._EXISTS && id === "frameworks" ? null : id
	            App.module = module
	
	            // build content
	
	            that.build(id, function (module, callback) {
	
	                callback = callback || noop
	
	                // not first ?
	
	                if ( od ) {
	                    that.transform(function () {
	                        callback()
	                        that.inProcess = 18
	                    })
	                } else {
	                    callback()
	                    that.inProcess = 1
	                }
	            })
	
	        })
	
	        return this
	    },
	
	    // 检测cache 周期
	
	    fetch : function (module, param) {
	
	        if ( Date.now() - module.updatetime[param] > module.config.cache * 1000 ) {
	            delete module.prefetch[param]
	
	            module.dimension = false
	        }
	
	        // is prefetched ?
	
	        this.prefetched = module.prefetch[param] ? true : false
	    },
	
	    build : function (id, readied) {
	        var that = this
	          , module = this.module
	
	        if ( module.loaded !== true
	            || module.update === true 
	            || module.config.update === true ) 
	        {   
	            // 毁灭
	
	            module.destroy(1)
	
	            // 联网且预览或预取
	            
	            if ( navigator.onLine === true && (this.prefetched || module.config.preview) ) {
	                this.include(id, null, readied)
	            } else {
	                readied(module, function () {
	                    that.include(id, null, function (module, callback) { 
	                        callback()
	                    })
	                })
	            }
	        } else {
	            readied(module, function () {
	
	                // 刷新远程应用
	
	                if ( module.remoteframe ) {
	                    module.refresh()
	                }
	            })
	        }
	    },
	
	    limit : function (id, module) {
	        var index = this.LIMIT.indexOf(id)
	
	        // 不可被极限破坏
	        
	        if ( module.config.destroy === false ) return
	
	        // 将已有模块推移
	
	        if ( index !== -1 ) this.LIMIT.splice(index, 1)
	
	        // push 此模块记录
	
	        this.LIMIT.push(id)
	
	        // limit module
	
	        if ( this.LIMIT.length > this.options.limit ) {
	            App.modules[this.LIMIT.splice(0, 1)].clearCache(true, true).destroy(-1)
	        }
	
	    },
	
	    reset : function (id, rested) {
	        var module = App.modules[id]
	        var config = module.config
	        var container = module.elements.container
	        var frameworks = ["frameworks", "system"].consistOf(id)
	
	        // clear style
	
	        container.style.cssText = ''
	
	        if ( !frameworks ) {
	            container.css({
	                "position" : "absolute",
	                "z-index" : (Number(module.config.level) || 0) + 1,
	                "background" : config.background || "",
	                "transform" : rested ? "translate(0, 0)" : "translate(200%, 200%)"
	            })
	        }
	    },
	
	    update : function (id, param, prefetch, readied) {
	        this.include(id, function (module, render) { 
	            if ( prefetch ) {
	                prefetch(render)
	            } else {
	                render()
	            }
	        }, function (module, render) { 
	            if ( readied ) {
	                readied(render)
	            } else {
	                render()
	            }
	        })
	    },
	
	    include : function (id, prefetch, readied) {
	        var that = this
	        var module = this.module
	        var dimension = module.dimension
	
	        // no update && status == waiting return
	
	        if ( module.inupdate !== true && module.status[dimension] === 0 ) return
	
	        // lock module
	
	        module.status[dimension] = 0
	        module.timeout = false
	
	        // limit
	
	        this.limit(id, module)
	
	        // open loading
	
	        module.loading(1)
	
	        this.loadingTimeId = setTimeout(function () {
	            if ( that.modulu ) {
	                that.modulu.loading(1)
	            }
	        }, 1000) 
	
	        // preload on event
	
	        if ( typeof module.events.preload === "function" ) {
	            module.events.preload()
	        }
	
	        // include module page
	
	        module.Template = App.template(id).prefetch(function (module, callback) {
	
	            module.trigger('fetch')
	
	            // callback
	            
	            if ( prefetch ) {
	                prefetch(module, callback)
	            } else {
	                callback()
	            }
	
	        }).then(function (module, callback) {
	
	            // module status
	
	            module.status[dimension] = 'loaded'
	
	            // module element loaded
	            
	            module.loaded = true
	            module.trigger('load')
	
	            // callback
	            
	            if ( readied ) {
	                readied(module, callback)
	            } else {
	                callback()
	            }
	
	            // prefetch callback
	
	            that.callback(module)
	
	            // preload on event
	
	            if ( typeof module.events.load === "function" ) {
	                module.events.load()
	            }
	
	            // moduleload
	            
	            App.trigger('moduleload', { module : module })
	
	        }).get(function (module) {
	
	            // close loading
	
	            module.loading(0)
	
	            clearTimeout(that.loadingTimeId)
	
	            if ( that.modulu ) {
	                that.modulu.loading(0)
	            }
	
	            // timeout refresh
	
	            if ( module.timeout ) {
	                if ( id == 'frameworks' ) return
	                setTimeout(function () {
	                    module.refresh()
	                }, 100)
	            }
	
	        }).error(function (module) {
	
	            module.trigger('error')
	
	            // module status
	
	            module.status[dimension] = 'error'
	
	            // callback
	            
	            if ( readied ) {
	                readied(module)
	            }
	
	            // onerror
	            
	            if ( typeof module.onerror === "function" ) {
	                module.onerror()
	            }
	        })
	    },
	
	    loading : function (id, display) {
	        var modules = App.modules
	          , module = modules[id]
	          , loader
	
	        if ( !module || module.refreshing ) return
	
	        // 全局 loading 设定
	        
	        loader = module.events.loading
	        loader = typeof loader == 'function' ? loader : loader !== false ? App.modules.frameworks.events : null
	
	        if ( typeof loader == 'function' ) {
	            return loader.apply(this, arguments)
	        }
	
	        loader = module.elements.loader
	
	        // open loader or close loader
	
	        switch (display) {
	            case 0:
	
	                if ( !loader ) return
	
	                loader.hide()
	                module.elements.loader.hidden = true
	                module.elements.loader.cont.remove()
	
	                delete module.elements.loader
	
	                break
	                
	            case 1:
	
	                if ( loader && loader.hidden === false ) return
	
	                var size = 38 * device.ui.scale
	                  , opts = {
	                        shape: "roundRect",
	                        diameter: size * devicePixelRatio,
	                        density: 12,
	                        speed: 1,
	                        FPS: 12,
	                        range: 0.95,
	                        color: "#999999"
	                    }
	                  , config = module.config.loader || modules['frameworks'].config.loader
	
	                // loader config
	
	                if ( config ) {
	                    opts.extend(config)
	                }
	
	                loader = new Loader(module.elements.container, {safeVML: true})
	                loader.setShape(opts.shape)
	                loader.setDiameter(opts.diameter)
	                loader.setDensity(opts.density)
	                loader.setSpeed(opts.speed)
	                loader.setFPS(opts.FPS)
	                loader.setRange(opts.range)
	                loader.setColor(opts.color)
	
	                loader.cont.style.position = "absolute"
	                loader.cont.style.zIndex = 999
	                loader.cont.style.top = loader.cont.style.left = "50%"
	                loader.cont.style.marginTop = loader.cont.style.marginLeft = size * -0.5 + "px"
	                loader.cont.style.width = loader.cont.style.height = size + "px"
	
	                loader.cont.children.each(function (i, can) {
	                    can.style.width = can.style.height = size + "px"
	                })
	
	                loader.show()
	
	                module.elements.loader = loader
	                module.elements.loader.hidden = false
	
	                break
	        }
	
	    },
	
	    container : function (id) {
	        var that = this
	        var module = App.modules[id]
	        var config = module.config
	        var target = id == "system" ? App.fixedViewport : config.absolute === false ? App.relativeViewport : App.absoluteViewport
	
	        var container = document.createElement("module-container")
	            container.setAttribute("name", id)
	            container.setAttribute("type", ["frameworks", "system"].consistOf(id) ? id : "module")
	
	        // set DNA
	
	        this.DNA(container)
	
	        // set module container
	
	        module.addElement('container', container)
	
	        // reset status
	
	        this.reset(id, this.cutting || !this.animation)
	
	        // append
	
	        target.appendChild(container)
	    },
	
	    animations : function (type) {
	        var A = this.Animations
	
	        switch (type) {
	            case 'flip':
	                return [A.flip, A.flip]
	            break
	
	            case 'fade':
	                return [A.fade(1), A.fade(0)]
	            break
	
	            case 'zoom':
	                return [A.zoom(1), A.zoom(0)]
	            break
	
	            case 'slide':
	            case 'slideLeft':
	            case 'slideleft':
	            case 'slide-left':
	                return [A.slide(1), A.slide(3)]
	            break
	
	            case 'slideRight':
	            case 'slideright':
	            case 'slide-right':
	                return [A.slide(3), A.slide(1)]
	            break
	
	            case 'slideUp':
	            case 'slideup':
	            case 'slide-up':
	                return [A.slide(0), A.slide(2)]
	            break
	
	            case 'slideDown':
	            case 'slidedown':
	            case 'slide-down':
	                return [A.slide(2), A.slide(0)]
	            break
	
	            default:
	                return false
	            break
	        }
	    },
	
	    transform : function (callback) {
	        var that = this
	        var events = this.events
	        var module = this.module
	        var modulu = this.modulu
	        var modules = this.moduli
	        var cutting = this.cutting
	        var backset = (modules.length === 1 || module.config.level === modulu.config.level) ? false : (module.config.level > modulu.config.level ? 0 : 1)
	        var reverse = backset === 0 ? false : true
	        var animation = function (event) { event.callback() }
	
	        var views = cutting ? [
	                                module.config.absolute === false 
	                                ? App.relativeViewport 
	                                : App.absoluteViewport
	                                , modulu.config.absolute === false 
	                                ? App.relativeViewport 
	                                : App.absoluteViewport
	                            ] 
	                            : [
	                                module.elements.container, 
	                                modulu.elements.container
	                            ]
	
	        var x = 0, y = 0, attach = "center", origin = "center"
	        var width = device.ui.width
	        var height = device.ui.height
	        var touches = events ? events.touches : null
	
	        touches = touches ? touches.srcEvent : null
	        
	        if ( !touches ) {
	            touches = modulu.events.touches
	            touches = touches ? touches.srcEvent : {}
	        }
	
	        if ( touches.changedTouches ) {
	            x = touches.changedTouches[0].pageX
	            y = touches.changedTouches[0].pageY
	        } else {
	            x = touches.x
	            y = touches.y
	        }
	
	        if ( x && y ) {
	            origin = [x, y]
	
	            if ( x < width/4 ) {
	                x = 0
	            } else if ( x > width*3/4 ) {
	                x = width
	            }
	
	            if ( y < height/4 ) {
	                y = 0
	            } else if ( y > height*3/4 ) {
	                y = height
	            }
	
	            attach = [x, y]
	        }
	
	        // get animation
	        
	        if ( backset !== false ) {
	            if ( typeof this.animation === "function" ) {
	                animation = this.animation
	            } else if ( typeof this.animation === "object" ) {
	                animation = this.animation[this.animation.length === 2 ? backset : 0] 
	            }
	        }
	
	        // prefetched
	
	        if ( this.prefetched ) {
	            callback()
	            callback = noop
	        }
	
	        // animation end
	
	        function end (stillness) {
	            if ( cutting ) {
	                that.cut(stillness)
	            }
	            
	            that.end(stillness)
	
	            // module dispatch
	
	            that.dispatch()
	
	            // callback
	
	            callback()
	        }
	
	        rAF(function () {
	            animation({
	                view       : views,
	                x          : x,
	                y          : y,
	                in         : views[0].Animate(),
	                out        : views[1].Animate(),
	                width      : width,
	                height     : height,
	                viewport   : [App.relativeViewport, App.absoluteViewport],
	                modules    : modules,
	                reverse    : reverse,
	                direction  : reverse ? -1 : 1,
	                backset    : backset,
	                callback   : end,
	                origin     : origin,
	                attach     : attach,
	                touches    : touches
	            })
	        })
	    },
	
	    dispatch : function () {
	        var events = {
	                ids : this.ids, 
	                modules : this.moduli
	            }
	
	        try {
	            if ( this.cutting ) {
	               App.frameworks.trigger(this.module.config.absolute == true ? 'hide' : 'show') 
	            }
	
	            this.module.trigger('show', events)
	            this.modulu.trigger('hide', events)
	        } catch (e) {}
	    },
	
	    start : function (callback) {
	
	        // transformstart on event
	
	        if ( typeof this.module.events.transformstart === "function" ) {
	            if ( this.module.events.transformstart() === false ) {
	                return false
	            }
	        }
	        
	        
	        /*
	            没有动画或不适合动画设备
	            先隐藏－当前模块－再显示－未来模块 先释放内存有助于加快显示
	        */
	
	        if ( !this.animation || this.cutting ) {
	            this.module.elements.container.css({"transform": "translate(0, 0)"})
	        }
	
	        // start
	
	        callback()
	
	        // event
	        
	        App.trigger("transformstart", {
	            ids: this.ids,
	            modules: this.moduli
	        })
	    },
	
	    end : function (stillness) {
	
	        /*
	         * cutting 模块类型集装箱视图切换
	        */
	
	        if ( this.modulu ) {
	            if ( !this.animation || !stillness ) {
	                this.modulu.elements.container.css({"transform": "translate(200%, 200%)"})
	
	                this.reset(this.id, true)
	
	                // clear cache
	        
	                if ( !this.self && (this.modulu.config.update || this.modulu.config.cache <= 0) ) {
	                    this.modulu.destroy(1)
	                }
	
	                // App background
	
	                if ( this.modulu.remoteframe.App ) {
	                    this.modulu.remoteframe.App.trigger('background')
	                }
	            }
	
	            // reset transition-duration
	
	            this.modulu.elements.container.css({
	                "transition-duration" : "0ms"
	            })
	        }
	
	        // transformend on event
	
	        if ( typeof this.module.events.transformend == "function" ) {
	            this.module.events.transformend()
	        }
	
	        // transformend event
	
	        App.trigger("transformend", {
	            ids: this.ids,
	            modules: this.moduli
	        })
	
	        // queue
	
	        if ( this.queue.length ) {
	            this.to.apply(this, this.queue.pop())
	        }
	    },
	
	    cut : function (stillness) {
	        
	        /*
	         * cut : 场景切牌
	         * 没有动画时直接切牌视窗
	        */
	
	        if ( !this.animation || !stillness ) {
	
	            // clear style
	
	            App.relativeViewport.style.cssText = ''
	            App.absoluteViewport.style.cssText = ''
	
	            // change view
	            
	            if ( this.module.config.absolute === false ) {
	                App.absoluteViewport.css({"transform": "translate(200%, 200%)"})
	                App.relativeViewport.css({"transform": "translate(0, 0)"})
	            } else {
	                App.relativeViewport.css({"transform": "translate(200%, 200%)"})
	                App.absoluteViewport.css({"transform": "translate(0, 0)"})
	            }
	        }
	
	    },
	
	    then : function (callback) {
	        this.callback = callback || noop
	    }
	}
	
	
	// Animations
	
	Transform.prototype.Animations = {
	    flip : function (e) {
	        e.in.duration(0).perspective(1000).to(0, 0, 0).opacity(0).rotate3d(0, 1, 0, 90*e.direction).end(function () {
	            e.out.duration(300).perspective(1000).rotate3d(0, 1, 0, -90*e.direction).end(function () {
	                e.out.duration(0).opacity(0).end()
	                e.in.duration(0).opacity(1).end(function () {
	                    e.in.duration(300).rotate3d(0, 1, 0, 0).end(function () {
	                        e.callback(false)
	                    })
	                })
	            })
	        })
	    },
	    fade : function (type) {
	        return function (e) {
	            var inO, outO, inV, outV
	            switch (type) {
	                case 0:
	                    inO = 1
	                    outO = 0
	                    inV = e.in
	                    outV = e.out
	                break
	                case 1:
	                    inO = 0
	                    outO = 1
	                    inV = outV = e.in
	            }
	            inV.duration(0).to(0, 0, 0).opacity(inO).end(function () {
	                outV.duration(300).opacity(outO).end(function () {
	                    e.callback(false)
	                })
	            })
	        }
	    },
	    slide : function (type) {
	        return function (e) {
	            var inX, outX, inY, outY
	            switch (type) {
	                case 0:
	                    outY = e.height
	                    inY = -outY
	                    inX = outX = 0
	                break
	                case 1:
	                    inX = e.width
	                    outX = -inX
	                    inY = outY = 0
	                break
	                case 2:
	                    inY = e.height
	                    outY = -inY
	                    inX = outX = 0
	                break
	                case 3:
	                    outX = e.width
	                    inX = -outX
	                    inY = outY = 0
	                break
	            }
	
	            if ( e.reverse ) {
	                e.in.duration(0).to(inX, inY, 0).end(function () {
	                    e.in.duration(300).to(0, 0, 0).end()
	                    e.out.duration(300).to(outX, outY, 0).end(function () {
	                        e.callback(false)
	                    })
	                })
	            } else {
	                e.in.duration(0).to(inX, inY, 0).end(function () {
	                        e.out.duration(300).to(outX, outY, 0).end()
	                        e.in.duration(300).to(0, 0, 0).end(function () {
	                            e.callback(false)
	                        })
	                    })
	                }
	            }
	    },
	    zoom : function (type) {
	        return function (e) {
	            switch (type) {
	                case 0:
	                    e.in.origin(e.attach).duration(0).to(0, 0, 0).scale(2.5).end(function () {
	                        e.out.origin(e.origin).duration(0).to(0, 0, 0).opacity(1).scale(1).end(function () {
	                            e.in.duration(300).scale(1).end()
	                            e.out.duration(300).opacity(0).scale(0).end(function () {
	                                e.callback(false)
	                            })
	                        })
	                    })
	                break
	                case 1:
	                    e.in.origin(e.origin).duration(0).to(0, 0, 0).scale(0).end(function () {
	                        e.out.origin(e.attach).duration(0).to(0, 0).scale(1).end(function () {
	                            e.in.to(0, 0, 0).duration(300).scale(1).end(function () {
	                                e.callback(false)
	                            })
	                            e.out.duration(300).scale(2.5).end()
	                        })
	                    })
	                break
	            }
	
	        }
	    }
	}
	
	
	export default Transform

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

	// 上善若水。水善利万物而不争，处众人之所恶，故几於道。
	
	(function () {
	
	    'use strict'
	
	    window.App = 'top'
	
	    // module && components css style reset
	
	    /*＊
	    * scrolling > z-index : 1 !important 提升渲染性能的关键
	    * css 书写规范
	    1.位置属性(position, top, right, z-index, display, float等)
	    2.大小(width, height, padding, margin)
	    3.文字系列(font, line-height, letter-spacing, color- text-align等)
	    4.背景(background, border等)
	    5.其他(animation, transition等)
	    */
	
	    // append bace css
	
	    document.write('<style>* { margin : 0; padding : 0 } \n'
	                        + 'html, body { position: absolute; width: 100%; height: 100%; background: #fff; overflow: hidden } \n'
	                        + 'mask, view { position: absolute; width: 100%; height: 100%; overflow: hidden } \n'
	                        + 'module-container[type=module] { display: block; top: 0; right: 0; bottom: 0; left: 0; width: 100%; height: 100% } \n'
	                        + 'iframe[app=true] { width: 100%; height: 100%; border: 0 } \n'
	                    + '</style>')
	
	    window.CSSBaseStyle = '* { box-sizing: border-box; margin : 0; padding : 0; text-size-adjust: 100%; tap-highlight-color: rgba(0, 0, 0, 0) } \n'
	                        + 'html, body { position: absolute; width: 100%; height: 100%; background: #fff; font-size: 10dp; overflow: hidden } \n'
	                        + 'a { text-decoration: none } \n'
	                        + '*[href], *[transform], *[on-tap] { cursor: pointer }'
	                        + 'button { background-color: transparent; border: 0; outline: 0 } \n'
	                        + 'input, textarea, htmlarea { user-select: initial; touch-callout: initial; border: 0; outline: 0; appearance: none } \n'
	                        + 'htmlarea { display: inline-block; text-rendering: auto; letter-spacing: normal; word-spacing: normal; text-indent: 0px; text-align: start; font: initial } \n'
	                        + 'article, aside, details, figcaption, figure, footer, header, hgroup, menu, nav, section { display: block } \n'
	                        + 'ol, ul { list-style: none } \n'
	                        + 'table { border-collapse: collapse; border-spacing: 0 } \n'
	
	                        // scroll
	                        + 'scroll, scrolling, scrollbar, indicator { display: block; box-sizing: border-box } \n'
	                        + 'scroll { position: relative; padding: 0; border: 0; overflow: hidden } \n'
	                        + 'scroll[fullscreen] { position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 2 } \n'
	                        + 'scroll > scrolling, scroll > scrolling > infinite { display: block; position: absolute; z-index: 2; backface-visibility: hidden } \n'
	                        + 'scroll > scrolling { min-width: 100%; min-height: 100% } \n'
	                        + 'scroll[y=false] > scrolling { position: relative; display: inline-block } \n'
	                        + 'scroll > scrolling > infinite { top: 0; left: 0; width: 100% } \n'
	                        + 'scroll > scrolling > infinite > fragment { display: block; position: relative; z-index: 2; width: 100% } \n'
	                        + 'scroll > scrollbar { position: absolute; z-index: 9999; border-radius: 3dp; overflow: hidden } \n'
	                        + 'scroll > scrollbar > indicator { position: absolute; z-index: 9; border-radius: 3dp; background: rgba(0, 0, 0, 0.4) } \n'
	                        
	                        // pulling
	                        + 'pullup, pullright, pulldown, pullleft { display: block; position: absolute; z-index: 9999; text-align: center } \n'
	                        + 'pullup { bottom: 0; width: 100% }'
	                        + 'pulldown { top: 0; width: 100% }'
	                        + 'pullright { left: 0; height: 100% }'
	                        + 'pullleft { right: 0; height: 100% }'
	                        + 'pullstart, pulling, pullend, pullover { display: none } \n'
	                        + 'pullup[pullstart] pullstart, pullright[pullstart] pullstart, pulldown[pullstart] pullstart, pullleft[pullstart] pullstart { display: block } \n'
	                        + 'pullup[pulling] pulling, pullright[pulling] pulling, pulldown[pulling] pulling, pullleft[pulling] pulling { display: block } \n'
	                        + 'pullup[pullend] pullend, pullright[pullend] pullend, pulldown[pullend] pullend, pullleft[pullend] pullend { display: block } \n'
	                        + 'pullup[pullover] pullover, pullright[pullover] pullover, pulldown[pullover] pullover, pullleft[pullover] pullover { display: block } \n'
	                        
	                        // windows
	                        + 'relative-windows, absolute-windows { position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 10000; width: 100%; height: 100%; overflow: hidden } \n'
	
	
	
	    // 设备属性检测
	
	    var OS = (function (navigator, userAgent, platform, appVersion) {
	
	        this.webkit = userAgent.match(/WebKit\/([\d.]+)/) ? true : false
	
	        this.ipod = /iPod/i.test(platform) || userAgent.match(/(iPod).*OS\s([\d_]+)/) ? true : false
	        this.ipad = /iPad/i.test(navigator.userAgent) ||userAgent.match(/(iPad).*OS\s([\d_]+)/) ? true : false
	        this.iphone = /iPhone/i.test(platform) || !this.ipad && userAgent.match(/(iPhone\sOS)\s([\d_]+)/) ? true : false
	
	        this.ie = userAgent.match(/MSIE 10.0/i) ? true : false
	        this.mac = /Mac/i.test(platform)
	        this.ios = this.ipod || this.ipad || this.iphone
	        this.android = userAgent.match(/(Android)\s+([\d.]+)/) || userAgent.match(/Silk-Accelerated/) ? true : false
	        this.android = this.android && !this.webkit
	        this.androidICS = this.android && userAgent.match(/(Android)\s4/) ? true : false
	
	        this.chrome = userAgent.match(/Chrome/) ? true : false
	        this.safari = userAgent.match(/Safari/) && !this.chrome ? true : false
	        this.mobileSafari = this.ios && !!appVersion.match(/(?:Version\/)([\w\._]+)/)
	        this.opera = userAgent.match(/Opera/) ? true : false
	        this.fennec = userAgent.match(/fennec/i) ? true : userAgent.match(/Firefox/) ? true : false
	        this.MSApp = typeof(MSApp) === "object"
	        this.wechat = userAgent.match(/MicroMessenger/i) ? true : false
	
	        this.ieTouch = this.ie && userAgent.toLowerCase().match(/touch/i) ? true : false
	        this.supportsTouch = ((window.DocumentTouch && document instanceof window.DocumentTouch) || 'ontouchstart' in window)
	
	        this.webos = userAgent.match(/(webOS|hpwOS)[\s\/]([\d.]+)/) ? true : false
	        this.touchpad = this.webos && userAgent.match(/TouchPad/) ? true : false
	
	        this.playbook = userAgent.match(/PlayBook/) ? true : false
	        this.blackberry10 = userAgent.match(/BB10/) ? true : false
	        this.blackberry = this.playbook || this.blackberry10|| userAgent.match(/BlackBerry/) ? true : false
	
	        // 主流系统版本检测
	
	        if ( this.ios ) this.iosVersion = parseFloat(appVersion.slice(appVersion.indexOf("Version/")+8)) || -1
	        if ( this.android ) this.androidVersion = parseFloat(appVersion.slice(appVersion.indexOf("Android")+8)) || -1
	        if ( this.safari ) this.safariVersion = appVersion.match(/Safari\/([\d.]+)/)[1]
	        if ( this.chrome ) this.chromeVersion = appVersion.match(/Chrome\/([\d.]+)/)[1]
	        if ( this.webkit ) this.webKitVersion = appVersion.match(/WebKit\/([\d.]+)/)[1]
	
	        return this
	
	    }).call({}, navigator, navigator.userAgent, navigator.platform, navigator.appVersion || navigator.userAgent)
	
	
	    /*===================================== viewport scale ========================================*/
	
	    var reviewport = function () {
	
	        // 创建 viewport meta
	
	        function creat (id, scale, tdpi) {
	            document.write('<meta ' 
	                                + 'id="' + id + '" ' 
	                                + 'name="viewport" ' 
	                                + 'content="' 
	                                    + 'width=device-width,' 
	                                    + 'initial-scale=' + scale + ',' 
	                                    + 'minimum-scale=' + scale + ',' 
	                                    + 'maximum-scale=' + scale + ',' 
	                                    + 'user-scalable=no' 
	                                    + (tdpi && OS.androidVersion < 5 ? ',target-densitydpi=device-dpi' : '') 
	                            + '">')
	            return document.getElementById(id)
	        }
	
	        var windowInitWidth = window.innerWidth
	
	
	        // init viewport {{
	
	        var testViewport = creat('test-viewport', '1.0')
	
	        // mark document init width
	        
	        var windowRestWidth = window.innerWidth
	        var documentElementInitWidth = document.documentElement.offsetWidth
	
	        // remove test viewport
	
	        testViewport.parentNode.removeChild(testViewport)
	
	        // }}
	
	
	        // setting new viewport
	
	        var realViewport = creat('real-viewport', 1 / devicePixelRatio, true)
	
	        /* viewport is ok?
	         * 由屏幕斜角排列导致dpi缩放不精准，宽度相减值应小于 w * 0.01
	         * devicePixelRatio floor * documentElementInitWidth 在某些设备上约等于实际像素
	         * document.documentElement.offsetWidth 在部分手机中渲染完会发生变更
	         */
	        
	        /*
	            !!! viewport 具有刷新缓存, 因此可能是物理值也可能是虚拟值
	         */
	
	        var realScreenWidth = Math.max(window.innerWidth, window.document.documentElement.offsetWidth)
	        var realWindowWidth = devicePixelRatio * Math.min(windowRestWidth, documentElementInitWidth)
	        var scale = ((window.innerWidth != window.screen.width && windowRestWidth != windowInitWidth) || ((window.innerWidth == window.screen.width || window.innerWidth == realScreenWidth) && windowRestWidth == windowInitWidth && realScreenWidth == realWindowWidth))
	                            ? Math.max(window.innerWidth / windowRestWidth, document.documentElement.offsetWidth / documentElementInitWidth)
	                            : null
	
	        // rest viewport
	
	        if ( scale == null ) {
	
	            // remove real viewport
	
	            realViewport.parentNode.removeChild(realViewport)
	
	            creat('real-viewport', '1.0')
	
	            scale = 1
	        }
	
	        // }}
	
	        // exports
	
	        window.viewportScale = scale
	
	    }
	
	    // 嵌套应用
	
	    if ( window.parent.viewportScale ) {
	        window.viewportScale = window.parent.viewportScale
	    } else {
	        reviewport()
	    }
	
	
	
	    /*====================================== Define =======================================*/
	
	
	    // Define
	
	    var Define = function (window) {
	
	        var step = {}
	        var modules = {}
	        var handlerMap = {}
	        var loadedFiles = {}
	        var requireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/ig
	
	        // get root
	
	        var scripts = document.getElementsByTagName('script')
	        var script = scripts[scripts.length - 1]
	        var paths = script.src.split('/')
	            paths.pop()
	        var root = paths.join('/')
	
	        // Module
	
	        function Module (name, deps, model, body) {
	            this.name = name
	            this.body = body
	            this.deps = deps
	            this.model = model
	            this.exports = {}
	            this.created = false
	
	            Object.defineProperty(this.exports, "__esModule", {
	                value: true
	            })
	        }
	
	        Module.prototype = {
	            _get : function (name, callback, error) {
	                name = name || this.name
	
	                switch ( name ) {
	                    case 'module':
	                        return this
	                    break
	
	                    case 'exports':
	                        name = this.name
	                    break
	                }
	
	                if ( callback ) {
	                    __webpack_require__(16)('argument', name, function (require) {
	                        callback(require)
	                    }, error)
	
	                    return this
	                }
	
	                return modules[name] ? (function (exports) {
	                    exports = modules[name].exports
	                    if ( exports.default ) {
	                        Object.defineProperty(exports.default, "__esModule", {
	                            value: true
	                        })
	                        return exports.default
	                    }
	                    return exports
	                })() : null
	            },
	            _deps : function () {
	                var deps = []
	
	                for (var i = 0, l = this.deps.length; i < l; i++) {
	                    var dep = this.deps[i]
	                    deps.push(this._get(dep))
	                }
	
	                switch ( this.model ) {
	                    case 1:
	                        return deps
	                    break
	
	                    case 0:
	                    default:
	                        return [
	                            this._get, 
	                            this, 
	                            this._get()
	                        ]
	                    break
	                }
	            },
	            _create : function () {
	                if ( this.created ) return
	                this.created = true
	
	                dispatchEvent('moduleExecute', this)
	
	                this.body.apply(this.body, this._deps())
	                
	                dispatchEvent(this.name, this)
	            }
	        }
	
	        function define () {
	            var model = 0
	            var name = arguments[0]
	            var deps = arguments[1]
	            var body = arguments[2]
	            var error = arguments[3]
	
	            switch (arguments.length) {
	                case 1:
	                    name = null
	                    body = arguments[0]
	                    deps = null
	                    break
	                case 2:
	                    body = arguments[1]
	                    if ( typeof name === 'string' ) {
	                        deps = null
	                    } else {
	                        name = null
	                        deps = arguments[0]
	                    }
	                    break
	            }
	
	            deps = deps || getRequireNames(body.toString()) || []
	
	            if ( ['module', 'exports'].indexOf(deps[0]) !== -1 ) {
	                model = 1
	            }
	
	            // step.call
	
	            if ( name ) {
	                step.call = null
	                creat(name, deps, model, body, error)
	            } else {
	                step.call = function (name) {
	                    creat(name, deps, model, body, error)
	                }
	            }
	        }
	
	        // creat deps module
	
	        function creat (name, deps, model, body, error) {
	
	            // new module
	
	            var newModule = new Module(name, deps, model, body)
	
	            // add to modules
	
	            modules[name] = newModule
	
	            // dispatchEvent moduleLoad
	
	            dispatchEvent('moduleLoad', newModule)
	
	            // unloadDeps
	
	            var unloadDeps = []
	
	            // push to unloadDeps
	
	            for (var i = 0; i < deps.length; i++) {
	                var dep = deps[i]
	
	                if ( modules[dep] == null && ['module', 'exports'].indexOf(dep) == -1 ) {
	                    unloadDeps.push(dep)
	                }
	            }
	
	            // create
	
	            if ( unloadDeps.length == 0 ) {
	                newModule._create()
	            } else {
	                addEventListeners(unloadDeps, function () {
	                    newModule._create()
	                })
	
	                // 打包独立文件时，执行完函数再检查依赖
	
	                setTimeout(function () {
	                    for (var i = 0; i < unloadDeps.length; i++) {
	                        var name = unloadDeps[i]
	                        
	                        if ( !modules[name] ) {
	                            load(name, error)
	                        }
	                    }
	                }, 0)
	            }
	        }
	
	        function load (name, error) {
	            if ( loadedFiles[name] ) return
	            loadedFiles[name] = true
	
	            // -/modulePath == {root}/modulePath
	
	            var src = getRealPath(name) + '.js'
	            var head = window.document.head
	            var script = window.document.createElement('SCRIPT')
	            
	            // dispatchEvent
	
	            dispatchEvent('scriptLoad', src)
	
	            // async load
	
	            script.async = true
	            script.src = src
	
	            head.appendChild(script)
	
	            // onload
	            
	            script.onload = function () {
	                dispatchEvent('scriptLoaded', src)
	
	                if ( step.call ) {
	                    step.call(name)
	                }
	
	                head.removeChild(script)
	
	                // Dereference the node
	                script = null
	            }
	
	            script.onerror = function () {
	                if ( error ) error()
	
	                head.removeChild(script)
	
	                // Dereference the node
	                script = null
	            }
	        }
	
	        function getRealPath (path) {
	            return path.indexOf('~/') === 0 ? root + path.substr(1) : path
	        }
	
	        function getRequireNames (str) {
	            var names = []
	            var r = requireRegExp.exec(str)
	            while(r != null) {
	                names.push(r[1])
	                r = requireRegExp.exec(str)
	            }
	            return names
	        }
	
	        function addEventListener (topic, handler) {
	            var handlers = handlerMap[topic]
	            
	            if ( handlers == null ) {
	                handlerMap[topic] = []
	            }
	
	            handlerMap[topic].push(handler)
	        }
	
	        function addEventListeners (topics, handler) {
	            var counter = 0
	            
	            for (var i = 0; i < topics.length; i++) {
	                var topic = topics[i]
	                var handlers = handlerMap[topic]
	
	                if ( handlers == null ) {
	                    handlerMap[topic] = []
	                }
	
	                handlerMap[topic].push(function (result){
	                    if ( (++counter) === topics.length ) {
	                        return handler(result)
	                    } else {
	                        return null
	                    }
	                })
	            }
	        }
	
	        function dispatchEvent (topic, event) {
	            var handlers = handlerMap[topic]
	            if( handlers != null ) {
	                for (var i=0; i<handlers.length; i++) {
	                    handlers[i](event)
	                }
	            }
	        }
	
	        window.define = define
	    }
	
	
	
	    /*=============================================================================*/
	
	
	    // DETECT
	
	    var DETECT = (function (userAgent) {
	
	        // ELEMENT
	
	        var _ELEMENT = document.createElement('div')
	        var _STYLE = _ELEMENT.style
	
	        _STYLE.position = "fixed"
	        _STYLE.top = "0"
	        _STYLE.left = "0"
	        _STYLE.zIndex = "1"
	
	        document.documentElement.appendChild(_ELEMENT)
	                
	        // features - 功能检测 or 返回最适合特性
	
	        this.touch = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch
	        this.vendor = OS.webkit ? "Webkit" : OS.fennec ? "Moz" : OS.ie ? "ms" : OS.opera ? "O" : ""
	        this.prefix = OS.webkit ? "-webkit-" : OS.fennec ? "-moz-" : OS.ie ? "-ms-" : OS.opera ? "-O-" : ""
	        this.cssTransformStart = !OS.opera ? "3d(" : "("
	        this.cssTransformEnd = !OS.opera ? ",0)" : ")"
	        
	        // viewport 起效检测
	
	        this.viewportScale = window.viewportScale
	
	        // js or css 前缀支持
	
	        var _JSPROPMAPS = {}
	          , _CSSPROPMAPS = {}
	          , VENDORS  = ['webkit', 'Moz', 'ms', 'O']
	          , PREFIXS  = ['-webkit-', '-moz-', '-ms-', '-O-']
	
	        this.CSSSupport = this.prefixStyle = function (prop, css) {
	
	            if ( css && prop in _CSSPROPMAPS ) {
	                return _CSSPROPMAPS[prop]
	            } else if ( !css && prop in _JSPROPMAPS ) {
	                return _JSPROPMAPS[prop]
	            }
	
	            var i = 0, l = VENDORS.length + 1
	
	            while ( i < l ) {
	                var property = ((VENDORS[i] ? VENDORS[i] + '-' : '') + prop).replace(/-(\w)/g,function () { return arguments[1].toUpperCase() })
	                var prefix = (PREFIXS[i] || '') + prop
	                if ( property in _STYLE ) return css ? _CSSPROPMAPS[prop] = prefix : _JSPROPMAPS[prop] = property
	                i++
	            }
	
	            return css ? _CSSPROPMAPS[prop] = prop : _JSPROPMAPS[prop] = false
	        }
	
	        this.hasTranslate3d = this.prefixStyle('transform') && window.getComputedStyle ? true : false
	
	        /**
	            This should find all Android browsers lower than build 535.19 (both stock browser and webview)
	            - galaxy S2 is ok
	            - 2.3.6 : `AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1`
	            - 4.0.4 : `AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30`
	            - galaxy S3 is badAndroid (stock brower, webview)
	            `AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30`
	            - galaxy S4 is badAndroid (stock brower, webview)
	            `AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30`
	            - galaxy S5 is OK
	            `AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Mobile Safari/537.36 (Chrome/)`
	            - galaxy S6 is OK
	            `AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Mobile Safari/537.36 (Chrome/)`
	         */
	        
	        this.isBadTransition = (function() {
	            
	            // Android browser is not a chrome browser.
	            
	            if ( OS.android ) {
	                if ( OS.webkit && parseFloat(OS.webKitVersion) < 535.19 ) return true
	                if ( OS.chrome && parseFloat(OS.chromeVersion) < 53 ) return true
	                if ( OS.safari && parseFloat(OS.safariVersion) < 535.19 ) return true
	
	                return false
	            } else if ( OS.ios ) {
	                return false
	            } else {
	                return true
	            }
	        })()
	
	        // 是否支持observer
	        
	        this.observer = (window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver) ? true : false
	
	        // 是否支持ShadowRoot
	
	        this.shadowRoot = document.documentElement.createShadowRoot ? true : false
	
	        // 是否支持svg
	
	        this.svg = window.SVGAngle ? true : false 
	
	        // 是否支持贞动画
	
	        this.keyframes = (window.CSSRule.WEBKIT_KEYFRAMES_RULE || window.CSSRule.MOZ_KEYFRAMES_RULE || window.CSSRule.MS_KEYFRAMES_RULE || window.CSSRule.O_KEYFRAMES_RULE) ? true : false
	        
	        // 获取贞动画前缀
	
	        this.keyframesPrefix = window.CSSRule.WEBKIT_KEYFRAMES_RULE ? '-webkit-' : false || window.CSSRule.MOZ_KEYFRAMES_RULE ? '-moz-' : false || window.CSSRule.MS_KEYFRAMES_RULE ? '-ms-' : false || window.CSSRule.O_KEYFRAMES_RULE ? '-o-' : false || ''
	
	        // 支持动画
	
	        this.supportTransition = this.keyframes
	
	        // iframeInputBlurBug
	
	        this.iframeInputBlurBug = OS.ios && OS.iosVersion < 9
	
	        // css support view sizing units
	
	        this.supportSizeUnits = (function () {
	            var initialWidth
	              , initialHeight
	              , supportSizeUnits = {
	                    'px' : true,
	                    'dp' : false,
	                    'vw' : false,
	                    'vh' : false,
	                    'vmin' : false,
	                    'vmax' : false,
	                    'mm' : false,
	                    'cm' : false,
	                    'pt' : false,
	                    'pc' : false,
	                    'in' : false,
	                    '%' : true
	                }
	
	            // get initial width
	
	            initialWidth = _ELEMENT.offsetWidth
	            initialHeight = _ELEMENT.offsetHeight
	
	            // set width 10vw
	
	            _ELEMENT.style.width = 0
	            _ELEMENT.style.width = '10vw'
	            supportSizeUnits.vw = supportSizeUnits.vh = _ELEMENT.offsetWidth == Math.round(document.documentElement.offsetWidth / 10) ? true : false
	
	            // set width 10vmin
	
	            _ELEMENT.style.width = 0
	            _ELEMENT.style.width = '10vmin'
	            supportSizeUnits.vmin = _ELEMENT.offsetWidth == Math.round(Math.min(initialWidth, initialHeight) / 10) ? true : false
	            
	            // set width 10vmax
	
	            _ELEMENT.style.width = 0
	            _ELEMENT.style.width = '10vmax'
	            supportSizeUnits.vmax = _ELEMENT.offsetWidth == Math.round(Math.max(initialWidth, initialHeight) / 10) ? true : false
	            
	            // set width 10mm
	
	            _ELEMENT.style.width = 0
	            _ELEMENT.style.width = '10mm'
	            supportSizeUnits.mm = _ELEMENT.offsetWidth > 0 ? true : false
	
	            // set width 10cm
	
	            _ELEMENT.style.width = 0
	            _ELEMENT.style.width = '10cm'
	            supportSizeUnits.cm = _ELEMENT.offsetWidth > 0 ? true : false
	
	            // set width 10cm
	
	            _ELEMENT.style.width = 0
	            _ELEMENT.style.width = '10pt'
	            supportSizeUnits.pt = _ELEMENT.offsetWidth > 0 ? true : false
	
	            // set width 10pc
	
	            _ELEMENT.style.width = 0
	            _ELEMENT.style.width = '10pc'
	            supportSizeUnits.pc = _ELEMENT.offsetWidth > 0 ? true : false
	
	            // set width 10in
	
	            _ELEMENT.style.width = 0
	            _ELEMENT.style.width = '10in'
	            supportSizeUnits.in = _ELEMENT.offsetWidth > 0 ? true : false
	
	            // set width 10dp
	
	            // _ELEMENT.style.width = 0
	            // _ELEMENT.style.width = '10dp'
	            // supportSizeUnits.dp = _ELEMENT.offsetWidth > 0 ? true : false
	
	
	            return supportSizeUnits
	        })()
	
	        this.supportSizeCalc = (function () {
	            var initialWidth
	              , supportSizeCalc
	
	            // get initial width
	
	            _ELEMENT.style.width = '100%'
	            initialWidth = _ELEMENT.offsetWidth
	
	            // set width 10vw
	
	            _ELEMENT.style.width = 'calc((100vw/10 - 1px) / 2)'
	
	            // calc(100%/10) == initialWidth / 10 ? true : false
	
	            supportSizeCalc = _ELEMENT.offsetWidth == Math.round((initialWidth / 10 - 1) / 2) ? true : false
	
	            return supportSizeCalc
	        })()
	
	        //判断浏览器是否支持DOM树结构改变
	
	        // this.mutations = (function () {
	        //     var type = [
	        //             "DOMSubtreeModified",
	        //             "DOMNodeInserted",
	        //             "DOMNodeRemoved",
	        //             "DOMNodeRemovedFromDocument",
	        //             "DOMNodeInsertedIntoDocument",
	        //             "DOMAttrModified",
	        //             "DOMCharacterDataModified"
	        //         ]
	        //       , documentElement = document.documentElement
	        //       , method = "EventListener"
	        //       , data = "deleteData"
	        //       , p = document.createElement("p")
	        //       , mutations = {}
	        //       , i
	
	        //     function check(addOrRemove) {
	        //         for (i = type.length; i--;) {
	        //             p[addOrRemove](type[i], cb, false)
	        //             documentElement[addOrRemove](type[i], cb, false)
	        //         }
	        //     }
	
	        //     function cb(e) {
	        //         mutations[e.type] = true
	        //     }
	
	        //     check("add" + method)
	
	        //     documentElement.insertBefore(
	        //         p,
	        //         documentElement.lastChild
	        //     )
	
	        //     p.setAttribute("i", i)
	        //     p = p.appendChild(document.createTextNode(i))
	        //     data in p && p[data](0, 1)
	        //     documentElement.removeChild(p = p.parentNode)
	        //     check("remove" + method)
	        //     return (p = mutations)
	
	        // }())
	
	        document.documentElement.removeChild(_ELEMENT)
	
	        return this
	
	    }).call({}, navigator.userAgent)
	
	    
	    var setBaseUI = function (_window) {
	
	        var UI, UNIT
	
	        // set ui
	
	        UI = {
	            os          : OS,
	            dpi         : window.devicePixelRatio,
	            scale       : window.viewportScale,
	            width       : window.document.documentElement.offsetWidth || window.innerWidth,
	            height      : window.document.documentElement.offsetHeight || window.innerHeight,
	            orientation : window.orientation
	        }
	
	        UI.viewportWidth = _window.viewportWidth = UI.width / UI.scale
	        UI.viewportHeight = _window.viewportHeight = UI.height / UI.scale
	
	        // define unit
	
	        UNIT = {
	            px : 1,
	            dp : UI.scale,
	            mm : UI.scale * 3.76562,
	            cm : UI.scale * 37.7812,
	            pt : UI.scale * 1.32812,
	            pc : UI.scale * 16,
	            in : UI.scale * 96,
	            vw : UI.width / 100,
	            vh : UI.height / 100,
	            vmin : Math.min(UI.width, UI.height) / 100,
	            vmax : Math.max(UI.width, UI.height) / 100,
	            __unitRegExp__ : /(?=\b|\-|\.)(\-?\.?[0-9]+\.?[0-9]*)(px|mm|cm|pt|pc|in|dp|vw|vh|vm|vmin|vmax|%)\b/ig,
	            __nativeUnits__ : DETECT.supportSizeUnits
	        }
	
	        // device
	
	        _window.device = {
	            ui   : UI,
	            os   : OS,
	            feat : DETECT
	        }
	
	        _window.UI = UI
	        _window.UNIT = UNIT
	        _window.DP = function (dp) {
	            return dp * UI.scale
	        }
	    }
	
	
	
	    /*=============================================================================*/
	
	
	    
	
	    // UUID 
	
	    var UUID = (function () {
	        function UUID () {
	            this.id = this.createUUID()
	        }
	
	        UUID.prototype.valueOf = function () { return this.id }
	        UUID.prototype.toString = function () { return this.id }
	
	        UUID.prototype.createUUID = function () {
	            var dg = new Date(1582, 10, 15, 0, 0, 0, 0)
	            var dc = new Date()
	            var t = dc.getTime() - dg.getTime()
	            var tl = UUID.getIntegerBits(t,0,31)
	            var tm = UUID.getIntegerBits(t,32,47)
	            var thv = UUID.getIntegerBits(t,48,59) + '1' // version 1, security version is 2
	            var csar = UUID.getIntegerBits(UUID.rand(4095),0,7)
	            var csl = UUID.getIntegerBits(UUID.rand(4095),0,7)
	            // since detection of anything about the machine/browser is far to buggy,
	            // include some more random numbers here
	            // if NIC or an IP can be obtained reliably, that should be put in
	            // here instead.
	            var n = UUID.getIntegerBits(UUID.rand(8191),0,7) +
	                    UUID.getIntegerBits(UUID.rand(8191),8,15) +
	                    UUID.getIntegerBits(UUID.rand(8191),0,7) +
	                    UUID.getIntegerBits(UUID.rand(8191),8,15) +
	                    UUID.getIntegerBits(UUID.rand(8191),0,15) // this last number is two octets long
	            return tl + tm  + thv  + csar + csl + n
	        }
	
	        //Pull out only certain bits from a very large integer, used to get the time
	        //code information for the first part of a UUID. Will return zero's if there
	        //aren't enough bits to shift where it needs to.
	        UUID.getIntegerBits = function (val,start,end) {
	            var base16 = UUID.returnBase(val,16)
	            var quadArray = new Array()
	            var quadString = ''
	            var i = 0
	            for (i = 0; i < base16.length; i++) {
	                quadArray.push(base16.substring(i,i+1)) 
	            }
	            for (i = Math.floor(start/4); i <= Math.floor(end/4); i++) {
	                if(!quadArray[i] || quadArray[i] == '') quadString += '0'
	                else quadString += quadArray[i]
	            }
	            return quadString
	        };
	
	        //Replaced from the original function to leverage the built in methods in
	        //JavaScript. Thanks to Robert Kieffer for pointing this one out
	        UUID.returnBase = function (number, base) {
	            return (number).toString(base).toUpperCase()
	        }
	         
	        //pick a random number within a range of numbers
	        //int b rand(int a); where 0 <= b <= a
	        UUID.rand = function (max) {
	            return Math.floor(Math.random() * (max + 1))
	        }
	
	        return UUID
	    })()
	
	
	
	
	    /*=============================================================================*/
	
	
	    
	
	    // watch - 变量改变观察
	
	    var Watch = (function () {
	        function watch (target, prop, handler) {
	            if ( target.__lookupGetter__(prop) != null ) {
	                return true
	            }
	
	            var oldval = target[prop]
	              , newval = oldval
	              , self = this
	              , getter = function () {
	                    return newval
	                }
	              , setter = function (val) {
	                    if ( Object.prototype.toString.call(val) === '[object Array]' ) {
	                        val = _extendArray(val, handler, self)
	                    }
	                    oldval = newval
	                    newval = val
	                    handler.call(target, prop, oldval, val)
	                }
	
	            if ( delete target[prop] ) { // can't watch constants
	                if ( Object.defineProperty ) { // ECMAScript 5
	                    Object.defineProperty(target, prop, {
	                        get: getter,
	                        set: setter,
	                        enumerable: true,  // 可被枚举
	                        configurable: true
	                    });
	                } else if ( Object.prototype.__defineGetter__ && Object.prototype.__defineSetter__ ) { // legacy
	                    Object.prototype.__defineGetter__.call(target, prop, getter)
	                    Object.prototype.__defineSetter__.call(target, prop, setter)
	                }
	            }
	
	            return this
	        }
	
	        // 解除变量监测器
	
	        function unwatch (target, prop) {
	            var val = target[prop]
	
	            delete target[prop] // remove accessors
	            target[prop] = val
	
	            return this
	        };
	
	        // Allows operations performed on an array instance to trigger bindings
	
	        function _extendArray (arr, callback, motive) {
	            if (arr.__wasExtended === true) return
	
	            function generateOverloadedFunction (target, methodName, self) {
	                return function () {
	                    var oldValue = Array.prototype.concat.apply(target)
	                    var newValue = Array.prototype[methodName].apply(target, arguments)
	                    target.updated(oldValue, motive)
	                    return newValue
	                }
	            }
	            arr.updated = function (oldValue, self) {
	                callback.call(this, 'items', oldValue, this, motive)
	            }
	            arr.concat = generateOverloadedFunction(arr, 'concat', motive)
	            arr.join = generateOverloadedFunction(arr, 'join', motive)
	            arr.pop = generateOverloadedFunction(arr, 'pop', motive)
	            arr.push = generateOverloadedFunction(arr, 'push', motive)
	            arr.reverse = generateOverloadedFunction(arr, 'reverse', motive)
	            arr.shift = generateOverloadedFunction(arr, 'shift', motive)
	            arr.slice = generateOverloadedFunction(arr, 'slice', motive)
	            arr.sort = generateOverloadedFunction(arr, 'sort', motive)
	            arr.splice = generateOverloadedFunction(arr, 'splice', motive)
	            arr.unshift = generateOverloadedFunction(arr, 'unshift', motive)
	            arr.__wasExtended = true
	
	            return arr
	        }
	
	        if ( true ) {
	            module.exports.watch = watch
	            module.exports.unwatch = unwatch
	        }
	
	        return {
	            watch : watch,
	            unwatch : unwatch
	        }
	    
	    })()
	
	    var Mirror = (function() {
	        Mirror.prototype.css_attr = [
	            "borderBottomWidth", 
	            "borderLeftWidth", 
	            "borderRightWidth", 
	            "borderTopStyle", 
	            "borderRightStyle", 
	            "borderBottomStyle", 
	            "borderLeftStyle", 
	            "borderTopWidth", 
	            "boxSizing", 
	            "fontFamily", 
	            "fontSize", 
	            "fontWeight", 
	            "height", 
	            "letterSpacing", 
	            "lineHeight", 
	            "marginBottom", 
	            "marginLeft", 
	            "marginRight", 
	            "marginTop", 
	            "outlineWidth", 
	            "overflow", 
	            "overflowX", 
	            "overflowY", 
	            "paddingBottom", 
	            "paddingLeft", 
	            "paddingRight", 
	            "paddingTop", 
	            "textAlign", 
	            "textOverflow", 
	            "textTransform", 
	            "whiteSpace", 
	            "wordBreak", 
	            "wordWrap"
	        ]
	
	        function Mirror(inputor) {
	            this.inputor = inputor
	
	            return this
	        }
	
	        Mirror.prototype.mirrorCss = function() {
	            var that = this
	            var css = {
	                position: 'absolute',
	                left: -9999,
	                top: 0,
	                zIndex: -20000
	            }
	
	            if ( this.inputor.nodeName === 'TEXTAREA' ) {
	                this.css_attr.push('width')
	            }
	
	            this.css_attr.each(function(i, p) {
	                return css[p] = that.inputor.css(p)
	            })
	
	            return css
	        }
	
	        Mirror.prototype.create = function(html) {
	            var that = this
	            var css = this.mirrorCss()
	
	            this.mirror = document.createElement('div')
	
	            css.each(function (i, p) {
	                that.mirror.style[i] = p
	            })
	
	            this.mirror.html(html)
	            this.inputor.after(this.mirror)
	
	            return this
	        }
	
	        Mirror.prototype.rect = function(select) {
	            var flag = this.mirror.find(select)
	            var pos = flag.position()
	            var rect = {
	                left: pos.left,
	                top: pos.top,
	                height: flag[0].offsetHeight
	            }
	
	            this.mirror.remove()
	        
	            return rect
	        }
	
	        return Mirror
	    })()
	
	
	
	    /*=============================================================================*/
	
	
	    
	
	
	    /*=============================================================================*/
	
	
	    
	
	    // 统一兼容性
	
	    window.__defineUnify__ = (function () {
	
	        // Prefix, default unit
	
	        var VENDOR_LENGTH = DETECT.vendor.length
	        var REGEXP = {
	                vendor : new RegExp("^" + DETECT.vendor, "ig")
	            }
	
	        // noop
	
	        var noop = function () {}
	
	        // preventDefaultEvent
	
	        var stopPropagation = function (event) { return event.stopPropagation() }
	        var preventDefaultEvent = function (event) { return event.preventDefault() }
	
	
	
	        return function (window) {
	
	            // defineProperty
	
	
	            window.Object.defineProperty(window.Object.prototype, "extendProperty", {configurable:true, writable:true})
	            window.Object.prototype.extendProperty = function (prop, value) {
	                try {
	                    window.Object.defineProperty(this, prop, {configurable:true, writable:true})
	                    if ( value !== undefined ) this[prop] = value
	                } catch (e) {}
	            }
	            window.Object.defineProperty(window.Object.prototype, "extendProperties", {configurable:true, writable:true})
	            window.Object.prototype.extendProperties = function (object) {
	                for (var key in object) {
	                    this.extendProperty(key, object[key])
	                }
	            }
	
	
	            /*=============================================================================*/
	
	
	
	            var document = window.document
	
	            // Define
	
	            Define(window)
	
	            // setBaseUI
	
	            setBaseUI(window)
	            window.onresize = function () {
	                setBaseUI(window)
	            }
	
	            window.keyboard = {}
	
	            // 空函数
	
	            window.noop = noop
	
	            // 阻止默认事件行为 指针目的:所有preventDefault 函数指向同一内存，可在全局进行 add & remove
	
	            window.stopPropagation = stopPropagation
	            window.preventDefaultEvent = preventDefaultEvent
	
	
	
	
	            /*=============================================================================*/
	
	
	
	            // 修正开发商前缀为W3C API
	
	            for ( var key in window ) {
	                var vendor = REGEXP.vendor.exec(key)
	
	                if ( vendor ) {
	                    var start = key.charAt(VENDOR_LENGTH)
	                    var rekey = key.substr(VENDOR_LENGTH).replace(/(\w)/,function(v){return v.toLowerCase()})
	
	                    if ( start > 'A' || start < 'Z' ) {
	                        try {
	                            if ( !window[rekey] ) {
	                                Object.defineProperty(window, rekey, {configurable:true, writable:true})
	                                window[rekey] = window[key]
	                            }
	                        } catch (e) {}
	                    }
	                }
	            }
	
	
	
	            /*=============================================================================*/
	
	
	
	            /* requestAnimationFrame & cancelAnimationFrame */
	
	            if ( !window.requestAnimationFrame || !window.cancelAnimationFrame ) {
	
	                window.extendProperty("requestAnimationFrame", (function () {
	                    var lastTime = 0
	
	                    return function (callback) {
	                        var now = Date.now()
	                        var nextTime = Math.max(lastTime + 16.78, now)
	                        return setTimeout(function () { callback(lastTime = nextTime) }, nextTime - now)
	                    }
	                })())
	
	                window.extendProperty("cancelAnimationFrame", window.clearTimeout)
	            }
	
	            if ( !window.requestIdleCallback ) {
	                window.extendProperty("requestIdleCallback", function (callback) {
	                    return setTimeout(function () { 
	                        callback({ 
	                            timeRemaining: function () { 
	                                return Number.MAX_VALUE 
	                            } 
	                        }) 
	                    }, 0)
	                })
	            }
	
	            if ( !window.document.head ) {
	                window.document.extendProperty("head", window.document.getElementsByTagName("head")[0] || window.document.documentElement)
	            }
	
	            /* time */
	
	            if ( !window.Date.now ) {
	                window.Date.extendProperty("now", function () {
	                    return new Date().getTime()
	                })
	            }
	
	            // UUID
	
	            window.extendProperty("UUID", UUID)
	
	
	
	            // Object extend
	
	            !(function () {
	
	                var Array = window.Array,
	                    Object = window.Object,
	                    String = window.String,
	                    Node = window.Node,
	                    Element = window.Element,
	                    DOMParser = window.DOMParser,
	                    Function = window.Function,
	                    CSSStyleDeclaration = window.CSSStyleDeclaration
	
	                // String
	
	                !(function (proto) {
	
	                    // trim
	
	                    if ( !proto.trim ) {
	                        proto.extendProperty("trim", function () {
	                            return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '')
	                        })
	                    }
	
	                    // split, 只split 字符中的组织结构，即忽略字符中被引号包裹的内容
	
	                    if ( !proto.splitCells ) {
	                        proto.extendProperty("splitCells", (function () {
	                            var SPLITES_RE = /(['"])[^'"]*\1/
	                            return function (reg) {
	                                var that = this
	                                that = that.replace(SPLITES_RE, function (v) { return encodeURIComponent(v) })
	                                that = that.split(reg)
	
	                                return that.map(function (v) {
	                                    return decodeURIComponent(v)
	                                })
	                            }
	                        })())
	                    }
	
	                    // params string trans to Object
	
	                    proto.extendProperty("paramsToObject", function (reg) {
	                        var kds = this.split(reg || /[\?\#\,\&\:\=\/]/)
	                        var index = kds.length - 1
	                        var params = {}
	
	                        while ( index > 0  ) {
	                            params[kds[index-1]] = kds[index]
	
	                            index = index-2
	                        }
	
	                        return params
	                    })
	
	                    // 字符重复: str.repeat(3) >> strstrstr
	
	                    proto.extendProperty("repeat", function (n) {
	                        return new Array(1 + n).join(this)
	                    })
	
	                    // 字符静态分析
	                    
	                    proto.extendProperty("staticAnalysis", (function () {
	                        var SPLITES_RE = /\.|\[/
	                        var WORDS_RE = /^[a-zA-Z_$]+\w*$/
	                        var NUMBER_RE = /^[0-9]*\.?[0-9]*$/
	                        var OBJECT_RE = /window|top/
	
	                        // 静态分析模板变量
	                        
	                        var KEYWORDS =
	                            // 关键字
	                            'break,case,catch,continue,debugger,default,delete,do,else,false'
	                            + ',finally,for,function,if,in,instanceof,new,null,return,switch,this'
	                            + ',throw,true,try,typeof,var,void,while,with'
	
	                            // 保留字
	                            + ',abstract,boolean,byte,char,class,const,double,enum,export,extends'
	                            + ',final,float,goto,implements,import,int,interface,long,native'
	                            + ',package,private,protected,public,short,static,super,synchronized'
	                            + ',throws,transient,volatile'
	
	                            // ECMA 5 - use strict
	                            + ',arguments,let,yield'
	
	                            + ',undefined'
	
	                        var KEYWORDS_RE = new RegExp("\\b(?:" + KEYWORDS.split(',').join('|') + ")\\b")
	
	                        return function () {    
	                            var arrays = this.split(SPLITES_RE)
	                            var object = arrays[0]
	                            var result = window.sandboxWindow[object]
	
	                            if ( result ) return typeof result
	                            if ( NUMBER_RE.test(object) ) return 'number'
	                            if ( KEYWORDS_RE.test(object) ) return 'token'
	                            if ( OBJECT_RE.test(object) ) return 'object'
	                            if ( WORDS_RE.test(object) ) return 'variable'
	
	                            return 'unknown'
	
	                            // try {
	                            //     result = seval("typeof " + object)
	                            //     if ( result == 'undefined' ) return 'variable'
	                            // } catch(e) {
	                            //     return e.message.split(' ')[1]
	                            // }
	                        }
	                    })())
	
	                })(String.prototype)
	        
	
	                // Object
	
	                !(function (proto) {
	
	                    // 获取原型
	
	                    proto.extendProperty("getInstanceType", function () {
	                        return proto.toString.call(this).match(/^\[object\s(.*)\]$/)[1]
	                    })
	
	                    // extend
	
	                    proto.extendProperty("extend", function () {
	                        for (var i = 0, l = arguments.length; i < l; i++) {
	                            var source = arguments[i]
	
	                            for (var key in source)
	                                this[key] = source[key]
	                        }
	
	                        return this
	                    })
	
	                    // Object.assign
	
	                    if ( Object.assign !== 'function' ) {
	                            Object.extendProperty("assign", function (target) {
	                                
	                                //第一个传参不能是undefined和null，因为它们不能被转为对象
	                                
	                                if ( target === undefined || target === null ) {
	                                  throw new TypeError('Can not convert undefined or null to object')
	                                }
	
	                                //使用Object对象化target
	                                
	                                var output = Object(target)
	                                
	                                for (var idx = 1, l = arguments.length; index < l; idx++) {
	                                    
	                                    var source = arguments[idx]
	                                    
	                                    //后续传参也需要判断undefined和null
	                                  
	                                    if ( source !== undefined && source !== null ) {
	                                        for (var key in source) {
	                                            if ( Object.prototype.hasOwnProperty.call(source, key) ) {
	                                                output[key] = source[key]
	                                            }
	                                        }
	                                    }
	                                }
	
	                                return output
	                          })
	                    }
	
	                    // objectToParams
	
	                    proto.extendProperty("objectToParams", function (object) {
	                        var payload = ""
	                        var params = []
	                        var e = encodeURIComponent
	
	                        object = object || this
	                        
	                        if (typeof object === "string") {
	                            payload = object
	                        } else {
	
	                            for (var k in object) {
	                                if ( object.hasOwnProperty(k) ) {
	                                    var value = object[k]
	
	                                    switch (typeof value) {
	                                        case 'object':
	                                            value = JSON.stringify(object[k])
	                                        break
	                                        case 'string':
	                                            value = value
	                                        break
	                                    }
	
	                                    params.push(k + '=' + e(value))
	                                }
	                            }
	                            payload = params.join('&')
	                        }
	
	                        return payload
	                    })
	
	                    // countProperties 获取Object propert length
	
	                    proto.extendProperty("countProperties", function () {
	                        var count = 0
	
	                        for (var property in this) {
	                            if (this.hasOwnProperty(property)) {
	                                count++
	                            }
	                        }
	
	                        return count
	                    })
	
	                    // each
	
	                    proto.extendProperty("each", function (callback, that) {
	                        that = that || this
	                        
	                        var i, key, length, array
	
	                        switch (this.getInstanceType()) {
	                            case "Object":
	                                i = 0
	                                length = this.countProperties()
	
	                                for (key in this) {
	                                    if (!this.hasOwnProperty(key))
	                                        continue
	                                    if (callback.call(that, key, this[key], i + 1, length) === false)
	                                        return this
	
	                                    i++
	                                }
	
	                                break
	
	                            default:
	
	                                array = this.nodeType ? this.childNodes : this
	
	                                for (i = 0; i < array.length; i++) {
	                                    if (callback.call(that, i, array[i], i + 1, array.length) === false)
	                                        return this
	                                }
	
	                                break
	                        }
	
	                        return this
	                    })
	
	                    // equals
	
	                    proto.extendProperty("equals", function(x, y) {
	                        if ( arguments.length == 1 ) {
	                            y = this
	                        }
	
	                        // If both x and y are null or undefined and exactly the same
	                        if ( x === y ) {
	                            return true
	                        }
	
	                        // If they are not strictly equal, they both need to be Objects
	                        if ( ! ( x instanceof Object ) || ! ( y instanceof Object ) ) {
	                            return false
	                        }
	
	                        // They must have the exact same prototype chain, the closest we can do is
	                        // test the constructor.
	                        if ( x.constructor !== y.constructor ) {
	                            return false
	                        }
	
	                        for ( var p in x ) {
	                            // Inherited properties were tested using x.constructor === y.constructor
	                            if ( x.hasOwnProperty( p ) ) {
	                                // Allows comparing x[ p ] and y[ p ] when set to undefined
	                                if ( ! y.hasOwnProperty( p ) ) {
	                                    return false
	                                }
	
	                                // If they have the same strict value or identity then they are equal
	                                if ( x[ p ] === y[ p ] ) {
	                                    continue
	                                }
	
	                                // Numbers, Strings, Functions, Booleans must be strictly equal
	                                if ( typeof( x[ p ] ) !== "object" ) {
	                                    return false
	                                }
	
	                                // Objects and Arrays must be tested recursively
	                                if ( ! Object.equals( x[ p ],  y[ p ] ) ) {
	                                    return false
	                                }
	                            }
	                        }
	
	                        for ( p in y ) {
	                            // allows x[ p ] to be set to undefined
	                            if ( y.hasOwnProperty( p ) && ! x.hasOwnProperty( p ) ) {
	                                return false
	                            }
	                        }
	                        return true
	                    })
	
	                    // clone
	
	                    proto.extendProperty("clone", function () {
	                        return Object.create(this)
	                    })
	
	                    // watch
	
	                    proto.extendProperty("watch", function (prop, handler) {
	                        Watch.watch(this, prop, handler)
	                    })
	
	                    // unwatch
	
	                    proto.extendProperty("unwatch", function (prop) {
	                        Watch.unwatch(this, prop)
	                    })
	
	                    // initial
	
	                    proto.extendProperty("initial", function (prop, value) {
	                        return this[prop] || (this[prop] = value)
	                    })
	
	                    // setValueOfHref
	
	                    proto.extendProperty("setValueOfHref", function (link, value) {
	                        new Function('scope', 'value', 'scope.' + link + ' = value')(this, value)
	                    })
	
	                    // getValueByRoute
	
	                    proto.extendProperty("getValueByRoute", (function () {
	
	                        var SPLITES_RE = /[^\w|\.$]+/
	                        var LINKS_RE = /(['"])[^'"]*\1/
	                        var OBJECT_RE = /\.|\[/
	                        var LINKER_RE = /^[\w\_\$\.]*$/
	
	                        return function (link, factory, error) {
	                            var result
	
	                            // 传参空直接返回this
	
	                            if ( !link ) return this
	
	                            // 无运算直接输出
	                            
	                            if ( LINKER_RE.test(link) ) {
	                                result = this.getValueByLink(link)
	
	                                // get Function
	                                
	                                if ( factory ) {
	                                    return {
	                                        factory : null,
	                                        result : result
	                                    }
	                                }
	
	                                return result
	                            } else {
	                                result = this[link]
	                                
	                                if ( result ) {
	
	                                    // get Function
	                                
	                                    if ( factory ) {
	                                        return {
	                                            factory : null,
	                                            result : result
	                                        }
	                                    }
	
	                                    return result
	                                }
	                            }
	
	                            // 需要创建运算函数
	
	                            var i
	                              , l
	                              , fn
	                              , val
	                              , noops = []
	                              , scope = []
	                              , links = []
	                              , splits = []
	                              , inscope = {}
	                              , unlink = link.replace(LINKS_RE, '')
	                              , inlink = unlink.split(SPLITES_RE).unique()
	                               
	                            for (i = inlink.length - 1; i >= 0; i--) {
	                                val = inlink[i].split(OBJECT_RE)[0]
	
	                                if ( !inscope[val] ) { 
	
	                                    // 取得根对象，且检测根对象是否合法 (object.val || window.val)
	
	                                    if ( val && val.length && (this[val] || val.staticAnalysis() == 'variable') ) {
	                                        
	                                        // watched 可读变量
	                                        
	                                        if ( val in this ) {
	                                            splits.push(val)
	                                            scope.push(this[val])
	                                        } else {
	                                            splits.push(val)
	                                            scope.push(undefined)
	                                        }
	                                    }
	
	                                    inscope[val] = true
	                                }
	                            }
	                            
	                            try {
	                                fn = typeof factory == 'function' ? factory : new window.SandboxFunction(splits.join(','), 'try { return (' + link + ') } catch (e) {}')
	                                result = fn.apply(null, scope)
	                            } catch (e) {
	                                error && error(e)
	                            }
	
	                            // get Function
	
	                            if ( factory ) {
	                                return {
	                                    factory : fn,
	                                    result : result
	                                }
	                            }
	
	                            // 对象未定义时的默认声明
	
	                            return result
	                        }
	
	                    })())
	
	                    // getValueByRoutes
	
	                    proto.extendProperty("getValueByRoutes", function (links, fact, error) {
	                        var result = []
	
	                        if ( typeof links == 'string' ) links = [links]
	
	                        for (var i = 0, l = links.length; i < l; i++) {
	                            result.push(this.getValueByRoute(links[i], fact, error))
	                        }
	
	                        return result
	                    })
	
	                    // getValueByRoute
	
	                    proto.extendProperty("getFunctionByRoute", function (link, fact, error) {
	                        return this.getValueByRoute(link, fact || true, error)
	                    })
	
	                    // getValueByRoutes
	                    
	                    proto.extendProperty("getFunctionByRoutes", function (links, fact, error) {
	                        return this.getValueByRoutes(links, fact || true, error)
	                    })
	
	                    // getValueByLink
	                    
	                    proto.extendProperty("getValueByLink", (function () {
	                        var SPLITES_RE = /\./
	
	                        return function (link) {
	                            var links = link.split(SPLITES_RE)
	                            var object = this
	
	                            for (var i = 0, l = links.length; i < l; i++) {
	                                if ( !object ) break
	                                object = object[links[i]]
	                                if ( l == 1 ) {
	                                    if ( ["true"].consistOf(links[i]) ) object = true
	                                    if ( ["false", "null", "undefined"].consistOf(links[i]) ) object = false
	                                } else if ( typeof object !== 'object' && i < l - 1 ) {
	                                    object = undefined
	                                    break
	                                }
	                            }
	
	                            return object
	                        }
	                    })())
	
	                })(Object.prototype)
	
	
	                // Array
	
	                !(function (proto) {
	
	                    // inArray
	
	                    if ( !proto.consistOf ) {
	                        proto.extendProperty("consistOf", function (obj) {
	                            var i = this.length
	
	                            while (i--) {  
	                                if ( this[i] === obj ) {  
	                                    return true
	                                }  
	                            } 
	
	                            return false 
	                        })
	                    }
	
	                    // map
	
	                    if ( !proto.map ) {
	                        proto.extendProperty("map", function (fn) {
	                            var a = []
	                            for(var i = 0; i < this.length; i++){
	                                var value = fn(this[i], i)
	
	                                if ( value == null ){
	                                    continue
	                                }
	
	                                a.push(value)
	                            }
	                            return a
	                        })
	                    }
	
	                    // unique 数组去重
	
	                    if ( !proto.unique ) {
	                        proto.extendProperty("unique", function () {
	                            var result = [], hash = {}
	                            for (var i = 0, elem; (elem = this[i]) != null; i++) {
	                                if (!hash[elem]) {
	                                    result.push(elem)
	                                    hash[elem] = true
	                                }
	                            }
	                            return result
	                        })
	                    }
	
	                })(Array.prototype)
	
	
	                // Node.prototype
	
	                !(function (proto) {
	
	                    // observer
	
	                    proto.extendProperty("observer", function (options, callback) {
	                        var MutationObserver = window.MutationObserver
	
	                        /**
	                        * @param {Object} options
	                        * @param {Function} callback
	                        * 元素attr change 监听 
	                        * childList：子元素的变动。
	                        * attributes：属性的变动。
	                        * characterData：节点内容或节点文本的变动。
	                        * subtree：所有下属节点（包括子节点和子节点的子节点）的变动。
	                        */
	
	                        var options = options || {
	                                attributes: true,
	                                childList: true,
	                                characterData: true,
	                                attributeOldValue : true,
	                                attributeFilter:["id", "class", "style", "src", "width", "height"]
	                            }
	
	                        try {
	                            if ( MutationObserver ) {
	                                new MutationObserver(function(record) {
	                                        callback(record)
	                                    }).observe(this, options)
	                            } else {
	                                var queue = []
	                                  , eventName = []
	
	                                if ( options ) {
	                                    options.each(function (key, on) {
	                                        switch (key) {
	                                            case 'attributes':
	                                                on && eventName.push("DOMAttrModified")
	                                                break;
	                                            case 'childList':
	                                                on && eventName.push("DOMNodeInserted")
	                                                on && eventName.push("DOMNodeRemoved")
	                                                break
	                                            case 'characterData':
	                                                on && eventName.push("DOMCharacterDataModified")
	                                                break;
	                                            case 'subtree':
	                                                on && eventName.push("DOMNodeInserted")
	                                                on && eventName.push("DOMNodeRemoved")
	                                                on && eventName.push("DOMNodeInsertedIntoDocument")
	                                                on && eventName.push("DOMNodeRemovedFromDocument")
	                                                break
	                                        }
	                                    })
	
	                                    if ( eventName.length == 8 ) {
	                                        eventName = "DOMSubtreeModified"
	                                    } else {
	                                        eventName = eventName.join(' ')
	                                    }
	                                } else {
	                                    eventName = "DOMSubtreeModified"
	                                }
	
	                                this.bind(eventName, function (e) {
	                                    if ( queue.length == 0 ) {
	                                        setTimeout(function () {
	                                            callback([].concat(queue))
	                                            queue = []
	                                        }, 0)
	                                    }
	
	                                    queue.push(e)
	                                })
	                            }
	                        } catch (e) {}
	                    })
	
	                })(Node.prototype)
	
	
	                // Element.prototype
	
	                !(function (proto) {
	
	                    // element.Move() => new Move()
	
	                    proto.extendProperty("Animate", function (options) {
	
	                        if ( !this.animationEvent ) {
	                            this.extendProperty("animationEvent", window.Move(this))
	                        }
	
	                        return this.animationEvent
	                    })
	
	                    // element.Touch() => new Touch()
	
	                    proto.extendProperty("Touch", function (options) {
	
	                        // shadow box trans window
	
	                        var win = this.ownerDocument.defaultView
	
	                        if ( !win ) return {}
	
	                        if ( !this.touchEvent ) {
	                            this.extendProperty("touchEvent", new win.Touch(this, options))
	                        }
	
	                        return this.touchEvent
	                    })
	                    
	                    // element.Scroll() => new Scroll()
	
	                    proto.extendProperty("Scroll", function (options, window) {
	
	                        // shadow box trans window
	
	                        var win = this.ownerDocument.defaultView
	
	                        if ( !win ) return {}
	
	                        if ( !this.scrollEvent ) {
	                            this.extendProperty("scrollEvent", new win.Scroll(this, options, window))
	                        }
	
	                        return this.scrollEvent
	                    })
	
	                    // get attr
	
	                    proto.extendProperty("getAttrSign", function (prop) {
	                        prop = this.getAttribute(prop)
	
	                        if ( ["false", "none", null].consistOf(prop) ) {
	                            prop = false
	                        } else if ( ["", "true"].consistOf(prop)) {
	                            prop = true
	                        } else if ( !isNaN(prop) ) {
	                            prop = Number(prop)
	                        }
	                        
	                        return prop
	                    })
	
	                    // getOwnerSelection
	
	                    proto.extendProperty("getOwnerSelection", function (context) {
	                        return (this.parentShadowRoot && device.feat.shadowRoot == true ? this.parentShadowRoot : this.ownerDocument.defaultView).getSelection()
	                    })
	
	                    // getSelectionRange
	
	                    proto.extendProperty("getSelectionRange", function (selection) {
	                        selection = selection || this.getOwnerSelection()
	
	                        return selection.createRange ? selection.createRange() : selection.anchorNode ? selection.getRangeAt(0) : null
	                    })
	
	                    // setSelectionRangeAt
	
	                    proto.extendProperty("setSelectionRangePos", function (pos) {
	                        var selection = this.getOwnerSelection()
	
	                        switch (this.nodeName) {
	                            case 'INPUT':
	                            case 'TEXTAREA':
	                                pos = pos.getInstanceType() == 'Array' ? pos : [this.selectionStart, this.selectionEnd]
	
	                                if ( selection.rangeCount > 0 ) selection.removeAllRanges()
	
	                                this.setSelectionRange(pos[0], pos[1])
	
	                            break
	
	                            case 'HTMLAREA':
	                                var oDocument = this.ownerDocument
	                                var fn, found, offset
	
	                                if ( pos === undefined ) {
	                                    pos = this.getSelectionRange(selection)
	                                }
	
	                                if ( pos.getInstanceType() == 'Range' ) {
	                                    selection.removeAllRanges()
	                                    selection.addRange(pos)
	                                } else if ( selection ) {
	                                    offset = 0
	                                    found = false
	
	                                    (fn = function (pos, parent) {
	                                        var node, range, _i, _len, _ref, _results
	
	                                        _ref = parent.childNodes
	                                        _results = []
	
	                                        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	                                            node = _ref[_i]
	
	                                            if ( found ) {
	                                                break
	                                            }
	
	                                            if ( node.nodeType === 3 ) {
	                                                if ( offset + node.length >= pos ) {
	                                                    found = true
	                                                    range = oDocument.createRange()
	
	                                                    range.setStart(node, pos - offset)
	                                                    selection.removeAllRanges()
	                                                    selection.addRange(range)
	
	                                                    break
	                                                } else {
	                                                    _results.push(offset += node.length)
	                                                }
	                                            } else {
	                                                _results.push(fn(pos, node))
	                                            }
	                                        }
	                                        
	                                        return _results
	
	                                    })(pos, this)
	                                }
	
	                            break
	                        }
	                    })
	
	                    // getSelectionRangeInsert
	
	                    proto.extendProperty("getSelectionRangeInsert", function (context) {
	                        var selection = this.getOwnerSelection()
	                        var range = this.getSelectionRange(selection)
	                        
	                        if ( range == null ) return null
	                        if ( context == undefined ) return range
	
	                        range.collapse(false)
	
	                        var content = range.createContextualFragment(context)
	                        var lastChild = content.lastChild
	
	                        range.insertNode(content)
	
	                        if ( lastChild ) {
	                            range.setEndAfter(lastChild)
	                            range.setStartAfter(lastChild)
	                        }
	
	                        this.setSelectionRangePos(range)
	
	                        return range
	                    })
	
	
	                    // getSelectionRangePos
	
	                    proto.extendProperty("getSelectionRangePosition", function (pos) {
	                        switch (this.nodeName) {
	                            case 'INPUT':
	                            case 'TEXTAREA':
	
	                                var at_rect, end_range, format, html, mirror, start_range
	
	                                if ( pos === void 0 ) {
	                                    pos = this.selectionStart
	                                }
	
	                                if ( pos == this.preSelectionPos ) {
	                                    return this.preSelectionRect
	                                }
	
	                                format = function (value) {
	                                    value = value.replace(/<|>|`|"|&/g, '?').replace(/\r\n|\r|\n/g, "<br/>")
	                                    if ( /firefox/i.test(navigator.userAgent) ) {
	                                        value = value.replace(/\s/g, '&nbsp;')
	                                    }
	                                    return value
	                                }
	
	                                start_range = this.value.slice(0, pos)
	                                end_range = this.value.slice(pos)
	                                html = "<span style='position: relative; display: inline;'>" + format(start_range) + "</span>"
	                                html += "<span id='mirror' style='position: relative; display: inline;'>|</span>"
	                                html += "<span style='position: relative; display: inline;'>" + format(end_range) + "</span>"
	                                mirror = new Mirror(this)
	
	                                at_rect = mirror.create(html).rect("#mirror")
	                                
	                                at_rect.left -= this.scrollLeft
	                                at_rect.top -= this.scrollTop
	
	                                this.preSelectionPos = pos
	                                this.preSelectionRect = at_rect
	
	                                return at_rect
	
	                            break
	
	                            case 'HTMLAREA':
	
	                                var inputor_offset, range_offset
	                        
	                                range_offset = this.getSelectionRangeOffset()
	                                inputor_offset = this.offset()
	                                range_offset.left -= inputor_offset.left
	                                range_offset.top -= inputor_offset.top
	
	                                return range_offset
	                            break
	                        }
	                    })
	
	                    proto.extendProperty("getSelectionRangeOffset", function (pos) {
	                        switch (this.nodeName) {
	                            case 'INPUT':
	                            case 'TEXTAREA':
	                                var offset = this.offset()
	                                var position = this.getSelectionRangePosition(pos)
	
	                                return offset = {
	                                    left: offset.left + position.left,
	                                    top: offset.top + position.top,
	                                    height: position.height
	                                }
	
	                            break
	
	                            case 'HTMLAREA':
	
	                                var oWindow = this.ownerDocument.defaultView
	                                var oDocument = oWindow.document
	
	                                var selection = this.getOwnerSelection()
	                                var range = this.getSelectionRange(selection)
	
	                                var clonedRange, offset, rect, shadowCaret
	
	                                if ( range ) {
	
	                                    range.collapse(false)
	
	                                    if ( range.endOffset - 1 > 0 && range.endContainer !== this ) {
	                                        clonedRange = range.cloneRange()
	                                        clonedRange.setStart(range.endContainer, range.endOffset - 1)
	                                        clonedRange.setEnd(range.endContainer, range.endOffset)
	                                        rect = clonedRange.getBoundingClientRect()
	                                        offset = {
	                                            height: rect.height,
	                                            left: rect.left + rect.width,
	                                            top: rect.top
	                                        }
	                                        clonedRange.detach()
	                                    }
	
	                                    if ( !offset || (offset != null ? offset.height : void 0) === 0) {
	                                        clonedRange = range.cloneRange()
	                                        shadowCaret = oDocument.createTextNode("|")
	                                        clonedRange.insertNode(shadowCaret)
	                                        clonedRange.selectNode(shadowCaret)
	                                        rect = clonedRange.getBoundingClientRect()
	                                        offset = {
	                                            height: rect.height,
	                                            left: rect.left,
	                                            top: rect.top
	                                        }
	                                        shadowCaret.remove()
	                                        clonedRange.detach()
	                                    }
	                                }
	
	                                offset.left += top.scrollX
	                                offset.top += top.scrollY
	
	                                return offset
	
	                            break
	                        }
	                    })
	
	
	                })(Element.prototype)
	
	
	                // CSSStyleDeclaration
	
	                !(function (proto) {
	
	                    // style.set(propertyName, value)
	
	                    proto.extendProperty("set", function (propertyName, value) {
	                        if ( propertyName === undefined || value === undefined ) return
	
	                        value = typeof value === 'string' 
	                                ? value.replace(window.UNIT.__unitRegExp__, function (size, length, unit) { 
	                                    return length * window.UNIT[unit] + 'px'
	                                  }) 
	                                : value
	
	                        this.setProperty(device.feat.prefixStyle(propertyName, true), value)
	                    })
	
	                    // style.remove
	
	                    proto.extendProperty("remove", function (propertyName) {
	
	                        var vendors = [DETECT.prefix + propertyName, propertyName]
	
	                        for (var i = 0, l = vendors.length; i < l; i++) {
	                            var propertyName = vendors[i]
	
	                            if ( this.propertyIsEnumerable(propertyName) ) {
	                                this.removeProperty(propertyName)
	                            }
	                        }
	                    })
	
	                })(CSSStyleDeclaration.prototype)
	
	                // document 
	
	                !(function (proto) {
	
	                    // setCookie
	
	                    proto.extendProperty("setCookie", function (name, value, domain, path) {
	                        var Days = 30
	                        var exp = new Date()
	                        exp.setTime(exp.getTime() + Days*24*60*60*1000)
	                        document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString() + (domain ? ";path=" + (path ? path : "/") + ";domain=" + domain : "")
	                    })
	
	                    proto.extendProperty("getCookie", function (name) {
	                            var arr
	                        var reg = new RegExp("(^| )"+name+"=([^;]*)(;|$)")
	                        if ( arr = document.cookie.match(reg) )
	                            return unescape(arr[2])
	                        else
	                            return null
	                    })
	
	                    proto.extendProperty("delCookie", function (name) {
	                        var exp = new Date()
	                        exp.setTime(exp.getTime() - 1)
	                        var cval = getCookie(name)
	                        if ( cval != null ) {
	                            document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString()
	                        }
	                    })
	
	                })(document) 
	
	
	                // Function
	                
	                !(function (proto) {
	
	                    if ( !proto.bind ) {
	
	                        proto.bind = function (oThis) {
	                            if (typeof this !== "function") {
	                              // closest thing possible to the ECMAScript 5
	                              // internal IsCallable function
	                              throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable")
	                            }
	
	                            var aArgs = Array.prototype.slice.call(arguments, 1), 
	                                fToBind = this, 
	                                fNOP = function () {},
	                                fBound = function () {
	                                  return fToBind.apply(this instanceof fNOP
	                                                         ? this
	                                                         : oThis || this,
	                                                       aArgs.concat(Array.prototype.slice.call(arguments)))
	                                }
	
	                            fNOP.prototype = this.prototype
	                            fBound.prototype = new fNOP()
	
	                            return fBound
	                        }
	                    }
	
	                })(Function.prototype)
	
	
	                // DOMParser
	
	                !(function (proto) {
	
	                    proto.extendProperty("parseFromStringToNode", (function () {
	                        var DOMParser_proto = proto
	                        var real_parseFromString = DOMParser_proto.parseFromString
	
	                        // Firefox/Opera/IE throw errors on unsupported types
	
	                        try {
	
	                            // WebKit returns null on unsupported types
	
	                            if ( (new DOMParser).parseFromString("", "text/html") ) {
	
	                                // text/html parsing is natively supported
	                                var isParseHtmlFromString = true
	                            }
	
	                        } catch (ex) {}
	
	                        return function (markup, type) {
	
	                            switch (type) {
	                                case 'text/html':
	                                    var doc
	                                    var body
	
	                                    if ( isParseHtmlFromString ) {
	                                        doc = real_parseFromString.apply(this, arguments)
	
	                                        try {
	                                            body = doc.body
	                                        } catch (e) {}
	                                    }
	
	                                    if ( !body ) {
	
	                                        doc = document.implementation.createHTMLDocument("")
	
	                                        if ( markup.toLowerCase().indexOf('<!doctype') > -1) {
	                                            doc.documentElement.innerHTML = markup
	                                        } else {
	
	                                            try {
	                                                body = doc.body
	                                            } catch (e) {}
	
	                                            // android parseFromString then body is not definde 
	
	                                            if ( !body ) {
	                                                doc.documentElement.innerHTML = markup
	
	                                                var node
	                                                var nodes = document.createNodeIterator(doc.documentElement, NodeFilter.SHOW_ALL, null, false)
	
	                                                while ( node = nodes.nextNode() ) {
	                                                    if ( node.nodeName === 'BODY' ) {
	                                                        break
	                                                    }
	                                                }
	
	                                                nodes.body = node
	
	                                                doc = nodes
	                                            } else {
	                                                doc.body.innerHTML = markup
	                                            }
	                                            
	                                        }
	                                    }
	
	                                    return doc
	
	                                    break
	
	                                default:
	                                    return real_parseFromString.apply(this, arguments)
	
	                                    break
	                            }
	                        }
	
	                    })())
	
	                })(DOMParser.prototype)
	
	
	            })()
	        }
	
	    })()
	
	    __defineUnify__(window)
	
	})()

/***/ }),
/* 16 */
/***/ (function(module, exports) {

	module.exports = function() { throw new Error("define cannot be used indirect"); };


/***/ })
/******/ ]);
//# sourceMappingURL=ioing.js.map