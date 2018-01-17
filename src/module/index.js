  // Module

export default () => {
  class Module {
    constructor(id, model) {

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

      this.extend(model)
      this.checkCache()
    }

    init() {
      this.update = true
      this._events = {}

      this.rsetParam()

      return this
    }

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

    origin(sids, callback) {
      var that = this

      return new Promise(function(resolve, reject) {
        App.source().async(that.id, that.param, sids, 'data', resolve)

      }).then(function(data) {
        callback(data[2])
      })
    }

    checkCache() {
      let id = this.id
      let key = '[[' + id + ']]:Version'

      try {
        let version = localStorage.getItem(key)

        if (version) {
          if (version !== this.version) {
            id = id === 'frameworks' ? null : id

            App.clearLocalStorage(null, id)
            App.clearSessionStorage(null, id)
            App.clearFileCache(id)
          }
        } else if (this.version) {
          localStorage.setItem(key, this.version)
        }
      } catch (e) {}
    }

    getStatus() {
      return this.status[this.dimension]
    }

    turnover(options, callback) {
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

        if (!row || !row[0]) {
          return callback(null, end)
        }

        if (endflag) {
          end = data.getValueByRoute(endflag) ? true : false
        } else {
          end = row.length < Number(limit) ? true : false
        }

        // 附加源

        row.map((v, i) => {
          return v.__proto__ = data
        })

        // 回调给滚动组件

        callback(row, end)
      }

      // set module param

      this.setParam(((param) => {
        param[id + '_page'] = param.page = param._page = param.$page = Math.ceil(start / limit)
        param[id + '_start'] = param.start = param._start = param.$start = start
        param[id + '_limit'] = param.limit = param._limit = param.$limit = limit
        param[id + '_turnover'] = param.turnover = param._turnover = param.$turnover = turnover

        return param
      })({}))

      data ? filter(data) : this.origin(origins, filter)
    }

    trigger(type) {
      let that = this
      let args = arguments
      let events = this._events[type]

      if (!events) return

      for (let i = events.length - 1; i >= 0; i--) {
        events[i].apply(that, [].slice.call(args, 1))
      }
    }

    setParam(param, initial) {
      App.setParam(this.id, param, initial)

      return this
    }

    rsetParam() {
      this.param = this.initialparam.clone()

      return this
    }

    clearCache(id, dimension, storage) {

      dimension = dimension == true ? module.dimension : dimension

      if (dimension) {
        delete this.prefetch[dimension]
      } else {
        this.prefetch = {}
      }

      // claer param

      this.init()

      // clear storage

      if (storage) {
        App.clearLocalStorage(null, id)
        App.clearSessionStorage(null, id)
      }

      // clear dimension

      delete module.dimension

      return this
    }

    cloneAsNew(id) {
      return {}.extend(this, new Module(this.id), {
        id: id,
        config: {}.extend(this.config),
        param: {}.extend(this.initialparam),
        elements: {},
        initialparam: this.initialparam
      })
    }

    clipView(clip) {
      let mask = this.elements.mask
      let view = this.elements.view

      if (!clip || !mask || !view) return

      if (clip.length === 1) {
        clip[1] = clip[2] = clip[3] = clip[0]
      } else if (clip.length === 2) {
        clip[2] = clip[0]
        clip[3] = clip[1]
      } else if (clip.length === 3) {
        clip[3] = clip[1]
      }

      mask.css({
        "display": "block",
        "position": "absolute",
        "top": clip[0] + 'dp',
        "right": clip[1] + 'dp',
        "bottom": clip[2] + 'dp',
        "left": clip[3] + 'dp',
        "overflow": "hidden"
      })

      view.css({
        "display": "block",
        "position": "absolute",
        "top": "-" + clip[0] + 'dp',
        "right": "-" + clip[1] + 'dp',
        "bottom": "-" + clip[2] + 'dp',
        "left": "-" + clip[3] + 'dp'
      })
    }

    addElement(name, element) {
      if (this.refreshing && this.elements[name] instanceof Element) {
        this.refreshing.push(this.elements[name])
      }

      // sandbox

      if (name === 'sandbox') {
        this.sandbox = element
      }

      this.elements[name] = element
    }

    loading(display) {
      App.transform.loading(this.id, display)
    }

    refresh(dimension, prefetch, readied) {
      let id = this.id

      // refreshstart

      this.trigger('refresh')
      App.trigger('refreshstart', id)

      // module dimension

      dimension = !dimension ? this.dimension : dimension

      // clear module cache & storeage

      this.clearCache(id, true, true)
      this.destroy()

      // setParam

      this.setParam(dimension, true)

      // refreshing elements

      this.refreshing = []

      // prefetch this module resources

      App.transform.update(id, dimension, (render) => {
        if (prefetch) {
          prefetch(render)
        } else {
          render()
        }
      }, (render) => {

        if (this.refreshing) {
          this.refreshing.each((i, element) => {
            if (element.localName === 'iframe') {
              element.src = 'about:blank'
            }

            element.remove()
          })

          this.refreshing = null
        }

        if (readied) {
          readied(render)
        } else {
          render()
        }

        App.trigger('refreshend', id)

      })

      return this
    }

    destroy(type) {
      let sandbox = this.elements.sandbox

      if (sandbox) {

        let swindow = sandbox.window
        let cdocument = sandbox.iframe.contentDocument

        // _blank

        sandbox.iframe.src = 'about:blank'
        swindow.location.reload()

        // clear document

        cdocument.open()
        cdocument.write('') //清空iframe的内容

        // close iframe window

        cdocument.close() //避免iframe内存泄漏

        // clear window

        for (let i in swindow) {
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

  return Module
}
