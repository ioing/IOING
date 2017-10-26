// 有无相生，难易相成，长短相形，高下相盈，音声相和，前後相随。恒也。

define('~/template', ['~/css', '~/dom'], function (require, module, exports) {
    'use strict';

    const CSS = require('~/css')
    const DOM = require('~/dom')

    class Template {
        constructor (id) {
            if ( id ) this.init(id)
            return this
        }

        init (id) {

            // include lib
            
            this.id = id

            this.css = new CSS()
            this.dom = new DOM()

            this.module = App.modules[id]
            this.config = this.module.config
            this.target = this.module.elements.container

            // first error
            
            this.module.one('failedtoload', (e) => {
                this.errored(this.module)
                this.errored = noop
            })
        }

        render (id, module, source) {
            
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

                this.fetched(module, () => {
                    this.write(this.compile(id, source[0], source[1], source[2]))
                })
            }

            return this
        }

        write (source) {
            this.config.sandbox ? this.sandbox(source[0], source[1]) : this.embed(source[0], source[1])
        }

        compile (id, sids, suri, data) {

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
        }

        include (id) {
            let module = this.module
            let config = this.config
            let dimension = module.dimension
            let prefetched = module.prefetch[dimension]

            // new app

            if ( module.remoteframe ) {
                return this.frame(module)
            }

            // 如果存在缓存并且没有被定义为强制刷新模块

            if ( prefetched ) {
                return this.render(id, module, prefetched)
            }

            // async!!!important 

            setTimeout(() => {
                App.source().fetch(id, config, module.param, (...args) => {

                    // render

                    this.render(id, module, args)

                    if ( module.config.cache && !module.config.update ) {
                        module.prefetch[module.dimension] = args
                        module.updatetime[module.dimension] = Date.now()
                    }
                }, () => {
                    this.errored(module)
                })
            }, 0)
        }

        scope (sandbox, context, content) {
            let id = this.id
            let dom = this.dom
            let config = this.config
            let module = this.module
            let scopeWindow = sandbox.window
            let scopeDocument = sandbox.document

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
        }

        trick (sandbox, context) {
            if ( sandbox.window === window ) return

            // valid window

            sandbox.window.validWindow = sandbox.window.vwindow = window
            sandbox.window.validDocument = sandbox.window.vdocument = window.document


            sandbox.window.document.extendProperty("getElementById", (id) => { return this.dom.DOM[0][id] || context.find('#' + id)[0] || window.document.getElementById(id) })
            sandbox.window.document.extendProperty("getElementsByName", (name) => { return context.find('*[name=' + name + ']').toArray() || window.document.getElementsByName(name) })
            sandbox.window.document.extendProperty("getElementsByClassName", (name) => { return context.find('.' + name).toArray() || window.document.getElementsByClassName(name) })
            sandbox.window.document.extendProperty("getElementsByTagName", (name) => { return context.find(name).toArray() || window.document.getElementsByTagName(name) })
            sandbox.window.document.extendProperty("getElementsByTagNameNS", (name, namespace) => { return window.document.getElementsByTagNameNS(name, namespace) })
            
        }

        wrap (id, style, dom, type) {

            // creat css

            let css = document.createElement('style')
                css.name = id
                css.innerHTML = style

            let body = document.createElement("module-context")
                body.name = id
                body.className = "module-context"

            // inset style

            id == "frameworks" && type == 0 && !this.config.shadowbox 
                ? document.head.appendChild(css) 
                : body.appendChild(css)

            body.appendChild(dom)

            return body
        }

        script () {
            let id = this.id
            let module = this.module
            let config = module.config
            let path = ''
            let script = '' 
              
            config.script.each(function (i, name) {
                path = module.resources.script[name]

                if ( path ) {
                    script += '<script src=' + App.realpath(id, null, path) + '></script> \n'
                } else {
                    App.console.error('resources.script["' + name + '"]', 'Config error' ,'is not definde')
                }
            })

            return script
        }

        style (style) {
            return '<style>' + style + '</style>'
        }

        blakbox (target, style, script, content, puppet) {
            let sandbox = new Sandbox(true)
            let module = this.module
            let config = module.config

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

            sandbox.init().unify()

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
        }

        mirroring (style, dom) {
            let mirroring = this.config.mirroring

            if ( !mirroring ) return

            let module = this.module
            let sandbox = this.blakbox(this.target, this.style(style), null, null, true)

            sandbox.iframe.css({
                "z-index"   : "-1",
                "filter"    : mirroring.filter || "none"
            })

            // insert dom to body

            sandbox.document.body.appendChild(dom)

            module.addElement('mirroring', sandbox.iframe)
        }

        container () {
            let view
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
        }

        frame (module) {
            let that = this
            let frame = document.createElement('iframe')
            let cwindow, cdocument

            frame.src = module.remoteframe
            frame.setAttribute('app', true)

            // inset

            this.target.appendChild(frame)

            // remoteframe

            cwindow = frame.contentWindow
            cdocument = frame.contentWindow.document
            module.addElement('content', frame)
            module.addElement('context', cdocument)
            module.addElement('sandbox', { window : cwindow, document : cdocument, iframe : frame })

            // loaded

            cwindow.onload = function () {
                if ( this.App ) {
                    
                    // set name
                        
                    this.App.name = module.id

                    // load
                    
                    this.addEventListener(module.config.preview === 2 ? "applicationload" : "applicationready", function () {
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
            }

            // error

            frame.onerror = function () {
                that.errored(module)
            }

            // fetched

            this.fetched(module, noop) 
        }

        sandbox (style, dom) {
            let that = this
            let module = this.module
            let container = this.container()
            let sandbox = this.blakbox(container, this.style(style), this.script())

            // ready event

            sandbox.document.ready(function () {

                // insert dom to body

                sandbox.document.body.appendChild(dom[0])

                // over

                that.over(module, sandbox.window, sandbox.document.body)

                // creat mirroring

                that.mirroring(style, dom[1])
            })
        }

        embed (style, dom) {
            let id = this.id
            let module = this.module
            let config = this.config
            let content = this.wrap(id, style, dom[0], 0)
            let container = this.container()
            let sandbox = this.blakbox(container, null, this.script(), content)

            // append context

            container.appendChild(content)

            // trick 移形幻影 乾坤大挪移

            this.trick(sandbox, content)

            // over
                
            this.over(module, sandbox.window, content)

            // creat mirroring

            this.mirroring(style, dom[1])
        }

        over (module, window, content) {

            let that = this

            // preview

            if ( module.config.preview === 2 ) {
                that.dom.space(window, content)
                        .load(function () { 
                            that.readied(module, function () {
                                that.loaded(module)
                            })
                        })
                        .end(0)
            } else {
                // readied

                this.readied(module, function () {

                    // trigger dom is ready

                    that.dom.space(window, content)
                            .load(function () { 
                                that.loaded(module)
                            })
                            .end(0)
                })
            }
        }

        prefetch (callback) {
            this.fetched = callback
            return this
        }

        then (callback) {
            this.readied = callback
            return this
        }

        get (callback) {
            this.loaded = callback
            this.include(this.id)
            return this
        }

        error (callback) {
            this.errored = callback
            return this
        }

    }

    module.exports = Template
})