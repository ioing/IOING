define(function(require, exports, module) {
    'use strict';

    var CSS = require("CSS"),
        DOM = require("DOM"),
        Async = require("Async"),
        extend = require('Extend')
    ;

    function Template () {
        'use strict';

        if ( !(this instanceof Template) ) {
            return new Template();
        }

        this.init();
    }

    Template.prototype = {
        init : function () {
            this._events = {};

            // include lib;

            this.css = CSS();
            this.async = Async();
        },

        setup : function (id) {
            var config = this.config;

            // include lib

            this.dom = DOM();
            this.dom.css = this.css;

            // 配置过滤

            this.filter(config);
        },

        on : function (type, fn) {
            var types = type.split(' ');

            for (var i = 0, l = types.length; i < l; i++) {

                var type = types[i];

                if ( !this._events[type] ) {
                    this._events[type] = [];
                }

                this._events[type].push(fn);
            }
        },

        off : function (type, fn) {
            var types = type.split(' ');

            for (var i = 0, length = types.length; i < length; i++) {

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

        trigger : function (type) {
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

        include : function (target, id, callback) {
            if ( !id ) return;

            var that = this;

            this.id = id;
            this.target = target;
            this.callback = callback;

            this.module = application.modules[id];
            this.config = this.module.config;

            this.setup(id);

            this.async.get(id, this.config, function (sids, data) {
                that.compile(id, sids, data);
            })
        },

        iframe : function (style, mirroring) {
            return '<!DOCTYPE html>'
                + '<html' + (mirroring ? ' class="mirroring"' : '') + '>'
                + '<head>'
                + '<style>' + style + '</style>'
                + '</head>'
                + '<body>'
                + '</body>'
                + '</html>';
        },

        clipView : function (context) {
            var clip = this.config.mirroring.clip;

            var view = document.createElement('div');
                view.css({
                    "position"  : "absolute",
                    "top"       : clip[0] + 'dp',
                    "right"     : clip[1] + 'dp',
                    "bottom"    : clip[2] + 'dp',
                    "left"      : clip[3] + 'dp',
                    "width"     : "100%",
                    "overflow"  : "hidden"
                })

            var mask = document.createElement('div');
                mask.css({
                    "position"  : "absolute",
                    "top"       : "-" + clip[0] + 'dp',
                    "right"     : "-" + clip[1] + 'dp',
                    "bottom"    : "-" + clip[2] + 'dp',
                    "left"      : "-" + clip[3] + 'dp',
                    "width"     : "100%"
                })

            if ( context ) mask.appendChild(context);

            view.appendChild(mask);

            return  context ? view : [view, mask];
        },

        mirroring : function (style, dom) {
            var id = this.id,
                target,
                mirroring,
                module = this.module,
                options = this.config.mirroring
            ;

            var frameContent = document.createElement('iframe');

                // set sandbox;

                frameContent.attr({
                    "name"      : "mirroring-" + id,
                    "src"       : "about:blank",
                    "seamless"  : "seamless",
                    "sandbox"   : "allow-same-origin allow-scripts",
                    "class"     : "module-mirroring-context"
                }).css({
                    "position"  : "absolute",
                    "z-index"   : "-1",
                    "top"       : '0',
                    "right"     : '0',
                    "bottom"    : '0',
                    "left"      : '0',
                    "width"     : "100%",
                    "height"    : "100%",
                    "border"    : "0",
                    "filter"    : options.filter || "none"
                })

            // set clip mirroring

            if ( options.filter ) {
                var container = document.createElement('div');
                    container.css({
                        "position"  : "absolute",
                        "z-index"   : "-1",
                        "top"       : '0',
                        "right"     : '0',
                        "bottom"    : '0',
                        "left"      : '0',
                        "width"     : "100%",
                        "height"    : "100%",
                        "overflow"  : "hidden"
                    })

                    container.appendChild(frameContent);

                mirroring = container;
            } else {
                container = frameContent 
            }

            // target

            if ( options.target ) {
                target = typeof options.target == 'string' ? document.querySelector(options.target) : options.target;
            } else {
                target = module.elements.container;
            }

            // insert

            target.appendChild(mirroring);

            // frame : document and window;

            var frameDoc = frameContent.contentDocument;
            var frameWindow = frameContent.contentWindow.window;

            // set application;

            application.modules[id].elements.mirroring = {
                container   : frameContent,
                window      : frameWindow,
                document    : frameDoc
            };

            frameDoc.open();
            frameDoc.write(this.iframe(style, true));
            frameDoc.close();

            frameDoc.body.appendChild(dom);
        },

        sandbox : function (style, dom) {
            var that = this,
                id = this.id,
                module = this.module,
                config = this.config
            ;

            var frameContent = document.createElement('iframe');

                // set sandbox;

                frameContent.attr({
                    "name"     : id, 
                    "src"      : "about:blank",
                    "seamless" : "seamless",
                    "sandbox"  : typeof config.sandbox == "string" ? config.sandbox : "allow-scripts allow-top-navigation allow-same-origin",
                    "style"    : "position: absolute; z-index: 0; width: 100%; height: 100%; border: 0"
                })

            // creat clip view

            if ( config.clip ) {

                this.target.appendChild(this.clipView(frameContent));

            } else {

                this.target.appendChild(frameContent);

            }

            // frame : document and window;

            var frameWindow = frameContent.contentWindow.window;
            var frameDocument = frameContent.contentDocument;

            // set application;

            application.modules[id].elements.sandbox = {
                container   : frameContent,
                window      : frameWindow,
                document    : frameDocument
            }

            // set sandbox;

            frameWindow.module = module;
            frameWindow.application = application;

            // react DATA ROOT;

            frameWindow.DOM = this.dom.DOM.root;
            frameWindow.DATA = this.dom.DATA;

            // updata data && updata view;!!!!!!

            frameWindow.application.update = function (id) {
                id = id ? id : that.config.source[0];
                
                that.async.source(id, that.config, 'data').then(function (err, sids, data) {
                    if ( !err && data ) {
                        that.dom.update(id, 0, data);
                    }
                });
            };

            frameDocument.open();
            frameDocument.write(this.iframe(style));
            frameDocument.close();

            // compatible window;

            extend(frameWindow);

            // ready event;

            frameDocument.ready(function () {

                // setup moderation;

                moderation(frameWindow);

                // insert dom to body;

                frameDocument.body.appendChild(dom[0]);

                // trigger dom is ready;

                that.dom.space(frameWindow, frameDocument.body).end();

                // creat mirroring;

                if ( config.mirroring ) that.mirroring(style, dom[1]);

                // setup require;

                that.require('sandbox', function () {

                    // event trigger;

                    this.trigger("complete", {
                        type   : "sandbox",
                        id     : id,
                        module : module
                    });
                })

                // callback;

                that.callback && that.callback();

            })

            // loaded event;

            frameWindow.load(function () {

                // event trigger;

                that.trigger("load", {
                    type   : "sandbox",
                    id     : id,
                    module : module
                })
            })
        },

        // embed contenter

        wrap : function (id, style, dom, type) {
            
            // creat css;

            var css = document.createElement('style');
                css.name = id;
                css.innerHTML = style;

            var body = document.createElement('div');
                body.id = "module-" + id + "-context";
                body.name = id;
                body.className = "module-context";

            // inset style;

            id == 'frameworks' && type == 0 ? document.head.appendChild(css) : body.appendChild(css);

            body.appendChild(dom);

            return body;
        },

        // free module;

        embed : function (style, dom) {
            var id = this.id,
                config = this.config
            ;
            
            var body = this.wrap(id, style, dom[0], 0);

            // 主框架与模块分离;

            if ( config.shadow ) {

                // creat clip view

                if ( config.clip ) {

                    var clipView = this.clipView(),
                        view = clipView[0],
                        mask = clipView[1]
                    ;

                    this.target.appendChild(view);

                    var shadow = mask.createShadowRoot();

                } else {

                    var shadow = this.target.createShadowRoot();

                }

                // inset dom;

                shadow.appendChild(body);

            } else {

                // creat clip view

                if ( config.clip ) {

                    // inset dom;

                    this.target.appendChild(this.clipView(body));

                } else {

                    // inset dom;

                    this.target.appendChild(body);
                }
            }

            // trigger dom is ready;

            this.dom.space(window, body).end();

            // creat mirroring;

            if ( config.mirroring ) this.mirroring(style, this.wrap(id, style, dom[1], 1));

            // setup require;

            this.require('embed', function () {

                // event trigger;

                this.trigger("complete", {
                    type   : "embed",
                    id     : id,
                    module : this.module
                });
            });

            // callback;

            this.callback && this.callback();
            
        },

        compile : function (id, sids, data) {
            this.css.setup({
                module     : id,
                root       : "modules/",
                data       : {
                    module     : id,
                    config     : this.config,
                    dpi        : device.ui.dpi,
                    width      : device.ui.width,
                    height     : device.ui.height,
                    os         : device.os,
                    feat       : device.feat,
                    prefix     : device.feat.prefix
                },
                wrap       : (this.config.sandbox || this.config.shadow || id == 'frameworks') ? null : "#module-" + id + "-context"
            })
            
            data.data.extend({
                module : {
                    id     : id,
                    uri    : "modules/" + id + "/",
                    param  : this.module.param || []
                },
                device : device
            })

            this.dom.setup({
                module     : id,
                root       : "modules/",
                dids       : sids.data,
                sids       : sids.source,
                parallel   : this.config.mirroring
            })

            this.write(
                this.css.render(this.config.style, sids.style, data.style), 
                this.dom.render(this.config.source[0], data.source, data.data)
            )
        },

        write : function (style, dom) {
            this.config.sandbox ? this.sandbox(style, dom) : this.embed(style, dom);
        },

        require : function (type, callback) {
            var that = this,
                uri,
                load,
                url = [],
                id = this.id,
                root = "modules/",
                module = this.module,
                config = module.config,
                script = config.script,
                resources = module.resources,
                requires = config.require || {},
                moderation
            ;

            if ( script.length ) {
                for (var i = 0, l = script.length; i < l; i++) {
                    uri = resources.script[script[i]];

                    uri = uri.split(/\:\:/);

                    if ( uri.length == 2 ) {
                        id = uri[0];
                        uri = uri[1];
                    } else {
                        uri = uri[0];
                    }

                    if ( uri.indexOf('://') > 0 ) {
                        
                    } else if ( uri.indexOf('/') == 0 ) {
                        uri = root + uri.substr(1);
                    } else if ( uri.indexOf('./') == 0 ) {
                        uri = root + id + uri.substr(1);
                    } else if ( uri.indexOf('-/') == 0 ) {
                        uri = root + this.id + uri.substr(1);
                    } else {
                        uri = root + id + '/' + uri;
                    }

                    url.push(uri);
                }
            }

            // load;

            load = requires.use && requires.use.load || url;

            // return

            if ( !load ) return callback && callback.call(this);

            // extend

            requires.config = {
                vars  : modules.data.vars || {},
                paths : modules.data.paths || {}
            }.extend(requires.config || {});

            // sandbox || embed

            switch (type) {
                case 'embed':
                    if ( requires.config ) modules.config(requires.config);

                    require.async(load, function () {
                        requires.use && requires.use.callback && requires.use.callback.apply(this, arguments)
                        callback && callback.call(that)
                    })

                    break;

                case 'sandbox':
                    moderation = module.elements.sandbox.window.modules;

                    // updata fetchedList

                    moderation.data.fetchedList = modules.data.fetchedList;

                    if ( requires.config ) moderation.config(requires.config);

                    moderation.use(url, function () {
                        requires.use && requires.use.callback && requires.use.callback.apply(this, arguments)
                        callback && callback.call(that)
                    })

                    break;
            }

        },

        // config filter;

        filter : function (config) {

            // shadowRoot;

            if ( device.feat.shadowRoot == false ) {
                config.shadow = false;
            }

            // if is Bad GPU exit;

            if ( this.id == 'frameworks' || device.feat.isBadAndroid || !device.feat.observer ) {
                config.mirroring = false;
            }

            if ( device.feat.isBadTransition ) {
                config.animation = false;
            }

            if ( config.mirroring && config.mirroring.clip && !config.mirroring.target ) {
                config.clip = true;

                if ( !config.mirroring.filter ) {
                    config.mirroring.filter = "blur(20px)";
                }
            }
        }

    }


    return Template;
})