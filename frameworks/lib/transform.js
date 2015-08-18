define(function(require, exports, module) {
    'use strict';

    var browser = {
          isBadTransition : device.feat.isBadTransition,
          isBadGPU        : device.feat.isBadAndroid,
          hasObserver     : device.feat.observer,
          prefixStyle     : {
                                transform : device.feat.prefixStyle('transform'),
                                translateZ : device.feat.prefixStyle('perspective') ? ' translateZ(0)' : ''
                            }
        };

    // Trans to this module;

    function Transform () {
        'use strict';

        if ( !(this instanceof Transform) ) {
            return new Transform();
        }

        this.default = {
            visible : "translate(0, 0)" + browser.prefixStyle.translateZ,
            hidden  : "translate(200%, 200%)" + browser.prefixStyle.translateZ
        }

        this.init();
    }

    Transform.prototype = {
        init : function () {
            var that = this;

            // event

            this._events = {};

            // go to history

            window.bind('hashchange', function (event) {

                // no hashchange

                if ( that.hashchange == false ) return that.hashchange = true;

                // level == 0 return

                if ( that.module && that.module.level == 0 ) return;

                var md = location.hash.replace("#","").split("$");

                if ( md[0] ) {
                    application.transform.to(md.length == 2 ? md : md[0], -1);
                }
            })

            // reset viewport;
            /* use preserve-3d */

            document.documentElement.style.height = document.body.style.height = "100%";
            document.body.style.overflow = "hidden";

            // creat complex view;

            application.complexViewport = document.createElement('div');
            application.complexViewport.id = "complex-viewport";
            application.complexViewport.style.position = "fixed";
            application.complexViewport.style.width = application.complexViewport.style.height = "100%";
            application.complexViewport.style.overflow = "hidden";
            document.body.appendChild(application.complexViewport);

            // creat absolute view;

            application.absoluteViewport = document.createElement('div');
            application.absoluteViewport.id = "absolute-viewport";
            application.absoluteViewport.style.position = "fixed";
            application.absoluteViewport.style.width = application.absoluteViewport.style.height = "100%";
            application.absoluteViewport.style.overflow = "hidden";
            document.body.appendChild(application.absoluteViewport);
        },

        hash : function (id, param) {
            
            // no hashchange

            this.hashchange = false;

            document.location.hash = id + (param ? "$" + param : "");

            return this;
        },

        to : function (md, history) {
            var that = this,
                id = typeof md == "object" ? md[0] : md,
                od = this.od,
                ids = od ? [id, od] : [id],
                param = typeof md == "object" ? md[1] : null,
                module,
                modules
            ;

            history = history || 1;

            // md=[id,param]

            if ( typeof md == "object" ) {
                id = md[0];
                param = md[1];
            }

            // 检测模块配置

            if ( !application.modules[id] ) {
                application.get(id, function () {
                    that.to(md, history);
                }, this)
                return false;
            }

            // set param && update

            if ( param ) this.param(id, param);

            // set id

            this.id = id;
            this.ids = ids;

            // activity page = this page ? return;

            if ( od && id == od ) return;

            // modules;

            this.module = module = application.modules[id];
            this.modules = modules = [module, application.modules[od]];

            // this module is undefined ? return;

            if ( module == undefined ) {
                throw 'IOING ERROR { module[' + id + '] is not defined }';
            }

            // module is infinite or module Ele ? creat new elements;

            if ( module.elements == undefined ) {
                this.container(id);
            } else {
                if ( module.update == true ) {

                    // clear old page;

                    module.elements.container.innerHTML = null;

                    // open loading;

                    this.loading(id, 1);

                    // update page;

                    application.template.include(module.elements.container, id, function (data) {
                        that.loading(id, 0);
                    })
                }
            }

            this.transformStart();

            // is first ?;
            if ( od ) {
                var modeChange = modules[0].config.complex != modules[1].config.complex ? true : false,
                    animation = (history === 1 ? modules[0].config.animation : modules[1].config.animation) || function (event) { event.callback(); }
                ;

                animation({
                    "browser" : browser,
                    "reverse" : history == 1 ? false : true,
                    "viewport": [application.complexViewport, application.absoluteViewport],
                    "view"    : modeChange ? [modules[0].config.complex === true ? application.complexViewport : application.absoluteViewport, modules[1].config.complex === true ? application.complexViewport : application.absoluteViewport] : [modules[0].elements.container, modules[1].elements.container],
                    "modules" : modules,
                    "callback": function (end) {
                                    if ( modeChange ) {
                                        that.changeViewport(end);
                                    }
                                    
                                    that.transformEnd(end);
                                }
                })
            } else {
                this.changeViewport();
                this.transformEnd();
            }


            // history;
            if ( history > 0 ) {
                this.hash(id, param);
            }

            this.od = application.activity = id;
        },

        on : function (type, fn) {
            var types = type.split(' ');

            for ( var i = 0, l = types.length; i < l; i++ ) {

                var type = types[i];

                if ( !this._events[type] ) {
                    this._events[type] = [];
                }

                this._events[type].push(fn);
            }
        },

        off : function (type, fn) {
            var types = type.split(' ');

            for ( var i = 0, l = types.length; i < l; i++ ) {

                var type = types[i];

                if ( !this._events[type] ) {
                    return;
                }

                var index = this._events[type].indexOf(fn);

                if ( index > -1 ) {
                    this._events[type].splice(index, 1);
                }
            }
        },

        _execEvent : function (type) {
            if ( !this._events[type] ) {
                return;
            }

            var i = 0,
                l = this._events[type].length;

            if ( !l ) {
                return;
            }

            for ( ; i < l; i++ ) {
                this._events[type][i].apply(this, [].slice.call(arguments, 1));
            }
        },

        loading : function (id, display) {
            var module = application.modules[id];

            switch (display) {
                case 0:
                    loader = module.elements.loader;
                    if ( loader === 'undefined' ) return;
                    module.elements.loader.cont.style.display = "none";
                    loader.hide();

                    this._execEvent("loadingEnd", id, module.elements.loader);

                    break;
                case 1:
                    var Loader = require('Loader');
                    var size = 30 * device.ui.scale;
                    var opts = {
                        shape: "roundRect",
                        diameter: size * device.ui.scale,
                        density: 12,
                        speed: 1,
                        FPS: 12,
                        range: 0.95,
                        color: "#999999"
                    };

                    if ( module.config.loader ) {
                        $.extend(opts, module.config.loader);
                    }

                    var container = application.modules[id].elements.container;

                    var loader = new Loader(container, {id: 'loader-' + id, safeVML: true});
                        loader.setShape(opts.shape);
                        loader.setDiameter(opts.diameter);
                        loader.setDensity(opts.density);
                        loader.setSpeed(opts.speed);
                        loader.setFPS(opts.FPS);
                        loader.setRange(opts.range);
                        loader.setColor(opts.color);
                        loader.show();

                        loader.cont.style.position = "absolute";
                        loader.cont.style.zIndex = 999;
                        loader.cont.style.top = loader.cont.style.left = "50%";
                        loader.cont.style.marginTop = loader.cont.style.marginLeft = size * -0.5 + "px";
                        loader.cont.style.width = loader.cont.style.height = size + "px";

                    var canvas = loader.cont.children;
                    for (var i = canvas.length - 1; i >= 0; i--) {
                        canvas[i].style.width = canvas[i].style.height = size + "px";
                    }; 

                    application.modules[id].elements.loader = loader;

                    this._execEvent("loadingStart", id, module.elements.loader);

                    break;
            }

        },

        // set module param;
        param : function (id, paramStr) {
            var module = application.modules[id];

            // if this module cache param != param ? updata = ture;
            
            application.modules[id].update = module.param && module.param._string != paramStr ? true : false;
            application.modules[id].param = typeof paramStr == 'string' ? paramStr.toParams() : [];

            application.modules[id].param._string = paramStr;
        },

        reset : function (id) {
            var container = application.modules[id].elements.container,
                style = container.style
            ;

            style.cssText = "";
            style.position = "fixed";
            style.top = style.right = style.bottom = style.left = 0;
            style.width = style.height = "100%";
            style.set("transform", "translate(0, 0) translateZ(0) scale(1, 1)");
        },

        refresh : function (id) {
            var that = this;

            var container = application.modules[id].elements.container;

            if ( !container ) return console.log("refresh : container is not defined in this module");

            // open loading;
            this.loading(id, 1);
            
            // include module page;
            application.template.include(container, id, function (data) {
                // close loading;
                that.loading(id, 0);
            })
        },

        container : function (id) {
            var that = this;
            var target = this.module.config.complex === true ? application.complexViewport : application.absoluteViewport;

            var container = document.createElement('section');
                container.id = "module-" + id;
                container.className = "module-container"

            application.modules[id].elements = {
                "container" : container
            };

            this.reset(id);

            // preload on event;
            if ( typeof this.module.preload === "function" ) {
                this.module.preload(container);
            }

            target.appendChild(container);

            // if this module need network;
            if ( application.modules[id].network ) {
                if ( navigator.onLine === false ) {
                    window.addEventListener("online", function () {
                        that.refresh(id);
                    }, false);

                    return this._execEvent("offline", id, this.module);
                }
            }

            // open loading;
            this.loading(id, 1);

            // include module page;
            application.template.include(container, id, function (data) {
                // close loading;
                that.loading(id, 0);
            }) 

        },

        transformStart : function () {

            this.modules[0].elements.container.style.set("transform", this.default.visible);

            this._execEvent("transformStart", this.ids, this.modules);
        },

        transformEnd : function (end) {

            if ( end ) return;

            if ( this.modules[1] ) {

                this.reset(this.id);
                this.modules[1].elements.container.style.set("transform", this.default.hidden);

            }

            // include

            this._execEvent("transformEnd", this.ids, this.modules);
        },

        changeViewport: function (end) {
            
            if ( end ) return;

            if ( this.module.config.complex === true ) {
                application.absoluteViewport.style.set("transform", this.default.hidden);
                application.complexViewport.style.set("transform", this.default.visible);
            } else {
                application.complexViewport.style.set("transform", this.default.hidden);
                application.absoluteViewport.style.set("transform", this.default.visible);
            }
        }
    }


    return Transform;
})