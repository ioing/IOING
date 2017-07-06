(function () {
    'use strict'

    // ELEMENT

    var _ELEMENT = document.createElement('div')
      , _STYLE = _ELEMENT.style

    // module && components css style reset

    /*
     * scrolling > z-index : 1 !important 提升android手机中的性能关键
     */

    // append bace css

    document.write('<style>* { margin : 0; padding : 0 } \n'
                        + ' html, body { position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 1; width: 100%; height: 100% } \n'
                        + ' module-container[type=module] { display: block; top: 0; right: 0; bottom: 0; left: 0; width: 100%; height: 100%; background: #fff } \n'
                    + '</style>')


    window.CSSBaseStyle = '* { tap-highlight-color: rgba(0, 0, 0, 0); margin : 0; padding : 0; box-sizing: border-box } \n'
                        + 'html, body { position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 1; width: 100%; height: 100%; background: #fff; overflow: hidden; color: #000; font-size: 10dp } \n'
                        + 'html, body, shadow-root { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif } \n'
                        + 'a { text-decoration: none } \n'
                        + 'button { background-color: transparent; border: 0; outline: 0 } \n'
                        + 'input, textarea, *[contenteditable=true] { user-select: initial; touch-callout: initial; border: 0; outline: 0 } \n'
                        + 'htmlarea { display: inline-block; text-rendering: auto; letter-spacing: normal; word-spacing: normal; text-indent: 0px; text-align: start; font: initial } \n'
                        + 'article, aside, details, figcaption, figure, footer, header, hgroup, menu, nav, section { display: block } \n'
                        + 'ol, ul { list-style: none } \n'
                        + 'table { border-collapse: collapse; border-spacing: 0 } \n'
                        + 'scroll, scrolling, scrollbar, indicator { display: block; box-sizing: border-box } \n'
                        + 'scroll { position: relative; overflow: hidden } \n'
                        + 'scroll[fullscreen] { position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 1 }'
                        + 'scroll scrolling, scroll infinite { display: block; position: absolute; z-index: 1 } \n'
                        + 'scroll infinite { width: 100% } \n'
                        + 'scroll[flow-x] > scrolling { display: flex } \n'
                        + 'scroll[flow-free] > scrolling, scroll[fullscreen] > scrolling, scroll[flow-y] > scrolling { min-width: 100%; min-height: 100% } \n'
                        + 'scroll scrollbar { position: absolute; z-index: 9999; border-radius: 3dp; overflow: hidden } \n'
                        + 'scroll scrollbar indicator { position: absolute; z-index: 1; border-radius: 3dp; background: rgba(0, 0, 0, 0.4) } \n'


    /*===================================== viewport scale ========================================*/

    !(function () {

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
                                    + (tdpi ? (devicePixelRatio > 2 ? '' : ',target-densitydpi=device-dpi') : '') 
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

        var scale = window.innerWidth !== window.screen.width && windowRestWidth !== windowInitWidth
                            ? Math.max(Math.round(window.innerWidth / windowRestWidth), Math.round(document.documentElement.offsetWidth / documentElementInitWidth))
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

    })()



    /*====================================== Define =======================================*/


    // Define

    var Define = function (window) {

        var step = {}
        var modules = {}
        var handlerMap = {}
        var loadedFiles = {}
        var requireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/ig

        // Module

        function Module (name, deps, body) {
            this.name = name
            this.deps = deps
            this.body = body
            this.exports = {}
            this.created = false
        }

        Module.prototype = {
            get : function (name, callback, faild) {
                return callback ? define('argument', name, function (require) {
                                    callback(require)
                                }, faild)
                                : modules[name] ? modules[name].exports : null
            },
            create : function () {
                if ( this.created ) return
                this.created = true

                dispatchEvent('moduleExecute', this)

                this.body(this.get, this, this.exports)
                dispatchEvent(this.name, this)
            }
        }

        function define () {
            var name = arguments[0]
            var deps = arguments[1]
            var body = arguments[2]
            var faild = arguments[3]

            if ( arguments.length == 1 ) {
                body = name
                deps = getRequireNames(body.toString())
                name = null
            } else if ( arguments.length == 2 ) {
                if ( typeof name == 'string' ) {
                    body = deps
                    deps = getRequireNames(body.toString())
                } else {
                    body = deps
                    deps = name
                    name = null
                }
            }

            deps = deps || []

            if ( name ) {
                step.call = null
                creat(name, deps, body, faild)
            } else {
                step.call = function (name) {
                    creat(name, deps, body, faild)
                }
            }
        }

        function creat (name, deps, body, faild) {
            var newModule = new Module(name, deps, body)

            modules[name] = newModule

            dispatchEvent('moduleLoad', newModule)

            var unloadDeps = []

            for (var i = 0; i < deps.length; i++) {
                var dep = deps[i]
                if ( modules[dep] == null ) {
                    unloadDeps.push(dep)
                }
            }

            if ( unloadDeps.length == 0 ) {
                newModule.create()
            } else {
                addEventListeners(unloadDeps, function () {
                    newModule.create()
                })

                // 打包独立文件时，执行完函数再检查依赖

                setTimeout(function () {
                    for (var i = 0; i < unloadDeps.length; i++) {
                        var name = unloadDeps[i]
                        if ( !modules[name] ) {
                            load(name, faild)
                        }
                    }
                }, 0)
            }
        }

        function load (name, faild) {
            if ( loadedFiles[name] != null ) return
                
            loadedFiles[name] = true

            var path = name + '.js'

            dispatchEvent('scriptLoad', path)

            var script = window.document.createElement('SCRIPT')
            var head = window.document.head

            script.async = true
            script.src = path

            head.appendChild(script)

            script.onload = function () {
                dispatchEvent('scriptLoaded', path)

                if ( step.call ) {
                    step.call(name)
                }

                head.removeChild(script)

                // Dereference the node
                script = null
            }

            script.onerror = function () {
                if ( faild ) faild()
            }
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


    // 设备属性检测

    var OS = (function (userAgent) {

        this.webkit = userAgent.match(/WebKit\/([\d.]+)/) ? true : false
        this.android = userAgent.match(/(Android)\s+([\d.]+)/) || userAgent.match(/Silk-Accelerated/) ? true : false
        this.androidICS = this.android && userAgent.match(/(Android)\s4/) ? true : false
        this.ipad = userAgent.match(/(iPad).*OS\s([\d_]+)/) ? true : false
        this.iphone = !this.ipad && userAgent.match(/(iPhone\sOS)\s([\d_]+)/) ? true : false
        this.webos = userAgent.match(/(webOS|hpwOS)[\s\/]([\d.]+)/) ? true : false
        this.touchpad = this.webos && userAgent.match(/TouchPad/) ? true : false
        this.ios = this.ipad || this.iphone
        this.playbook = userAgent.match(/PlayBook/) ? true : false
        this.blackberry10 = userAgent.match(/BB10/) ? true : false
        this.blackberry = this.playbook || this.blackberry10|| userAgent.match(/BlackBerry/) ? true : false
        this.chrome = userAgent.match(/Chrome/) ? true : false
        this.opera = userAgent.match(/Opera/) ? true : false
        this.fennec = userAgent.match(/fennec/i) ? true : userAgent.match(/Firefox/) ? true : false
        this.ie = userAgent.match(/MSIE 10.0/i) ? true : false
        this.ieTouch = this.ie && userAgent.toLowerCase().match(/touch/i) ? true : false
        this.supportsTouch = ((window.DocumentTouch && document instanceof window.DocumentTouch) || 'ontouchstart' in window)

        // 主流系统版本检测

        if ( this.ios ) this.iosVersion = parseFloat(userAgent.slice(userAgent.indexOf("Version/")+8)) || -1
        if ( this.android && !this.webkit ) this.android = false
        if ( this.android ) this.androidVersion = parseFloat(userAgent.slice(userAgent.indexOf("Android")+8)) || -1

        return this

    }).call({}, navigator.userAgent)



    // DETECT

    var DETECT = (function (userAgent) {
                
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

        this.prefixStyle = function (prop, css) {
            var api

            if ( css && prop in _CSSPROPMAPS ) {
                return _CSSPROPMAPS[prop]
            } else if ( !css && prop in _JSPROPMAPS ) {
                return _JSPROPMAPS[prop]
            }
            
            for ( var i = 0, l = VENDORS.length; i < l; i++ ) {
                api = VENDORS[i] + ('-' + prop).replace(/-(\w)/g,function () { return arguments[1].toUpperCase() })
                if ( api in _STYLE ) return css ? _CSSPROPMAPS[prop] = PREFIXS[i] + prop : _JSPROPMAPS[prop] = api
            }

            if ( prop in _STYLE ) return css ? _CSSPROPMAPS[prop] = prop : _JSPROPMAPS[prop] = prop

            return css ? _CSSPROPMAPS[prop] = prop : _JSPROPMAPS[prop] = false
        }

        // getPrefixStyleProp

        this.getPrefixStyleProp = function (prop) {
            if ( prop in _CSSPROPMAPS ) return _CSSPROPMAPS[prop]

            for ( var i = 0, l = VENDORS.length; i < l; i++ ) {
                var prefix = VENDORS[i] + ('-' + prop).replace(/-(\w)/g, function (context, word) { return word.toUpperCase() })

                if ( prefix in _STYLE ) {
                    return _CSSPROPMAPS[prop] = PREFIXS[i] + prop
                }
            }

            return _CSSPROPMAPS[prop] = prop
        }

        this.hasTranslate3d = this.prefixStyle('transform') && window.getComputedStyle ? true : false

        // This should find all Android browsers lower than build 535.19 (both stock browser and webview)

        this.isBadTransition = (OS.android && OS.androidVersion < 6.5) || (OS.ios && OS.iosVersion < 6) || (!OS.ios && !OS.android) || !OS.webkit || !this.hasTranslate3d

        this.isBadAndroid = devicePixelRatio < 2 && screen.width < 640 && OS.androidVersion < 3

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
            var initialDocumentWidth
              , initialDocumentHeight
              , supportSizeUnits = {vw:false,vh:false,vm:false}

            // get initial width

            initialDocumentWidth = document.documentElement.offsetWidth
            initialDocumentHeight = document.documentElement.offsetHeight

            // set width 10vw

            document.documentElement.style.width = '10vw'

            // 10vm == initialWidth / 10 ? true : false

            supportSizeUnits.vw = supportSizeUnits.vh = document.documentElement.offsetWidth == Math.round(initialDocumentWidth / 10) ? true : false

            // set width 10vw

            document.documentElement.style.width = '10vm'

            // vm ?

            supportSizeUnits.vm = document.documentElement.offsetWidth == Math.round(Math.min(initialDocumentWidth, initialDocumentHeight) / 10) ? true : false

            // clear 10vm

            document.documentElement.style.width = ''


            return supportSizeUnits
        })()

        this.supportSizeCalc = (function () {
            var initialDocumentWidth
              , supportSizeCalc

            // get initial width

            initialDocumentWidth = document.documentElement.offsetWidth

            // set width 10vw

            document.documentElement.style.width = 'calc(100%/10 - 1px)'

            // calc(100%/10) == initialWidth / 10 ? true : false

            supportSizeCalc = document.documentElement.offsetWidth == Math.round(initialDocumentWidth / 10 - 1) ? true : false

            // clear 10vm

            document.documentElement.style.width = ''

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

        return this

    }).call({}, navigator.userAgent)



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
                        enumerable: false,
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

        function _extendArray (arr, callback, framework) {
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

        if ( typeof module !== 'undefined' ) {
            module.exports.watch = watch
            module.exports.unwatch = unwatch
        }

        return {
            watch : watch,
            unwatch : unwatch
        }
    
    })()




    /*=============================================================================*/


    

    // Sandbox

    var Sandbox = (function () {
        function Sandbox (unify, proto, whitebox) {
            var sandbox, content, context

            this.sandbox = this.iframe = sandbox = document.createElement('iframe')

            // 沙箱拓为明箱及暗箱之别 whitebox && blackbox

            if ( !whitebox ) {
                sandbox.style.display = 'none'
                document.head.appendChild(sandbox)

                this.init()
                this.write()
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

            extend : function () {
                // 获取被支持的iframe

                __defineUnify__(this.window)
                __defineProto__(this.window)

                return this
            },

            write : function (style, script) {
                var context
                  , content = this.sandbox.contentDocument

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

                content.open()
                content.write(context)
                content.close()

                return this
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

        return Sandbox
    })()

    // SandboxFunction

    var SandboxFunction = (function () {
        var sandbox = new Sandbox(),
            sandboxWindow = sandbox.window,
            sandboxFunction = sandboxWindow.Function

        sandbox.exit()

        return sandboxFunction
    })()

    // shadowRootFunction

    var ShadowRootFunction = (function () {
        var shadowRoot = new Sandbox()
          , shadowRootWindow = shadowRoot.window
          , shadowRootFunction = shadowRootWindow.Function

        return shadowRootFunction
    })()

    


    /*=============================================================================*/


    

    // 统一兼容性

    window.__defineUnify__ = (function () {

        // set ui

        var UI = {
                os          : OS,
                dpi         : window.devicePixelRatio,
                scale       : window.viewportScale,
                width       : window.document.documentElement.offsetWidth || window.innerWidth,
                height      : window.document.documentElement.offsetHeight || window.innerHeight,
                orientation : window.orientation
            }

        UI.viewportWidth = window.viewportWidth = UI.width / UI.scale
        UI.viewportHeight = window.viewportHeight = UI.height / UI.scale

        // define unit

        window.UNIT = {
            px : 1,
            dp : UI.scale,
            vw : UI.width / 100,
            vh : UI.height / 100,
            vm : Math.min(UI.width, UI.height) / 100
        }

        // Prefix, default unit

        var VENDOR_LENGTH = DETECT.vendor.length
        var REGEXP = {
                size : /\b(\d*\.?\d+)+(px|dp|vm|vw|vh)\b/ig,
                vendor : new RegExp("^" + DETECT.vendor, "ig")
            }

        // noop

        var noop = function () {}

        // preventDefaultEvent

        var stopPropagation = function (event) { return event.stopPropagation() }
        var preventDefaultEvent = function (event) { return event.preventDefault() }



        return function (window) {
            var document = window.document

            // Define

            Define(window)

            // device

            window.device = {
                ui   : UI,
                os   : OS,
                feat : DETECT
            }

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

                Object.defineProperty(window, "requestAnimationFrame", {configurable:true, writable:true})
                Object.defineProperty(window, "cancelAnimationFrame", {configurable:true, writable:true})

                var lastTime = 0
                window.requestAnimationFrame = function(callback) {
                    var now = Date.now()
                    var nextTime = Math.max(lastTime + 16, now)
                    return setTimeout(function () { callback(lastTime = nextTime) }, nextTime - now)
                }
                window.cancelAnimationFrame = window.clearTimeout
            }

            if ( !window.document.head ) {
                window.document.head = window.document.getElementsByTagName("head")[0] || window.document.documentElement
            }

            /* time */

            if ( !window.Date.now ) {
                window.Date.now = function () {
                    return new Date().getTime();
                }
            }

            // Sandbox

            if ( !window.Sandbox ) {
                Object.defineProperty(window, "Sandbox", {configurable:true, writable:true})
                window.Sandbox = Sandbox
            }

            // SandboxFunction

            if ( !window.SandboxFunction ) {
                Object.defineProperty(window, "SandboxFunction", {configurable:true, writable:true})
                window.SandboxFunction = SandboxFunction
            }

            //ShadowRootFunction

            if ( !window.ShadowRootFunction ) {
                Object.defineProperty(window, "ShadowRootFunction", {configurable:true, writable:true})
                window.ShadowRootFunction = ShadowRootFunction
            }

            // safe eval

            if ( !window.seval ) {
                Object.defineProperty(window, "seval", {configurable:true, writable:true})
                window.seval = function (code) {

                    //安全闭包

                    return new SandboxFunction(' try { return ' + code + ' } catch (e) { console.log("safe-eval error!" + e) }')()
                }
            }

            // UUID

            if ( !window.UUID ) {
                Object.defineProperty(window, "UUID", {configurable:true, writable:true})
                window.UUID = UUID
            }

            // Object extend

            !(function () {

                var Array = window.Array,
                    Object = window.Object,
                    String = window.String,
                    DOMParser = window.DOMParser,
                    CSSStyleDeclaration = window.CSSStyleDeclaration

                // String;

                !(function (proto) {

                    if ( !proto.trim ) {
                        Object.defineProperty(proto, "trim", {configurable:true, writable:true})
                        proto.trim = function () {
                            return this.replace(/^\s+|\s+$/g, '')
                        };
                    }

                    if ( !proto.paramsToObject ) {
                        Object.defineProperty(proto, "paramsToObject", {configurable:true, writable:true})
                        proto.paramsToObject = function (Reg) {
                            var param,
                                params = {},
                                Reg = Reg || /\,|\&|\?|\#|\$/
                            ;

                            this.split(Reg).each(function (index, value) {
                                param = value.split(/\:|\=/);
                                
                                if ( param[0] ) {
                                    params[param[0]] = param[1];
                                }
                            })

                            return params
                        }
                    }

                    if ( !proto.parseStringOfURL ) {
                        Object.defineProperty(proto, "parseStringOfURL", {configurable:true, writable:true})
                        proto.parseStringOfURL = function (Reg) {
                            return /^(?:(\w+):\/\/)?(?:(\w+):?(\w+)?@)?([^:\/\?#]+)(?::(\d+))?(\/[^\?#]+)?(?:\?([^#]+))?(?:#(\w+))?/.exec(this)
                        }
                    }


                    if ( !proto.encodeToNumber ) {
                        Object.defineProperty(proto, "encodeToNumber", {configurable:true, writable:true})
                        proto.encodeToNumber = function (number, split) {
                            var i = 0,
                                pre = split ? "\\" : "", 
                                string = '',
                                length = this.length

                            while (i < length) {
                                string += pre + this.charCodeAt(i).toString(number)
                                i++;
                            }

                            return string
                        }
                    }

                    if ( !proto.decodeforNumber ) {
                        Object.defineProperty(proto, "decodeforNumber", {configurable:true, writable:true})
                        proto.decodeforNumber = function (number) {
                            var i = 0,
                                string = '',
                                charArry = this.split("\\"),
                                length = charArry.length

                            for (i = 0; i < length; i++) {
                                string += this.fromCharCode(parseInt(charArry[i], number))
                            }

                            return string
                        }
                    }

                    if ( !proto.removeQuotes ) {
                        Object.defineProperty(proto, "removeQuotes", {configurable:true, writable:true})
                        proto.removeQuotes = function () {
                            return this.replace(/\"|\'/g, '')
                        }
                    }

                    if ( !proto.repeat ) {
                        Object.defineProperty(proto, "repeat", {configurable:true, writable:true})
                        proto.repeat = function (n) {
                            return new Array(1 + n).join(this)
                        }
                    }

                    // 字符静态分析

                    if ( !proto.staticAnalysis ) {
                        Object.defineProperty(proto, "staticAnalysis", {configurable:true, writable:true});
                        proto.staticAnalysis = function () {
                            try { 
                                return typeof seval(this)
                            } catch(e) { 
                                return e.message
                            }
                        }
                    }

                })(String.prototype)
        

                // Object;

                !(function (proto) {

                    if ( !proto.extendProperty ) {
                        Object.defineProperty(proto, "extendProperty", {configurable:true, writable:true});
                        proto.extendProperty = function (prop, value) {
                            Object.defineProperty(this, prop, {configurable:true, writable:true});
                            if ( value ) this[prop] = value;
                        }
                    }

                    if ( !proto.getInstanceType ) {
                        Object.defineProperty(proto, "getInstanceType", {configurable:true, writable:true});
                        proto.getInstanceType = function (type) {
                            return proto.toString.call(this).match(/^\[object\s(.*)\]$/)[1];
                        }
                    }

                    // extend;

                    if ( !proto.extend ) {
                        Object.defineProperty(proto, "extend", {configurable:true, writable:true});
                        proto.extend = function () {
                            for (var i = 0, l = arguments.length; i < l; i++ ) {
                                var source = arguments[i]

                                for (var key in source)
                                    this[key] = source[key]
                            }

                            return this
                        }
                    }

                    // objectToParams

                    if ( !proto.objectToParams ) {
                        Object.defineProperty(proto, "objectToParams", {configurable:true, writable:true});
                        proto.objectToParams = function () {
                            var payload = ""
                              , params = []
                              , e = encodeURIComponent
                            
                            if (typeof this === "string") {
                                payload = this
                            } else {

                                for (var k in this) {
                                    if ( this.hasOwnProperty(k) ) {
                                        var value = this[k]

                                        switch (typeof value) {
                                            case 'object':
                                                value = JSON.stringify(this[k])
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
                        }
                    }

                    // countProperties

                    if ( !proto.countProperties ) {
                        Object.defineProperty(proto, "countProperties", {configurable:true, writable:true});
                        proto.countProperties = function () {
                            var count = 0

                            for (var property in this) {
                                if (this.hasOwnProperty(property)) {
                                    count++
                                }
                            }

                            return count
                        }
                    }

                    // each

                    if ( !proto.each ) {
                        Object.defineProperty(proto, "each", {configurable:true, writable:true});
                        proto.each = function (callback, that) {
                            that = that || this
                            
                            var i, key, length

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
                                // case "Array":
                                // case "NodeList":
                                // case "HTMLCollection":

                                    for (i = 0; i < this.length; i++) {
                                        if (callback.call(that, i, this[i], i + 1, this.length) === false)
                                            return this
                                    }

                                    break
                            }

                            return this
                        }
                    }

                    // equals
                    if ( !proto.equals ) {
                        Object.defineProperty(proto, "equals", {configurable:true, writable:true});
                        proto.equals = function(x, y) {
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
                        }
                    }

                    // clone

                    if ( !proto.clone ) {
                        Object.defineProperty(proto, "clone", {configurable:true, writable:true})
                        proto.clone = function () {
                            return Object.create(this)
                        }
                    }

                    // watch

                    if ( !proto.watch ) {
                        Object.defineProperty(proto, "watch", {configurable:true, writable:true});
                        proto.watch = function (prop, handler) {
                            Watch.watch(this, prop, handler)
                        }
                    }

                    // unwatch

                    if ( !proto.unwatch ) {
                        Object.defineProperty(proto, "unwatch", {configurable:true, writable:true});
                        proto.unwatch = function (prop) {
                            Watch.unwatch(this, prop)
                        }
                    }

                    // initial

                    if ( !proto.initial ) {
                        Object.defineProperty(proto, "initial", {configurable:true, writable:true});
                        proto.initial = function (prop, value) {
                            return this[prop] || (this[prop] = value)
                        }
                    }

                    // setValueOfHref

                    if ( !proto.setValueOfHref ) {
                        Object.defineProperty(proto, "setValueOfHref", {configurable:true, writable:true})
                        proto.setValueOfHref = function (link, value) {
                            var type = typeof value == 'string' ? value.staticAnalysis() : null,
                                script

                            switch (type) {
                                case 'number':
                                case 'boolean':
                                    script = 'scope.' + link + ' = ' + value

                                    break

                                default:
                                    script = 'scope.' + link + ' = value'

                                    break

                            }

                            new Function('scope', 'value', script)(this, value)
                        }
                    }

                    // getValueByRoute

                    if ( !proto.getValueByRoute ) {
                        Object.defineProperty(proto, "getValueByRoute", {configurable:true, writable:true})

                        proto.getValueByRoute = (function () {

                            var SPLITES_REG = /[^\w|\_|\$|\.|\[|\]$]+/

                            return function (link) {
                                
                                if ( !link ) return this

                                var i
                                  , l
                                  , val
                                  , scope = []
                                  , links = []
                                  , splits = []

                                link.split(SPLITES_REG).each(function (i, val) {
                                    val = val.split('.')[0]

                                    // /(^[\w_$!]?)+([\w_$]?)+[\w_$]$/.test(val)

                                    if ( val && val.staticAnalysis() === 'undefined' ) {
                                        links.push(val)
                                    }
                                })

                                for (i in this) {
                                    scope.push(this[i])
                                    splits.push(i)
                                }

                                // watched 可读变量

                                for (i = 0, l = links.length; i < l; i++) {
                                    val = links[i]

                                    if ( val in this) {
                                        splits.push(val)
                                        scope.push(this[val])
                                    }
                                }

                                return new Function(splits.join(','), 'try { return (' + link + ') } catch (e) {}').apply(this, scope)
                            }

                        })()
                    }

                })(Object.prototype)


                // Array

                !(function (proto) {

                    // inArray

                    if ( !proto.inArray ) {
                        Object.defineProperty(proto, "inArray", {configurable:true, writable:true});
                        proto.inArray = function (obj) {
                            var i = this.length; 

                            while (i--) {  
                                if ( this[i] === obj ) {  
                                    return true
                                }  
                            } 

                            return false 
                        }
                    }

                    // map

                    if ( !proto.map ) {
                        Object.defineProperty(proto, "map", {configurable:true, writable:true});
                        proto.map = function(fn){
                            var a = []
                            for(var i = 0; i < this.length; i++){
                                var value = fn(this[i], i)

                                if ( value == null ){
                                    continue
                                }

                                a.push(value)
                            }
                            return a
                        }
                    }

                    // unique

                    if ( !proto.unique ) {
                        Object.defineProperty(proto, "unique", {configurable:true, writable:true});
                        proto.unique = function () {
                            var result = [], hash = {}
                            for (var i = 0, elem; (elem = this[i]) != null; i++) {
                                if (!hash[elem]) {
                                    result.push(elem)
                                    hash[elem] = true
                                }
                            }
                            return result
                        }
                    }

                })(Array.prototype)


                // Element.prototype

                !(function (proto) {
                    if ( !proto.Touch ) {
                        Object.defineProperty(proto, "Touch", {configurable:true, writable:true})
                        proto.Touch = function (options) {
                            
                            // shadow box trans window

                            var win = this.ownerDocument.defaultView

                            if ( !win ) return {}

                            if ( !this.toucher ) {
                                this.extendProperty("toucher", new win.Touch(this, options))
                            }

                            return this.toucher
                        }
                    }

                    if ( !proto.Scroll ) {
                        Object.defineProperty(proto, "Scroll", {configurable:true, writable:true})
                        proto.Scroll = function (options, window) {
                            
                            // shadow box trans window

                            var win = this.ownerDocument.defaultView

                            if ( !win ) return {}

                            if ( !this.scroller ) {
                                this.extendProperty("scroller", new win.Scroll(this, options, window))
                            }

                            return this.scroller
                        }
                    }

                    if ( !proto.observer ) {

                        Object.defineProperty(proto, "observer", {configurable:true, writable:true})
                        /**
                        * @param {Object} options
                        * @param {Function} callback
                        * 元素attr change 监听 
                        * childList：子元素的变动。
                        * attributes：属性的变动。
                        * characterData：节点内容或节点文本的变动。
                        * subtree：所有下属节点（包括子节点和子节点的子节点）的变动。
                        */
                        proto.observer = function(options, callback) {
                            var MutationObserver = window.MutationObserver
                              , options = options || {
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
                                        options.each(function (i, name) {
                                            switch (name) {
                                                case 'attributes':
                                                    eventName.push("DOMAttrModified")
                                                    break;
                                                case 'childList':
                                                    eventName.push("DOMNodeInserted")
                                                    eventName.push("DOMNodeRemoved")
                                                    break
                                                case 'characterData':
                                                    eventName.push("DOMCharacterDataModified")
                                                    break;
                                                case 'subtree':
                                                    eventName.push("DOMNodeInserted")
                                                    eventName.push("DOMNodeRemoved")
                                                    eventName.push("DOMNodeInsertedIntoDocument")
                                                    eventName.push("DOMNodeRemovedFromDocument")
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
                            } catch (e) {
                                application.console.log(e)
                            }
                        }
                    }

                    if ( !proto.getSelectionRangeInsert ) {
                        Object.defineProperty(proto, "getSelectionRangeInsert", {configurable:true, writable:true})
                        proto.getSelectionRangeInsert = function (context) {
                            var selection = (this.parentShadowRoot && device.feat.shadowRoot == true ? this.parentShadowRoot : this.ownerDocument.defaultView).getSelection()
                              , range = selection.createRange ? selection.createRange() : selection.anchorNode ? selection.getRangeAt(0) : null
                            
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

                            selection.removeAllRanges()
                            selection.addRange(range)

                            this.getSelection = function () {
                                return selection
                            }

                            return range
                        }
                    }

                })(window.Element.prototype)


                // CSSStyleDeclaration;

                !(function (proto) {

                    // style.set;

                    if ( !proto.set ) {
                        Object.defineProperty(proto, "set", {configurable:true, writable:true})
                        proto.set = function (propertyName, value) {
                            if ( !propertyName || !value ) return

                            var i
                              , l
                              , vendors = [DETECT.prefix + propertyName, propertyName]
                              , propertyName

                            value = typeof value == 'string' 
                                    ? value.replace(REGEXP.size, function (size, length, unit) { 
                                        return length * UNIT[unit] + 'px'
                                      }) 
                                    : value

                            for (i = 0, l = vendors.length; i < l; i++) {
                                propertyName = vendors[i]

                                if ( propertyName in _STYLE ) {
                                    return this.setProperty(propertyName, value)
                                }
                            }
                        }
                    }

                    // style.remove;

                    if ( !proto.remove ) {
                        Object.defineProperty(proto, "remove", {configurable:true, writable:true})
                        proto.remove = function (propertyName) {

                            var vendors = [DETECT.prefix + propertyName, propertyName]

                            for (var i = 0, l = vendors.length; i < l; i++) {
                                var propertyName = vendors[i]

                                if ( this.propertyIsEnumerable(propertyName) ) {
                                    this.removeProperty(propertyName)
                                }
                            }
                        }
                    }

                })(CSSStyleDeclaration.prototype)

                // document 

                !(function (proto) {
                    if ( !proto.setCookie ) {
                        Object.defineProperty(proto, "setCookie", {configurable:true, writable:true})
                        proto.setCookie = function (name, value, domain, path) {
                            var Days = 30
                            var exp = new Date()
                            exp.setTime(exp.getTime() + Days*24*60*60*1000)
                            document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString() + (domain ? ";path=" + (path ? path : "/") + ";domain=" + domain : "")
                        }
                    }

                    if ( !proto.getCookie ) {
                        Object.defineProperty(proto, "getCookie", {configurable:true, writable:true})
                        proto.getCookie = function (name) {
                            var arr
                            var reg = new RegExp("(^| )"+name+"=([^;]*)(;|$)")
                            if ( arr = document.cookie.match(reg) )
                                return unescape(arr[2])
                            else
                                return null
                        }
                    }

                    if ( !proto.delCookie ) {
                        Object.defineProperty(proto, "delCookie", {configurable:true, writable:true})
                        proto.delCookie = function (name) {
                            var exp = new Date()
                            exp.setTime(exp.getTime() - 1)
                            var cval = getCookie(name)
                            if ( cval != null ) {
                                document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString()
                            }
                        }
                    }

                })(document) 

                // DOMParser

                !(function(DOMParser) {
                    var DOMParser_proto = DOMParser.prototype,
                        real_parseFromString = DOMParser_proto.parseFromString

                    // Firefox/Opera/IE throw errors on unsupported types
                    try {

                        // WebKit returns null on unsupported types

                        if ( (new DOMParser).parseFromString("", "text/html") ) {

                            // text/html parsing is natively supported
                            var isParseHtmlFromString = true
                        }
                    } catch (ex) {}

                    DOMParser_proto.parseFromString = function (markup, type) {

                        if ( /^\s*text\/html\s*(?:;|$)/i.test(type) ) {
                            var doc

                            if ( isParseHtmlFromString ) {
                                doc = real_parseFromString.apply(this, arguments)
                            }

                            try {
                                var body = doc.body
                            } catch (e) {}

                            if ( !body ) {

                                doc = document.implementation.createHTMLDocument("")

                                if ( markup.toLowerCase().indexOf('<!doctype') > -1) {
                                    doc.documentElement.innerHTML = markup
                                } else {

                                    try {
                                        var body = doc.body
                                    } catch (e) {}

                                    // android parseFromString then body is not definde 

                                    if ( !body ) {
                                        doc.documentElement.innerHTML = markup

                                        var node
                                        var nodes = document.createNodeIterator(doc.documentElement, NodeFilter.SHOW_ALL, null, false)

                                        while ( node = nodes.nextNode() ) {
                                            if ( node.nodeName == 'BODY' ) {
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

                        } else {

                            return real_parseFromString.apply(this, arguments)
                        }

                    }

                })(DOMParser)


            })()
        }

    })()

    __defineUnify__(window)

})()