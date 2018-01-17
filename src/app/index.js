import DNA from '../dna/index'
import MODULE from '../module/index'
import SOURCE from '../source/index'
import TEMPLATE from '../template/index'
import TRANSFORM from '../transform/index'

// define Application

export default () => {
  const Module = MODULE()
  const Source = SOURCE()
  const Template = TEMPLATE()
  const Transform = TRANSFORM()

  return class Application {
    constructor() {

      // console

      this.console = {
        echo: (type, pre, mid, suf) => {
          requestIdleCallback(function(deadline) {
            console[type](
              "%c " +
              (pre[0] ? pre[0] + ' ' : '') +
              "%c " + (mid[0] ? mid[0] + ' ' : '') +
              "%c " + (suf[0] ? suf[0] + ' ' : ''),
              "color: #ffffff; background:" + pre[1],
              "color: #ffffff; background:" + mid[1],
              "color: #ffffff; background:" + (suf[0] ? suf[1] : mid[1])
            )
          })
        },
        log: (message, title, description) => {
          this.console.echo('log', [title, '#999'], [message, '#333'], [description, '#666'])
        },
        info: (message, title, description) => {
          this.console.echo('info', [title, '#0cf'], [message, '#06c'], [description, '#0c0'])
        },
        warn: (message, title, description) => {
          this.console.echo('warn', [title, '#f60'], [message, '#f30'], [description, '#f90'])
        },
        error: (message, title, description) => {
          this.console.echo('warn', [title, '#f06'], [message, '#903'], [description, '#993'])
        },
        dir: (message) => {
          console.dir.apply(console, message)
        }
      }

      // lib

      this.sandbox = new Sandbox().unify()
      this.transform = new Transform(DNA)

      // init

      this.init()
    }

    init() {
      this._error = {}
      this._events = {}
      this._prefetchs = {}
      this._callbacks = {}
      this._prefetching = []

      // _EXISTS

      this._EXISTS = false
      this._inHistory = history.length
      this._inPrefetch = false

      // setting

      this.modules = {}
      this.config = {}
      this.frameworks = null

      this.setting(App.config)

      // console version

      this.name = App.name || 'top'
      this.version = '3.0.3'
      this.console.log(this.version, 'Version', 'ioing.com')

      // lock top window

      window.addEventListener('touchstart', function(e) {
        if (!App.preventDefaultException(e, {
            tagName: /^(INPUT|TEXTAREA|HTMLAREA|BUTTON|SELECT)$/
          })) {
          e.preventDefault()
        }
      }, false)
      window.addEventListener('touchmove', preventDefaultEvent, false)
    }

    setting(opts) {
      this.config.extend(opts)
    }

    // check () {

    // 	let check = () => {
    // 		return applicationCache.status == applicationCache.UPDATEREADY
    // 	}

    // 	let updateready = () => {
    // 		// Browser downloaded a new app cache.

    //       	// Swap it in and reload the page to get the new hotness.
    //  		try {

    //       		applicationCache.swapCache()

    //       		App.trigger("cachechange")

    //       	} catch (e) {}
    // 	}

    // 	if ( check() ) {

    // 		updateready()

    // 	} else {
    // 		applicationCache.addEventListener("updateready", function (e) {

    // 		    if ( check() ) {

    // 		      	updateready()

    // 		    } else {

    // 		      	// Manifest didn’t changed. Nothing new to server.

    // 		      	App.trigger('cachenochange')

    // 		    }

    // 		}, false)
    // 	}

    // }

    on(types, fn) {
      types.split(' ').each((i, type) => {
        this._events.initial(type, []).push(fn)
      })

      return this
    }

    one(types, fn) {
      let once = () => {
        fn.apply(this, arguments)
        this.off(types, once)
      }

      types.split(' ').each((i, type) => {
        this._events.initial(type, []).push(once)
      })

      return this
    }

    off(types, fn) {
      types.split(' ').each((i, type) => {
        if (!this._events[type]) return

        let index = this._events[type].indexOf(fn)

        if (index > -1) {
          this._events[type].splice(index, 1)
        }
      })
    }

    trigger(type) {
      let args = arguments

      if (!this._events[type]) return

      this._events[type].each((i, fn) => {
        try {
          fn.apply(this, [].slice.call(args, 1))
        } catch (e) {
          this.off(type, fn)
          this.console.warn('event:' + type, 'Expire', 'be off')
        }
      })
    }

    to() {
      return App.transform.to.apply(App.transform, arguments)
    }

    get(id, callback, failed) {

      if (!id) return
      if (this._error[id]) return failed && failed()

      // 主依赖

      if (id !== 'frameworks' && this.modules.frameworks === undefined) {
        return this.get('frameworks', () => {
          App.get(id, callback, failed)
        })
      }

      let modules = this.modules

      id = decodeURIComponent(id).split('^')[0]

      // define callback

      callback = callback || noop

      // module is not defined

      if (typeof modules[id] !== 'object') {

        // clalback list

        this._callbacks.initial(id, []).push(callback)

        // require module config

        this.take(id, (uri) => {

          // 异步回调重新检测模块是否存在

          if (modules[id] === undefined) {
            modules[id] = new Module(id, define.require(uri))

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
        callback.apply(this, [modules[id]])

        return modules[id]
      }
    }

    take(id, callback, failed) {
      let that = this
      let uri = ''
      let frame = this.frameworks
      let config = frame ? frame.config : {}
      let origins = config.origins

      if (!id) return

      // module config path

      if (id.match(/^\w+\:/) === null) {
        uri = this.realpath(id, id, 'config')
      } else if (origins) {
        origins.each((i, origin) => {
          if (id.indexOf(origin) == 0) {
            uri = id + '/config'
          }
        })
      } else {
        uri = id + '/config'
      }

      if (!uri) return

      define.require([uri], (require) => {
        callback && callback(uri)
      }, () => {
        failed && failed()
      })
    }

    origin(id) {
      let remote = id.match(/^\w+\:/) === null ? false : true
      let repath = remote ? id.split('/').shift() : null

      // proto module id

      id = remote ? id : id.split('^')[0]

      return {
        root: repath ? repath : this.config.root + 'modules',
        path: remote ? id : this.config.root + 'modules/' + id
      }
    }

    realpath(id, sid, url, path) {

      // removeQuotes

      url = url.replace(/\"|\'/g, '')
      url = url.trim()

      if (!url) return ''

      // indexOf keyWord

      if (url.match(/^\w+\:/) === null && url.indexOf('//') !== 0) {

        if (path == true) return this.config.root + url

        let origin = this.origin(id)
        let root = origin.root
        let modpath = origin.path
        let prepath = path ? path : sid ? root + '/' + sid : modpath

        if (url.indexOf('/') === 0) {
          url = root + url
        } else if (url.indexOf('./') === 0) {
          url = prepath + url.substr(1)
        } else if (url.indexOf('~/') === 0) {
          url = prepath + url.substr(1)
        } else if (url.indexOf('~~/') === 0) {
          url = modpath + url.substr(2)
        } else {
          url = prepath + '/' + url
        }
      }

      return url
    }

    source() {
      return new Source()
    }

    template(id) {
      return new Template(id, DNA)
    }

    prefetching(id, param, callback) {

      if (!id) return

      let modules = this.modules
      let prefetch = this._prefetchs

      id = id.split('^')[0]
      callback = callback || noop

      /*
       * 模块配置未存在时推入预取队列
       * prefetch : app 状态 > 预取队列
       */

      if (modules[id] === undefined) {
        return this.get(id, () => {
          this.prefetching.apply(this, arguments)
        })
      } else {
        param = this.filterParam(param, modules[id].config.route)
        param = param[0] || null

        prefetch.initial(id, []).push(param)
      }

      /*
       * 模块已存在
       * 按参数预取模块source
       * 通过extend模块参数获取新的数据
       */

      prefetch[id].each((i, params) => {

        // remoteframe

        if (modules[id].remoteframe) return
        if (modules[id].getStatus() == 1) return

        // startTime

        modules[id].startLoadTime = Date.now()

        // nomal param url

        params = this.getParam(params)

        if (!modules[id].prefetch[params]) {

          // waiting

          modules[id].prefetch[params] = false

          // 标记为update模块预取无效

          if (modules[id].config.update === true || modules[id].config.cache === 0) {
            return this.console.warn('Modules[' + id + ']', 'Prefetch', 'config[update == true or cache == 0] cannot prefetch')
          }

          // 预取资源

          App.source().prefetch(id, modules[id].config, {}.extend(modules[id].initialparam, this.filterParam(params)[0]), (...args) => {

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
              if (modules[id]) {
                modules[id].prefetch[params] = null
                modules[id].updatetime[params] = null
                delete modules[id].prefetch[params]
                delete modules[id].updatetime[params]
              }
            }, modules[id].config.cache)


            callback()

          }, (err) => {

            delete modules[id].prefetch[params]

            App.console.error('Module [' + id + ']', 'Prefetch', 'failed')
          })
        }
      })

      delete prefetch[id]
    }

    prefetch(id, param) {
      let that = this

      // push

      this._prefetching.push([id, param])

      // check

      if (this._inPrefetch) return

      // lock

      this._inPrefetch = true

      // loop

      function step() {
        requestIdleCallback((deadline) => {
          if (that._prefetching.length === 0) return that._inPrefetch = false

          let args = that._prefetching.shift()
          let next = setTimeout(function() {
            step()
          }, 1200)
          that.prefetching(args[0], args[1], function() {
            clearTimeout(next)
            setTimeout(function() {
              step()
            }, 300)
          })
        })
      }

      // start

      step()
    }

    refresh() {

      this.clearSessionStorage()

      // remove module element

      this.modules.each((id, module) => {

        if (id !== 'frameworks') {
          if (module.elements) {
            module.elements.container.remove()
          }

          delete this.modules[id]
        }

      })
    }

    clearSessionStorage(key, id) {
      try {
        if (key) {
          (typeof key == 'string' ? [key] : key).each((i, key) => {
            sessionStorage.removeItem(id ? '[[' + id + ']]:' + key : key)
          })
        } else {
          for (let i = sessionStorage.length; i >= 0; i--) {
            key = sessionStorage.key(i)
            if (!id || key.indexOf('[[' + id + ']]:') == 0) {
              sessionStorage.removeItem(key)
            }
          }
        }
      } catch (e) {}
    }

    clearLocalStorage(key, id) {
      try {
        if (key) {
          (typeof key == 'string' ? [key] : key).each((i, key) => {
            localStorage.removeItem(id ? '[[' + id + ']]:' + key : key)
          })
        } else {
          for (let i = localStorage.length; i >= 0; i--) {
            key = localStorage.key(i)
            if (!id || key.indexOf('[[' + id + ']]:') == 0) {
              localStorage.removeItem(key)
            }
          }
        }
      } catch (e) {}
    }

    checkLocalStorage(time) {
      try {
        let expires = localStorage.getItem('EXPIRES')

        if (expires) {
          if (Date.now() - expires > time) {
            this.clearLocalStorage()
            expires = true
          }
        } else {
          localStorage.setItem('EXPIRES', Date.now())
        }

        this.expires = expires

      } catch (e) {}
    }

    setFileCache(id, key, response) {
      let that = this
      let cacid = '[[' + id + ']]:' + key
      let module = this.modules[id]

      return new Promise(function(resolve, reject) {
        try {
          if (('caches' in window) && ((location.protocol === 'https:') || (location.hostname === 'localhost'))) {
            caches.open(id).then(function(cache) {
              cache.put(key, new Response(response, {
                status: 200,
                statusText: Date.now()
              }))
              resolve(key)
            })
          } else {
            localStorage.setItem(cacid, response)
            module.storagemaps.push(cacid)
            resolve(key)
          }
        } catch (e) {}
      })
    }

    getFileCache(id, key, timeout) {
      let that = this

      return new Promise(function(resolve, reject) {
        try {
          if (('caches' in window) && ((location.protocol === 'https:') || (location.hostname === 'localhost'))) {
            caches.open(id).then(function(cache) {
              return cache.match(key)
            }).then(function(response) {
              if (!response) return reject(key)
              if (timeout && Date.now - response.statusText >= timeout) return reject(key)
              return response.text()
            }).then(function(body) {
              resolve(body)
            })
          } else {
            id = localStorage.getItem(key)

            if (id) {
              resolve(id)
            } else {
              reject(key)
            }
          }
        } catch (e) {
          reject(key)
        }
      })
    }

    clearFileCache(id) {
      if ('caches' in window) {
        if (id) {
          caches.delete(id)
        } else {
          caches.keys().then(function(keys) {
            for (let id of keys) {
              caches.delete(id)
            }
          })
        }
      } else {
        this.clearLocalStorage()
      }
    }

    getParam(param) {
      return param ? this.route('/' + param).param : null
    }

    setParam(id, param, initial) {
      let module = this.modules[id]
      let params = this.filterParam(param, module.config.route)

      // if this module cache param != param ? update = ture

      if (typeof param === 'string' || param === null) {
        module.update = this.equalsParam(module.dimension, param) ? false : true
        module.dimension = param
      }

      if (initial && module.update) {
        module.init()
        module.param.extend(module.initialparam, params[0])
        module.config.extend(module.initialconfig, params[1])
      } else {
        module.param.extend(params[0])
      }
    }

    filterParam(param, route) {
      let config = {}
      let params = (typeof param === 'string' ? param.paramsToObject(null, route) : param) || {}

      // filter config param

      params.each(function(key, value) {

        if (key.indexOf('^') === 0) {

          delete params[key]

          key = key.substr(1)

          if (['level', 'cache', 'timeout'].indexOf(key) !== -1) {
            config[key] = Number(value)
          }

        }

      })

      return [params, config]
    }

    equalsParam(a, b) {
      a = typeof a === 'string' ? a.paramsToObject() : a
      b = typeof b === 'string' ? b.paramsToObject() : b

      return Object.equals(a, b)
    }

    exists(push) {
      try {

        if (push) {
          sessionStorage.setItem('EXISTS', history.length)
        } else {
          return parseInt(sessionStorage.getItem('EXISTS')) === history.length
        }

      } catch (e) {
        this.console.warn('storage', 'Warn', 'error')
        return false
      }
    }

    defend(element, clear) {

      if (clear) element.innerHTML = null

      element.observer({
          childList: true
        },
        (records) => {
          records.each((i, record) => {
            let garbages = record.addedNodes
            garbages.each(function(i, garbage) {
              if (IMMUNITY.indexOf(garbage) == -1) {
                if (garbage.nodeName !== 'SCRIPT') garbage.remove()
              }
            })
          })
        }
      )
    }

    route(route) {
      let id, param

      if (!route) {
        if (this.config.hash == false && this.config.root) {
          route = location.href.indexOf(this.config.root)
          if (route.length <= 16) {
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
        id: id ? decodeURIComponent(id) : null,
        param: param ? decodeURIComponent(param) : null
      }
    }

    /**
     * 组织默认行为的元素过滤
     * @param  {Element} el
     * @param  {Object} exceptions
     * @return {Boolean}
     */
    preventDefaultException(e, exceptions) {
      let target = e.target
      let origin = e.path ? e.path[0] : null

      // shadow dom 中无法捕捉源

      if (origin && !(origin instanceof Node)) return true

      // 意外处理

      target = target || {}
      origin = origin || {}

      // 比对

      for (let i in exceptions) {
        let exc = exceptions[i]

        if (exc.test(target[i]) || exc.test(origin[i])) {
          return true
        }
      }

      return false
    }

    filter(id) {
      let module = this.modules[id]
      let config = module.config

      // 主模块禁止卸载

      if (["frameworks", "system"].consistOf(id)) {
        config.sandbox = false
        config.destroy = false

        if (id == "system") {
          config.shadowbox = true
        }

        if (id == "frameworks") {
          this.config.debug = module.debug

          if (module.baseStyles) {
            CSSBaseStyle += module.baseStyles
          }
        }
      }

      // reset level

      if (isNaN(config.level)) {
        config.level = 0
      }

      // reset route

      if (Object.getInstanceType(config.route) !== 'Array') {
        if (typeof config.route === 'string') {
          config.route = config.route.split('\\')
        } else {
          config.route = false
        }
      }

      // app type

      if (typeof config.source === 'string') {
        module.remoteframe = this.realpath(null, null, config.source, true)
      }

      // shadowRoot

      if (device.feat.shadowRoot == false) {
        config.shadowbox = false
      }

      // blur && mutations

      if (!device.feat.isBadTransition && !device.feat.prefixStyle('filter')) {
        config.mirroring = false
      }

      if (config.mirroring && config.mirroring.filter && config.mirroring.filter.indexOf('blur(') === 0) {
        if (device.feat.prefixStyle('backdrop-filte')) {
          config.mirroring = false
        }
      }

      // cache timeout

      config.cache = config.cache == undefined ? 3600 : config.cache
      config.timeout = config.timeout == undefined ? 3600 : config.timeout

      // WARMING: cache and update cannot coexist

      if (config.cache && config.update) {
        this.console.warn('cache and update cannot coexist', 'Config error', 'The cache should be 0')
      }

      // module type

      if (config.absolute !== false) {
        config.absolute = true
      }

      // module script

      if (config.script == undefined) {
        config.script = []
      }

      // module style

      if (config.style == undefined) {
        config.style = []
      }

      // module source

      if (config.source == undefined) {
        config.source = []
      }

      // filter

      if (typeof this.modules.frameworks.filter == 'function') {
        this.modules.frameworks.filter(id, config)
      }
    }
  }
}
