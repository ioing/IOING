'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// 民不畏威，则大威至。

define('~/sandbox', [], function (require, module, exports) {

    "use strict";

    // Sandbox

    function Sandbox(unify, proto, whitebox) {
        var sandbox, content, context;

        this.sandbox = this.iframe = sandbox = document.createElement('iframe');

        // 沙箱拓为明箱及暗箱之别 whitebox && blackbox

        if (!whitebox) {
            sandbox.style.display = 'none';
            document.head.appendChild(sandbox);

            this.init();
        }
    }

    Sandbox.prototype = {
        init: function init() {
            var content = this.sandbox.contentDocument;

            // init

            content.open();
            content.write('');
            content.close();

            this.window = this.sandbox.contentWindow.window;
            this.document = this.sandbox.contentWindow.document;

            return this;
        },

        extend: function extend(un) {

            // 获取被支持的iframe

            __defineUnify__(this.window);

            if (!un) {
                __defineProto__(this.window);
            }

            return this;
        },

        open: function open() {
            this.sandbox.contentDocument.open();

            return this;
        },

        write: function write(style, script) {
            var context;

            if (style || script) {
                context = '<!DOCTYPE html>' + '<html>' + '<head>' + (style ? style : '') + (script ? script : '') + '</head>' + '<body>' + '</body>' + '</html>';
            } else {
                context = '<head><meta charset="utf-8"></head>';
            }

            this.sandbox.contentDocument.write(context);

            return this;
        },

        close: function close() {
            this.sandbox.contentDocument.close();
        },

        exit: function exit() {
            document.head.removeChild(this.sandbox);
        },

        load: function load(files, callback) {
            files = (typeof files === 'undefined' ? 'undefined' : _typeof(files)) == 'object' ? files : [files];

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

        // SandboxFunction

    };var sandbox = new Sandbox(),
        sandboxWindow = sandbox.window,
        SandboxFunction = sandboxWindow.Function;

    sandbox.extend(true);
    sandbox.exit();

    // shadowRootFunction

    var shadowRoot = new Sandbox(),
        shadowRootWindow = shadowRoot.window,
        ShadowRootFunction = shadowRootWindow.Function;

    shadowRoot.extend(true);

    module.exports = {
        sandbox: Sandbox,
        sandboxWindow: sandboxWindow,
        SandboxFunction: SandboxFunction,
        shadowRootWindow: shadowRootWindow,
        ShadowRootFunction: ShadowRootFunction
    };
});