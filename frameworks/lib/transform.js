// 天下皆知美之为美，斯恶已。皆知善之为善，斯不善已

define('~/transform', [], function (require, module, exports) {
    
    'use strict'

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
            this.singleflowtimes = 0

            // go to history

            window.on("hashchange popstate", function (event) {

                // hashchange popstate

                if ( !App.id || App.equalsParam(that.prehistory, location.hash) ) return

                // pre history

                that.prehistory = location.hash

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

            // append to document

            document.body.appendChild(App.relativeViewport)
            document.body.appendChild(App.absoluteViewport)
        },

        setup : function (options) {

            this.options = options

            var currpage = options.currpage
            var homepage = options.homepage
            var exists = options.exists
            var singleflow = options.singleflow
            var singlelocking = options.singlelocking

            if ( singleflow ) {

                // inset homepage history
                
                if ( !exists && currpage !== homepage ) {
                    this.hash(homepage, null, 0)
                }

                if ( singlelocking && homepage ) {
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

            if ( this.options.singlelocking && this.module.config.level === 0 ) {

                this.singleflowtimes++

                this.hash(this.id, this.param, 1)

                // exit App

                App.trigger('exit', { singleflow : this.singleflowtimes})

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
            
                history.replaceState({}, null, '#' + this.reid(id) + (param ? '/' + param.replace(/\s/g, '') : ''))
            }

            this.module.setParam(param)
        },

        reid : function (id) {
            
            // remot module id
            
            return /\//.test(id) && id.indexOf('[') !== 0 ? '[' + id + ']' : id
        },

        get : function (id, od, input) {
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

                that.to.apply(that, input)
            }, function () {
                if ( id === nofind ) return
                that.loading(od, 0)
                that.to(nofind)
            })

            return this
        },

        to : function (id, param, history) {
            var that = this

            // filter
            
            if ( this.inProcess === 0 ) return this

            // in the process

            this.inProcess = 0

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
                return this.get(id, od, arguments)
            }

            // nomal param url

            param = App.getParam(param)

            // this extend

            this.id = id
            this.param = param
            this.callback = noop  // reset callback

            // od & id

            var od = this.od
            var ids = od ? [id, od] : [id]
            var module = App.modules[id]
            var modulu = App.modules[od]
            var moduli = od ? [module, modulu] : [module]

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

            this.animation = (this.self || !od || od === 'frameworks') 
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

                // pre module

                App.id = that.od = id === "frameworks" ? null : id
                App.module = module

                // history -1 ? 0 : ++
                /**
                 * push history build pre view
                 * hashchange 应该在试图转换之前插入，因为右滑会退效果会记录hashchange后的dom改变视图
                */

                if ( history !== -1 ) that.hash(id, param, history)

                // build content

                that.build(id, function (module, callback) {

                    callback = callback || noop

                    // not first ?

                    if ( od ) {
                        that.transform(function () {
                            callback()
                            that.inProcess = 1
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
              , modules = App.modules
              , module = modules[id]

            if ( !module.loaded 
                || module.update === true 
                || module.config.update === true ) 
            {   
                module.destroy(1)

                if ( that.prefetched || module.config.preview ) {
                    that.include(id, null, readied)
                } else {
                    rAF(function () {
                        readied(module, function () {
                            that.include(id, null, function (module, callback) { 
                                callback()
                            })
                        })
                    })
                }
            } else {
                readied(module)
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
            var frameworks = id == "frameworks" ? true : false

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
            var module = App.modules[id]
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

            // preload on event

            if ( typeof module.events.preload === "function" ) {
                module.events.preload()
            }

            // include module page

            module.Template = App.template(id).prefetch(function (module, callback) {

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

                // callback
                
                if ( readied ) {
                    readied(module, callback)
                } else {
                    callback()
                }

                // prefetch callback

                that.callback(module)

            }).get(function (module) {

                // close loading

                module.loading(0)

                // preload on event

                if ( typeof module.events.load === "function" ) {
                    module.events.load()
                }

                // timeout refresh

                if ( module.timeout ) {
                    if ( id == 'frameworks' ) return
                    setTimeout(function () {
                        module.refresh(dimension)
                    }, 100)
                }

            }).error(function (module) {

                // module status

                module.status[dimension] = 'error'
                
                // close loading

                module.loading(0)

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
              , module = App.modules[id]
              , config = module.config
              , target = config.absolute === false ? App.relativeViewport : App.absoluteViewport

            var container = document.createElement("module-container")
                container.setAttribute("name", id)
                container.setAttribute("type", id === "frameworks" ? "frameworks" : "module")

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
            var viewin,
                viewout,
                reverse,
                width,
                height

            function reset (event) {
                viewin = event.view[0].Animate()
                viewout = event.view[1].Animate()
                reverse = event.reverse

                width = device.ui.width
                height = device.ui.height
            }

            switch (type) {
                case 'flip':
                    return [function (event) {
                                reset(event)
                                reverse = reverse ? -1 : 1
                                viewin.duration(0).perspective(1000).to(0, 0, 0).opacity(0).rotate3d(0, 1, 0, 90*reverse).end(function () {
                                    viewout.duration(400).perspective(1000).rotate3d(0, 1, 0, -90*reverse).end(function () {
                                        viewout.duration(0).opacity(0).end()
                                        viewin.duration(0).opacity(1).end(function () {
                                            viewin.duration(400).rotate3d(0, 1, 0, 0).end(function () {
                                                event.callback(false)
                                            })
                                        })
                                    })
                                })
                            }]
                break
                case 'fade':
                    return [function (event) {
                                reset(event)
                                viewin.duration(0).to(0, 0, 0).opacity(0).end(function () {
                                    viewin.duration(400).opacity(1).end(function () {
                                        event.callback(false)
                                    })
                                })
                            },
                            function (event) {
                                reset(event)
                                viewin.duration(0).to(0, 0, 0).opacity(1).end(function () {
                                    viewout.duration(400).opacity(0).end(function () {
                                        event.callback(false)
                                    })
                                })
                            }]
                break
                case 'slide':
                    return [function (event) {
                                reset(event)
                                viewin.duration(0).to(width, 0, 0).end(function () {
                                    viewout.duration(400).to(-width, 0, 0).end()
                                    viewin.duration(400).to(0, 0, 0).end(function () {
                                        event.callback(false)
                                    })
                                })
                            },
                            function (event) {
                                reset(event)
                                viewin.duration(0).to(-width, 0, 0).end(function () {
                                    viewin.duration(400).to(0, 0, 0).end()
                                    viewout.duration(400).to(width, 0, 0).end(function () {
                                        event.callback(false)
                                    })
                                })
                            }]
                break
                default:
                    return false
                break
            }
        },

        transform : function (callback) {
            var that = this
            var module = this.module
            var modulu = this.modulu
            var modules = this.moduli
            var cutting = this.cutting
            var backset = (modules.length === 1 || module.config.level === modulu.config.level) ? false : (module.config.level > modulu.config.level ? 0 : 1)
            var reverse = backset === 0 ? false : true
            var animation = function (event) { event.callback() }

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
                    "view"     : cutting ? [module.config.absolute === false ? App.relativeViewport : App.absoluteViewport, modulu.config.absolute === false ? App.relativeViewport : App.absoluteViewport] : [module.elements.container, modulu.elements.container],
                    "viewport" : [App.relativeViewport, App.absoluteViewport],
                    "modules"  : modules,
                    "reverse"  : reverse,
                    "backset"  : backset,
                    "callback" : end
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
                   App.frameworks.trigger(this.module.config.absolute == true ? 'hidden' : 'show') 
                }

                this.module.trigger('show', events)
                this.modulu.trigger('hidden', events)
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
            
                    if ( !this.modulu.config.cache && !this.self ) {
                        this.modulu.destroy(1)
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


    module.exports = Transform
})