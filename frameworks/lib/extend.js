define(function(require, exports, module) {
    'use strict';

    return (function () {
        // 设备属性检测;
        var os = (function (userAgent) {

                this.webkit = userAgent.match(/WebKit\/([\d.]+)/) ? true : false;
                this.android = userAgent.match(/(Android)\s+([\d.]+)/) || userAgent.match(/Silk-Accelerated/) ? true : false;
                this.androidICS = this.android && userAgent.match(/(Android)\s4/) ? true : false;
                this.ipad = userAgent.match(/(iPad).*OS\s([\d_]+)/) ? true : false;
                this.iphone = !this.ipad && userAgent.match(/(iPhone\sOS)\s([\d_]+)/) ? true : false;
                this.webos = userAgent.match(/(webOS|hpwOS)[\s\/]([\d.]+)/) ? true : false;
                this.touchpad = this.webos && userAgent.match(/TouchPad/) ? true : false;
                this.ios = this.ipad || this.iphone;
                this.playbook = userAgent.match(/PlayBook/) ? true : false;
                this.blackberry10 = userAgent.match(/BB10/) ? true : false;
                this.blackberry = this.playbook || this.blackberry10|| userAgent.match(/BlackBerry/) ? true : false;
                this.chrome = userAgent.match(/Chrome/) ? true : false;
                this.opera = userAgent.match(/Opera/) ? true : false;
                this.fennec = userAgent.match(/fennec/i) ? true : userAgent.match(/Firefox/) ? true : false;
                this.ie = userAgent.match(/MSIE 10.0/i) ? true : false;
                this.ieTouch = this.ie && userAgent.toLowerCase().match(/touch/i) ? true : false;
                this.supportsTouch = ((window.DocumentTouch && document instanceof window.DocumentTouch) || 'ontouchstart' in window);

                // 主流系统版本检测;

                if ( this.ios ) this.iosVersion = parseFloat(userAgent.slice(userAgent.indexOf("Version/")+8));
                if ( this.android && !this.webkit ) this.android = false;
                if ( this.android ) this.androidVersion = parseFloat(userAgent.slice(userAgent.indexOf("Android")+8));

                
                return this;

            }).call({}, navigator.userAgent);


        var detect = (function (userAgent) {
                
                // features - 功能检测 or 返回最适合特性;

                this.touch = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
                this.nativeTouchScroll = typeof(document.documentElement.getElementsByTagName("head")[0].style["-webkit-overflow-scrolling"]) !== "undefined";
                this.vendor = os.webkit ? "Webkit" : os.fennec ? "Moz" : os.ie ? "ms" : os.opera ? "O" : "";
                this.prefix = os.webkit ? "-webkit-" : os.fennec ? "-moz-" : os.ie ? "-ms-" : os.opera ? "-O-" : "";
                this.cssTransformStart = !os.opera ? "3d(" : "(";
                this.cssTransformEnd = !os.opera ? ",0)" : ")";
                
                // viewport 起效检测;

                this.viewport = window.viewport;

                // js or css 前缀支持;

                var _JSPROPMAPS = {},
                    _CSSPROPMAPS = {},
                    _ELEMENT = document.createElement('div'),
                    _STYLE   = _ELEMENT.style,
                    VENDORS  = ['webkit', 'Moz', 'ms', 'O'],
                    PREFIXS  = ['-webkit-', '-moz-', '-ms-', '-O-']
                ;

                this.prefixStyle = function (prop, css) {
                    var api;

                    if ( css && prop in _CSSPROPMAPS ) {
                        return _CSSPROPMAPS[prop];
                    } else if ( !css && prop in _JSPROPMAPS ) {
                        return _JSPROPMAPS[prop];
                    }
                    
                    for ( var i = 0, l = VENDORS.length; i < l; i++ ) {
                        api = VENDORS[i] + ('-' + prop).replace(/-(\w)/g,function () { return arguments[1].toUpperCase(); });
                        if ( api in _STYLE ) return css ? _CSSPROPMAPS[prop] = PREFIXS[i] + prop : _JSPROPMAPS[prop] = api;
                    }

                    if ( prop in _STYLE ) return css ? _CSSPROPMAPS[prop] = prop : _JSPROPMAPS[prop] = prop;

                    return css ? _CSSPROPMAPS[prop] = prop : _JSPROPMAPS[prop] = false;
                };

                this.hasTranslate3d = this.prefixStyle('transform') && window.getComputedStyle ? true : false;

                // This should find all Android browsers lower than build 535.19 (both stock browser and webview)

                this.isBadTransition = os.android && os.androidVersion < 4.4 && !os.chrome;
                this.isBadAndroid = window.devicePixelRatio < 2 && screen.width < 640 && os.androidVersion < 4.1;

                // 是否支持observer;
                
                this.observer = (window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver) ? true : false;

                // 是否支持ShadowRoot;

                this.shadowRoot = document.body.createShadowRoot ? true : false;

                // 是否支持贞动画;

                this.keyframes = (window.CSSRule.WEBKIT_KEYFRAMES_RULE || window.CSSRule.MOZ_KEYFRAMES_RULE || window.CSSRule.MS_KEYFRAMES_RULE || window.CSSRule.O_KEYFRAMES_RULE) ? true : false;
                
                // 获取贞动画前缀;

                this.keyframesPrefix = window.CSSRule.WEBKIT_KEYFRAMES_RULE ? '-webkit-' : false || window.CSSRule.MOZ_KEYFRAMES_RULE ? '-moz-' : false || window.CSSRule.MS_KEYFRAMES_RULE ? '-ms-' : false || window.CSSRule.O_KEYFRAMES_RULE ? '-o-' : false || '';

                //判断浏览器是否支持DOM树结构改变

                this.mutations = (function () {
                    var type = [
                            "DOMSubtreeModified",
                            "DOMNodeInserted",
                            "DOMNodeRemoved",
                            "DOMNodeRemovedFromDocument",
                            "DOMNodeInsertedIntoDocument",
                            "DOMAttrModified",
                            "DOMCharacterDataModified"
                        ],
                        documentElement = document.documentElement,
                        method = "EventListener",
                        data = "deleteData",
                        p = document.createElement("p"),
                        mutations = {},
                        i
                    ;

                    function check(addOrRemove) {
                        for (i = type.length; i--;) {
                            p[addOrRemove](type[i], cb, false);
                            documentElement[addOrRemove](type[i], cb, false);
                        }
                    }

                    function cb(e) {
                        mutations[e.type] = true;
                    }

                    check("add" + method);

                    documentElement.insertBefore(
                        p,
                        documentElement.lastChild
                    )

                    p.setAttribute("i", i);
                    p = p.appendChild(document.createTextNode(i));
                    data in p && p[data](0, 1);
                    documentElement.removeChild(p = p.parentNode);
                    check("remove" + method);
                    return (p = mutations);

                }());

                return this;

            }).call({}, navigator.userAgent);

        var UUID = (function () {
            function UUID(){
                this.id = this.createUUID();
            }

            UUID.prototype.valueOf = function () { return this.id; };
            UUID.prototype.toString = function () { return this.id; };

            UUID.prototype.createUUID = function () {
                var dg = new Date(1582, 10, 15, 0, 0, 0, 0);
                var dc = new Date();
                var t = dc.getTime() - dg.getTime();
                var tl = UUID.getIntegerBits(t,0,31);
                var tm = UUID.getIntegerBits(t,32,47);
                var thv = UUID.getIntegerBits(t,48,59) + '1'; // version 1, security version is 2
                var csar = UUID.getIntegerBits(UUID.rand(4095),0,7);
                var csl = UUID.getIntegerBits(UUID.rand(4095),0,7);
                // since detection of anything about the machine/browser is far to buggy,
                // include some more random numbers here
                // if NIC or an IP can be obtained reliably, that should be put in
                // here instead.
                var n = UUID.getIntegerBits(UUID.rand(8191),0,7) +
                        UUID.getIntegerBits(UUID.rand(8191),8,15) +
                        UUID.getIntegerBits(UUID.rand(8191),0,7) +
                        UUID.getIntegerBits(UUID.rand(8191),8,15) +
                        UUID.getIntegerBits(UUID.rand(8191),0,15); // this last number is two octets long
                return tl + tm  + thv  + csar + csl + n;
            };

            //Pull out only certain bits from a very large integer, used to get the time
            //code information for the first part of a UUID. Will return zero's if there
            //aren't enough bits to shift where it needs to.
            UUID.getIntegerBits = function (val,start,end) {
                var base16 = UUID.returnBase(val,16);
                var quadArray = new Array();
                var quadString = '';
                var i = 0;
                for(i=0;i<base16.length;i++){
                    quadArray.push(base16.substring(i,i+1));   
                }
                for(i=Math.floor(start/4);i<=Math.floor(end/4);i++){
                    if(!quadArray[i] || quadArray[i] == '') quadString += '0';
                    else quadString += quadArray[i];
                }
                return quadString;
            };

            //Replaced from the original function to leverage the built in methods in
            //JavaScript. Thanks to Robert Kieffer for pointing this one out
            UUID.returnBase = function (number, base) {
                return (number).toString(base).toUpperCase();
            };
             
            //pick a random number within a range of numbers
            //int b rand(int a); where 0 <= b <= a
            UUID.rand = function (max) {
                return Math.floor(Math.random() * (max + 1));
            };

            return UUID;
        })();

        // watch - 变量改变观察;

        var watch = (function () {
            function watch (target, prop, handler) {
                if ( target.__lookupGetter__(prop) != null ) {
                    return true;
                }

                var oldval = target[prop],
                    newval = oldval,
                    self = this,
                    getter = function () {
                        return newval;
                    },
                    setter = function (val) {
                        if ( Object.prototype.toString.call(val) === '[object Array]' ) {
                            val = _extendArray(val, handler, self);
                        }
                        oldval = newval;
                        newval = val;
                        handler.call(target, prop, oldval, val);
                    };

                if ( delete target[prop] ) { // can't watch constants
                    if ( Object.defineProperty ) { // ECMAScript 5
                        Object.defineProperty(target, prop, {
                            get: getter,
                            set: setter,
                            enumerable: false,
                            configurable: true
                        });
                    } else if ( Object.prototype.__defineGetter__ && Object.prototype.__defineSetter__ ) { // legacy
                        Object.prototype.__defineGetter__.call(target, prop, getter);
                        Object.prototype.__defineSetter__.call(target, prop, setter);
                    }
                }

                return this;
            };

            // 解除变量监测器;

            function unwatch (target, prop) {
                var val = target[prop];
                delete target[prop]; // remove accessors
                target[prop] = val;
                return this;
            };

            // Allows operations performed on an array instance to trigger bindings

            function _extendArray (arr, callback, framework) {
                if (arr.__wasExtended === true) return;

                function generateOverloadedFunction (target, methodName, self) {
                    return function () {
                        var oldValue = Array.prototype.concat.apply(target);
                        var newValue = Array.prototype[methodName].apply(target, arguments);
                        target.updated(oldValue, motive);
                        return newValue;
                    };
                }
                arr.updated = function (oldValue, self) {
                    callback.call(this, 'items', oldValue, this, motive);
                };
                arr.concat = generateOverloadedFunction(arr, 'concat', motive);
                arr.join = generateOverloadedFunction(arr, 'join', motive);
                arr.pop = generateOverloadedFunction(arr, 'pop', motive);
                arr.push = generateOverloadedFunction(arr, 'push', motive);
                arr.reverse = generateOverloadedFunction(arr, 'reverse', motive);
                arr.shift = generateOverloadedFunction(arr, 'shift', motive);
                arr.slice = generateOverloadedFunction(arr, 'slice', motive);
                arr.sort = generateOverloadedFunction(arr, 'sort', motive);
                arr.splice = generateOverloadedFunction(arr, 'splice', motive);
                arr.unshift = generateOverloadedFunction(arr, 'unshift', motive);
                arr.__wasExtended = true;

                return arr;
            }

            if (typeof module !== 'undefined') {
              module.exports.watch = watch;
              module.exports.unwatch = unwatch;
            }

            return {
                watch : watch,
                unwatch : unwatch
            };
        
        })();

        // Sandbox;

        var Sandbox = (function () {
            function Sandbox () {
                this.sandbox = document.createElement('iframe');
                this.sandbox.style.display = 'none';

                document.documentElement.appendChild(this.sandbox);

                this.sandboxWindow = this.sandbox.contentWindow.window;
            };

            Sandbox.prototype = {
                get : function () {
                    return this.sandboxWindow;
                },

                exit : function () {
                    document.documentElement.removeChild(this.sandbox);
                },

                load : function (files, callback) {
                    files = typeof files == 'object' ? files : [files];

                    var html = '';
                    for (var i = files.length - 1; i >= 0; i--) {
                        html += '<object data=' + files[i] + '</object>';
                    }

                    this.sandboxWindow.open();
                    this.sandboxWindow.write(html);
                    this.sandboxWindow.close();

                    this.sandboxWindow.onload = function () {
                        callback();
                    };
                }
            };

            return Sandbox;
        })();

        // SandboxFunction;

        var SandboxFunction = (function () {
            var sandbox = new Sandbox(),
                sandboxWindow = sandbox.get(),
                sandboxFunction = sandboxWindow.Function;

            sandbox.exit(); 

            return sandboxFunction;
        })();

        // shadowRootFunction;

        var ShadowRootFunction = (function () {
            var shadowRoot = new Sandbox(),
                shadowRootWindow = shadowRoot.get(),
                shadowRootFunction = shadowRootWindow.Function;

            return shadowRootFunction;
        })();


        // set ui;

        var ui = {
            "dpi"    : window.devicePixelRatio || 1,
            "scale"  : detect.viewport ? (window.devicePixelRatio || 1) : 1,
            "width"  : window.innerWidth,
            "height" : window.innerHeight,
            "os"     : os
        };

        // define unit;

        window.Unit = {
            px : 1,
            dp : ui.scale,
            vw : ui.width / 100,
            vh : ui.height / 100,
            vm : Math.min(ui.width, ui.height) / 100
        };

        // Prefix, default unit;

        var cat = detect.vendor.length,
            vendorX = new RegExp("^" + detect.vendor, "ig"),
            sizeX = /\b(\d*\.?\d+)+(px|dp|vm|vw|vh)\b/ig
        ;      

        // compatible body ======================================== body ========================================

        return function (window) {
            var top = window.top == window.self;
            var document = window.document;

            window.device = {
                ui   : ui,
                os   : os,
                feat : detect
            };

            // 修正开发商前缀为W3C API

            for ( var key in window ) {
                var vendor = vendorX.exec(key);

                if ( vendor ) {
                    var start = key.charAt(cat);
                    var rekey = key.substr(cat);

                    if ( start > 'A' || start < 'Z' ) {
                        Object.defineProperty(window, "rekey", {configurable:true, writable:true});
                        window[rekey] = window[rekey] || window[key];
                    }
                }
            }

            /* requestAnimationFrame & cancelAnimationFrame */

            if ( !window.requestAnimationFrame || !window.cancelAnimationFrame ) {

                Object.defineProperty(window, "requestAnimationFrame", {configurable:true, writable:true});
                Object.defineProperty(window, "cancelAnimationFrame", {configurable:true, writable:true});

                var lastTime = 0;
                window.requestAnimationFrame = function(callback) {
                    var now = Date.now();
                    var nextTime = Math.max(lastTime + 16, now);
                    return setTimeout(function () { callback(lastTime = nextTime); }, nextTime - now);
                };
                window.cancelAnimationFrame = window.clearTimeout;
            }

            if ( !window.document.head ) {
                window.document.head = window.document.getElementsByTagName("head")[0] || window.document.documentElement;
            }

            /* time */

            if ( !window.Date.now ) {
                window.Date.now = function () {
                    return new Date().getTime();
                };
            }

            // Sandbox;

            Object.defineProperty(window, "Sandbox", {configurable:true, writable:true});
            window.Sandbox = Sandbox;

            // SandboxFunction;

            Object.defineProperty(window, "SandboxFunction", {configurable:true, writable:true});
            window.SandboxFunction = SandboxFunction;

            //ShadowRootFunction;

            Object.defineProperty(window, "ShadowRootFunction", {configurable:true, writable:true});
            window.ShadowRootFunction = ShadowRootFunction;

            // safe eval;

            Object.defineProperty(window, "seval", {configurable:true, writable:true});
            window.seval = function (code) {

                //安全闭包;

                return new SandboxFunction(' try { return ' + code + ' } catch (e) { console.log("safe-eval error!" + e) }')();
            };

            // UUID;

            Object.defineProperty(window, "UUID", {configurable:true, writable:true});
            window.UUID = UUID;

            // jquery;

            Object.defineProperty(window, "$", {configurable:true, writable:true});
            window.$ = window.query = require('Query')(window);

            // move;
            Object.defineProperty(window, "move", {configurable:true, writable:true});
            window.move = require("Move");

            // Promise;
            Object.defineProperty(window, "Promise", {configurable:true, writable:true});
            window.promise = require('Promise');
            window.Promise = window.promise.Promise;

            // Scroll;

            Object.defineProperty(window, "Scroll", {configurable:true, writable:true});
            window.Scroll = require('Scroll')(window, document, window.Math);
            window.scroller = {};

            // Touch;

            Object.defineProperty(window, "Touch", {configurable:true, writable:true});
            window.Touch = require('Touch')(window, window.document, undefined);
            window.toucher = {};

            // Object extend;

            (function () {

                var Array = window.Array,
                    Object = window.Object,
                    String = window.String,
                    DOMParser = window.DOMParser,
                    CSSStyleDeclaration = window.CSSStyleDeclaration
                ;

                // CSSStyleDeclaration;

                (function (proto) {

                    // style.set;

                    if ( !proto.set ) {
                        Object.defineProperty(proto, "set", {configurable:true, writable:true});
                        proto.set = function (propertyName, value) {

                            var vendors = [detect.prefix + propertyName, propertyName];

                            value = value.replace(sizeX, function (size, length, unit) { 
                                return length * Unit[unit] + 'px';
                            });

                            for (var i = 0, l = vendors.length; i < l; i++) {
                                var propertyName = vendors[i];

                                if ( this.hasOwnProperty(propertyName) ) {
                                    return this.setProperty(propertyName, value);
                                }
                            }
                        };
                    }

                    // style.remove;

                    if ( !proto.remove ) {
                        Object.defineProperty(proto, "remove", {configurable:true, writable:true});
                        proto.remove = function (propertyName) {

                            var vendors = [detect.prefix + propertyName, propertyName];

                            for (var i = 0, l = vendors.length; i < l; i++) {
                                var propertyName = vendors[i];

                                if ( this.propertyIsEnumerable(propertyName) ) {
                                    this.removeProperty(propertyName)
                                }
                            }
                        };
                    }

                })(CSSStyleDeclaration.prototype);


                // String;

                (function (proto) {

                    if ( !proto.trim ) {
                        Object.defineProperty(proto, "trim", {configurable:true, writable:true});
                        proto.trim = function () {
                            return this.replace(/^\s+|\s+$/g, '');
                        };
                    }

                    if ( !proto.toParams ) {
                        Object.defineProperty(proto, "toParams", {configurable:true, writable:true});
                        proto.toParams = function () {
                            var param,
                                params = {}
                            ;

                            this.split(/\,/).each(function (index, value) {
                                param = value.split(/\:/);
                                params[param[0]] = param[1];
                            })

                            return params;
                        };
                    }

                    if ( !proto.encodeToNumber ) {
                        Object.defineProperty(proto, "encodeToNumber", {configurable:true, writable:true});
                        proto.encodeToNumber = function (number, split) {
                            var i = 0,
                                pre = split ? "\\" : "", 
                                string = '',
                                length = this.length
                            ;

                            while (i < length) {
                                string += pre + this.charCodeAt(i).toString(number);
                                i++;
                            }

                            return string;
                        };
                    }

                    if ( !proto.decodeforNumber ) {
                        Object.defineProperty(proto, "decodeforNumber", {configurable:true, writable:true});
                        proto.decodeforNumber = function (number) {
                            var i = 0,
                                string = '',
                                charArry = this.split("\\"),
                                length = charArry.length
                            ;

                            for (i = 0; i < length; i++) {
                                string += this.fromCharCode(parseInt(charArry[i], number));
                            }

                            return string;
                        };
                    }

                    if ( !proto.removeQuotes ) {
                        Object.defineProperty(proto, "removeQuotes", {configurable:true, writable:true});
                        proto.removeQuotes = function () {
                            return this.replace(/\"|\'/g, '');
                        };
                    }

                    if ( !proto.repeat ) {
                        Object.defineProperty(proto, "repeat", {configurable:true, writable:true});
                        proto.repeat = function (n) {
                            return new Array(1 + n).join(this);
                        };
                    }

                })(String.prototype);
        

                // Object;

                (function (proto) {

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
                                var source = arguments[i];

                                for (var key in source)
                                    this[key] = source[key];
                            }

                            return this;
                        };
                    }

                    // each;

                    if ( !proto.each ) {
                        Object.defineProperty(proto, "each", {configurable:true, writable:true});
                        proto.each = function (callback, that) {
                            that = that || this;
                            
                            var i, key;

                            switch (this.getInstanceType()) {
                                case "Array":
                                    for (i = 0; i < this.length; i++) {
                                        if (callback.call(that, i, this[i]) === false)
                                            return this;
                                    }
                                    break;

                                case "Object":
                                    for (key in this) {
                                        if (!this.hasOwnProperty(key) || key == "length")
                                            continue;
                                        if (callback.call(that, key, this[key]) === false)
                                            return this;
                                    }
                                    break;
                            }

                            return this;
                        };
                    }

                    // clone;

                    if ( !proto.clone ) {
                        Object.defineProperty(proto, "clone", {configurable:true, writable:true});
                        proto.clone = function (callback) {
                            return Object.create(this);;
                        };
                    }

                    // watch;

                    if ( !proto.watch ) {
                        Object.defineProperty(proto, "watch", {configurable:true, writable:true});
                        proto.watch = function (prop, handler) {
                            watch.watch(this, prop, handler)
                        };
                    }

                    // unwatch;

                    if ( !proto.unwatch ) {
                        Object.defineProperty(proto, "unwatch", {configurable:true, writable:true});
                        proto.unwatch = function (prop) {
                            watch.unwatch(this, prop)
                        };
                    }

                    // setValueOfHref;

                    if ( !proto.setValueOfHref ) {
                        Object.defineProperty(proto, "setValueOfHref", {configurable:true, writable:true});
                        window.Object.prototype.setValueOfHref = function (link, value) {
                            link && new Function('scope', 'value', 'scope.' + link + ' = value')(this, value);
                        };
                    }

                    // getValueByString;

                    if ( !proto.getValueByString ) {
                        Object.defineProperty(proto, "getValueByString", {configurable:true, writable:true});
                        proto.getValueByString = function (link) {
                            if ( !link ) return this;

                            var scope = [],
                                root = []
                            ;

                            for (var i in this) {
                                scope.push(i);
                                root.push(this[i]);
                            }

                            return new Function(scope.join(','), 'try { return (' + link + ') } catch (e) {}').apply(this, root);
                        };
                    }

                })(Object.prototype);


                // Array;

                (function (proto) {

                    // inArray;

                    if ( !proto.inArray ) {
                        Object.defineProperty(proto, "inArray", {configurable:true, writable:true});
                        proto.inArray = function (obj) {
                            var i = this.length; 

                            while (i--) {  
                                if ( this[i] === obj ) {  
                                    return true;  
                                }  
                            } 

                            return false; 
                        }
                    }

                })(Array.prototype);
                    

                // DOMParser;

                (function(DOMParser) {
                    var DOMParser_proto = DOMParser.prototype,
                        real_parseFromString = DOMParser_proto.parseFromString
                    ;

                    // Firefox/Opera/IE throw errors on unsupported types

                    try {

                        // WebKit returns null on unsupported types

                        if ( (new DOMParser).parseFromString("", "text/html") ) {

                            // text/html parsing is natively supported

                            return;
                        }
                    } catch (ex) {}

                    DOMParser_proto.parseFromString = function (markup, type) {

                        if ( /^\s*text\/html\s*(?:;|$)/i.test(type) ) {
                            var doc = document.implementation.createHTMLDocument("");

                            if ( markup.toLowerCase().indexOf('<!doctype') > -1 ) {
                                doc.documentElement.innerHTML = markup;
                            } else {
                                doc.body.innerHTML = markup;
                            }

                            return doc;

                        } else {

                            return real_parseFromString.apply(this, arguments);
                        }

                    };

                })(DOMParser);

                // element extend;

                (function ($) {
                    var proto = window.Node.prototype;
                    var query = $(document.createElement('div'));

                    var windowExtend = ['trigger', 'bind', 'unbind', 'on', 'off', 'load'];
                    var documentExtend = ['trigger', 'bind', 'unbind', 'on', 'off','ready'];

                    var applyQuery = function (key) {
                        return (function (key) {
                            return function () {
                                var that = $(this);
                                return that[key].apply(that, arguments);
                            }
                        })(key);
                    };

                    // element extend;

                    for (var key in query) {
                        if ( !proto[key] ) proto[key] = applyQuery(key);
                    }

                    // window events extend;

                    for (var i in windowExtend) {
                        var key = windowExtend[i];
                        window[key] = applyQuery(key);
                    }

                    // document events extend;

                    for (var i in documentExtend) {
                        var key = documentExtend[i];
                        document[key] = applyQuery(key);
                    }

                })(window.$);

            })();

        }
        
    })();

})