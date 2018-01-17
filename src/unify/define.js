export const DEFINE = (w) => {

  let step = {}
  let modules = {}
  let handlerMap = {}
  let loadedFiles = {}
  let requireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/ig

  // Module

  function Module(name, deps, model, body) {
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
    _get: function(name, callback, error) {
      name = name || this.name

      switch (name) {
        case 'module':
          return this
          break

        case 'exports':
          name = this.name
          break
      }

      return require.call(this, name, callback, error)
    },
    _deps: function() {
      let deps = []

      for (let i = 0, l = this.deps.length; i < l; i++) {
        let dep = this.deps[i]
        deps.push(this._get(dep))
      }

      switch (this.model) {
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
    _create: function() {
      if (this.created) return
      this.created = true

      dispatchEvent('moduleExecute', this)

      this.body.apply(this.body, this._deps())

      dispatchEvent(this.name, this)
    }
  }

  function define() {
    let model = 0
    let name = arguments[0]
    let deps = arguments[1]
    let body = arguments[2]
    let error = arguments[3]

    switch (arguments.length) {
      case 1:
        name = null
        body = arguments[0]
        deps = null
        break
      case 2:
        body = arguments[1]
        if (typeof name === 'string') {
          deps = null
        } else {
          name = null
          deps = arguments[0]
        }
        break
    }

    deps = deps || getRequireNames(body.toString()) || []

    if (['module', 'exports'].indexOf(deps[0]) !== -1) {
      model = 1
    }

    // step.call

    if (name) {
      step.call = null
      creat(name, deps, model, body, error)
    } else {
      step.call = function(name) {
        creat(name, deps, model, body, error)
      }
    }
  }

  // creat deps module

  function creat(name, deps, model, body, error) {

    // new module

    let newModule = new Module(name, deps, model, body)

    // add to modules

    modules[name] = newModule

    // dispatchEvent moduleLoad

    dispatchEvent('moduleLoad', newModule)

    // unloadDeps

    let unloadDeps = []

    // push to unloadDeps

    for (let i = 0; i < deps.length; i++) {
      let dep = deps[i]

      if (modules[dep] == null && ['module', 'exports'].indexOf(dep) == -1) {
        unloadDeps.push(dep)
      }
    }

    // create

    if (unloadDeps.length == 0) {
      newModule._create()
    } else {
      addEventListeners(unloadDeps, function() {
        newModule._create()
      })

      // 打包独立文件时，执行完函数再检查依赖

      setTimeout(function() {
        for (let i = 0; i < unloadDeps.length; i++) {
          let name = unloadDeps[i]

          if (!modules[name]) {
            load(name, error)
          }
        }
      }, 0)
    }
  }

  function load(name, error) {
    if (loadedFiles[name]) return
    loadedFiles[name] = true

    // -/modulePath == {root}/modulePath

    let src = getRealPath(name) + (name.split('\/').pop().indexOf('.js') !== -1 ? '' : '.js')
    let head = w.document.head
    let script = w.document.createElement('SCRIPT')

    // dispatchEvent

    dispatchEvent('scriptLoad', src)

    // async load

    script.async = true
    script.src = src

    head.appendChild(script)

    // onload

    script.onload = function() {
      dispatchEvent('scriptLoaded', src)

      if (step.call) {
        step.call(name)
      }

      head.removeChild(script)

      // Dereference the node
      script = null
    }

    script.onerror = function() {
      if (error) error()

      head.removeChild(script)

      // Dereference the node
      script = null
    }
  }

  function getRealPath(path) {
    return path.indexOf('~/') === 0 ? __dir + path.substr(2) : path
  }

  function getRequireNames(str) {
    let names = []
    let r = requireRegExp.exec(str)
    while (r != null) {
      names.push(r[1])
      r = requireRegExp.exec(str)
    }
    return names
  }

  function addEventListener(topic, handler) {
    let handlers = handlerMap[topic]

    if (handlers == null) {
      handlerMap[topic] = []
    }

    handlerMap[topic].push(handler)
  }

  function addEventListeners(topics, handler) {
    let counter = 0

    for (let i = 0; i < topics.length; i++) {
      let topic = topics[i]
      let handlers = handlerMap[topic]

      if (handlers == null) {
        handlerMap[topic] = []
      }

      handlerMap[topic].push(function(result) {
        if ((++counter) === topics.length) {
          return handler(result)
        } else {
          return null
        }
      })
    }
  }

  function dispatchEvent(topic, event) {
    let handlers = handlerMap[topic]
    if (handlers != null) {
      for (let i = 0; i < handlers.length; i++) {
        handlers[i](event)
      }
    }
  }

  function get(name) {
    return modules[name] ? (function(exports) {
      exports = modules[name].exports
      return exports.default || exports
    })() : null
  }

  function require(name, callback, error) {
    if (callback) {
      define('argument', name, function(req) {
        callback(req)
      }, error)

      return this
    }
    return get(name)
  }

  define.require = require

  return w.define = define
}
