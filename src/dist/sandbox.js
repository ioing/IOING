'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// 民不畏威，则大威至。

define('~/sandbox', [], function (require, module, exports) {

  "use strict";

  // Sandbox

  var Sandbox = function () {
    function Sandbox(whitebox) {
      _classCallCheck(this, Sandbox);

      var sandbox = void 0,
          content = void 0,
          context = void 0;

      this.sandbox = this.iframe = sandbox = document.createElement('iframe');

      // 沙箱拓为明箱及暗箱之别 whitebox && blackbox

      if (!whitebox) {
        sandbox.style.display = 'none';
        document.head.appendChild(sandbox);

        this.init();
      }
    }

    _createClass(Sandbox, [{
      key: 'init',
      value: function init() {
        var content = this.sandbox.contentDocument;

        // init

        content.open();
        content.write('');
        content.close();

        this.window = this.sandbox.contentWindow.window;
        this.document = this.sandbox.contentWindow.document;

        return this;
      }
    }, {
      key: 'unify',
      value: function unify(un) {

        // 获取被支持的iframe

        __defineUnify__(this.window);

        if (!un) {
          __defineProto__(this.window);
        }

        return this;
      }
    }, {
      key: 'open',
      value: function open() {
        this.sandbox.contentDocument.open();

        return this;
      }
    }, {
      key: 'write',
      value: function write(style, script) {
        var context = void 0;

        if (style || script) {
          context = '<!DOCTYPE html>' + '<html>' + '<head>' + (style ? style : '') + (script ? script : '') + '</head>' + '<body>' + '</body>' + '</html>';
        } else {
          context = '<head><meta charset="utf-8"></head>';
        }

        this.sandbox.contentDocument.write(context);

        return this;
      }
    }, {
      key: 'close',
      value: function close() {
        this.sandbox.contentDocument.close();
      }
    }, {
      key: 'exit',
      value: function exit() {
        document.head.removeChild(this.sandbox);
      }
    }, {
      key: 'load',
      value: function load(files, callback) {
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
    }]);

    return Sandbox;
  }();

  // SandboxFunction

  var sandbox = new Sandbox(),
      sandboxWindow = sandbox.window,
      SandboxFunction = sandboxWindow.Function;

  sandbox.unify(true);
  sandbox.exit();

  // shadowRootFunction

  var shadowRoot = new Sandbox(),
      shadowRootWindow = shadowRoot.window,
      ShadowRootFunction = shadowRootWindow.Function;

  shadowRoot.unify(true);

  module.exports = {
    sandbox: Sandbox,
    sandboxWindow: sandboxWindow,
    SandboxFunction: SandboxFunction,
    shadowRootWindow: shadowRootWindow,
    ShadowRootFunction: ShadowRootFunction
  };
});