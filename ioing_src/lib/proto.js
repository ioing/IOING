// 信言不美，美言不信。善者不辩，辩者不善。知者不博，博者不知。

define('~/proto', ['~/query', '~/sandbox', '~/move', '~/promise', '~/scroll', '~/touch', '~/loader'], function (require, module, exports) {
    
    'use strict'

    module.exports = (function () {
        
        // compatible body ======================================== body ========================================

        return function (window) {

            // jquery

            Object.defineProperty(window, "$$", {configurable:true, writable:true})
            window.$$ = window.query = require('~/query')(window)

            // sandbox

            window.extendProperty("sandbox", require('~/sandbox'))

            // Sandbox

            window.extendProperty("Sandbox", window.sandbox.sandbox)

            // SandboxWindow

            window.extendProperty("sandboxWindow", window.sandbox.sandboxWindow)

            // SandboxFunction

            window.extendProperty("SandboxFunction", window.sandbox.SandboxFunction)

            // ShadowRootWindow

            window.extendProperty("shadowRootWindow", window.sandbox.shadowRootWindow)

            // ShadowRootFunction

            window.extendProperty("ShadowRootFunction", window.sandbox.ShadowRootFunction)

            // safe eval

            window.extendProperty("seval", function (code, shadow) {

                //安全闭包

                return new (shadow ? window.ShadowRootFunction : window.SandboxFunction)(' try { return ' + code + ' } catch (e) {}')()
            })

            // Sandbox

            window.extendProperty("openWorker", function (content) {
                return new window.Worker(window.URL.createObjectURL(new Blob([typeof content === 'string' ? content : content.toString()])))
            })

            // move

            Object.defineProperty(window, "move", {configurable:true, writable:true})
            window.Move = require('~/move')

            // Promise
   
            Object.defineProperty(window, "Promise", {configurable:true, writable:true})
            window.io = window.promise = require('~/promise')

            // Scroll

            Object.defineProperty(window, "Scroll", {configurable:true, writable:true})
            window.Scroll = require('~/scroll')(window, window.document, window.Math)

            // Touch

            Object.defineProperty(window, "Touch", {configurable:true, writable:true})
            window.Touch = require('~/touch')(window, window.document, undefined)

            // Loader

            Object.defineProperty(window, "Loader", {configurable:true, writable:true})
            window.Loader = require('~/loader')

            // Object extend

            !(function () {

                // element extend

                (function ($) {
                    var proto = window.Node.prototype

                        // == $(document.createElement('div'))

                      , $element = [
                                    "constructor", 
                                    "proxy",
                                    "map",
                                    "each",
                                    "find", 
                                    "html", 
                                    "text", 
                                    "css", 
                                    "computedStyle", 
                                    "empty", 
                                    "hide", 
                                    "show", 
                                    "toggle", 
                                    "val", 
                                    "attr", 
                                    "removeAttr", 
                                    "prop", 
                                    "removeProp", 
                                    "remove", 
                                    "addClass", 
                                    "removeClass", 
                                    "toggleClass", 
                                    "replaceClass", 
                                    "hasClass", 
                                    "append", 
                                    "appendTo", 
                                    "prependTo", 
                                    "prepend", 
                                    "before", 
                                    "after", 
                                    "get", 
                                    "position",
                                    "offsetParent",
                                    "offset", 
                                    "height", 
                                    "width", 
                                    "parent", 
                                    "parents", 
                                    "childrens", 
                                    "siblings", 
                                    "closest", 
                                    "filter", 
                                    "not", 
                                    "data", 
                                    "end", 
                                    "clone", 
                                    "size", 
                                    "serialize", 
                                    "eq", 
                                    "index", 
                                    "is", 
                                    "bind", 
                                    "unbind", 
                                    "one", 
                                    "delegate", 
                                    "undelegate", 
                                    "on", 
                                    "off", 
                                    "trigger", 
                                    "click", 
                                    "keydown", 
                                    "keyup", 
                                    "keypress", 
                                    "submit", 
                                    "load", 
                                    "resize", 
                                    "change", 
                                    "select", 
                                    "error"
                                ]
                      , $window = ['trigger', 'bind', 'unbind', 'on', 'one', 'off', 'load']
                      , $document = ['trigger', 'bind', 'unbind', 'on', 'one', 'off','ready']
                      , applyQuery = function (key) {
                            return (function (key) {
                                return function () {
                                    var that = $(this)
                                    that.native = true
                                    return that[key].apply(that, arguments)
                                }
                            })(key)
                        }
                        

                    // element extend

                    $element.each(function (i, key) {
                        // if ( !proto[key] ) 
                        try {
                            proto[key] = applyQuery(key)
                        } catch (e) {}
                    })

                    // window events extend

                    for (var i in $window) {
                        var key = $window[i]
                        window[key] = applyQuery(key)
                    }

                    // document events extend

                    for (var i in $document) {
                        var key = $document[i]
                        window.document[key] = applyQuery(key)
                    }

                })(window.$$)

            })()

            // ScrollEvent

            !(function () {
                var scrollid = 0

                window.top.addEventListener('scroll', function () {

                    var event = {
                        x : top.scrollX,
                        y : top.scrollY
                    }
                    
                    if ( scrollid == 0 ) {
                        if ( window.onscrollstart ) window.onscrollstart(event)
                        window.trigger('scrollstart', event)
                    }

                    clearTimeout(scrollid)

                    scrollid = setTimeout(function () {
                        scrollid = 0
                        if ( window.onscrollend ) window.onscrollend(event)
                        window.trigger('scrollend', event)
                    }, 400)

                    if ( window !== top ) {
                        if ( window.onscrollend ) window.onscroll(event)
                        window.trigger('scroll')
                    }
                }, false)
            })()

        }

        
    })()

})