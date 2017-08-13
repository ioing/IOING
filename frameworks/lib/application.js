define('~/application', ['~/proto', '~/fetch', '~/transform', '~/template'], function (require, module, exports) {
	
	'use strict'

	// templates & trans viewport
	
	var Async = require('~/fetch')
	var Template = require('~/template')
	var Transform = require('~/transform')

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

			this.setting()

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
						modules[id] = new Module(id).extend(require(uri))

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

			require([uri], function () {
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

	window.__defineProto__ = require('~/proto')
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

})