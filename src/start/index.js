import APP from '../app/index'

export const start = (w, d) => {

  const Application = APP()

  // 初始化 Application

  w.App = w.application = new Application()

  // applicationready

  w.trigger("applicationready")
  w.trigger("startup")
  w.trigger("launch")

  // document ready after

  d.ready(function() {
    let route = App.route()
    let id = route.id
    let od = id
    let param = route.param
    let exists = App.exists()

    // async get current page config

    App.prefetching(id)

    // start main view

    App.get('frameworks', function(module) {

      this.frameworks = module

      let mainc = module.config
      let index = mainc.index
      let system = mainc.system

      // prefet index

      if (id !== index) {
        App.prefetching(index)
      }

      // current page

      id = id || index

      // check localStorage

      this.checkLocalStorage((mainc.expires || 604800) * 1000)

      // defend

      if (mainc.defend) this.defend(d.body, true)

      // transform init

      this.transform.init()
      this.transform.setup({
        singleflow: mainc.singleflow,
        singlelocking: mainc.singlelocking,
        nofindpage: mainc.nofind,
        currpage: id,
        homepage: index,
        limit: Math.max(mainc.limit || 50, 10),
        exists: exists
      })

      // start App

      this.to('frameworks', param, -1).then(function() {

        // applicationready

        w.trigger('applicationready')

        // no transform

        if (id) {

          // no need mark hash, because id is hash

          App.to(id, param, mainc.singleflow ? 1 : 0).then(function() {

            App._EXISTS = true

            w.trigger('applicationload')

            // prefetch index

            if (!App.modules[index]) {
              setTimeout(function() {
                App.prefetch(index)
              }, 2000)
            }

          })

        } else {

          App._EXISTS = true

          w.trigger('applicationload')
        }

        if (system) {
          App.get('system', function(module) {
            this.transform.container('system')
            module.Template = App.template('system').prefetch(function(module, callback) {
              callback()
            }).then(function(module, callback) {
              callback()
              App.trigger('systemload', {
                module: module
              })
            }).get(function(module) {
              App.trigger('systemloadall', {
                module: module
              })
            }).error(function(module) {
              App.trigger('systemloaderror', {
                module: module
              })
            })
          })
        }

      })
    }, function() {
      App.console.error('Module[frameworks]', 'Fatal error', 'is necessary')
    })

  })

  // error

  w.onerror = function() {
    App.console.error(arguments[1] || '(anonymous function)', 'Error', arguments[2] + ':' + arguments[3])
    App.trigger('unknownerror', arguments)

    return false
  }
}
