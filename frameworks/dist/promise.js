'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// 民不畏威，则大威至。

define('~/promise', ['~/sandbox'], function (require, module, exports) {

    "use strict";

    function Promise() {
        this._callbacks = [];
    }

    Promise.prototype.then = function (func, context) {
        var p;

        if (this._isdone) {
            p = func.apply(context, this.result);
        } else {
            p = new Promise();
            this._callbacks.push(function () {
                var res = func.apply(context, arguments);
                if (res && typeof res.then === 'function') res.then(p.done, p);
            });
        }
        return p;
    };

    Promise.prototype.done = function () {
        this.result = arguments;
        this._isdone = true;
        for (var i = 0; i < this._callbacks.length; i++) {
            this._callbacks[i].apply(null, arguments);
        }
        this._callbacks = [];
    };

    function join(promises) {
        var p = new Promise();
        var results = [];

        if (!promises || !promises.length) {
            p.done(results);
            return p;
        }

        var numdone = 0;
        var total = promises.length;

        function notifier(i) {
            return function () {
                numdone += 1;
                results[i] = Array.prototype.slice.call(arguments);
                if (numdone === total) {
                    p.done(results);
                }
            };
        }

        for (var i = 0; i < total; i++) {
            promises[i].then(notifier(i));
        }

        return p;
    }

    function chain(funcs, args) {
        var p = new Promise();
        if (funcs.length === 0) {
            p.done.apply(p, args);
        } else {
            funcs[0].apply(null, args).then(function () {
                funcs.splice(0, 1);
                chain(funcs, arguments).then(function () {
                    p.done.apply(p, arguments);
                });
            });
        }
        return p;
    }

    /*
     * AJAX requests
     */

    function new_xhr() {
        var xhr = new XMLHttpRequest();

        // CORS 跨域支持 后端输出：header(“Access-Control-Allow-Origin：*“)

        if (!("withCredentials" in xhr)) {

            if (typeof XDomainRequest != "undefined") {
                xhr = new XDomainRequest();
            } else {
                xhr = null;
            }
        }

        return xhr;
    }

    function ajax(method, url, data, headers, settings, type, id) {
        if (method.toUpperCase === 'JSONP' || /=\~/.test(url)) {
            return origin(url, data, settings.caller, type, id);
        }

        var p = new Promise();
        var xhr;

        settings = settings || {};
        headers = headers || {};
        data = data || {};

        var payload = Object.objectToParams(data);
        var withCredentials = true;

        if (method === 'GET' && payload) {
            url += (url.indexOf('?') != -1 ? '&' : '?') + payload;
            payload = null;
        }

        try {
            xhr = new_xhr(method, url);
        } catch (e) {
            p.done(promise.ENOXHR, "");
            return p;
        }

        function open() {
            xhr.open(method, url, true);

            // 是否同域 withCredentials 解决跨域

            if (url.indexOf('//') == 0 || url.indexOf('://') > 0) {

                [window.location.host].concat(App.config.origin || []).each(function (i, host) {
                    i = url.indexOf(host);
                    if (i !== -1 && i <= 16) {
                        withCredentials = false;
                    }
                });

                if (withCredentials && settings.origin !== 'true') xhr.withCredentials = true;
            }

            if (settings.contentType) headers['Content-Type'] = settings.contentType;

            var content_type = 'application/x-www-form-urlencoded';
            for (var h in headers) {
                if (headers.hasOwnProperty(h)) {
                    if (h.toLowerCase() === 'content-type') content_type = headers[h];else xhr.setRequestHeader(h, headers[h]);
                }
            }
            xhr.setRequestHeader('Content-type', content_type);
        }

        // abort

        function abort() {
            if (timeout) {
                clearTimeout(tid);
            }

            xhr.abort();
        }

        // send

        function send() {
            open();
            xhr.send(payload);
        }

        // tryAgain

        function over() {

            abort();

            if (tryAgain(url, abort, send, id) == false) {
                p.done(true, {}, {});
            }
        }

        // timeout

        var timeout = promise.ajaxTimeout;
        if (timeout) {
            var tid = setTimeout(over, timeout);
        }

        xhr.onerror = over;

        xhr.onload = function () {
            if (timeout) {
                clearTimeout(tid);
            }
            if (xhr.readyState === 4) {
                var err = !xhr.status || (xhr.status < 200 || xhr.status >= 300) && xhr.status !== 304;

                delete _tryAgain[url];

                var data = xhr.responseText;

                if (['{', '['].consistOf(data.charAt(0))) {
                    try {
                        data = JSON.parse(data);
                    } catch (e) {
                        try {
                            data = application.sandbox.window.eval('(' + data + ')');
                        } catch (e) {}
                    }
                }

                p.done(err, data, xhr);
            }
        };

        // open

        send();

        return p;
    }

    function _ajaxer(method) {
        return function (url, data, headers, settings, type, id) {
            return ajax(method, url, data, headers, settings, type, id);
        };
    }

    function origin(url, data, caller, type, id) {
        var p = new Promise();
        var callbackName = !caller ? '__' + type + '__' + caller : '__call__' + ++_jsonPID;
        var script = sandboxDocument.createElement("script");

        var data = data || {};

        // JsonP data

        if (caller) {
            data[caller] = callbackName;
        }

        var payload = Object.objectToParams(data);

        if (payload) {
            url += (url.indexOf('?') != -1 ? '&' : '?') + payload;
            payload = null;
        }

        // JsonP URL

        url = url.replace(/=\~/, '=' + callbackName);

        // abort

        function abort() {
            if (timeout) {
                clearTimeout(tid);
            }

            try {
                sandboxDocumentHead.removeChild(script);
            } catch (e) {}
        }

        // send

        function send() {
            script = sandboxDocument.createElement("script");
            script.charset = 'utf-8';
            script.src = url;

            // failed

            script.onerror = over;

            sandboxDocumentHead.appendChild(script);
        }

        // 错误处理

        function over() {

            abort();

            if (tryAgain(url, abort, send, id) == false) {
                p.done(true, {}, {});
            }
        }

        // DEBUG

        sandboxWindow.onerror = function (e) {
            over();
            application.trigger('jsonerror', e);
        };

        // timeout

        var timeout = promise.ajaxTimeout;
        if (timeout) {
            var tid = setTimeout(over, timeout);
        }

        // callback ! 超时被移除的script加载成功后仍会被执行

        sandboxWindow[callbackName] = function (data, type) {
            abort();

            if ((type == 'data' || type == 'js') && (typeof data === 'undefined' ? 'undefined' : _typeof(data)) !== 'object') return;

            delete sandboxWindow[callbackName];
            delete _tryAgain[url];

            p.done(null, data, {});
        };

        send();

        return p;
    }

    function tryAgain(url, abort, send, id) {
        var again = _tryAgain[url] || 1;
        var module = App.modules[id];

        if (module) {
            module.trigger('failedtoload', {
                id: id,
                url: url,
                again: again
            });
        }

        if (again && again >= promise.TRYAGAIN) return false;

        // again times++

        again++;
        _tryAgain[url] = again;

        function regain() {
            abort();

            setTimeout(function () {
                send();
            }, 1000);

            if (!_tryAgain[url]) {
                window.removeEventListener("online", regain, false);
            }
        }

        if (navigator.onLine === false) {
            window.addEventListener("online", regain, false);
        } else {
            setTimeout(function () {
                send();
            }, 3000);
        }

        return again;
    }

    var Sandbox = require('~/sandbox').sandbox,
        sandbox = new Sandbox(true),
        sandboxWindow = sandbox.window,
        sandboxDocument = sandbox.document,
        sandboxDocumentHead = sandboxDocument.head,
        _jsonPID = 0,
        _tryAgain = [];

    // JsonP define

    sandboxWindow.define = function (type, name, context) {
        sandboxWindow['__' + type + '__' + name](context, type);
    };

    sandboxWindow.style = function (name, context) {
        sandboxWindow['__style__' + name](context, 'style');
    };

    sandboxWindow.source = function (name, context) {
        sandboxWindow['__source__' + name](context, 'source');
    };

    sandboxWindow.data = function (name, context) {
        sandboxWindow['__data__' + name](context, 'source');
    };

    var promise = {
        Promise: Promise,
        join: join,
        chain: chain,
        ajax: ajax,
        origin: origin,
        get: _ajaxer('GET'),
        post: _ajaxer('POST'),
        put: _ajaxer('PUT'),
        del: _ajaxer('DELETE'),

        /* Error codes */
        ENOXHR: 1,
        ETIMEOUT: 2,

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
    };

    module.exports = promise;
});