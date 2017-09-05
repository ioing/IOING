// 上善若水。水善利万物而不争，处众人之所恶，故几於道。

(function () {

    // init App config

    window.App = {
        config : {
            root : ''
        }
    }

    /*＊
    * module && components css style reset
    * scrolling > z-index : 1 !important
    */

    // append bace css

    document.write(`<style>* { margin : 0; padding : 0 } \n
                        html, body { position: absolute; width: 100%; height: 100%; background: #fff; overflow: hidden } \n
                        mask, view { position: absolute; width: 100%; height: 100%; overflow: hidden } \n
                        module-container[type=module] { display: block; top: 0; right: 0; bottom: 0; left: 0; width: 100%; height: 100% } \n
                        iframe[app=true] { width: 100%; height: 100%; border: 0 } \n
                    </style>`)

    window.CSSBaseStyle = `* { box-sizing: border-box; margin : 0; padding : 0; text-size-adjust: 100%; tap-highlight-color: rgba(0, 0, 0, 0) } \n
                        html, body { position: absolute; width: 100%; height: 100%; background: #fff; font-size: 10dp; overflow: hidden } \n
                        a { text-decoration: none } \n
                        *[href], *[transform], *[on-tap] { cursor: pointer } \n
                        button { background-color: transparent; border: 0; outline: 0 } \n
                        input, textarea, htmlarea { user-select: initial; touch-callout: initial; border: 0; outline: 0; appearance: none } \n
                        htmlarea { display: inline-block; text-rendering: auto; letter-spacing: normal; word-spacing: normal; text-indent: 0px; text-align: start; font: initial } \n
                        article, aside, details, figcaption, figure, footer, header, hgroup, menu, nav, section { display: block } \n
                        ol, ul { list-style: none } \n
                        table { border-collapse: collapse; border-spacing: 0 } \n

                        scroll, scrolling, scrollbar, indicator { display: block; box-sizing: border-box } \n
                        scroll { position: relative; padding: 0; border: 0; overflow: hidden } \n
                        scroll[fullscreen] { position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 2 } \n
                        scroll > scrolling, scroll > scrolling > infinite { display: block; position: absolute; z-index: 2; backface-visibility: hidden } \n
                        scroll > scrolling { min-width: 100%; min-height: 100% } \n
                        scroll[y=false] > scrolling { position: relative; display: inline-block } \n
                        scroll > scrolling > infinite { top: 0; left: 0; width: 100% } \n
                        scroll > scrolling > infinite > fragment { display: block; position: relative; z-index: 2; width: 100% } \n
                        scroll > scrollbar { position: absolute; z-index: 9999; border-radius: 3dp; overflow: hidden } \n
                        scroll > scrollbar > indicator { position: absolute; z-index: 9; border-radius: 3dp; background: rgba(0, 0, 0, 0.4) } \n
                        
                        pullup, pullright, pulldown, pullleft { display: block; position: absolute; z-index: 9999; text-align: center } \n
                        pullup { bottom: 0; width: 100% } \n
                        pulldown { top: 0; width: 100% } \n
                        pullright { left: 0; height: 100% } \n
                        pullleft { right: 0; height: 100% } \n
                        pullstart, pulling, pullend, pullover { display: none } \n
                        pullup[pullstart] pullstart, pullright[pullstart] pullstart, pulldown[pullstart] pullstart, pullleft[pullstart] pullstart { display: block } \n
                        pullup[pulling] pulling, pullright[pulling] pulling, pulldown[pulling] pulling, pullleft[pulling] pulling { display: block } \n
                        pullup[pullend] pullend, pullright[pullend] pullend, pulldown[pullend] pullend, pullleft[pullend] pullend { display: block } \n
                        pullup[pullover] pullover, pullright[pullover] pullover, pulldown[pullover] pullover, pullleft[pullover] pullover { display: block } \n
                        
                        relative-windows, absolute-windows { position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 10000; width: 100%; height: 100%; overflow: hidden } \n`



    // 设备属性检测

    let OS = ((navigator, userAgent, platform, appVersion) => {
        let detect = {}

        detect.webkit = userAgent.match(/WebKit\/([\d.]+)/) ? true : false

        detect.ipod = /iPod/i.test(platform) || userAgent.match(/(iPod).*OS\s([\d_]+)/) ? true : false
        detect.ipad = /iPad/i.test(navigator.userAgent) ||userAgent.match(/(iPad).*OS\s([\d_]+)/) ? true : false
        detect.iphone = /iPhone/i.test(platform) || !detect.ipad && userAgent.match(/(iPhone\sOS)\s([\d_]+)/) ? true : false

        detect.ie = userAgent.match(/MSIE 10.0/i) ? true : false
        detect.mac = /Mac/i.test(platform)
        detect.ios = detect.ipod || detect.ipad || detect.iphone
        detect.android = userAgent.match(/(Android)\s+([\d.]+)/) || userAgent.match(/Silk-Accelerated/) ? true : false
        detect.android = detect.android && !detect.webkit
        detect.androidICS = detect.android && userAgent.match(/(Android)\s4/) ? true : false

        detect.chrome = userAgent.match(/Chrome/) ? true : false
        detect.safari = userAgent.match(/Safari/) && !detect.chrome ? true : false
        detect.mobileSafari = detect.ios && !!appVersion.match(/(?:Version\/)([\w\._]+)/)
        detect.opera = userAgent.match(/Opera/) ? true : false
        detect.fennec = userAgent.match(/fennec/i) ? true : userAgent.match(/Firefox/) ? true : false
        detect.MSApp = typeof(MSApp) === "object"
        detect.wechat = userAgent.match(/MicroMessenger/i) ? true : false

        detect.ieTouch = detect.ie && userAgent.toLowerCase().match(/touch/i) ? true : false
        detect.supportsTouch = ((window.DocumentTouch && document instanceof window.DocumentTouch) || 'ontouchstart' in window)

        detect.webos = userAgent.match(/(webOS|hpwOS)[\s\/]([\d.]+)/) ? true : false
        detect.touchpad = detect.webos && userAgent.match(/TouchPad/) ? true : false

        detect.playbook = userAgent.match(/PlayBook/) ? true : false
        detect.blackberry10 = userAgent.match(/BB10/) ? true : false
        detect.blackberry = detect.playbook || detect.blackberry10|| userAgent.match(/BlackBerry/) ? true : false

        // 主流系统版本检测

        if ( detect.ios ) detect.iosVersion = parseFloat(appVersion.slice(appVersion.indexOf("Version/")+8)) || -1
        if ( detect.android ) detect.androidVersion = parseFloat(appVersion.slice(appVersion.indexOf("Android")+8)) || -1
        if ( detect.safari ) detect.safariVersion = appVersion.match(/Safari\/([\d.]+)/)[1]
        if ( detect.chrome ) detect.chromeVersion = appVersion.match(/Chrome\/([\d.]+)/)[1]
        if ( detect.webkit ) detect.webKitVersion = appVersion.match(/WebKit\/([\d.]+)/)[1]

        return detect

    })(navigator, navigator.userAgent, navigator.platform, navigator.appVersion || navigator.userAgent)


    /*===================================== viewport scale ========================================*/

    let reviewport = () => {

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
                                    + (tdpi && OS.androidVersion < 5 ? ',target-densitydpi=device-dpi' : '') 
                            + '">')
            return document.getElementById(id)
        }

        let windowInitWidth = window.innerWidth


        // init viewport {{

        let testViewport = creat('test-viewport', '1.0')

        // mark document init width
        
        let windowRestWidth = window.innerWidth
        let documentElementInitWidth = document.documentElement.offsetWidth

        // remove test viewport

        testViewport.parentNode.removeChild(testViewport)

        // }}


        // setting new viewport

        let realViewport = creat('real-viewport', 1 / devicePixelRatio, true)

        /* viewport is ok?
         * 由屏幕斜角排列导致dpi缩放不精准，宽度相减值应小于 w * 0.01
         * devicePixelRatio floor * documentElementInitWidth 在某些设备上约等于实际像素
         * document.documentElement.offsetWidth 在部分手机中渲染完会发生变更
         */
        
        /*
            !!! viewport 具有刷新缓存, 因此可能是物理值也可能是虚拟值
         */

        let realScreenWidth = Math.max(window.innerWidth, window.document.documentElement.offsetWidth)
        let realWindowWidth = devicePixelRatio * Math.min(windowRestWidth, documentElementInitWidth)
        let scale = ((window.innerWidth != window.screen.width && windowRestWidth != windowInitWidth) || ((window.innerWidth == window.screen.width || window.innerWidth == realScreenWidth) && windowRestWidth == windowInitWidth && realScreenWidth == realWindowWidth))
                            ? Math.max(window.innerWidth / windowRestWidth, document.documentElement.offsetWidth / documentElementInitWidth)
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
    }

    // 嵌套应用

    if ( window.parent.viewportScale ) {
        window.viewportScale = window.parent.viewportScale
    } else {
        reviewport()
    }


    let __dir = (() => {

        // get root

        let script = document.getElementById('ioing') || document.getElementsByTagName('script')[0]
        let root = script.getAttribute('root') 
        let paths = []

        if ( root ) {
            if ( root.match(/^\w+\:/) === null && root.indexOf('//') !== 0 ) {
                paths = location.pathname.split('/')
                paths.pop()
                root = location.origin + paths.join('/') + root
            }
        } else {
            paths = script.src.split('/')
            paths.pop()

            root = paths.join('/') + '/'
        }

        // root

        return App.config.root = root
    })()

    /*====================================== Define =======================================*/


    // Define

    let Define = (window) => {

        let step = {}
        let modules = {}
        let handlerMap = {}
        let loadedFiles = {}
        let requireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/ig

        // Module

        function Module (name, deps, model, body) {
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
            _get : function (name, callback, error) {
                name = name || this.name

                switch ( name ) {
                    case 'module':
                        return this
                    break

                    case 'exports':
                        name = this.name
                    break
                }

                if ( callback ) {
                    define('argument', name, function (require) {
                        callback(require)
                    }, error)

                    return this
                }

                return modules[name] ? (function (exports) {
                    exports = modules[name].exports
                    if ( exports.default ) {
                        Object.defineProperty(exports.default, "__esModule", {
                            value: true
                        })
                        return exports.default
                    }
                    return exports
                })() : null
            },
            _deps : function () {
                let deps = []

                for (let i = 0, l = this.deps.length; i < l; i++) {
                    let dep = this.deps[i]
                    deps.push(this._get(dep))
                }

                switch ( this.model ) {
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
            _create : function () {
                if ( this.created ) return
                this.created = true

                dispatchEvent('moduleExecute', this)

                this.body.apply(this.body, this._deps())
                
                dispatchEvent(this.name, this)
            }
        }

        function define () {
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
                    if ( typeof name === 'string' ) {
                        deps = null
                    } else {
                        name = null
                        deps = arguments[0]
                    }
                    break
            }

            deps = deps || getRequireNames(body.toString()) || []

            if ( ['module', 'exports'].indexOf(deps[0]) !== -1 ) {
                model = 1
            }

            // step.call

            if ( name ) {
                step.call = null
                creat(name, deps, model, body, error)
            } else {
                step.call = function (name) {
                    creat(name, deps, model, body, error)
                }
            }
        }

        // creat deps module

        function creat (name, deps, model, body, error) {

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

                if ( modules[dep] == null && ['module', 'exports'].indexOf(dep) == -1 ) {
                    unloadDeps.push(dep)
                }
            }

            // create

            if ( unloadDeps.length == 0 ) {
                newModule._create()
            } else {
                addEventListeners(unloadDeps, function () {
                    newModule._create()
                })

                // 打包独立文件时，执行完函数再检查依赖

                setTimeout(function () {
                    for (let i = 0; i < unloadDeps.length; i++) {
                        let name = unloadDeps[i]
                        
                        if ( !modules[name] ) {
                            load(name, error)
                        }
                    }
                }, 0)
            }
        }

        function load (name, error) {
            if ( loadedFiles[name] ) return
            loadedFiles[name] = true

            // -/modulePath == {root}/modulePath

            let src = getRealPath(name) + ( name.split('\/').pop().indexOf('.js') !== -1 ? '' : '.js' )
            let head = window.document.head
            let script = window.document.createElement('SCRIPT')
            
            // dispatchEvent

            dispatchEvent('scriptLoad', src)

            // async load

            script.async = true
            script.src = src

            head.appendChild(script)

            // onload
            
            script.onload = function () {
                dispatchEvent('scriptLoaded', src)

                if ( step.call ) {
                    step.call(name)
                }

                head.removeChild(script)

                // Dereference the node
                script = null
            }

            script.onerror = function () {
                if ( error ) error()

                head.removeChild(script)

                // Dereference the node
                script = null
            }
        }

        function getRealPath (path) {
            return path.indexOf('~/') === 0 ? __dir + path.substr(2) : path
        }

        function getRequireNames (str) {
            let names = []
            let r = requireRegExp.exec(str)
            while(r != null) {
                names.push(r[1])
                r = requireRegExp.exec(str)
            }
            return names
        }

        function addEventListener (topic, handler) {
            let handlers = handlerMap[topic]
            
            if ( handlers == null ) {
                handlerMap[topic] = []
            }

            handlerMap[topic].push(handler)
        }

        function addEventListeners (topics, handler) {
            let counter = 0
            
            for (let i = 0; i < topics.length; i++) {
                let topic = topics[i]
                let handlers = handlerMap[topic]

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
            let handlers = handlerMap[topic]
            if( handlers != null ) {
                for (let i=0; i<handlers.length; i++) {
                    handlers[i](event)
                }
            }
        }

        window.define = define
    }



    /*=============================================================================*/


    // DETECT

    var DETECT = (function (userAgent) {

        // ELEMENT

        var _ELEMENT = document.createElement('div')
        var _STYLE = _ELEMENT.style

        _STYLE.position = "fixed"
        _STYLE.top = "0"
        _STYLE.left = "0"
        _STYLE.zIndex = "1"

        document.documentElement.appendChild(_ELEMENT)
                
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

        this.CSSSupport = this.prefixStyle = function (prop, css) {

            if ( css && prop in _CSSPROPMAPS ) {
                return _CSSPROPMAPS[prop]
            } else if ( !css && prop in _JSPROPMAPS ) {
                return _JSPROPMAPS[prop]
            }

            var i = 0, l = VENDORS.length + 1

            while ( i < l ) {
                var property = ((VENDORS[i] ? VENDORS[i] + '-' : '') + prop).replace(/-(\w)/g,function () { return arguments[1].toUpperCase() })
                var prefix = (PREFIXS[i] || '') + prop
                if ( property in _STYLE ) return css ? _CSSPROPMAPS[prop] = prefix : _JSPROPMAPS[prop] = property
                i++
            }

            return css ? _CSSPROPMAPS[prop] = prop : _JSPROPMAPS[prop] = false
        }

        this.hasTranslate3d = this.prefixStyle('transform') && window.getComputedStyle ? true : false

        /**
            This should find all Android browsers lower than build 535.19 (both stock browser and webview)
            - galaxy S2 is ok
            - 2.3.6 : `AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1`
            - 4.0.4 : `AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30`
            - galaxy S3 is badAndroid (stock brower, webview)
            `AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30`
            - galaxy S4 is badAndroid (stock brower, webview)
            `AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30`
            - galaxy S5 is OK
            `AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Mobile Safari/537.36 (Chrome/)`
            - galaxy S6 is OK
            `AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Mobile Safari/537.36 (Chrome/)`
         */
        
        this.isBadTransition = (function() {
            
            // Android browser is not a chrome browser.
            
            if ( OS.android ) {
                if ( OS.webkit && parseFloat(OS.webKitVersion) < 535.19 ) return true
                if ( OS.chrome && parseFloat(OS.chromeVersion) < 53 ) return true
                if ( OS.safari && parseFloat(OS.safariVersion) < 535.19 ) return true

                return false
            } else if ( OS.ios ) {
                return false
            } else {
                return true
            }
        })()

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
            var initialWidth
              , initialHeight
              , supportSizeUnits = {
                    'px' : true,
                    'dp' : false,
                    'vw' : false,
                    'vh' : false,
                    'vmin' : false,
                    'vmax' : false,
                    'mm' : false,
                    'cm' : false,
                    'pt' : false,
                    'pc' : false,
                    'in' : false,
                    '%' : true
                }

            // get initial width

            initialWidth = _ELEMENT.offsetWidth
            initialHeight = _ELEMENT.offsetHeight

            // set width 10vw

            _ELEMENT.style.width = 0
            _ELEMENT.style.width = '10vw'
            supportSizeUnits.vw = supportSizeUnits.vh = _ELEMENT.offsetWidth == Math.round(document.documentElement.offsetWidth / 10) ? true : false

            // set width 10vmin

            _ELEMENT.style.width = 0
            _ELEMENT.style.width = '10vmin'
            supportSizeUnits.vmin = _ELEMENT.offsetWidth == Math.round(Math.min(initialWidth, initialHeight) / 10) ? true : false
            
            // set width 10vmax

            _ELEMENT.style.width = 0
            _ELEMENT.style.width = '10vmax'
            supportSizeUnits.vmax = _ELEMENT.offsetWidth == Math.round(Math.max(initialWidth, initialHeight) / 10) ? true : false
            
            // set width 10mm

            _ELEMENT.style.width = 0
            _ELEMENT.style.width = '10mm'
            supportSizeUnits.mm = _ELEMENT.offsetWidth > 0 ? true : false

            // set width 10cm

            _ELEMENT.style.width = 0
            _ELEMENT.style.width = '10cm'
            supportSizeUnits.cm = _ELEMENT.offsetWidth > 0 ? true : false

            // set width 10cm

            _ELEMENT.style.width = 0
            _ELEMENT.style.width = '10pt'
            supportSizeUnits.pt = _ELEMENT.offsetWidth > 0 ? true : false

            // set width 10pc

            _ELEMENT.style.width = 0
            _ELEMENT.style.width = '10pc'
            supportSizeUnits.pc = _ELEMENT.offsetWidth > 0 ? true : false

            // set width 10in

            _ELEMENT.style.width = 0
            _ELEMENT.style.width = '10in'
            supportSizeUnits.in = _ELEMENT.offsetWidth > 0 ? true : false

            // set width 10dp

            // _ELEMENT.style.width = 0
            // _ELEMENT.style.width = '10dp'
            // supportSizeUnits.dp = _ELEMENT.offsetWidth > 0 ? true : false


            return supportSizeUnits
        })()

        this.supportSizeCalc = (function () {
            var initialWidth
              , supportSizeCalc

            // get initial width

            _ELEMENT.style.width = '100%'
            initialWidth = _ELEMENT.offsetWidth

            // set width 10vw

            _ELEMENT.style.width = 'calc((100vw/10 - 1px) / 2)'

            // calc(100%/10) == initialWidth / 10 ? true : false

            supportSizeCalc = _ELEMENT.offsetWidth == Math.round((initialWidth / 10 - 1) / 2) ? true : false

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

        document.documentElement.removeChild(_ELEMENT)

        return this

    }).call({}, navigator.userAgent)

    
    var setBaseUI = function (_window) {

        var UI, UNIT

        // set ui

        UI = {
            os          : OS,
            dpi         : window.devicePixelRatio,
            scale       : window.viewportScale,
            width       : window.document.documentElement.offsetWidth || window.innerWidth,
            height      : window.document.documentElement.offsetHeight || window.innerHeight,
            orientation : window.orientation
        }

        UI.viewportWidth = _window.viewportWidth = UI.width / UI.scale
        UI.viewportHeight = _window.viewportHeight = UI.height / UI.scale

        // define unit

        UNIT = {
            px : 1,
            dp : UI.scale,
            mm : UI.scale * 3.76562,
            cm : UI.scale * 37.7812,
            pt : UI.scale * 1.32812,
            pc : UI.scale * 16,
            in : UI.scale * 96,
            vw : UI.width / 100,
            vh : UI.height / 100,
            vmin : Math.min(UI.width, UI.height) / 100,
            vmax : Math.max(UI.width, UI.height) / 100,
            __unitRegExp__ : /(?=\b|\-|\.)(\-?\.?[0-9]+\.?[0-9]*)(px|mm|cm|pt|pc|in|dp|vw|vh|vm|vmin|vmax|%)\b/ig,
            __nativeUnits__ : DETECT.supportSizeUnits
        }

        // device

        _window.device = {
            ui   : UI,
            os   : OS,
            feat : DETECT
        }

        _window.UI = UI
        _window.UNIT = UNIT
        _window.DP = function (dp) {
            return dp * UI.scale
        }
    }



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
                        enumerable: true,  // 可被枚举
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

        function _extendArray (arr, callback, motive) {
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

    var Mirror = (function() {
        Mirror.prototype.css_attr = [
            "borderBottomWidth", 
            "borderLeftWidth", 
            "borderRightWidth", 
            "borderTopStyle", 
            "borderRightStyle", 
            "borderBottomStyle", 
            "borderLeftStyle", 
            "borderTopWidth", 
            "boxSizing", 
            "fontFamily", 
            "fontSize", 
            "fontWeight", 
            "height", 
            "letterSpacing", 
            "lineHeight", 
            "marginBottom", 
            "marginLeft", 
            "marginRight", 
            "marginTop", 
            "outlineWidth", 
            "overflow", 
            "overflowX", 
            "overflowY", 
            "paddingBottom", 
            "paddingLeft", 
            "paddingRight", 
            "paddingTop", 
            "textAlign", 
            "textOverflow", 
            "textTransform", 
            "whiteSpace", 
            "wordBreak", 
            "wordWrap"
        ]

        function Mirror(inputor) {
            this.inputor = inputor

            return this
        }

        Mirror.prototype.mirrorCss = function() {
            var that = this
            var css = {
                position: 'absolute',
                left: -9999,
                top: 0,
                zIndex: -20000
            }

            if ( this.inputor.nodeName === 'TEXTAREA' ) {
                this.css_attr.push('width')
            }

            this.css_attr.each(function(i, p) {
                return css[p] = that.inputor.css(p)
            })

            return css
        }

        Mirror.prototype.create = function(html) {
            var that = this
            var css = this.mirrorCss()

            this.mirror = document.createElement('div')

            css.each(function (i, p) {
                that.mirror.style[i] = p
            })

            this.mirror.html(html)
            this.inputor.after(this.mirror)

            return this
        }

        Mirror.prototype.rect = function(select) {
            var flag = this.mirror.find(select)
            var pos = flag.position()
            var rect = {
                left: pos.left,
                top: pos.top,
                height: flag[0].offsetHeight
            }

            this.mirror.remove()
        
            return rect
        }

        return Mirror
    })()



    /*=============================================================================*/


    


    /*=============================================================================*/


    

    // 统一兼容性

    window.__defineUnify__ = (function () {

        // Prefix, default unit

        var VENDOR_LENGTH = DETECT.vendor.length
        var REGEXP = {
                vendor : new RegExp("^" + DETECT.vendor, "ig")
            }

        // noop

        var noop = function () {}

        // preventDefaultEvent

        var stopPropagation = function (event) { return event.stopPropagation() }
        var preventDefaultEvent = function (event) { return event.preventDefault() }



        return function (window) {

            // defineProperty


            window.Object.defineProperty(window.Object.prototype, "extendProperty", {configurable:true, writable:true})
            window.Object.prototype.extendProperty = function (prop, value) {
                try {
                    window.Object.defineProperty(this, prop, {configurable:true, writable:true})
                    if ( value !== undefined ) this[prop] = value
                } catch (e) {}
            }
            window.Object.defineProperty(window.Object.prototype, "extendProperties", {configurable:true, writable:true})
            window.Object.prototype.extendProperties = function (object) {
                for (var key in object) {
                    this.extendProperty(key, object[key])
                }
            }


            /*=============================================================================*/



            var document = window.document

            // Define

            Define(window)

            // setBaseUI

            setBaseUI(window)
            top.addEventListener('resize', function () {
                setBaseUI(window)
            })

            window.keyboard = {}

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

                window.extendProperty("requestAnimationFrame", (function () {
                    var lastTime = 0

                    return function (callback) {
                        var now = Date.now()
                        var nextTime = Math.max(lastTime + 16.78, now)
                        return setTimeout(function () { callback(lastTime = nextTime) }, nextTime - now)
                    }
                })())

                window.extendProperty("cancelAnimationFrame", window.clearTimeout)
            }

            if ( !window.requestIdleCallback ) {
                window.extendProperty("requestIdleCallback", function (callback) {
                    return setTimeout(function () { 
                        callback({ 
                            timeRemaining: function () { 
                                return Number.MAX_VALUE 
                            } 
                        }) 
                    }, 0)
                })
            }

            if ( !window.document.head ) {
                window.document.extendProperty("head", window.document.getElementsByTagName("head")[0] || window.document.documentElement)
            }

            /* time */

            if ( !window.Date.now ) {
                window.Date.extendProperty("now", function () {
                    return new Date().getTime()
                })
            }

            // UUID

            window.extendProperty("UUID", UUID)



            // Object extend

            !(function () {

                var Array = window.Array,
                    Object = window.Object,
                    String = window.String,
                    Node = window.Node,
                    Element = window.Element,
                    DOMParser = window.DOMParser,
                    Function = window.Function,
                    CSSStyleDeclaration = window.CSSStyleDeclaration

                // String

                !(function (proto) {

                    // trim

                    if ( !proto.trim ) {
                        proto.extendProperty("trim", function () {
                            return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '')
                        })
                    }

                    // split, 只split 字符中的组织结构，即忽略字符中被引号包裹的内容

                    if ( !proto.splitCells ) {
                        proto.extendProperty("splitCells", (function () {
                            var SPLITES_RE = /(['"])[^'"]*\1/
                            return function (reg) {
                                var that = this
                                that = that.replace(SPLITES_RE, function (v) { return encodeURIComponent(v) })
                                that = that.split(reg)

                                return that.map(function (v) {
                                    return decodeURIComponent(v)
                                })
                            }
                        })())
                    }

                    // params string trans to Object

                    proto.extendProperty("paramsToObject", function (reg) {
                        var kds = this.split(reg || /[\?\#\,\&\:\=\/]/)
                        var index = kds.length - 1
                        var params = {}

                        while ( index > 0  ) {
                            params[kds[index-1]] = kds[index]

                            index = index-2
                        }

                        return params
                    })

                    // 字符重复: str.repeat(3) >> strstrstr

                    proto.extendProperty("repeat", function (n) {
                        return new Array(1 + n).join(this)
                    })

                    // 字符静态分析
                    
                    proto.extendProperty("staticAnalysis", (function () {
                        var SPLITES_RE = /\.|\[/
                        var WORDS_RE = /^[a-zA-Z_$]+\w*$/
                        var NUMBER_RE = /^[0-9]*\.?[0-9]*$/
                        var OBJECT_RE = /window|top/

                        // 静态分析模板变量
                        
                        var KEYWORDS =
                            // 关键字
                            'break,case,catch,continue,debugger,default,delete,do,else,false'
                            + ',finally,for,function,if,in,instanceof,new,null,return,switch,this'
                            + ',throw,true,try,typeof,var,void,while,with'

                            // 保留字
                            + ',abstract,boolean,byte,char,class,const,double,enum,export,extends'
                            + ',final,float,goto,implements,import,int,interface,long,native'
                            + ',package,private,protected,public,short,static,super,synchronized'
                            + ',throws,transient,volatile'

                            // ECMA 5 - use strict
                            + ',arguments,let,yield'

                            + ',undefined'

                        var KEYWORDS_RE = new RegExp("\\b(?:" + KEYWORDS.split(',').join('|') + ")\\b")

                        return function () {    
                            var arrays = this.split(SPLITES_RE)
                            var object = arrays[0]
                            var result = window.sandboxWindow[object]

                            if ( result ) return typeof result
                            if ( NUMBER_RE.test(object) ) return 'number'
                            if ( KEYWORDS_RE.test(object) ) return 'token'
                            if ( OBJECT_RE.test(object) ) return 'object'
                            if ( WORDS_RE.test(object) ) return 'variable'

                            return 'unknown'

                            // try {
                            //     result = seval("typeof " + object)
                            //     if ( result == 'undefined' ) return 'variable'
                            // } catch(e) {
                            //     return e.message.split(' ')[1]
                            // }
                        }
                    })())

                })(String.prototype)
        

                // Object

                !(function (proto) {

                    // 获取原型

                    proto.extendProperty("getInstanceType", function () {
                        return proto.toString.call(this).match(/^\[object\s(.*)\]$/)[1]
                    })

                    // extend

                    proto.extendProperty("extend", function () {
                        for (var i = 0, l = arguments.length; i < l; i++) {
                            var source = arguments[i]

                            for (var key in source)
                                this[key] = source[key]
                        }

                        return this
                    })

                    // Object.assign

                    if ( Object.assign !== 'function' ) {
                            Object.extendProperty("assign", function (target) {
                                
                                //第一个传参不能是undefined和null，因为它们不能被转为对象
                                
                                if ( target === undefined || target === null ) {
                                  throw new TypeError('Can not convert undefined or null to object')
                                }

                                //使用Object对象化target
                                
                                var output = Object(target)
                                
                                for (var idx = 1, l = arguments.length; index < l; idx++) {
                                    
                                    var source = arguments[idx]
                                    
                                    //后续传参也需要判断undefined和null
                                  
                                    if ( source !== undefined && source !== null ) {
                                        for (var key in source) {
                                            if ( Object.prototype.hasOwnProperty.call(source, key) ) {
                                                output[key] = source[key]
                                            }
                                        }
                                    }
                                }

                                return output
                          })
                    }

                    // objectToParams

                    proto.extendProperty("objectToParams", function (object, route) {
                        var payload = ""
                        var params = []
                        var e = encodeURIComponent

                        object = object || this
                        
                        if ( typeof object === "string" ) {
                            payload = object
                        } else {

                            for (var k in object) {
                                if ( object.hasOwnProperty(k) ) {
                                    var value = object[k]

                                    switch (typeof value) {
                                        case 'object':
                                            value = JSON.stringify(object[k])
                                        break
                                        case 'string':
                                            value = value
                                        break
                                    }

                                    params.push(k + (route ? '/' : '=') + e(value))
                                }
                            }
                            payload = params.join(route ? '/' : '&')
                        }

                        return payload
                    })

                    // countProperties 获取Object propert length

                    proto.extendProperty("countProperties", function () {
                        var count = 0

                        for (var property in this) {
                            if (this.hasOwnProperty(property)) {
                                count++
                            }
                        }

                        return count
                    })

                    // each

                    proto.extendProperty("each", function (callback, that) {
                        that = that || this
                        
                        var i, key, length, array

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

                                array = this.nodeType ? this.childNodes : this

                                for (i = 0; i < array.length; i++) {
                                    if (callback.call(that, i, array[i], i + 1, array.length) === false)
                                        return this
                                }

                                break
                        }

                        return this
                    })

                    // equals

                    proto.extendProperty("equals", function(x, y) {
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
                    })

                    // clone

                    proto.extendProperty("clone", function () {
                        return Object.create(this)
                    })

                    // watch

                    proto.extendProperty("watch", function (prop, handler) {
                        Watch.watch(this, prop, handler)
                    })

                    // unwatch

                    proto.extendProperty("unwatch", function (prop) {
                        Watch.unwatch(this, prop)
                    })

                    // initial

                    proto.extendProperty("initial", function (prop, value) {
                        return this[prop] || (this[prop] = value)
                    })

                    // setValueOfHref

                    proto.extendProperty("setValueOfHref", function (link, value) {
                        new Function('scope', 'value', 'scope.' + link + ' = value')(this, value)
                    })

                    // getValueByRoute

                    proto.extendProperty("getValueByRoute", (function () {

                        var SPLITES_RE = /[^\w|\.$]+/
                        var LINKS_RE = /(['"])[^'"]*\1/
                        var OBJECT_RE = /\.|\[/
                        var LINKER_RE = /^[\w\_\$\.]*$/

                        return function (link, factory, error) {
                            var result

                            // 传参空直接返回this

                            if ( !link ) return this

                            // 无运算直接输出
                            
                            if ( LINKER_RE.test(link) ) {
                                result = this.getValueByLink(link)

                                // get Function
                                
                                if ( factory ) {
                                    return {
                                        factory : null,
                                        result : result
                                    }
                                }

                                return result
                            } else {
                                result = this[link]
                                
                                if ( result ) {

                                    // get Function
                                
                                    if ( factory ) {
                                        return {
                                            factory : null,
                                            result : result
                                        }
                                    }

                                    return result
                                }
                            }

                            // 需要创建运算函数

                            var i
                              , l
                              , fn
                              , val
                              , noops = []
                              , scope = [this]
                              , splits = ['scope']
                              , inscope = {}
                              , unlink = link.replace(LINKS_RE, '')
                              , inlink = unlink.split(SPLITES_RE).unique()
                               
                            for (i = inlink.length - 1; i >= 0; i--) {
                                val = inlink[i].split(OBJECT_RE)[0]

                                if ( !inscope[val] ) { 

                                    // 取得根对象，且检测根对象是否合法 (object.val || window.val)

                                    if ( val && val.length && (this[val] || val.staticAnalysis() == 'variable') ) {
                                        
                                        // watched 可读变量
                                        
                                        if ( val in this ) {
                                            splits.push(val)
                                            scope.push(this[val])
                                        } else {
                                            splits.push(val)
                                            scope.push(undefined)
                                        }
                                    }

                                    inscope[val] = true
                                }
                            }
                            
                            try {
                                fn = typeof factory == 'function' ? factory : new window.SandboxFunction(splits.join(','), 'try { return (' + link + ') } catch (e) {}')
                                result = fn.apply(this, scope)
                            } catch (e) {
                                error && error(e)
                            }

                            // get Function

                            if ( factory ) {
                                return {
                                    factory : fn,
                                    result : result
                                }
                            }

                            // 对象未定义时的默认声明

                            return result
                        }

                    })())

                    // getValueByRoutes

                    proto.extendProperty("getValueByRoutes", function (links, fact, error) {
                        var result = []

                        if ( typeof links == 'string' ) links = [links]

                        for (var i = 0, l = links.length; i < l; i++) {
                            result.push(this.getValueByRoute(links[i], fact, error))
                        }

                        return result
                    })

                    // getValueByRoute

                    proto.extendProperty("getFunctionByRoute", function (link, fact, error) {
                        return this.getValueByRoute(link, fact || true, error)
                    })

                    // getValueByRoutes
                    
                    proto.extendProperty("getFunctionByRoutes", function (links, fact, error) {
                        return this.getValueByRoutes(links, fact || true, error)
                    })

                    // getValueByLink
                    
                    proto.extendProperty("getValueByLink", (function () {
                        var SPLITES_RE = /\./

                        return function (link) {
                            var links = link.split(SPLITES_RE)
                            var object = this

                            for (var i = 0, l = links.length; i < l; i++) {
                                if ( !object ) break
                                object = object[links[i]]
                                if ( l == 1 ) {
                                    if ( ["true"].consistOf(links[i]) ) object = true
                                    if ( ["false", "null", "undefined"].consistOf(links[i]) ) object = false
                                } else if ( typeof object !== 'object' && i < l - 1 ) {
                                    object = undefined
                                    break
                                }
                            }

                            return object
                        }
                    })())

                })(Object.prototype)


                // Array

                !(function (proto) {

                    // inArray

                    if ( !proto.consistOf ) {
                        proto.extendProperty("consistOf", function (obj) {
                            var i = this.length

                            while (i--) {  
                                if ( this[i] === obj ) {  
                                    return true
                                }  
                            } 

                            return false 
                        })
                    }

                    // map

                    if ( !proto.map ) {
                        proto.extendProperty("map", function (fn) {
                            var a = []
                            for(var i = 0; i < this.length; i++){
                                var value = fn(this[i], i)

                                if ( value == null ){
                                    continue
                                }

                                a.push(value)
                            }
                            return a
                        })
                    }

                    // unique 数组去重

                    if ( !proto.unique ) {
                        proto.extendProperty("unique", function () {
                            var result = [], hash = {}
                            for (var i = 0, elem; (elem = this[i]) != null; i++) {
                                if (!hash[elem]) {
                                    result.push(elem)
                                    hash[elem] = true
                                }
                            }
                            return result
                        })
                    }

                })(Array.prototype)


                // Node.prototype

                !(function (proto) {

                    // observer

                    proto.extendProperty("observer", function (options, callback) {
                        var MutationObserver = window.MutationObserver

                        /**
                        * @param {Object} options
                        * @param {Function} callback
                        * 元素attr change 监听 
                        * childList：子元素的变动。
                        * attributes：属性的变动。
                        * characterData：节点内容或节点文本的变动。
                        * subtree：所有下属节点（包括子节点和子节点的子节点）的变动。
                        */

                        var options = options || {
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
                                    options.each(function (key, on) {
                                        switch (key) {
                                            case 'attributes':
                                                on && eventName.push("DOMAttrModified")
                                                break;
                                            case 'childList':
                                                on && eventName.push("DOMNodeInserted")
                                                on && eventName.push("DOMNodeRemoved")
                                                break
                                            case 'characterData':
                                                on && eventName.push("DOMCharacterDataModified")
                                                break;
                                            case 'subtree':
                                                on && eventName.push("DOMNodeInserted")
                                                on && eventName.push("DOMNodeRemoved")
                                                on && eventName.push("DOMNodeInsertedIntoDocument")
                                                on && eventName.push("DOMNodeRemovedFromDocument")
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
                        } catch (e) {}
                    })

                })(Node.prototype)


                // Element.prototype

                !(function (proto) {

                    // element.Move() => new Move()

                    proto.extendProperty("Animate", function (options) {

                        if ( !this.animationEvent ) {
                            this.extendProperty("animationEvent", window.Move(this))
                        }

                        return this.animationEvent
                    })

                    // element.Touch() => new Touch()

                    proto.extendProperty("Touch", function (options) {

                        // shadow box trans window

                        var win = this.ownerDocument.defaultView

                        if ( !win ) return {}

                        if ( !this.touchEvent ) {
                            this.extendProperty("touchEvent", new win.Touch(this, options))
                        }

                        return this.touchEvent
                    })
                    
                    // element.Scroll() => new Scroll()

                    proto.extendProperty("Scroll", function (options, window) {

                        // shadow box trans window

                        var win = this.ownerDocument.defaultView

                        if ( !win ) return {}

                        if ( !this.scrollEvent ) {
                            this.extendProperty("scrollEvent", new win.Scroll(this, options, window))
                        }

                        return this.scrollEvent
                    })

                    // get attr

                    proto.extendProperty("getAttrSign", function (prop) {
                        prop = this.getAttribute(prop)

                        if ( ["false", "none", null].consistOf(prop) ) {
                            prop = false
                        } else if ( ["", "true"].consistOf(prop)) {
                            prop = true
                        } else if ( !isNaN(prop) ) {
                            prop = Number(prop)
                        }
                        
                        return prop
                    })

                    // getOwnerSelection

                    proto.extendProperty("getOwnerSelection", function (context) {
                        return (this.parentShadowRoot && device.feat.shadowRoot == true ? this.parentShadowRoot : this.ownerDocument.defaultView).getSelection()
                    })

                    // getSelectionRange

                    proto.extendProperty("getSelectionRange", function (selection) {
                        selection = selection || this.getOwnerSelection()

                        return selection.createRange ? selection.createRange() : selection.anchorNode ? selection.getRangeAt(0) : null
                    })

                    // setSelectionRangeAt

                    proto.extendProperty("setSelectionRangePos", function (pos) {
                        var selection = this.getOwnerSelection()

                        switch (this.nodeName) {
                            case 'INPUT':
                            case 'TEXTAREA':
                                pos = pos.getInstanceType() == 'Array' ? pos : [this.selectionStart, this.selectionEnd]

                                if ( selection.rangeCount > 0 ) selection.removeAllRanges()

                                this.setSelectionRange(pos[0], pos[1])

                            break

                            case 'HTMLAREA':
                                var oDocument = this.ownerDocument
                                var fn, found, offset

                                if ( pos === undefined ) {
                                    pos = this.getSelectionRange(selection)
                                }

                                if ( pos.getInstanceType() == 'Range' ) {
                                    selection.removeAllRanges()
                                    selection.addRange(pos)
                                } else if ( selection ) {
                                    offset = 0
                                    found = false

                                    (fn = function (pos, parent) {
                                        var node, range, _i, _len, _ref, _results

                                        _ref = parent.childNodes
                                        _results = []

                                        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                            node = _ref[_i]

                                            if ( found ) {
                                                break
                                            }

                                            if ( node.nodeType === 3 ) {
                                                if ( offset + node.length >= pos ) {
                                                    found = true
                                                    range = oDocument.createRange()

                                                    range.setStart(node, pos - offset)
                                                    selection.removeAllRanges()
                                                    selection.addRange(range)

                                                    break
                                                } else {
                                                    _results.push(offset += node.length)
                                                }
                                            } else {
                                                _results.push(fn(pos, node))
                                            }
                                        }
                                        
                                        return _results

                                    })(pos, this)
                                }

                            break
                        }
                    })

                    // getSelectionRangeInsert

                    proto.extendProperty("getSelectionRangeInsert", function (context) {
                        var selection = this.getOwnerSelection()
                        var range = this.getSelectionRange(selection)
                        
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

                        this.setSelectionRangePos(range)

                        return range
                    })


                    // getSelectionRangePos

                    proto.extendProperty("getSelectionRangePosition", function (pos) {
                        switch (this.nodeName) {
                            case 'INPUT':
                            case 'TEXTAREA':

                                var at_rect, end_range, format, html, mirror, start_range

                                if ( pos === undefined ) {
                                    pos = this.selectionStart
                                }

                                if ( pos == this.preSelectionPos ) {
                                    return this.preSelectionRect
                                }

                                format = function (value) {
                                    value = value.replace(/<|>|`|"|&/g, '?').replace(/\r\n|\r|\n/g, "<br/>")
                                    if ( /firefox/i.test(navigator.userAgent) ) {
                                        value = value.replace(/\s/g, '&nbsp;')
                                    }
                                    return value
                                }

                                start_range = this.value.slice(0, pos)
                                end_range = this.value.slice(pos)
                                html = "<span style='position: relative; display: inline;'>" + format(start_range) + "</span>"
                                html += "<span id='mirror' style='position: relative; display: inline;'>|</span>"
                                html += "<span style='position: relative; display: inline;'>" + format(end_range) + "</span>"
                                mirror = new Mirror(this)

                                at_rect = mirror.create(html).rect("#mirror")
                                
                                at_rect.left -= this.scrollLeft
                                at_rect.top -= this.scrollTop

                                this.preSelectionPos = pos
                                this.preSelectionRect = at_rect

                                return at_rect

                            break

                            case 'HTMLAREA':

                                var inputor_offset, range_offset
                        
                                range_offset = this.getSelectionRangeOffset()
                                inputor_offset = this.offset()
                                range_offset.left -= inputor_offset.left
                                range_offset.top -= inputor_offset.top

                                return range_offset
                            break
                        }
                    })

                    proto.extendProperty("getSelectionRangeOffset", function (pos) {
                        switch (this.nodeName) {
                            case 'INPUT':
                            case 'TEXTAREA':
                                var offset = this.offset()
                                var position = this.getSelectionRangePosition(pos)

                                return offset = {
                                    left: offset.left + position.left,
                                    top: offset.top + position.top,
                                    height: position.height
                                }

                            break

                            case 'HTMLAREA':

                                var oWindow = this.ownerDocument.defaultView
                                var oDocument = oWindow.document

                                var selection = this.getOwnerSelection()
                                var range = this.getSelectionRange(selection)

                                var clonedRange, offset, rect, shadowCaret

                                if ( range ) {

                                    range.collapse(false)

                                    if ( range.endOffset - 1 > 0 && range.endContainer !== this ) {
                                        clonedRange = range.cloneRange()
                                        clonedRange.setStart(range.endContainer, range.endOffset - 1)
                                        clonedRange.setEnd(range.endContainer, range.endOffset)
                                        rect = clonedRange.getBoundingClientRect()
                                        offset = {
                                            height: rect.height,
                                            left: rect.left + rect.width,
                                            top: rect.top
                                        }
                                        clonedRange.detach()
                                    }

                                    if ( !offset || (offset != null ? offset.height : void 0) === 0) {
                                        clonedRange = range.cloneRange()
                                        shadowCaret = oDocument.createTextNode("|")
                                        clonedRange.insertNode(shadowCaret)
                                        clonedRange.selectNode(shadowCaret)
                                        rect = clonedRange.getBoundingClientRect()
                                        offset = {
                                            height: rect.height,
                                            left: rect.left,
                                            top: rect.top
                                        }
                                        shadowCaret.remove()
                                        clonedRange.detach()
                                    }
                                }

                                offset.left += top.scrollX
                                offset.top += top.scrollY

                                return offset

                            break
                        }
                    })


                })(Element.prototype)


                // CSSStyleDeclaration

                !(function (proto) {

                    // style.set(propertyName, value)

                    proto.extendProperty("set", function (propertyName, value) {
                        if ( propertyName === undefined || value === undefined ) return

                        value = typeof value === 'string' 
                                ? value.replace(window.UNIT.__unitRegExp__, function (size, length, unit) { 
                                    return length * window.UNIT[unit] + 'px'
                                  }) 
                                : value

                        this.setProperty(device.feat.prefixStyle(propertyName, true), value)
                    })

                    // style.remove

                    proto.extendProperty("remove", function (propertyName) {

                        var vendors = [DETECT.prefix + propertyName, propertyName]

                        for (var i = 0, l = vendors.length; i < l; i++) {
                            var propertyName = vendors[i]

                            if ( this.propertyIsEnumerable(propertyName) ) {
                                this.removeProperty(propertyName)
                            }
                        }
                    })

                })(CSSStyleDeclaration.prototype)

                // document 

                !(function (proto) {

                    // setCookie

                    proto.extendProperty("setCookie", function (name, value, domain, path) {
                        var Days = 30
                        var exp = new Date()
                        exp.setTime(exp.getTime() + Days*24*60*60*1000)
                        document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString() + (domain ? ";path=" + (path ? path : "/") + ";domain=" + domain : "")
                    })

                    proto.extendProperty("getCookie", function (name) {
                            var arr
                        var reg = new RegExp("(^| )"+name+"=([^;]*)(;|$)")
                        if ( arr = document.cookie.match(reg) )
                            return unescape(arr[2])
                        else
                            return null
                    })

                    proto.extendProperty("delCookie", function (name) {
                        var exp = new Date()
                        exp.setTime(exp.getTime() - 1)
                        var cval = getCookie(name)
                        if ( cval != null ) {
                            document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString()
                        }
                    })

                })(document) 


                // Function
                
                !(function (proto) {

                    if ( !proto.bind ) {

                        proto.bind = function (oThis) {
                            if (typeof this !== "function") {
                              // closest thing possible to the ECMAScript 5
                              // internal IsCallable function
                              throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable")
                            }

                            var aArgs = Array.prototype.slice.call(arguments, 1), 
                                fToBind = this, 
                                fNOP = function () {},
                                fBound = function () {
                                  return fToBind.apply(this instanceof fNOP
                                                         ? this
                                                         : oThis || this,
                                                       aArgs.concat(Array.prototype.slice.call(arguments)))
                                }

                            fNOP.prototype = this.prototype
                            fBound.prototype = new fNOP()

                            return fBound
                        }
                    }

                })(Function.prototype)


                // DOMParser

                !(function (proto) {

                    proto.extendProperty("parseFromStringToNode", (function () {
                        var DOMParser_proto = proto
                        var real_parseFromString = DOMParser_proto.parseFromString

                        // Firefox/Opera/IE throw errors on unsupported types

                        try {

                            // WebKit returns null on unsupported types

                            if ( (new DOMParser).parseFromString("", "text/html") ) {

                                // text/html parsing is natively supported
                                var isParseHtmlFromString = true
                            }

                        } catch (ex) {}

                        return function (markup, type) {

                            switch (type) {
                                case 'text/html':
                                    var doc
                                    var body

                                    if ( isParseHtmlFromString ) {
                                        doc = real_parseFromString.apply(this, arguments)

                                        try {
                                            body = doc.body
                                        } catch (e) {}
                                    }

                                    if ( !body ) {

                                        doc = document.implementation.createHTMLDocument("")

                                        if ( markup.toLowerCase().indexOf('<!doctype') > -1) {
                                            doc.documentElement.innerHTML = markup
                                        } else {

                                            try {
                                                body = doc.body
                                            } catch (e) {}

                                            // android parseFromString then body is not definde 

                                            if ( !body ) {
                                                doc.documentElement.innerHTML = markup

                                                var node
                                                var nodes = document.createNodeIterator(doc.documentElement, NodeFilter.SHOW_ALL, null, false)

                                                while ( node = nodes.nextNode() ) {
                                                    if ( node.nodeName === 'BODY' ) {
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

                                    break

                                default:
                                    return real_parseFromString.apply(this, arguments)

                                    break
                            }
                        }

                    })())

                })(DOMParser.prototype)


            })()
        }

    })()

    __defineUnify__(window)

})()