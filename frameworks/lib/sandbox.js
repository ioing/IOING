// 民不畏威，则大威至。

define('~/sandbox', [], function (require, module, exports) {
    
    "use strict"

    // Sandbox

    function Sandbox (unify, proto, whitebox) {
        var sandbox, content, context

        this.sandbox = this.iframe = sandbox = document.createElement('iframe')

        // 沙箱拓为明箱及暗箱之别 whitebox && blackbox

        if ( !whitebox ) {
            sandbox.style.display = 'none'
            document.head.appendChild(sandbox)

            this.init()
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

        extend : function (un) {

            // 获取被支持的iframe

            __defineUnify__(this.window)

            if ( !un ) {
                __defineProto__(this.window)
            }

            return this
        },

        open : function () {
            this.sandbox.contentDocument.open()

            return this
        },

        write : function (style, script) {
            var context

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

            this.sandbox.contentDocument.write(context)
            

            return this
        },

        close : function () {
            this.sandbox.contentDocument.close()
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

    // SandboxFunction

    var sandbox = new Sandbox(),
        sandboxWindow = sandbox.window,
        SandboxFunction = sandboxWindow.Function

    sandbox.extend(true)
    sandbox.exit()

    // shadowRootFunction

    var shadowRoot = new Sandbox()
      , shadowRootWindow = shadowRoot.window
      , ShadowRootFunction = shadowRootWindow.Function

    shadowRoot.extend(true)

    module.exports = {
        sandbox : Sandbox,
        sandboxWindow : sandboxWindow,
        SandboxFunction : SandboxFunction,
        shadowRootWindow : shadowRootWindow,
        ShadowRootFunction : ShadowRootFunction,
    }

})
