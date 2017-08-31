define('~/application', ['~/proto', '~/fetch', '~/transform', '~/template'], function (require, module, exports) {
	
	'use strict'

	// templates & trans viewport
	
	let Async = require('~/fetch')
	let Template = require('~/template')
	let Transform = require('~/transform')

	// Immunity

	let IMMUNITY = []

	let DNA = (element, remove) => {
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

	class Module {

		constructor (id) {
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

		init () {
			this.update = true
			this._events = {}

			this.rsetParam()

			return this
		}

		on (types, fn) {
            types.split(' ').each((i, type) => {
            	this._events.initial(type, []).push(fn)
            })

            return this
        }

        one (types, fn) {
        	let once = () => {
        		fn.apply(this, arguments)
        		this.off(types, once)
        	}

        	types.split(' ').each((i, type) => {
        		this._events.initial(type, []).push(once)
        	})

        	return this
        }

        off (types, fn) {
            types.split(' ').each((i, type) => {
            	if ( !this._events[type] ) return

            	let index = this._events[type].indexOf(fn)

            	if ( index > -1 ) {
                    this._events[type].splice(index, 1)
                }
            })
        }

        origin (sids, callback) {
            let geter = new promise.Promise()

            App.async.async(this.id, this.param, sids, 'data', geter)

            promise.join([geter]).then((data) => {
                callback(data[0][3], data)
            })
        }

        turnover (options, callback) {
        	let id = options.id
        	let data = options.data
        	let start = options.start
        	let limit = options.limit
        	let linker = options.linker
        	let origins = options.origins
        	let endflag = options.endflag
        	let turnover = options.turnover

        	let filter = (data) => {
                let row = []
                let ext = {}
                let end = true

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

                row.map((v, i) => { return v.__proto__ = data })
                
                // 回调给滚动组件
                
                callback(row, end)
            }

            // set module param

            this.setParam(((param) => {
                param.page = param._page = param.$page = Math.ceil(start / limit)
                param.start = param._start = param.$start = start
                param.limit = param._limit = param.$limit = limit
                param.turnover = param._turnover = param.$turnover = turnover

                return param
            })({}))

            data ? filter(data) : this.origin(origins, filter)
        }

        trigger (type) {
        	let that = this
        	let args = arguments
        	let events = this._events[type]

        	if ( !events ) return

        	for (let i = events.length - 1; i >= 0; i--) {
        		events[i].apply(that, [].slice.call(args, 1))
        	}
        }

		setParam (param, initial) {
			App.setParam(this.id, param, initial)

			return this
		}

		rsetParam () {
			this.param = this.initialparam.clone()

			return this
        }

		clearCache (dimension, storage) {
			App.clearCache(this.id, dimension, storage)

			return this
		}

		cloneAsNew (id) {
			return {}.extend(this, new Module(this.id), { 
				id : id, 
				config : {}.extend(this.config), 
				param : {}.extend(this.initialparam), 
				elements : {},
				initialparam : this.initialparam 
			})
		}

		clipView (clip) {
			let mask = this.elements.mask
			let view = this.elements.view
			
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
		}

		addElement (name, element) {
			if ( this.refreshing && this.elements[name] instanceof Element ) {
				this.refreshing.push(this.elements[name])
			}
			
			// sandbox
			
			if ( name === 'sandbox' ) {
				this.sandbox = element
			}

			this.elements[name] = element
		}

		loading (display) {
			App.transform.loading(this.id, display)
		}

		refresh (dimension, prefetch, readied) {

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

            App.transform.update(this.id, dimension, (render) => {
            	if ( prefetch ) {
					prefetch(render)
				} else {
					render()
				}
            }, (render) => {

            	if ( this.refreshing ) {
					this.refreshing.each((i, element) => {
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

			})

            return this
		}

		destroy (type) {
			let sandbox = this.elements.sandbox

			if ( sandbox ) {

				let swindow = sandbox.window

				sandbox.iframe.src = 'about:blank'
				swindow.location.reload()

				// clear document

				swindow.document.write('') //清空iframe的内容

				// close iframe window

				swindow.close() //避免iframe内存泄漏

				// clear window

				for ( let i in swindow ) { 
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

	class Application {
		constructor () {
			if ( !(this instanceof Application) ) {
	            return new Application()
	        }

			this.init()
		}

		init () {
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

			this.setting(App.config)

			// console

			this.console = {
	        	echo : (type, pre, mid, suf) => {
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
	        	log : (message, title, description) => {
	        		this.console.echo('log', [title, '#999'], [message, '#333'], [description, '#666'])
	        	},
	        	info : (message, title, description) => {
	        		this.console.echo('info', [title, '#0cf'], [message, '#06c'], [description, '#0c0'])
	        	},
	        	warn : (message, title, description) => {
	        		this.console.echo('warn', [title, '#f60'], [message, '#f30'], [description, '#f90'])
	        	},
	        	error : (message, title, description) => {
	        		this.console.echo('warn', [title, '#f06'], [message, '#903'], [description, '#993'])
	        	},
	        	dir : (message) => {
	        		console.dir.apply(console, message)
	        	}
	        }

	        // console version

			this.name = App.name || 'top'
			this.version = '3.0.1'
			this.console.log(this.version, 'Version', 'ioing.com')

	        // lock top window
	        
	        window.addEventListener('touchstart', function (e) {
	        	if ( !App.preventDefaultException(e, { tagName: /^(INPUT|TEXTAREA|HTMLAREA|BUTTON|SELECT)$/ }) ) {
					e.preventDefault()
				}
	        }, false)
	        window.addEventListener('touchmove', preventDefaultEvent, false)
		}

		setting (opts) {
			this.config.extend(opts)
		}

		check () {
			
			let check = () => {
				return applicationCache.status == applicationCache.UPDATEREADY
			}

			let updateready = () => {
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
		
		}

		on (types, fn) {
            types.split(' ').each((i, type) => {
            	this._events.initial(type, []).push(fn)
            })

            return this
        }

        one (types, fn) {
        	let once = () => {
        		fn.apply(this, arguments)
        		this.off(types, once)
        	}

        	types.split(' ').each((i, type) => {
        		this._events.initial(type, []).push(once)
        	})

        	return this
        }

        off (types, fn) {
            types.split(' ').each((i, type) => {
            	if ( !this._events[type] ) return

            	let index = this._events[type].indexOf(fn)

            	if ( index > -1 ) {
                    this._events[type].splice(index, 1)
                }
            })
        }

        trigger (type) {
        	let args = arguments

            if ( !this._events[type] ) return

            this._events[type].each((i, fn) => {
            	try {
            		fn.apply(this, [].slice.call(args, 1))
            	} catch (e) {
            		this.off(type, fn)
            		this.console.warn('event:' + type, 'Expire', 'be off')
            	}
            })
        }

        to () {
        	return App.transform.to.apply(App.transform, arguments)
        }

		get (id, callback, failed) {

			if ( !id ) return
			if ( this._error[id] ) return failed && failed()

			// 主依赖
			
			if ( id !== 'frameworks' && this.modules.frameworks === undefined ) {
				return this.get('frameworks', () => {
					App.get(id, callback, failed)
				})
			}

			let modules = this.modules

			id = decodeURIComponent(id).split('^')[0]

			// define callback

			callback = callback || noop

			// module is not defined

			if ( typeof modules[id] !== 'object' ) { 

				// clalback list

				this._callbacks.initial(id, []).push(callback)

				// require module config

				this.fetch(id, (uri) => {

					// 异步回调重新检测模块是否存在

					if ( modules[id] === undefined ) {
						modules[id] = new Module(id).extend(require(uri))

						// filter

						this.filter(id)

						// setup
						
						modules[id].initialparam = {}.extend(modules[id].param)
						modules[id].initialconfig = {}.extend(modules[id].config)

						// callback

						this._callbacks[id].each((i, callback) => {
							callback.apply(this, [modules[id]])
						})

						// del callback list

						delete this._callbacks[id]
					}
				}, () => {
					this._error[id] = true
					failed && failed()
				})
			} else {
				callback.apply([modules[id]])

				return modules[id]
			}

		}

		origin (id) {
			let remote = id.match(/^\w+\:/) === null ? false : true
			let repath = remote ? id.split('/').shift() : null

			// proto module id

			id = remote ? id : id.split('^')[0]
			
			return {
            	root : repath ? repath : this.config.root + 'modules',
            	path : remote ? id : this.config.root + 'modules/' + id
        	}
		}

		realpath (id, sid, url, path) {

			// removeQuotes

            url = url.replace(/\"|\'/g, '')
            url = url.trim()

            if ( !url ) return ''

            // indexOf keyWord

            if ( url.match(/^\w+\:/) === null && url.indexOf('//') !== 0 ) {

            	if ( path == true ) return this.config.root + url

            	let origin = this.origin(id)
            	let root = origin.root
            	let modpath = origin.path
            	let prepath = path ? path : sid ? root + '/' + sid : modpath

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
		}

		template (id) {
			return new Template(id, DNA)
		}

		fetch (id, callback, failed) {
			let uri = ''
			let frame = this.frameworks 
			let config = frame ? frame.config : {}
			let origins = config.origins

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
		}

		prefetch (id, param, callback) {
			
			if ( !id ) return

			let modules = this.modules
			let prefetch = this._prefetchs

			id = id.split('^')[0]
			callback = callback || noop

			/*
         	 * 模块配置未存在时推入预取队列
         	 * prefetch : app 状态 > 预取队列
			 */

			param = param || null

			prefetch.initial(id, []).push(param)
			
			if ( modules[id] === undefined || prefetch[id] === undefined ) {
				return  this.get(id, () => {
							this.prefetch(id, param)
						})
			}

			/*
			 * 模块已存在
			 * 按参数预取模块source
			 * 通过extend模块参数获取新的数据
			 */

			prefetch[id].each((i, params) => {

				// remoteframe

				if ( modules[id].remoteframe ) return

				// startTime

				modules[id].startLoadTime = Date.now()

				// nomal param url

				params = this.getParam(params)

				if ( modules[id].prefetch[params] === undefined ) {

					// waiting

					modules[id].prefetch[params] = false

					// 标记为update模块预取无效

					if ( modules[id].config.update === true || modules[id].config.cache === 0 ) {
						return this.console.warn('Modules[' + id + ']', 'Prefetch', 'config[update == true or cache == 0] cannot prefetch')
					}

					// 预取资源

					App.async.prefetch(id, modules[id].config, {}.extend(modules[id].initialparam, this.filterParam(params)[0]), (...args) => {

						// endTime

						modules[id].endLoadTime = Date.now()
						
						// console

                		App.console.info('Module [' + id + ']', 'Prefetch', (modules[id].endLoadTime - modules[id].startLoadTime) + 'ms')

						/* 
						 * 预取成功
						 * 以参数为key存储预取状态
						 */

						modules[id].prefetch[params] = args
						modules[id].updatetime[params] = Date.now()

						// timeout

						setTimeout(() => {
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

						App.console.error('Module [' + id + ']', 'Prefetch', 'failed')
					})
				}
			})

			delete prefetch[id]
		}

		refresh () {

			this.clearSessionStorage()

			// remove module element

			this.modules.each((id, module) => {

				if ( id !== 'frameworks' ) {
					if ( module.elements ) {
						module.elements.container.remove()
					}
					
					delete this.modules[id]
				}
				
			})
		}

		clearSessionStorage (key) {
			try {
				if ( key ) {				
					(typeof key == 'string' ? [key] : key).each((i, key) => {
						sessionStorage.removeItem(key)
					})
				} else {
					for (let i = sessionStorage.length; i >= 0; i--) {
						sessionStorage.removeItem(sessionStorage.key(i))
					}
				}
			} catch (e) {}
		}

		clearLocalStorage (key) {
			try {
				if ( key ) {
					(typeof key == 'string' ? [key] : key).each((i, key) => {
						localStorage.removeItem(key)
					})
				} else {
					for (let i = localStorage.length; i >= 0; i--) {
						localStorage.removeItem(localStorage.key(i))
					}
				}
			} catch (e) {}
		}

		checkLocalStorage (time) {
			try {
				let expires = localStorage.getItem('EXPIRES')

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
		}

		clearCache (id, dimension, storage) {
			
			let module = this.modules[id]

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
			
		}

		getParam (param) {
			return param ? this.route('/' + param).param : null
		}

		setParam (id, param, initial) {
            let module = this.modules[id]
            let params = this.filterParam(param)

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
        }

		filterParam (param) {
			let config = {}
			let params = (typeof param === 'string' ? param.paramsToObject() : param) || {}

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
		}

		equalsParam (a, b) {
        	a = typeof a === 'string' ? a.paramsToObject() : a
        	b = typeof b === 'string' ? b.paramsToObject() : b

        	return Object.equals(a, b)
        }

        exists (push) {
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
        }

        defend (element, clear) {

        	if ( clear ) element.innerHTML = null

        	element.observer(
	        	{ childList: true },
	        	(records) => {
					records.each((i, record) => {
						let garbages = record.addedNodes
						garbages.each(function (i, garbage) {
							if ( IMMUNITY.indexOf(garbage) == -1 ) {
								if ( garbage.nodeName !== 'SCRIPT' ) garbage.remove()
							}
						})
					})
				}
			)
        }

        route (route) {
        	let id, param

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

	        id = /(^\!(.*?)(?=\!\/)\!\/)/.exec(route)
	        id = id ? id[2] : false
	        route = id ? route.slice(id.length) : route
        	route = route.split(/\/|\$|\?|\&|\,|\=|\:/)
        	id = id ? id : route[0]
        	param = route.slice(1).join('/')
        	
        	return {
        		id : id ? decodeURIComponent(id) : null,
        		param : param ? decodeURIComponent(param) : null
        	}
        }

        /**
		 * 组织默认行为的元素过滤
		 * @param  {Element} el
		 * @param  {Object} exceptions
		 * @return {Boolean}
		 */
		preventDefaultException (e, exceptions) {
			let target = e.target
			let origin = e.path ? e.path[0] : null

			// shadow dom 中无法捕捉源

			if ( origin && !(origin instanceof Node) ) return true

			// 意外处理
			
			target = target || {}
			origin = origin || {}

			// 比对
			
			for ( let i in exceptions ) {
				let exc = exceptions[i]
				
				if ( exc.test(target[i]) || exc.test(origin[i]) ) {
					return true
				}
			}

			return false
		}

        filter (id) {
        	let module = this.modules[id]
        	let config = module.config

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

		let route = App.route()
		let id = route.id
		let od = id
		let param = route.param
		let exists = App.exists()

		// async get current page config 

		App.fetch(id)

		// start main view

		App.get('frameworks', function (module) {

			this.frameworks = module

			let mainc = module.config
			let index = mainc.index
			let system = mainc.system

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