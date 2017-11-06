'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// 天下皆知美之为美，斯恶已。皆知善之为善，斯不善已

define('~/transform', [], function (require, module, exports) {

  'use strict';

  var rAF = window.requestAnimationFrame;
  var rIC = window.requestIdleCallback;
  var Animations = {
    flip: function flip(e) {
      e.in.duration(0).perspective(1000).to(0, 0, 0).opacity(0).rotate3d(0, 1, 0, 90 * e.direction).end(function () {
        e.out.duration(300).perspective(1000).rotate3d(0, 1, 0, -90 * e.direction).end(function () {
          e.out.duration(0).opacity(0).end();
          e.in.duration(0).to(0, 0, 0).opacity(1).rotate3d(0, 1, 0, 90 * e.direction).end(function () {
            e.in.duration(300).rotate3d(0, 1, 0, 0).end(function () {
              e.callback(false);
            });
          });
        });
      });
    },
    fade: function fade(type) {
      return function (e) {
        var inO = void 0,
            outO = void 0,
            inV = void 0,
            outV = void 0;
        switch (type) {
          case 0:
            inO = 1;
            outO = 0;
            inV = e.in;
            outV = e.out;
            break;
          case 1:
            inO = 0;
            outO = 1;
            inV = outV = e.in;
        }
        inV.duration(0).to(0, 0, 0).opacity(inO).end(function () {
          outV.duration(300).opacity(outO).end(function () {
            e.callback(false);
          });
        });
      };
    },
    slide: function slide(type) {
      return function (e) {
        var inX = void 0,
            outX = void 0,
            inY = void 0,
            outY = void 0;
        switch (type) {
          case 0:
            outY = e.height;
            inY = -outY;
            inX = outX = 0;
            break;
          case 1:
            inX = e.width;
            outX = -inX;
            inY = outY = 0;
            break;
          case 2:
            inY = e.height;
            outY = -inY;
            inX = outX = 0;
            break;
          case 3:
            outX = e.width;
            inX = -outX;
            inY = outY = 0;
            break;
        }

        e.in.duration(0).to(inX, inY, 0).end(function () {
          e.in.duration(300).to(0, 0, 0).end();
          e.out.duration(300).to(outX, outY, 0).end(function () {
            e.callback(false);
          });
        });
      };
    },
    zoom: function zoom(type) {
      return function (e) {
        e.in.origin(type == 0 ? e.attach : e.origin).duration(0).to(0, 0, 0).scale(type == 0 ? 2.5 : 0).end(function () {
          e.out.origin(type == 1 ? e.attach : e.origin).duration(0).to(0, 0, 0).opacity(1).scale(1).end(function () {
            e.in.duration(300).to(0, 0, 0).scale(1).end();
            e.out.duration(300).opacity(type == 0 ? 0 : 1).scale(type == 0 ? 0 : 2.5).end(function () {
              e.callback(false);
            });
          });
        });
      };
    }

    // Trans to this module

  };
  var Transform = function () {
    function Transform() {
      _classCallCheck(this, Transform);

      // animations

      this.Animations = Animations;
    }

    _createClass(Transform, [{
      key: 'init',
      value: function init(DNA) {

        var that = this;

        this.DNA = DNA;
        this.LIMIT = [];
        this.queue = [];
        this.singleflowtimes = 0;

        // go to history

        window.on("hashchange popstate", function (event) {

          // hashchange popstate

          if (App.equalsParam(that.prehistory, window.location.hash)) return;

          // pre history

          that.prehistory = window.location.hash;

          // EXISTS

          that.back();

          // unique

          setTimeout(function () {
            that.prehistory = null;
          }, 0);
        });

        // creat relative view

        var relativeViewport = document.createElement('relative-windows');
        relativeViewport.id = "relative-viewport";
        relativeViewport.style.position = "absolute";
        relativeViewport.style.zIndex = 1;
        relativeViewport.style.width = relativeViewport.style.height = "100%";
        relativeViewport.style.overflow = "hidden";

        // set DNA

        DNA(relativeViewport);

        App.relativeViewport = relativeViewport;

        // creat absolute view

        var absoluteViewport = document.createElement('absolute-windows');
        absoluteViewport.id = "absolute-viewport";
        absoluteViewport.style.position = "absolute";
        absoluteViewport.style.zIndex = 10000;
        absoluteViewport.style.width = absoluteViewport.style.height = "100%";
        absoluteViewport.style.overflow = "hidden";

        // set DNA

        DNA(absoluteViewport);

        App.absoluteViewport = absoluteViewport;

        // creat fixed view

        var fixedViewport = document.createElement('fixed-windows');
        fixedViewport.id = "fixed-viewport";
        fixedViewport.style.position = "fixed";
        fixedViewport.style.zIndex = 999999;
        fixedViewport.style.width = "100%";
        absoluteViewport.style.height = "0";
        fixedViewport.style.overflow = "visible";

        // set DNA

        DNA(fixedViewport);

        App.fixedViewport = fixedViewport;

        // append to document

        document.body.appendChild(App.relativeViewport);
        document.body.appendChild(App.absoluteViewport);
        document.body.appendChild(App.fixedViewport);
      }
    }, {
      key: 'setup',
      value: function setup(options) {

        this.options = options;

        var currpage = options.currpage;
        var homepage = options.homepage || "frameworks";
        var exists = options.exists;
        var singleflow = options.singleflow;
        var singlelocking = options.singlelocking;

        if (singleflow) {

          // inset homepage history

          if (!exists && currpage !== homepage) {
            this.hash(homepage, null, 0);
          }

          if (singlelocking != null && homepage) {
            this.hash(homepage, null, 1);
          }
        }
      }
    }, {
      key: 'back',
      value: function back() {

        // Target module id & param

        var route = App.route();
        var id = route.id || this.options.homepage || 'frameworks';
        var param = route.param;
        var module = App.modules[id];

        // close App

        if (this.options.singlelocking === -1 && App._inHistory === history.length - 1) return window.history.back();

        // level == 0 return

        if (this.options.singlelocking === true && (this.id === "frameworks" || this.module.config.level === 0)) {

          this.singleflowtimes++;

          // push hash

          this.hash(this.id, this.param, 1);

          // exit App

          App.trigger('exit', {
            singleflow: this.singleflowtimes
          });

          return;
        }

        this.singleflowtimes = 0;

        // no module or no hashchange block trans

        if (this.id === id && App.equalsParam(this.param, param)) return;

        // continuity back or trans to module

        if (this.options.singleflow && module && module.config.level !== 0 && module.config.level >= this.module.config.level) {

          // back to >> 0

          return window.history.back();
        }

        // to

        this.to(id, param, -1);

        // history back event

        App.trigger('back', {
          id: id,
          module: module
        });
      }
    }, {
      key: 'hash',
      value: function hash(id, param, prepush) {

        id = id || this.id;

        // prepush

        prepush = prepush === undefined ? true : prepush;

        // remot module id

        id = this.reid(id);

        // param trim all \s

        param = param ? param.replace(/\s/g, '') : '';

        switch (prepush) {
          case 0:
            window.history.replaceState({
              id: id
            }, null, '#' + id + '/' + param);

            break;
          case 1:
            window.history.pushState({
              id: id
            }, null, '#' + id + '/' + param);

            break;
          default:
            window.location.hash = id + '/' + param;

            break;
        }

        // mark EXISTS

        App.exists(true);
      }
    }, {
      key: 'status',
      value: function status(id, param, push) {
        // param = (this.module.param || this.param || {}).extend(param).objectToParams()

        id = id || this.id;
        param = (this.module.param || this.param || {}).extend(param).objectToParams(null, 1);

        // push or replace

        if (push) {
          this.hash(id, param);
        } else {

          // remot module id

          window.history.replaceState({}, null, '#' + this.reid(id) + '/' + (param ? param.replace(/\s/g, '') : ''));
        }

        this.module.setParam(param);
      }
    }, {
      key: 'reid',
      value: function reid(id) {

        // remot module id

        return (/\//.test(id) && id.indexOf('[') !== 0 ? '!' + id + '!' : id
        );
      }
    }, {
      key: 'get',
      value: function get(id, od, callback) {
        var _this = this;

        var nofind = this.options.nofindpage || '404';

        // open loading

        this.loading(od, 1);

        App.get(id, function (module) {

          if (!App.modules[id] && id !== module.id) {
            App.modules[id] = module.cloneAsNew(id);
          }

          // close loading

          _this.loading(od, 0);

          // RE

          callback(module);
        }, function () {
          callback();

          if (id === nofind) return;
          _this.loading(od, 0);
          _this.to(nofind);
        });

        return this;
      }
    }, {
      key: 'to',
      value: function to(id, param, history, events, callback) {
        var _this2 = this;

        var args = arguments;

        if (!id) return this;

        // filter

        if (this._process === 0) {
          if (history == -1) {
            this.queue.push(args);
          } else {
            this.queue = [];
          }

          return this;
        }

        // 一致清理，和上面区分

        if (history !== -1) {
          this.queue = [];
        }

        // clear again back

        this.singleflowtimes = 0;

        // is number ? go to history

        if (!isNaN(id)) {
          switch (Number(id)) {
            case -1:
              window.history.back();
              return this;
              break;
            case 0:
              return this;
              break;
          }
        }

        // in the process !!! after: history.back()

        this._process = 0;

        // check module config

        if (App.modules[id] === undefined) {
          return this.get(id, od, function (module) {
            _this2._process = -1;

            if (module) {
              _this2.to.apply(_this2, args);
            } else {
              _this2.next();
            }
          });
        }

        // nomal param url

        param = App.getParam(param);

        // this extend

        this.id = id;
        this.param = param;
        this.events = events;
        this.callback = callback || noop; // reset callback

        // od & id

        var od = this.od;
        var ids = od ? [id, od] : [id];
        var module = App.modules[id];
        var modulu = App.modules[od];
        var moduli = od ? [module, modulu] : [module];

        // update events

        if (events) {
          module.events = events;
        }

        // all back frameworks

        if (id === "frameworks") {
          history = -1;
        }

        // self module

        this.self = id == od;

        // close pre loading

        this.loading(od, 0);
        this.loading(id, 0);

        // check fetch

        this.check(module, param);

        // activity page = this page ? return

        if (od && this.self && module.dimension === param && module.loaded && !module.update) {
          this._process = -1;
          return this;
        }

        // module cheak end then apply this

        this.ids = ids;
        this.module = module;
        this.modulu = modulu;
        this.moduli = moduli;

        // set param && update

        module.rsetParam().setParam(param, true);

        // check update

        if (module.getStatus() !== 1) {
          module.update = true;
        }

        // get animation

        this.animation = !App._EXISTS || this.self ? false : (history == -1 ? modulu : module).config.animation;

        if (this.animation == true || this.animation == "inherit") {
          this.animation = App.frameworks.config.animation;
        }

        if (typeof this.animation == "string") {
          this.animation = this.animations(this.animation);
        }

        this.cutting = od && module.config.absolute != modulu.config.absolute ? true : false;

        // module is infinite or module Ele ? creat new elements

        if (!module.elements.container) this.container(id);

        // transform start

        this.start(function () {

          // first page

          if (!od) {
            _this2.cut();
            _this2.end();
          }

          // history -1 ? 0 : ++
          /**
           * push history build pre view
           * hashchange 应该在试图转换之前插入，因为右滑会退效果会记录hashchange后的dom改变视图
           */

          if (history !== -1) _this2.hash(id, param, history);

          // pre module

          App.id = _this2.od = id;
          App.module = module;

          // build content

          _this2.build(id, function (module, fn) {

            var callback = function callback() {

              // timeout wait

              if (!module) return;

              // start render

              fn && fn();

              // unlock

              _this2._process = 1;

              // _process

              _this2.next();
            };

            // not first ?

            if (od) {
              _this2.transform(function () {
                callback();
              });
            } else {
              callback();
            }
          });
        });

        return this;
      }
    }, {
      key: 'next',
      value: function next() {
        var _this3 = this;

        // queue

        rIC(function () {
          if (_this3.queue.length) {
            _this3.to.apply(_this3, _this3.queue.shift());
          }
        });
      }

      // 检测 cache 周期

    }, {
      key: 'check',
      value: function check(module, param) {

        if (Date.now() - module.updatetime[param] > module.config.cache * 1000) {
          delete module.prefetch[param];

          module.dimension = false;
        }

        // is prefetched ?

        this.prefetched = module.prefetch[param] ? true : false;
      }
    }, {
      key: 'build',
      value: function build(id, readied) {
        var _this4 = this;

        var module = this.module;
        var config = module.config;
        var timeout = config.timeout;

        if (typeof timeout === 'number') {
          if (timeout === 0) {
            module.update = true;
          } else if (Date.now() - module.timestamp >= timeout) {
            module.timeout = true;
          }
        }

        if (module.loaded !== true || module.update === true || config.update === true) {
          // 毁灭

          module.destroy(1);

          // 联网且预览或预取

          if (App._EXISTS == true && navigator.onLine !== false && (this.prefetched || config.preview)) {
            this.include(id, null, readied);
          } else {
            readied(module, function () {
              _this4.include(id);
            });
          }
        } else {
          readied(module, function () {

            // 刷新远程应用

            if (module.timeout) {
              module.timeout = false;
              module.refresh();
            }
          });
        }
      }
    }, {
      key: 'limit',
      value: function limit(id, module) {
        var index = this.LIMIT.indexOf(id);

        // 不可被极限破坏

        if (module.config.destroy === false) return;

        // 将已有模块推移

        if (index !== -1) this.LIMIT.splice(index, 1);

        // push 此模块记录

        this.LIMIT.push(id);

        // limit module

        if (this.LIMIT.length > this.options.limit) {
          App.modules[this.LIMIT.splice(0, 1)].clearCache(true, true).destroy(-1);
        }
      }
    }, {
      key: 'reset',
      value: function reset(id, rested) {
        var module = App.modules[id];
        var config = module.config;
        var container = module.elements.container;
        var frameworks = ["frameworks", "system"].consistOf(id);

        // clear style

        container.style.cssText = '';

        if (!frameworks) {
          container.css({
            "position": "absolute",
            "z-index": (Number(module.config.level) || 0) + 1,
            "background": config.background || "",
            "transform": rested ? "translate3d(0, 0, 0)" : "translate3d(200%, 200%, 0)"
          });
        }
      }
    }, {
      key: 'update',
      value: function update(id, param, prefetch, readied) {
        this.include(id, function (module, render) {
          if (prefetch) {
            prefetch(render);
          } else {
            render();
          }
        }, function (module, render) {
          if (readied) {
            readied(render);
          } else {
            render();
          }
        });
      }
    }, {
      key: 'include',
      value: function include(id, prefetch, readied) {
        var _this5 = this;

        var that = this;
        var module = this.module;
        var dimension = module.dimension;
        var transTimeoutId = void 0,
            loadTimeoutId = void 0;

        // lock module

        module.status[dimension] = 0;
        module.timeout = false;

        // limit

        this.limit(id, module);

        // open loading

        loadTimeoutId = setTimeout(function () {
          module.loading(1);

          if (_this5.modulu && module.config.preview) {
            _this5.modulu.loading(1);
          }
        }, 1200);

        // 最长加载超时

        if (readied) {
          transTimeoutId = setTimeout(function () {

            // 超时转场

            _this5._process = -2;
            readied();
          }, 2000);
        }

        // preload on event

        if (typeof module.events.preload === "function") {
          module.events.preload();
        }

        // include module page

        module.Template = App.template(id).prefetch(function (module, callback) {

          module.trigger('fetch');

          // clear loadingTimeId

          clearTimeout(loadTimeoutId);

          // close pre loading

          if (that.modulu) {
            that.modulu.loading(0);
          }

          // callback

          if (prefetch) {
            prefetch(module, callback);
          } else {
            callback();
          }
        }).then(function (module, callback) {

          // clear transTimeoutId

          clearTimeout(transTimeoutId);

          // module status

          module.status[dimension] = 1;

          // module element loaded

          module.loaded = true;
          module.trigger('load');

          // callback

          if (readied && that._process !== -2) {

            // 给足 DOM 渲染时间

            rIC(function () {
              return readied(module, callback);
            });
          } else {
            callback();
            that.next();
          }

          // prefetch callback

          that.callback(module);

          // preload on event

          if (typeof module.events.load === "function") {
            module.events.load();
          }

          // moduleload

          App.trigger('moduleload', {
            module: module
          });
        }).get(function (module) {

          // end time

          module.timestamp = Date.now();

          // close loading

          module.loading(0);
        }).error(function (module) {

          that._process = -1;

          module.trigger('error');

          // module status

          module.status[dimension] = -1;

          // callback

          if (readied) {
            readied(module);
          }

          // onerror

          if (typeof module.onerror === "function") {
            module.onerror();
          }
        });
      }
    }, {
      key: 'loading',
      value: function loading(id, display) {
        var modules = App.modules,
            module = modules[id],
            loader = void 0;

        if (!module || module.refreshing) return;

        // 全局 loading 设定

        loader = module.events.loading;
        loader = typeof loader == 'function' ? loader : loader !== false ? App.modules.frameworks.events : null;

        if (typeof loader == 'function') {
          return loader.apply(this, arguments);
        }

        loader = module.elements.loader;

        // open loader or close loader

        switch (display) {
          case 0:

            if (!loader) return;

            loader.hide();
            module.elements.loader.hidden = true;
            module.elements.loader.cont.remove();

            delete module.elements.loader;

            break;

          case 1:

            if (loader && loader.hidden === false) return;

            var size = 38 * device.ui.scale,
                opts = {
              shape: "roundRect",
              diameter: size * devicePixelRatio,
              density: 12,
              speed: 1,
              FPS: 12,
              range: 0.95,
              color: "#999999"
            },
                config = module.config.loader || modules['frameworks'].config.loader;

            // loader config

            if (config) {
              opts.extend(config);
            }

            loader = new Loader(module.elements.container, {
              safeVML: true
            });
            loader.setShape(opts.shape);
            loader.setDiameter(opts.diameter);
            loader.setDensity(opts.density);
            loader.setSpeed(opts.speed);
            loader.setFPS(opts.FPS);
            loader.setRange(opts.range);
            loader.setColor(opts.color);

            loader.cont.style.position = "absolute";
            loader.cont.style.zIndex = 999;
            loader.cont.style.top = loader.cont.style.left = "50%";
            loader.cont.style.marginTop = loader.cont.style.marginLeft = size * -0.5 + "px";
            loader.cont.style.width = loader.cont.style.height = size + "px";

            loader.cont.children.each(function (i, can) {
              can.style.width = can.style.height = size + "px";
            });

            loader.show();

            module.elements.loader = loader;
            module.elements.loader.hidden = false;

            break;
        }
      }
    }, {
      key: 'container',
      value: function container(id) {
        var that = this;
        var module = App.modules[id];
        var config = module.config;
        var target = id == "system" ? App.fixedViewport : config.absolute === false ? App.relativeViewport : App.absoluteViewport;

        var container = document.createElement("module-container");
        container.setAttribute("name", id);
        container.setAttribute("type", ["frameworks", "system"].consistOf(id) ? id : "module");

        // set DNA

        this.DNA(container);

        // set module container

        module.addElement('container', container);

        // reset status

        this.reset(id, this.cutting || !this.animation);

        // append

        target.appendChild(container);
      }
    }, {
      key: 'animations',
      value: function animations(type) {
        var A = this.Animations;

        switch (type) {
          case 'flip':
            return [A.flip, A.flip];
            break;

          case 'fade':
            return [A.fade(1), A.fade(0)];
            break;

          case 'zoom':
            return [A.zoom(1), A.zoom(0)];
            break;

          case 'slide':
          case 'slideLeft':
          case 'slideleft':
          case 'slide-left':
            return [A.slide(1), A.slide(3)];
            break;

          case 'slideRight':
          case 'slideright':
          case 'slide-right':
            return [A.slide(3), A.slide(1)];
            break;

          case 'slideUp':
          case 'slideup':
          case 'slide-up':
            return [A.slide(0), A.slide(2)];
            break;

          case 'slideDown':
          case 'slidedown':
          case 'slide-down':
            return [A.slide(2), A.slide(0)];
            break;

          default:
            return false;
            break;
        }
      }
    }, {
      key: 'transform',
      value: function transform(callback) {
        var _this6 = this;

        var that = this;
        var events = this.events;
        var module = this.module;
        var modulu = this.modulu;
        var modules = this.moduli;
        var cutting = this.cutting;
        var backset = modules.length === 1 || module.config.level === modulu.config.level ? false : module.config.level > modulu.config.level ? 0 : 1;
        var reverse = backset === 0 ? false : true;
        var animation = function animation(event) {
          event.callback();
        };

        var views = cutting ? [module.config.absolute === false ? App.relativeViewport : App.absoluteViewport, modulu.config.absolute === false ? App.relativeViewport : App.absoluteViewport] : [module.elements.container, modulu.elements.container];

        var _in = new Animate(views[0]);
        var _out = new Animate(views[1]);

        var x = 0,
            y = 0,
            attach = "center",
            origin = "center";
        var width = device.ui.width;
        var height = device.ui.height;
        var touches = events ? events.touches : null;

        touches = touches ? touches.srcEvent : null;

        if (!touches) {
          touches = modulu.events.touches;
          touches = touches ? touches.srcEvent : {};
        }

        if (touches.changedTouches) {
          x = touches.changedTouches[0].pageX;
          y = touches.changedTouches[0].pageY;
        } else {
          x = touches.x;
          y = touches.y;
        }

        if (x && y) {
          origin = [x, y];

          if (x < width / 4) {
            x = 0;
          } else if (x > width * 3 / 4) {
            x = width;
          }

          if (y < height / 4) {
            y = 0;
          } else if (y > height * 3 / 4) {
            y = height;
          }

          attach = [x, y];
        }

        // get animation

        if (backset !== false) {
          if (typeof this.animation === "function") {
            animation = this.animation;
          } else if (_typeof(this.animation) === "object") {
            animation = this.animation[this.animation.length === 2 ? backset : 0];
          }
        }

        // animation end

        var end = function end(stillness) {
          if (cutting) {
            _this6.cut(stillness);
          }

          _this6.end(stillness);

          // module dispatch

          _this6.dispatch();

          // callback

          callback();
        };

        rAF(function () {
          animation({
            view: views,
            x: x,
            y: y,
            in: _in,
            out: _out,
            width: width,
            height: height,
            viewport: [App.relativeViewport, App.absoluteViewport],
            modules: modules,
            reverse: reverse,
            direction: reverse ? -1 : 1,
            backset: backset,
            callback: end,
            origin: origin,
            attach: attach,
            touches: touches
          });
        });
      }
    }, {
      key: 'dispatch',
      value: function dispatch() {
        var events = {
          ids: this.ids,
          modules: this.moduli
        };

        try {
          if (this.cutting) {
            App.frameworks.trigger(this.module.config.absolute == true ? 'hide' : 'show');
          }

          this.module.trigger('show', events);
          this.modulu.trigger('hide', events);
        } catch (e) {}
      }
    }, {
      key: 'start',
      value: function start(callback) {

        // transformstart on event

        if (typeof this.module.events.transformstart === "function") {
          if (this.module.events.transformstart() === false) {
            return false;
          }
        }

        /*
            没有动画或不适合动画设备
            先隐藏－当前模块－再显示－未来模块 先释放内存有助于加快显示
        */

        if (!this.animation || this.cutting) {
          this.module.elements.container.css({
            "transform": "translate3d(0, 0, 0)"
          });
        }

        // start

        callback();

        // event

        App.trigger("transformstart", {
          ids: this.ids,
          modules: this.moduli
        });
      }
    }, {
      key: 'end',
      value: function end(stillness) {

        /*
         * cutting 模块类型集装箱视图切换
         */

        if (this.modulu) {
          if (!this.animation || !stillness) {
            this.modulu.elements.container.css({
              "transform": "translate3d(200%, 200%, 0)"
            });

            this.reset(this.id, true);

            // clear cache

            if (!this.self && (this.modulu.config.update || this.modulu.config.destroy || this.modulu.config.cache <= 0)) {
              this.modulu.destroy(1);
            }

            // App background

            if (this.modulu.remoteframe.App) {
              this.modulu.remoteframe.App.trigger('background');
            }
          }

          // reset transition-duration

          this.modulu.elements.container.css({
            "transition-duration": "0ms"
          });
        }

        // transformend on event

        if (typeof this.module.events.transformend == "function") {
          this.module.events.transformend();
        }

        // transformend event

        App.trigger("transformend", {
          ids: this.ids,
          modules: this.moduli
        });
      }
    }, {
      key: 'cut',
      value: function cut(stillness) {

        /*
         * cut : 场景切牌
         * 没有动画时直接切牌视窗
         */

        if (!this.animation || !stillness) {

          // clear style

          App.relativeViewport.style.cssText = '';
          App.absoluteViewport.style.cssText = '';

          // change view

          if (this.module.config.absolute === false) {
            App.absoluteViewport.css({
              "transform": "translate3d(200%, 200%, 0)"
            });
            App.relativeViewport.css({
              "transform": "translate3d(0, 0, 0)"
            });
          } else {
            App.relativeViewport.css({
              "transform": "translate3d(200%, 200%, 0)"
            });
            App.absoluteViewport.css({
              "transform": "translate3d(0, 0, 0)"
            });
          }
        }
      }
    }, {
      key: 'then',
      value: function then(callback) {
        this.callback = callback || noop;

        return this;
      }
    }]);

    return Transform;
  }();

  module.exports = Transform;
});