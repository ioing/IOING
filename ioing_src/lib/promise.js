// 民不畏威，则大威至。

define('~/promise', ['~/sandbox'], function (require, module, exports) {
    
    "use strict"

    var Sandbox = require('~/sandbox').sandbox
      , sandbox = new Sandbox(true)
      , sandboxWindow = sandbox.window
      , sandboxDocument = sandbox.document
      , sandboxDocumentHead = sandboxDocument.head
      , _jsonPID = 0
      , _tryAgain = []



    /* ------------------------------------------ Promise ------------------------------------------ */



    function isArray (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }

    function assign (obj, props) {
        for (var prop in props) {
            /* istanbul ignore else */
            if (props.hasOwnProperty(prop)) {
                obj[prop] = props[prop];
            }
        }
    }

    /**
    A promise represents a value that may not yet be available. Promises allow
    you to chain asynchronous operations, write synchronous looking code and
    handle errors throughout the process.
    This constructor takes a function as a parameter where you can insert the logic
    that fulfills or rejects this promise. The fulfillment value and the rejection
    reason can be any JavaScript value. It's encouraged that rejection reasons be
    error objects
    <pre><code>
    var fulfilled = new Promise(function (resolve) {
        resolve('I am a fulfilled promise');
    });
    var rejected = new Promise(function (resolve, reject) {
        reject(new Error('I am a rejected promise'));
    });
    </code></pre>
    @class Promise
    @constructor
    @param {Function} fn A function where to insert the logic that resolves this
            promise. Receives `resolve` and `reject` functions as parameters.
            This function is called synchronously.
    **/
    function Promise(fn) {
        if (!(this instanceof Promise)) {
            throw new TypeError(this + 'is not a promise');
        }
        if (typeof fn !== 'function') {
            throw new TypeError('Promise resolver ' + fn + ' is not a function')
        }

        var resolver = new Resolver()

        /**
        A reference to the resolver object that handles this promise
        @property _resolver
        @type Object
        @private
        */
        this._resolver = resolver

        try {
            fn(function (value) {
                resolver.resolve(value)
            }, function (reason) {
                resolver.reject(reason)
            })
        } catch (e) {
            resolver.reject(e)
        }
    }

    assign(Promise.prototype, {
        /**
        Schedule execution of a callback to either or both of "fulfill" and
        "reject" resolutions for this promise. The callbacks are wrapped in a new
        promise and that promise is returned.  This allows operation chaining ala
        `functionA().then(functionB).then(functionC)` where `functionA` returns
        a promise, and `functionB` and `functionC` _may_ return promises.
        Asynchronicity of the callbacks is guaranteed.
        @method then
        @param {Function} [callback] function to execute if the promise
                    resolves successfully
        @param {Function} [errback] function to execute if the promise
                    resolves unsuccessfully
        @return {Promise} A promise wrapping the resolution of either "resolve" or
                    "reject" callback
        **/
        then: function (callback, errback) {
            // using this.constructor allows for customized promises to be
            // returned instead of plain ones
            var resolve, reject,
                promise = new this.constructor(function (res, rej) {
                    resolve = res;
                    reject = rej;
                });

            this._resolver._addCallbacks(
                typeof callback === 'function' ?
                    Promise._makeCallback(promise, resolve, reject, callback) : resolve,
                typeof errback === 'function' ?
                    Promise._makeCallback(promise, resolve, reject, errback) : reject
            );

            return promise;
        },

        /*
        A shorthand for `promise.then(undefined, callback)`.
        Returns a new promise and the error callback gets the same treatment as in
        `then`: errors get caught and turned into rejections, and the return value
        of the callback becomes the fulfilled value of the returned promise.
        @method catch
        @param [Function] errback Callback to be called in case this promise is
                            rejected
        @return {Promise} A new promise modified by the behavior of the error
                            callback
        */
        'catch': function (errback) {
            return this.then(undefined, errback);
        }
    });

    /**
    Wraps the callback in another function to catch exceptions and turn them
    into rejections.
    @method _makeCallback
    @param {Promise} promise Promise that will be affected by this callback
    @param {Function} fn Callback to wrap
    @return {Function}
    @static
    @private
    **/
    Promise._makeCallback = function (promise, resolve, reject, fn) {
        // callbacks and errbacks only get one argument
        return function (valueOrReason) {
            var result;

            // Promises model exception handling through callbacks
            // making both synchronous and asynchronous errors behave
            // the same way
            try {
                // Use the argument coming in to the callback/errback from the
                // resolution of the parent promise.
                // The function must be called as a normal function, with no
                // special value for |this|, as per Promises A+
                result = fn(valueOrReason);
            } catch (e) {
                // calling return only to stop here
                reject(e);
                return;
            }

            if (result === promise) {
                reject(new TypeError('Cannot resolve a promise with itself'));
                return;
            }

            resolve(result);
        };
    };

    /*
    Ensures that a certain value is a promise. If it is not a promise, it wraps it
    in one.
    This method can be copied or inherited in subclasses. In that case it will
    check that the value passed to it is an instance of the correct class.
    This means that `PromiseSubclass.resolve()` will always return instances of
    `PromiseSubclass`.
    @method resolve
    @param {Any} Any object that may or may not be a promise
    @return {Promise}
    @static
    */
    Promise.resolve = function (value) {
        if (value && value.constructor === this) {
            return value;
        }
        /*jshint newcap: false */
        return new this(function (resolve) {
        /*jshint newcap: true */
            resolve(value);
        });
    };

    /*
    A shorthand for creating a rejected promise.
    @method reject
    @param {Any} reason Reason for the rejection of this promise. Usually an Error
        Object
    @return {Promise} A rejected promise
    @static
    */
    Promise.reject = function (reason) {
        /*jshint newcap: false */
        var promise = new this(function () {});
       /*jshint newcap: true */

       // Do not go through resolver.reject() because an immediately rejected promise
       // always has no callbacks which would trigger an unnecessary warning
       promise._resolver._result = reason;
       promise._resolver._status = 'rejected';

       return promise;
    };

    /*
    Returns a promise that is resolved or rejected when all values are resolved or
    any is rejected. This is useful for waiting for the resolution of multiple
    promises, such as reading multiple files in Node.js or making multiple XHR
    requests in the browser.
    @method all
    @param {Any[]} values An array of any kind of values, promises or not. If a value is not
    @return [Promise] A promise for an array of all the fulfillment values
    @static
    */
    Promise.all = function (values) {
        var Promise = this;
        return new Promise(function (resolve, reject) {
            if (!isArray(values)) {
                reject(new TypeError('Promise.all expects an array of values or promises'));
                return;
            }

            var remaining = values.length,
                i         = 0,
                length    = values.length,
                results   = [];

            function oneDone(index) {
                return function (value) {
                    results[index] = value;

                    remaining--;

                    if (!remaining) {
                        resolve(results);
                    }
                };
            }

            if (length < 1) {
                return resolve(results);
            }

            for (; i < length; i++) {
                Promise.resolve(values[i]).then(oneDone(i), reject);
            }
        });
    };

    /*
    Returns a promise that is resolved or rejected when any of values is either
    resolved or rejected. Can be used for providing early feedback in the UI
    while other operations are still pending.
    @method race
    @param {Any[]} values An array of values or promises
    @return {Promise}
    @static
    */
    Promise.race = function (values) {
        var Promise = this;
        return new Promise(function (resolve, reject) {
            if (!isArray(values)) {
                reject(new TypeError('Promise.race expects an array of values or promises'));
                return;
            }
            
            // just go through the list and resolve and reject at the first change
            // This abuses the fact that calling resolve/reject multiple times
            // doesn't change the state of the returned promise
            for (var i = 0, count = values.length; i < count; i++) {
                Promise.resolve(values[i]).then(resolve, reject);
            }
        });
    };

    /**
    Forces a function to be run asynchronously, but as fast as possible. In Node.js
    this is achieved using `setImmediate` or `process.nextTick`. In YUI this is
    replaced with `Y.soon`.
    @method async
    @param {Function} callback The function to call asynchronously
    @static
    **/
    /* istanbul ignore next */
    Promise.async = typeof setImmediate !== 'undefined' ?
                        function (fn) {setImmediate(fn);} :
                    typeof process !== 'undefined' && process.nextTick ?
                        process.nextTick :
                    function (fn) {setTimeout(fn, 0);};

    /**
    Represents an asynchronous operation. Provides a
    standard API for subscribing to the moment that the operation completes either
    successfully (`fulfill()`) or unsuccessfully (`reject()`).
    @class Promise.Resolver
    @constructor
    **/
    function Resolver() {
        /**
        List of success callbacks
        @property _callbacks
        @type Array
        @private
        **/
        this._callbacks = [];

        /**
        List of failure callbacks
        @property _errbacks
        @type Array
        @private
        **/
        this._errbacks = [];

        /**
        The status of the operation. This property may take only one of the following
        values: 'pending', 'fulfilled' or 'rejected'.
        @property _status
        @type String
        @default 'pending'
        @private
        **/
        this._status = 'pending';

        /**
        This value that this promise represents.
        @property _result
        @type Any
        @private
        **/
        this._result = null;
    }

    assign(Resolver.prototype, {
        /**
        Resolves the promise, signaling successful completion of the
        represented operation. All "onFulfilled" subscriptions are executed and passed
        the value provided to this method. After calling `fulfill()`, `reject()` and
        `notify()` are disabled.
        @method fulfill
        @param {Any} value Value to pass along to the "onFulfilled" subscribers
        **/
        fulfill: function (value) {
            var status = this._status;

            if (status === 'pending' || status === 'accepted') {
                this._result = value;
                this._status = 'fulfilled';
            }

            if (this._status === 'fulfilled') {
                this._notify(this._callbacks, this._result);

                // Reset the callback list so that future calls to fulfill()
                // won't call the same callbacks again. Promises keep a list
                // of callbacks, they're not the same as events. In practice,
                // calls to fulfill() after the first one should not be made by
                // the user but by then()
                this._callbacks = [];

                // Once a promise gets fulfilled it can't be rejected, so
                // there is no point in keeping the list. Remove it to help
                // garbage collection
                this._errbacks = null;
            }
        },

        /**
        Resolves the promise, signaling *un*successful completion of the
        represented operation. All "onRejected" subscriptions are executed with
        the value provided to this method. After calling `reject()`, `resolve()`
        and `notify()` are disabled.
        @method reject
        @param {Any} reason Value to pass along to the "reject" subscribers
        **/
        reject: function (reason) {
            var status = this._status;

            if (status === 'pending' || status === 'accepted') {
                this._result = reason;
                this._status = 'rejected';
            }

            if (this._status === 'rejected') {
                this._notify(this._errbacks, this._result);

                // See fulfill()
                this._callbacks = null;
                this._errbacks = [];
            }
        },

        /*
        Given a certain value A passed as a parameter, this method resolves the
        promise to the value A.
        If A is a promise, `resolve` will cause the resolver to adopt the state of A
        and once A is resolved, it will resolve the resolver's promise as well.
        This behavior "flattens" A by calling `then` recursively and essentially
        disallows promises-for-promises.
        This is the default algorithm used when using the function passed as the
        first argument to the promise initialization function. This means that
        the following code returns a promise for the value 'hello world':
            var promise1 = new Promise(function (resolve) {
                resolve('hello world');
            });
            var promise2 = new Promise(function (resolve) {
                resolve(promise1);
            });
            promise2.then(function (value) {
                assert(value === 'hello world'); // true
            });
        @method resolve
        @param [Any] value A regular JS value or a promise
        */
        resolve: function (value) {
            if (this._status === 'pending') {
                this._status = 'accepted';
                this._value = value;

                if ((this._callbacks && this._callbacks.length) ||
                    (this._errbacks && this._errbacks.length)) {
                    this._unwrap(this._value);
                }
            }
        },

        /**
        If `value` is a promise or a thenable, it will be unwrapped by
        recursively calling its `then` method. If not, the resolver will be
        fulfilled with `value`.
        This method is called when the promise's `then` method is called and
        not in `resolve` to allow for lazy promises to be accepted and not
        resolved immediately.
        @method _unwrap
        @param {Any} value A promise, thenable or regular value
        @private
        **/
        _unwrap: function (value) {
            var self = this, unwrapped = false, then;

            if (!value || (typeof value !== 'object' &&
                typeof value !== 'function')) {
                self.fulfill(value);
                return;
            }

            try {
                then = value.then;

                if (typeof then === 'function') {
                    then.call(value, function (value) {
                        if (!unwrapped) {
                            unwrapped = true;
                            self._unwrap(value);
                        }
                    }, function (reason) {
                        if (!unwrapped) {
                            unwrapped = true;
                            self.reject(reason);
                        }
                    });
                } else {
                    self.fulfill(value);
                }
            } catch (e) {
                if (!unwrapped) {
                    self.reject(e);
                }
            }
        },

        /**
        Schedule execution of a callback to either or both of "resolve" and
        "reject" resolutions of this resolver. If the resolver is not pending,
        the correct callback gets called automatically.
        @method _addCallbacks
        @param {Function} [callback] function to execute if the Resolver
                    resolves successfully
        @param {Function} [errback] function to execute if the Resolver
                    resolves unsuccessfully
        **/
        _addCallbacks: function (callback, errback) {
            var callbackList = this._callbacks,
                errbackList  = this._errbacks;

            // Because the callback and errback are represented by a Resolver, it
            // must be fulfilled or rejected to propagate through the then() chain.
            // The same logic applies to resolve() and reject() for fulfillment.
            if (callbackList) {
                callbackList.push(callback);
            }
            if (errbackList) {
                errbackList.push(errback);
            }

            switch (this._status) {
                case 'accepted':
                    this._unwrap(this._value);
                    break;
                case 'fulfilled':
                    this.fulfill(this._result);
                    break;
                case 'rejected':
                    this.reject(this._result);
                    break;
            }
        },

        /**
        Executes an array of callbacks from a specified context, passing a set of
        arguments.
        @method _notify
        @param {Function[]} subs The array of subscriber callbacks
        @param {Any} result Value to pass the callbacks
        @protected
        **/
        _notify: function (subs, result) {
            // Since callback lists are reset synchronously, the subs list never
            // changes after _notify() receives it. Avoid calling Y.soon() for
            // an empty list
            if (subs.length) {
                // Calling all callbacks after Promise.async to guarantee
                // asynchronicity. Because setTimeout can cause unnecessary
                // delays that *can* become noticeable in some situations
                // (especially in Node.js)
                Promise.async(function () {
                    var i, len;

                    for (i = 0, len = subs.length; i < len; ++i) {
                        subs[i](result);
                    }
                })
            }
        }

    })

    Promise.Resolver = Resolver



    /* ------------------------------------------ Promise ------------------------------------------ */


    // Promise1

    // function Promise1 (fn) {
    //     this._callbacks = []

    //     if ( fn ) {
    //         fn((result)=> {
    //             result.unshift(null)
    //             this.done.apply(this, result)
    //         },
    //         (result)=> {
    //             result.unshift(true)
    //             this.done.apply(this, result)
    //         })
    //     }
    // }

    // Promise1.prototype.then = function (func, err, context) {
    //     var p

    //     if ( typeof err !== 'function' ) {
    //         context = err
    //         err = null
    //     }

    //     if (this._isdone) {
    //         p = func.apply(context, this.result)
    //     } else {
    //         p = new Promise1()
    //         this._callbacks.push(function () {
    //             var res = func.apply(context, arguments)
    //             if (res && typeof res.then === 'function')
    //                 res.then(p.done, p)
    //         })
    //     }

    //     if (err) {
    //        p.catch(err, context) 
    //     }

    //     return p
    // }

    // Promise1.prototype.catch = function (func, context) {
    //     var p

    //     if (this._isdone) {
    //         if ( this.result[0] ) {
    //             p = func.apply(context, this.result)
    //         }
    //     } else {
    //         p = new Promise1()
    //         this._callbacks.push(function () {
    //             if ( arguments[0] ) {
    //                 var res = func.apply(context, arguments)
    //                 if (res && typeof res.then === 'function')
    //                     res.then(p.done, p)
    //             }
    //         })
    //     }
    //     return p
    // }

    // Promise1.prototype.done = function () {
    //     this.result = arguments
    //     this._isdone = true
    //     for (var i = 0; i < this._callbacks.length; i++) {
    //         this._callbacks[i].apply(null, arguments)
    //     }
    //     this._callbacks = []
    // }

    // function join (promises) {
    //     var p = new Promise1()
    //     var results = []

    //     if (!promises || !promises.length) {
    //         p.done(results)
    //         return p
    //     }

    //     var numdone = 0
    //     var total = promises.length

    //     function notifier (i) {
    //         return function () {
    //             numdone += 1
    //             results[i] = Array.prototype.slice.call(arguments)
    //             if (numdone === total) {
    //                 p.done(results)
    //             }
    //         }
    //     }

    //     for (var i = 0; i < total; i++) {
    //         promises[i].then(notifier(i))
    //     }

    //     return p
    // }

    // function chain (funcs, args) {
    //     var p = new Promise1()
    //     if (funcs.length === 0) {
    //         p.done.apply(p, args)
    //     } else {
    //         funcs[0].apply(null, args).then(function () {
    //             funcs.splice(0, 1)
    //             chain(funcs, arguments).then(function () {
    //                 p.done.apply(p, arguments)
    //             })
    //         })
    //     }
    //     return p
    // }

    /*
     * AJAX requests
     */

    function new_xhr (prefetch) {
        var xhr = new (prefetch ? sandboxWindow : window).XMLHttpRequest()

        // CORS 跨域支持 后端输出：header(“Access-Control-Allow-Origin：*“)

        if ( !("withCredentials" in xhr) ) {

            if ( typeof XDomainRequest != "undefined" ) {
                xhr = new XDomainRequest()
            } else {
                xhr = null
            }

        }

        return xhr
    }


    function ajax (method, url, data, headers, settings, type, id, prefetch) {
        if ( method.toUpperCase === 'JSONP' || /=\~/.test(url) ) {
            return origin(url, data, settings.caller, type, id)
        }

        return new Promise(function(resolve, reject){

            var xhr

            settings = settings || {}
            headers = headers || {}
            data = data || {}

            var payload = Object.objectToParams(data)
            var withCredentials = true

            if ( method === 'GET' && payload ) {
                url += (url.indexOf('?') != -1 ? '&' : '?') + payload
                payload = null
            }

            try {
                xhr = new_xhr(prefetch)
            } catch (e) {
                reject()
            }

            function open () {
                xhr.open(method, url, true)

                // 是否同域 withCredentials 解决跨域

                if ( url.indexOf('//') == 0 || url.indexOf('://') > 0 ) {

                    [window.location.host].concat(App.config.origin || []).each(function (i, host) {
                        i = url.indexOf(host)
                        if ( i !== -1 && i <= 16 ) {
                            withCredentials = false
                        }
                    })

                    if ( withCredentials && settings.origin !== 'true' ) xhr.withCredentials = true
                }

                if ( settings.contentType ) headers['Content-Type'] = settings.contentType

                var content_type = 'application/x-www-form-urlencoded'
                for (var h in headers) {
                    if (headers.hasOwnProperty(h)) {
                        if (h.toLowerCase() === 'content-type')
                            content_type = headers[h]
                        else
                            xhr.setRequestHeader(h, headers[h])
                    }
                }
                xhr.setRequestHeader('Content-type', content_type)
            }

            // abort

            function abort () {
                if ( timeout ) {
                    clearTimeout(tid)
                }

                xhr.abort()
            }

            // send

            function send () {
                open()
                xhr.send(payload)
            }

            // tryAgain

            function over () {

                abort()

                if ( tryAgain(url, abort, send, id) == false ) {
                    p.done(true, {}, {})
                }
            }

            // timeout

            var timeout = promise.ajaxTimeout
            if ( timeout ) {
                var tid = setTimeout(over, timeout)
            }

            xhr.onerror = over 

            xhr.onload = function () {
                if ( timeout ) {
                    clearTimeout(tid)
                }
                if ( xhr.readyState === 4 ) {
                    var err = (!xhr.status ||
                               (xhr.status < 200 || xhr.status >= 300) &&
                               xhr.status !== 304)

                    delete _tryAgain[url]

                    if ( err ) reject()

                    var data = xhr.responseText

                    if ( ['{', '['].consistOf(data.charAt(0)) ) {
                        try {
                            data = JSON.parse(data)
                        } catch (e) {
                            try {
                                data = application.sandbox.window.eval('(' + data + ')')
                            } catch (e) {}
                            
                            App.console[typeof data === 'object' ? 'warn' : 'error']('url[' + url + ']', 'SyntaxError', 'Unexpected token in JSON')
                        }
                    }

                    resolve([data, xhr])
                }
            }

            // open
            
            send()
        })
    }

    function _ajaxer (method) {
        return function (url, data, headers, settings, type, id) {
            return ajax(method, url, data, headers, settings, type, id)
        }
    }

    function origin (url, data, caller, type, id) {
        var p = new Promise1()
        var callbackName = !caller ? '__' + type + '__' + caller : '__call__' + (++_jsonPID)
        var script = sandboxDocument.createElement("script")

        var data = data || {}

        // JsonP data
        
        if ( caller ) {
            data[caller] = callbackName
        }

        var payload = Object.objectToParams(data)

        if ( payload ) {
            url += (url.indexOf('?') != -1 ? '&' : '?') + payload
            payload = null
        }

        // JsonP URL

        url = url.replace(/=\~/, '=' + callbackName)

        // abort

        function abort () {
            if ( timeout ) {
                clearTimeout(tid)
            }

            try {
                sandboxDocumentHead.removeChild(script)
            } catch (e) {}
        }

        // send

        function send () {
            script = sandboxDocument.createElement("script")
            script.charset = 'utf-8'
            script.src = url

            // failed

            script.onerror = over

            sandboxDocumentHead.appendChild(script)
        }

        // 错误处理

        function over () {

            abort()

            if ( tryAgain(url, abort, send, id) == false ) {
                p.done(true, {}, {})
            }
        }

        // DEBUG

        sandboxWindow.onerror = function (e) {
            over()
            application.trigger('jsonerror', e)
        }

        // timeout
        
        var timeout = promise.ajaxTimeout
        if ( timeout ) {
            var tid = setTimeout(over, timeout)
        }

        // callback ! 超时被移除的script加载成功后仍会被执行
        
        sandboxWindow[callbackName] = function (data, type) {
            abort()

            if ( (type == 'data' || type == 'js') && typeof data !== 'object' ) return

            delete sandboxWindow[callbackName]
            delete _tryAgain[url]

            p.done(null, data, {})
        }

        send()

        return p
    }

    function tryAgain (url, abort, send, id) {
        var again = _tryAgain[url] || 1
        var module = App.modules[id]

        if ( module ) {
            module.trigger('failedtoload', {
                id : id,
                url : url,
                again : again
            })
        }

        if ( again && again >= promise.TRYAGAIN ) return false

        // again times++

        again++
        _tryAgain[url] = again

        function regain () {
            abort()
            
            setTimeout(function () {
                send()
            }, 1000)

            if ( !_tryAgain[url] ) {
                window.removeEventListener("online", regain, false)
            }
        }

        if ( navigator.onLine === false ) {
            window.addEventListener("online", regain, false)
        } else {
            setTimeout(function () {
                send()
            }, 3000)
        }

        return again
    }

    // JsonP define

    sandboxWindow.define = function (type, name, context) {
        sandboxWindow['__' + type + '__' + name](context, type)
    }

    sandboxWindow.style = function (name, context) {
        sandboxWindow['__style__' + name](context, 'style')
    }

    sandboxWindow.source = function (name, context) {
        sandboxWindow['__source__' + name](context, 'source')
    }

    sandboxWindow.data = function (name, context) {
        sandboxWindow['__data__' + name](context, 'source')
    }

    var promise = {
        Promise: Promise,
        // all: join,
        // join: join,
        // chain: chain,
        ajax: ajax,
        origin: origin,
        get: _ajaxer('GET'),
        post: _ajaxer('POST'),
        put: _ajaxer('PUT'),
        del: _ajaxer('DELETE'),

        /* Error codes */
        // ENOXHR: 1,
        // ETIMEOUT: 2,

        /* Network error then try again */
        TRYAGAIN: 3,

        /**
         * Configuration parameter: time in milliseconds after which a
         * pending AJAX request is considered unresponsive and is
         * aborted. Useful to deal with bad connectivity (e.g. on a
         * mobile network). A 0 value disables AJAX timeouts.
         *
         * Aborted requests resolve the promise with a ETIMEOUT error
         * code.
         */
        ajaxTimeout: 60000
    }


    module.exports = promise

})