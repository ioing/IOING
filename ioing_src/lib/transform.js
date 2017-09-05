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

            param = param ? param.replace(/\s/g, '') : ''

            switch (prepush) {
                case 0:
                    window.history.replaceState({ id : id }, null, '#' + id + '/' + param)

                    break
                case 1:
                    window.history.pushState({ id : id }, null, '#' + id + '/' + param)

                    break
                default:
                    window.location.hash = id + '/' + param

                    break
            }
            
            // mark EXISTS

            App.exists(true)
        },

        status : function (id, param, push) {
            // param = (this.module.param || this.param || {}).extend(param).objectToParams()

            id = id || this.id
            param = (this.module.param || this.param || {}).extend(param).objectToParams(null, 1)

            // push or replace

            if ( push ) {
                this.hash(id, param)
            } else {

                // remot module id
            
                window.history.replaceState({}, null, '#' + this.reid(id) + '/' + (param ? param.replace(/\s/g, '') : ''))
            }

            this.module.setParam(param)
        },

        reid : function (id) {
            
            // remot module id
            
            return /\//.test(id) && id.indexOf('[') !== 0 ? '!' + id + '!' : id
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


    module.exports = Transform
})