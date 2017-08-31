'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// 道可道，非恒道。名可名，非恒名。
// 人法地，地法天，天法道，道法自然。

define('~/dom', [], function (require, module, exports) {
    'use strict';

    var REGEXP = {
        key: /\.|\[/,
        token: /[^\w\_\$\.]/, // 非变量关键词切割
        string: /(['"])[^'"]*\1/, // 过滤掉字符
        route: /(\[(.*?)(?=\])\])/g, // 替换活动变量
        origins: /\{\{([\s\S]*?)(?=\}\})\}\}|\{([\s\S]*?)(?=\})\}/g,
        imports: /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/ig
        // imports : /[^\.\]]\s*[@|$]import\s*\(\s*["']([^'"\s]+)["']\s*\)/g.   // imports : /import\s([\w\_\$]+)\sfrom\s([\w\_\$\']+)/g
    };

    var dOC = document;
    var rAF = window.requestAnimationFrame;

    function DOM() {
        if (!(this instanceof DOM)) {
            return new DOM();
        }
    }

    DOM.prototype = {

        /**
         * 初始化DOM
         * @param {Object} module
         * @param {HTMLElement} sandbox
         * @param {Function} css编译器
         * @returns {Object} this
         */
        init: function init(module, sandbox, helper, css) {

            // DOM属性[uuid,id]的存储

            this.DOM = {
                "0": {}

                // 所有DOM的暂存

            };this.DOMS = {};

            // 虚拟DOM的暂存

            this.DOM2 = {};

            // 外部css引擎

            this.css = css;

            // 量子收集器

            this.Quantum = {};

            // 函数缓存器

            this.Function = {};

            // 当前编译模块

            this.module = module;

            // 当前执行沙箱

            this.sandbox = sandbox;

            // helper

            this.helper.extend(helper);

            // 根片段序列

            this.i = 0;
            this.o = 0;

            // watch(prop)事件收容器

            this.entanglement = {};

            // 组件事件序列

            this.components = { waiting: 0

                // 常任务序列

            };this.mission = {};

            // renderCountTime

            this.renderCountTime = 0;

            return this;
        },

        // helper

        helper: {
            encode: function encode(s) {
                return typeof s === 'string' ? encodeURIComponent(s) : s;
            },
            decode: function decode(s) {
                return typeof s === 'string' ? decodeURIComponent(s) : s;
            },
            replace: function replace(s, r, p) {
                return typeof s === 'string' ? s.replace(r, p) : s;
            }
        },

        /**
         * 创建新的文档空间
         * @param  {Object}
         * @param  {Node}
         * @param  {Boolean}
         * @return {String}
         */
        creat: function creat(root, node, _creat) {

            var uuid = _creat ? this.i++ : root.uuid;

            if (_creat && root.quantum.indexOf(root.uuid) == -1) {

                // 隐形功能 Tag，将其 push 到 quantum 集合

                this.Quantum[root.uuid] = [];

                // 移除不符合根叶关系的 uuid

                root.quantum.each(function (i, uuid) {
                    if (!(uuid < root.uuid)) {
                        root.quantum.splice(i, 1);
                    }
                });

                // 按照根叶关系排列

                root.quantum.push(root.uuid);
            }

            // creat new fragment & new event queue

            this.creatFragment(uuid);

            // set root node

            node.uuid = root.uuid;

            // new space uuid

            node._target = uuid;

            // event

            if (!this.mission[root.order]) {
                this.mission[root.order] = {
                    async: [],
                    events: [],
                    scripts: [],
                    parallel: [],
                    scroller: [],
                    components: [],
                    entanglement: []
                };
            }

            return uuid;
        },

        /**
         * creat root state
         * @param String
         * @return Object
         */

        state: function state(id) {
            return {
                "id": id,
                "uuid": 0,
                "order": 0,
                "target": 0,
                "quantum": []
            };
        },

        /**
         * save
         * @param {Object} source
         * @param {Object} data
         */
        save: function save(source, data) {
            this.DATA = data;
            this.SOURCE = source;
        },

        /**
         * set config
         * @param {Object} config
         */
        setup: function setup(config) {
            this.config = config;
        },

        /**
         * @param  {Window} window
         * @param  {HTMLElement} container
         * @return {Object} this
         */
        space: function space(window, container) {

            window.trigger('moduleready');

            // scope eval

            window.EVALSCOPE = {};

            this.window = window;
            this.container = container;

            container.trigger('ready');

            return this;
        },

        /**
         * 为node节点分配唯一ip
         * @param  {Object}
         * @param  {Node}
         * @return {String}
         */
        uuid: function uuid(root, node, _uuid) {
            _uuid = parseInt(_uuid || (node.parentNode ? node.parentNode.uuid : root.uuid));

            _uuid++;
            this.o++;

            // set tag id

            _uuid = _uuid + '.' + this.o;

            // define property && set uuid

            if (node && !node.uuid) node.extendProperty("uuid", _uuid);

            return _uuid;
        },

        quantum: function quantum(uuid) {
            return this.Quantum[uuid] || [];
        },

        /**
         * 获取模版Node对象
         * callback传入时异步获取模版，防止end事件循环
         * source == undefined 且 id indexOf('~/') === 0 时，异步获取远程模版
         * @param  {String}
         * @param  {Function}
         * @param  {String}
         * @param  {String}
         * @return {HTMLElement} source
         */
        get: function get(id, callback, prefixe, suffix, source) {
            source = source || this.SOURCE[id];
            suffix = suffix || '';
            prefixe = prefixe || '';

            if (source === undefined) {

                if (callback && id.indexOf('~/') === 0) {

                    // promise get components

                    return promise.get(id.slice(2)).then(function (err, data, xhr) {
                        if (!data) return;
                        if (err === false) {
                            this.SOURCE[id] = data;
                            callback.call(this, this.parser(data));
                        } else {
                            callback.call({}, null);
                        }
                    }.bind(this));
                }

                return;
            }

            // pack source

            source = this.parser(prefixe + source + suffix);

            if (callback) {

                callback.call(this, source);

                return;
            }

            return source;
        },

        /**
         * 保存模版
         * @param {Boolean}
         * @param {String}
         * @param {String|Node}
         * @param {String}
         */
        set: function set(space, id, source, pid) {

            id = (space ? space + '::' : '') + id;

            // set template id from file

            if (pid) {
                this.config.sids[id] = this.config.sids[pid];
            }

            this.SOURCE[id] = source;
        },

        /**
         * 闭包形式获取作用域内模版
         * @param  {Boolean}
         * @param  {String}
         * @param  {String}
         * @param  {String}
         * @return {Node}
         */
        take: function take(space, id, prefixe, suffix) {
            return this.get((space ? space + '::' : '') + id, null, prefixe, suffix) || this.get(id, null, prefixe, suffix);
        },

        /**
         * 解析HTML字符为Node
         * @param  {String|HTMLElement}
         * @return {HTMLElement}
         */
        parser: function parser(source) {
            return new DOMParser().parseFromStringToNode('<body>' + source + '</body>', "text/html").body;
        },

        /**
         * 创建NodeTreeWalker
         * @param  {HTMLElement}
         * @return {HTMLElement}
         */
        iterator: function iterator(nodes) {

            if (nodes.nextNode) return nodes;

            // createTreeWalker

            return dOC.createNodeIterator(nodes, NodeFilter.SHOW_ALL, null, false);
        },

        /**
         * 取数据源名称对应之源id
         * @param  {String}
         * @return {String}
         */
        spath: function spath(id) {
            return this.config.sids[id];
        },

        /**
         * 取绝对路径
         * @param  {Object}
         * @param  {String}
         * @return {String}
         */
        realpath: function realpath(root, url) {
            return App.realpath(this.module.id, this.spath(root.id), url, root.path);
        },

        /**
         * 取之父级
         * @param  {Node}
         * @return {[type]}
         */
        target: function target(node) {
            var uuid;

            // parentNode is not commandNode

            var parent = node.parentNode;

            // _target: all child owner target

            if (!parent) return node._target;
            if (parent._target) return parent._target;

            // get target

            uuid = parent.command ? this.target(parent) : parent.uuid;

            return uuid;
        },

        /**
         * 片段归位
         * @param  {Object}
         * @param  {Function}
         */
        insert: function insert(root, compiler) {
            var uuid = root.uuid;
            var targetid = root.target;
            var quantums = this.quantum(uuid);
            var preseted = quantums[0];
            var fragment = compiler.call(this);

            // append or insert

            if (preseted) {
                preseted.before(fragment);
            } else {
                this.DOMS[targetid].appendChild(fragment);
            }

            /* delete old dom
             * 当命令队列执行到最后一个时，删除旧的命令集合中的元素
             */

            if (preseted) {
                quantums.each(function (i, elem) {
                    elem.remove();
                });
            }

            // parallel : {

            if (this.config.parallel) {
                if (preseted) {
                    this.DOM2[preseted].before(this.DOM2[fragment.uuid]);
                } else {
                    this.DOM2[targetid].appendChild(this.DOM2[fragment.uuid]);
                }
            }

            //}
        },

        /**
         * 归位至父级
         * @param  {Object}
         * @param  {String}
         * @param  {String}
         */
        into: function into(root, uuid, puid) {
            var child = this.DOMS[uuid];
            var parent = this.DOMS[puid];
            var quantum = root.quantum;

            // append to parent

            if (!child || !parent) return;

            // append elem to plem

            parent.appendChild(child);
            parent.trigger('ready');

            // parallel : {

            if (this.config.parallel) {
                this.DOM2[puid] && this.DOM2[puid].appendChild(this.DOM2[uuid]);
            }

            // }

            // 命令归位

            for (var i = quantum.length - 1; i >= 0; i--) {
                this.Quantum[quantum[i]].push(child);
            }
        },

        /**
         * 附之其父
         * @param  {Object}
         * @param  {Node}
         */
        append: function append(root, node) {
            var uuid = node.uuid;
            var puid = this.target(node);

            // remove commandNode

            if (node.command) return node.remove();

            this.into(root, uuid, puid);
        },

        /**
         * 创建片段
         * @param  {String}
         * @param  {Boolean}
         * @return {HTMLElement}
         */
        creatFragment: function creatFragment(uuid, creat) {

            if (uuid === undefined) uuid = this.i++;

            // creat new fragment & new event queue

            if (!this.DOMS[uuid]) {

                // creat document fragment

                this.DOMS[uuid] = dOC.createDocumentFragment();
                this.DOMS[uuid].extendProperty("uuid", uuid);

                // parallel : {

                if (this.config.parallel) {
                    this.DOM2[uuid] = dOC.createDocumentFragment();
                    this.DOM2[uuid].extendProperty("uuid", uuid);
                }

                // }
            }

            return this.DOMS[uuid];
        },

        /**
         * 创建文档节点
         * @param  {Object}
         * @param  {Node}
         * @param  {String}
         * @param  {String}
         * @return {HTMLElement}
         */
        createElement: function createElement(root, node, uuid, name) {

            uuid = uuid ? this.uuid(root, node, uuid) : node.uuid;
            name = name ? name : node.nodeName;

            // 预处理
            // select 将会导致node解析时select内部其它标签被忽略

            switch (name) {
                case 'SELECTER':
                    name = 'SELECT';
                    break;
            }

            // creat

            this.DOMS[uuid] = dOC.createElement(name);

            // shivMethods

            if (this.DOMS[uuid].getInstanceType() == 'HTMLUnknownElement') {
                this.DOMS[uuid].__proto__ = dOC.createElement('div').__proto__;
            }

            // bind uuid

            this.DOMS[uuid].extendProperty("uuid", uuid);

            // parallel : {

            if (this.config.parallel) {

                // creat

                switch (name) {
                    case 'VIDEO':
                    case 'CANVAS':

                        var canvasid = node.getAttribute('name');

                        if (!canvasid) {
                            canvasid = new UUID().id;
                            node.setAttribute('name', new UUID().id);
                        }

                        // canvas as background

                        this.DOM2[uuid] = dOC.createElement('DIV');

                        if (node.nodeName === 'VIDEO') {
                            try {
                                this.events.push(function () {
                                    var context = dOC.getCSSCanvasContext("2d", uuid, this.DOMS[uuid].videoWidth, this.DOMS[uuid].videoHeight);
                                    context.getContext('2d').drawImage(this.DOMS[uuid], 0, 0, this.DOMS[uuid].videoWidth, this.DOMS[uuid].videoHeight);
                                });
                            } catch (e) {}

                            canvasid = uuid;
                        }

                        this.DOM2[uuid].css({
                            "background-image": device.feat.prefix + "canvas(" + canvasid + ")"
                        });

                        break;

                    default:

                        // default

                        this.DOM2[uuid] = dOC.createElement(name);

                        break;
                }

                // bind uuid

                this.DOM2[uuid].extendProperty("uuid", uuid);

                this.mission[root.order].parallel.push(function () {
                    this.parallel(this.DOMS[uuid], this.DOM2[uuid]);
                });
            }

            // }

            return this.DOMS[uuid];
        },

        /**
         * 设置节点属性
         * @param {Object}
         * @param {Node}
         * @param {String}
         * @param {String}
         * @param {Object}
         */
        setAttribute: function setAttribute(root, node, name, value, scope) {
            var text = '';
            var uuid = node.uuid;

            text = this.variable(root, scope, value, function () {
                this.setAttribute(root, node, name, value, scope);
            }, uuid + ':attr:' + name);

            // attribute rule

            text = this.attributeRule(root, node, name, text, scope);

            // cancel

            if (text === false) return;

            // set attr

            this.DOMS[uuid].setAttribute(name, text);

            // parallel : {

            if (this.config.parallel) {
                this.DOM2[uuid].setAttribute(name, text);
            }

            // }
        },

        /**
         * 创建文本节点
         * @param  {Object}
         * @param  {Node}
         * @param  {String}
         * @param  {String}
         * @return {Object}
         */
        createTextNode: function createTextNode(root, node, value, scope) {
            var text = '';
            var uuid = node.uuid;

            text = ['STYLE', 'SCRIPT'].consistOf(node.parentNode.nodeName) ? value : this.variable(root, scope, value, function () {
                this.createTextNode(root, node, value, scope);
            }, uuid + ':text');

            // template for contentText

            if (text.html) {

                root.uuid = this.target(node);
                this.compile(root.clone(), this.parser(text.html), scope);

                return;
            }

            // createTextNode

            if (this.DOMS[uuid]) {

                // innerText

                this.DOMS[uuid].textContent = text;
            } else {

                this.DOMS[uuid] = dOC.createTextNode(text);

                // bind uuid

                this.DOMS[uuid].extendProperty("uuid", uuid);

                // parallel : {

                if (this.config.parallel) {
                    this.DOM2[uuid] = dOC.createTextNode(text);

                    // bind uuid

                    this.DOM2[uuid].extendProperty("uuid", uuid);
                }

                // bind entanglement

                this.mission[root.order].parallel.push(function () {
                    this.parallel(this.DOMS[uuid], this.DOM2[uuid]);
                });

                // }
            }
        },

        /**
         * 创建影子节点树
         * @param  {Object}
         * @param  {Node}
         * @param  {HTMLElement}
         * @return {Object}
         */
        createShadowRoot: function createShadowRoot(root, node, dom, scope) {
            var uuid = node.uuid;
            var baseCSS = this.createElement(root, null, uuid, 'style');
            var shadowDOM = this.createElement(root, null, uuid, 'shadow-root');
            var shadowId = shadowDOM.uuid;
            var shadowRoot = dom.createShadowRoot ? dom.createShadowRoot() : false;

            if (shadowRoot) {

                // mark node

                node.extendProperty("_target", shadowId);

                // creat shadowRoot

                baseCSS.innerHTML = this.css.compile(this.module.id, CSSBaseStyle, scope, {
                    descendant: false
                });

                shadowRoot.appendChild(baseCSS);
                shadowRoot.appendChild(shadowDOM);
            } else {
                shadowDOM.className = 'shadow-root-' + shadowId.replace(/\./g, '-');

                // 不支持shadowRoot的css作用域方案

                baseCSS.innerHTML = this.css.compile(this.module.id, CSSBaseStyle, scope, {
                    path: root.path,
                    descendant: '.' + shadowDOM.className
                });

                dom.appendChild(baseCSS);
                dom.appendChild(shadowDOM);
            }

            // parallel : {

            if (this.config.parallel) {
                var dom2 = this.DOM2[dom.uuid];
                var baseCSS2 = this.DOM2[baseCSS.uuid];
                var shadowDOM2 = this.DOM2[shadowDOM.uuid];

                baseCSS2.innerHTML = baseCSS.innerHTML;

                if (shadowRoot) {
                    var shadowRoot2 = dom2.createShadowRoot();

                    shadowRoot2.appendChild(baseCSS2);
                    shadowRoot2.appendChild(shadowDOM2);
                } else {
                    dom2.appendChild(baseCSS2);
                    dom2.appendChild(shadowDOM2);
                }
            }

            // }

            return {
                id: shadowId,
                dom: shadowDOM,
                shadow: shadowRoot
            };
        },

        /**
         * 据其uuid及scope获取文档节点
         * @param  {String}
         * @param  {String}
         * @return {HTMLElement}
         */
        getElementById: function getElementById(uuid, scopeid) {
            var element;

            scopeid = scopeid || 0;
            element = this.DOM[scopeid][uuid];

            return element || scopeid == 0 ? element : this.getElementById(uuid, this.DOMS[scopeid].scopeid);
        },

        /**
         * 简约书写的过滤器
         * @param  {Object}
         * @param  {Array}
         * @return {Object}
         */
        getValueByMagic: function getValueByMagic(scope, magic) {
            var result;
            var handle;

            if (!magic) return magic;

            for (var i = 0, l = magic.length; i < l; i++) {
                if (i == 0) {
                    result = scope.getValueByRoutes(magic[0].splitCells(/\,/));
                } else {
                    handle = this.helper[magic[i]] || scope.helper[magic[i]];

                    if (handle) {
                        result = handle.apply(null, result);
                    }
                }
            }

            return result;
        },

        /**
         * 传统过滤器
         * @param  {Object}
         * @param  {String}
         * @return {Object}
         */
        getValueByRoute: function getValueByRoute(scope, origin) {
            var result;
            var handle;

            if (!origin) return origin;

            switch (origin.substr(0, 1)) {
                case '@':
                    origin = origin.substr(1);
                    origin = origin.replace(/[\(\)]/g, ',').split(/\,/);
                    origin.pop();
                    handle = this.helper[origin.shift()];

                    origin = origin.join(',');
                    break;
            }

            // result

            result = scope.getFunctionByRoute(origin, this.Function[origin]);

            // helper

            if (handle) {
                result = handle.apply(null, result);
            }

            // 缓存编译结果

            if (result && result.factory) {
                if (!this.Function[origin]) {
                    this.Function[origin] = result.factory;
                }
            }

            // return

            return result.result;
        },

        getOriginType: function getOriginType(origin) {
            var html = false;
            var watch = true;

            // #

            switch (origin.charAt(0)) {
                case '#':
                    origin = origin.substr(1);
                    break;
                case '!':
                    origin = origin.substr(2);
                    html = true;
                    break;
            }

            return {
                html: html,
                watch: watch,
                origin: origin
            };
        },

        getRootScope: function getRootScope(scope) {
            return scope.__proto__.__proto__ === null ? scope : this.getRootScope(scope.__proto__);
        },

        /**
         * 获取动态值
         * @param  {Object}
         * @param  {Object}
         * @param  {String}
         * @param  {Function}
         * @param  {String}
         * @param  {String}
         * @return {String}
         */
        variable: function variable(root, scope, value, callback, uuid, type) {
            var origin;
            var identity = {};

            // all {variable} code

            if (value.indexOf('{') !== -1) {

                value = value.replace(REGEXP.origins, function (content, double, single) {

                    // get origin

                    if (single) {
                        identity = this.getOriginType(single);
                        single = identity.origin.split('|');
                        origin = single[0];
                    } else if (double) {
                        identity = this.getOriginType(double);
                        origin = identity.origin;
                    }

                    // watch

                    if (callback && uuid && identity.watch == true) {
                        this.watch(root, scope, origin, callback, uuid, type);
                    }

                    // return

                    if (single) {
                        return this.getValueByMagic(scope, single);
                    } else if (double) {
                        return this.getValueByRoute(scope, origin);
                    }
                }.bind(this));

                // html type

                if (identity.html === true) {
                    value = {
                        html: value
                    };
                }
            }

            return value;
        },

        /**
         * 监视数据源改变
         * @param  {Object}
         * @param  {Object}
         * @param  {String}
         * @param  {Function}
         * @param  {String}
         */
        watch: function watch(root, scope, origin, callback, uuid) {

            // exists 检测源的有效性

            function exists(link) {
                if (!link) return;

                if (link.staticAnalysis() == 'variable') {
                    this.react(root, scope, link, callback, uuid);
                }
            }

            // 分离多条活动数据源

            function split(origin) {

                // 组合完整数据源路由

                origin = route.call(this, origin);

                // 打散多个link数据源

                origin = origin.replace(REGEXP.string, ' ').split(REGEXP.token);

                // 检测数据源并watch

                for (var i = 0, l = origin.length; i < l; i++) {

                    var k = origin[i];

                    if (k) {
                        var prop = k.split(REGEXP.key)[0];

                        // 无效源

                        if (scope[prop] === undefined) {
                            scope[prop] = null;
                        }

                        // 存在有效watch对象检测

                        exists.call(this, k);
                    }
                }
            }

            // 获取子活动数据源

            function route(origin) {
                return origin.replace(REGEXP.route, function (routestr, context, line) {

                    // 对活动数据源进行再分离

                    split.call(this, line);
                }.bind(this));
            }

            // 组合完整数据源路由

            split.call(this, origin);
        },

        /**
         * 数据源改变时响应其事件
         * @param  {Object}
         * @param  {Object}
         * @param  {String}
         * @param  {Function}
         * @param  {String}
         */
        react: function react(root, scope, route, callback, uuid) {
            var that = this;
            var link = route.split('.');
            var prop = link.pop();
            var target = link.join('.');
            var object = target ? scope.getValueByRoute(target) : scope[prop] ? scope : this.getRootScope(scope);

            // 忽略 watch length 属性

            if (prop === 'length') return;

            //检测 watch 对象属性是否存在

            if (!object || (typeof object === 'undefined' ? 'undefined' : _typeof(object)) !== 'object' || typeof object.watch !== 'function') {

                // App.console.warn('SCOPE[' + route + '] is not defined')

                return;
            }

            // getRootScope after check

            if (object[prop] === undefined) {
                object[prop] = null;
            }

            // is remove

            if (!this.mission[root.order]) return;

            // push prop events

            this.entanglement.initial(route, []).push({ caller: callback, uuid: uuid });

            // ready then mission > entanglement

            this.mission[root.order].entanglement.push(function () {
                object.watch(prop, function (propertyName, oldValue, newValue) {

                    // no change

                    if (oldValue === newValue) return;

                    // 事件堆

                    var callee = {};
                    var callbacks = [];

                    /* 
                     * 去重根据 uuid + type + typeid
                     * 同 attr 和 text node 上多条重复数据源，只执行一次事件回调
                     */

                    that.entanglement[route].splice(-that.entanglement[route].length).each(function (i, events) {
                        if (!callee[events.uuid]) {
                            callee[events.uuid] = true;
                            callbacks.push(events.caller);
                        }
                    });

                    // prop on event queue

                    rAF(function () {
                        callbacks.each(function (i, callback) {
                            callback.call(that, oldValue, newValue);
                        });
                    });
                });
            });
        },

        /**
         * 建立平行节点
         * @param  {HTMLElement}
         * @param  {HTMLElement}
         */
        parallel: function parallel(reality, virtual) {
            var that = this;

            if (this.config.parallel && this.config.parallel.appoint == true) {
                if (!reality.attributes || !reality.attributes.hasOwnProperty("parallel")) return;
            }

            reality.observer({
                childList: true,
                subtree: false,
                attributes: true,
                characterData: true,
                attributeOldValue: false,
                characterDataOldValue: false
            }, function (records) {
                records.each(function (index, record) {
                    if (!virtual) return;

                    switch (record.type) {
                        case "attributes":
                            virtual.setAttribute(record.attributeName, reality.getAttribute(record.attributeName));

                            break;

                        case "characterData":
                            virtual.textContent = reality.textContent;

                            break;

                        case "childList":
                            rAF(function () {
                                record.addedNodes.each(function (i, node) {
                                    try {
                                        if (that.DOM2[node.uuid]) {
                                            virtual.insertBefore(that.DOM2[node.uuid], node.nextSibling ? that.DOM2[node.nextSibling.uuid] : null);
                                        } else {
                                            var uuids = {};

                                            that.walker(that.iterator(node), function (node1) {

                                                var uuid = that.uuid({ uuid: virtual.uuid }, node1);
                                                var node2 = node1.cloneNode();

                                                uuids[uuid] = node2;

                                                if (node1 === node) {
                                                    virtual.insertBefore(node2, node.nextSibling ? that.DOM2[node.nextSibling.uuid] : null);
                                                } else {
                                                    uuids[node1.parentNode.uuid].appendChild(node2);
                                                }

                                                that.parallel(node1, node2);
                                            });
                                        }
                                    } catch (e) {}
                                });

                                record.removedNodes.each(function (i, node) {
                                    that.DOM2[node.uuid] && that.DOM2[node.uuid].remove();
                                });
                            });

                            break;
                    }
                });
            });
        },

        /**
         * 设置节点特性
         * @param {Object}
         * @param {Node}
         */
        setProperty: function setProperty(root, node) {
            var that = this;
            var uuid = node.uuid;
            var rooot = that.state(uuid).extend({
                scopeid: root.scopeid,
                spacename: root.spacename
            });

            function inner(type) {
                return function (id, data) {
                    if (!id) return;
                    if ((typeof id === 'undefined' ? 'undefined' : _typeof(id)) == "object") {
                        id[1] = typeof id[1] === "string" ? id[1] : id[1].outerHTML;
                        that.set(rooot.spacename, id[0], id[1]);
                        id = id[0];
                    }
                    that.include(rooot, this, id, data, type);
                };
            }

            // previous scroller

            this.DOMS[uuid].extendProperties({
                "parentFragment": root.fragment,
                "previousCommit": root.commiter,
                "previousScroller": root.scroller,
                "parentShadowRoot": root.shadowroot,
                "innerTemplate": inner(true),
                "appendTemplate": inner(false),
                "insetBeforeTemplate": inner(-1),
                "insetAfterTemplate": inner(1)
            });
        },

        /**
         * 节点属性语法拓展
         * @param  {Object}
         * @param  {Node}
         * @param  {String}
         * @param  {String}
         * @param  {Object}
         * @return {String}
         */
        attributeRule: function attributeRule(root, node, name, value, scope) {
            var that = this;
            var dom = this.DOMS[node.uuid];
            var command = node.attributes;

            switch (name) {
                case 'id':
                case 'uuid':

                    // 是否指定获取uuid

                    var rid = root.scopeid || 0;

                    if (value) {

                        // uuid map

                        this.DOM.initial(rid, {})[value] = dom;
                    }

                    break;

                case 'transform':

                    this.mission[root.order].events.unshift(function (window) {
                        value = value.split('|');

                        // 预测未来模块

                        var id = value[0];
                        var prefetch = that.commands('prefetch', node).key;
                        var actionTime = 0;

                        // self module

                        if (id == '#') {
                            id = App.id;
                        }

                        // PREFETCH

                        if (isNaN(id)) {

                            // prefetch source

                            if (prefetch) {
                                var previousScroller = dom.previousScroller;
                                var previousScroll = previousScroller ? previousScroller.scrollEvent : null;
                                var fragment = dom.parentFragment;
                                var loadTimeout;

                                var fetch = function fetch() {

                                    // async prefetch && do not prefetch then node been removed

                                    loadTimeout = setTimeout(function () {

                                        var param = that.commands('param', node).value;
                                        var isScrolling = previousScroll ? previousScroll.isScrolling() : false;

                                        if (isScrolling) {

                                            previousScroll.one('scrollend', function (type) {

                                                // cheak dom is visible

                                                if (type !== 'break' && dom.offsetHeight > 0) App.prefetch(id, param);
                                            });
                                        } else {
                                            App.prefetch(id, param);
                                        }
                                    }, 2000);
                                };

                                // infiniteshow

                                if (fragment) {
                                    fragment.on('show', function (e) {
                                        fetch();
                                    }).on('hide', function () {
                                        clearTimeout(loadTimeout);
                                    });
                                } else {
                                    fetch();
                                }
                            } else {
                                if (App.modules[id] === undefined) App.get(id);
                            }
                        }

                        // EVENT

                        dom.Touch().on(value[1] || 'tap', function (event) {

                            // 当指令被修改时，触发时获取未来模块

                            var param = that.commands('param', node).value;
                            var eventa = that.commands('data-event', node).value;

                            // 去重

                            if (Date.now() - actionTime < 300) return false;

                            // actionTime

                            actionTime = Date.now();

                            // trigger

                            App.trigger('transform', { id: id, od: App.id, param: param ? param.paramsToObject() : {}, data: eventa ? eventa.paramsToObject() : {}, event: event });

                            // transform module

                            App.transform.to(id, param, null, { touches: event });

                            // stopPropagation

                            event.stopPropagation();

                            return false;
                        });
                    });

                    break;

                case 'href':

                    if (value.indexOf('#') === 0) {
                        value = App.route(value.substr(1));

                        this.setAttribute(root, node, 'transform', value.id, scope);
                        this.setAttribute(root, node, 'param', value.param, scope);

                        return false;
                    }

                    // EVENT

                    this.mission[root.order].events.unshift(function (window) {
                        var events = value.split('|');
                        var url = this.realpath(root, events[0]);

                        dom.addEventListener('click', preventDefaultEvent, false);
                        dom.Touch().on(events[1] || 'tap', function (event) {
                            var target = that.commands('target', node).value;
                            var eventa = that.commands('data-event', node).value;

                            // stopPropagation

                            event.stopPropagation();

                            // trigger

                            App.trigger('href', { data: eventa ? eventa.paramsToObject() : {}, event: event });

                            // open url

                            setTimeout(function () {
                                // allow exists

                                App._EXISTS = -1;

                                if (target) {
                                    top.open(url, target);
                                } else {
                                    top.location.href = url;
                                }
                            }, 200);

                            return false;
                        });
                    });

                    break;

                case 'src':
                case 'url':
                case 'uri':
                case 'link':
                case 'path':
                case /^(src:|url:|uri:|link:|href:|path:)+(.*?)$/.test(name) ? name : null:

                    value = this.realpath(root, value);

                    break;

                case 'style':

                    value = this.css.compile(this.module.id, value + ';', scope, {
                        sid: this.spath(root.id),
                        path: root.path,
                        descendant: false
                    }, dom);

                    break;

                case 'toggle-class':

                    this.mission[root.order].events.push(function (window) {
                        var events = value.split('|');
                        var className = events[0];
                        var eventName = events[1].trim();
                        var eventNames = eventName.split(' ');

                        if (eventName) {

                            // EVENT

                            dom.Touch().on(eventName, function (event) {

                                if (eventNames.length == 2) {
                                    if (event.type == eventNames[0]) {
                                        dom.addClass(className);
                                    } else {
                                        dom.removeClass(className);
                                    }
                                } else {
                                    if (dom.hasClass(className)) {
                                        dom.removeClass(className);
                                    } else {
                                        dom.addClass(className);
                                    }
                                }

                                return false;
                            });
                        }
                    });

                    break;

                case 'tap-highlight':

                    this.mission[root.order].events.push(function (window) {
                        dom.on('touchstart mousedown', function (e) {
                            var startTimeId;
                            var cancleTimeId;

                            startTimeId = setTimeout(function () {
                                rAF(function () {
                                    dom.addClass(value);
                                });
                                cancleTimeId = setTimeout(function () {
                                    rAF(function () {
                                        dom.removeClass(value);
                                    });
                                }, 3000);
                            }, 50);

                            this.one('touchmove touchend touchcancel mousemove mouseup mousecancel', function (e) {

                                if (['touchmove', 'mousemove'].consistOf(e.type)) {
                                    clearTimeout(startTimeId);
                                    clearTimeout(cancleTimeId);
                                }

                                setTimeout(function () {
                                    rAF(function () {
                                        dom.removeClass(value);
                                    });
                                }, 200);
                            });
                        });
                    });

                    break;

                case name.indexOf('on-') == 0 ? name : null:

                    this.mission[root.order].events.unshift(function (window) {
                        var scopeID = root.scopeid;
                        var scopeEvent = value.split('::');
                        var scopeNamedIP = scopeEvent.length == 2 ? scopeEvent[0] : 'default';
                        var scopeEventName = name.split('-')[1];
                        var scopeNamedEvent = scopeEvent.length == 2 ? scopeEvent[1] : scopeEvent[0];
                        var scopeFunctionName = /[^(]+/.exec(scopeNamedEvent)[0];
                        var scopeFunctionEval = function scopeFunctionEval(window) {
                            return window.EVALSCOPE[(scopeID ? root.scopeid + ':' : '') + scopeNamedIP] || function (js, e) {
                                new window.Function(scopeFunctionName + '.apply(this, [].slice.call(arguments, 1))')(e);
                            };
                        };
                        var scopeInjectFunction = function scopeInjectFunction(window) {
                            return function () {
                                var applys = [scopeFunctionName];
                                var args = arguments;

                                if (scopeFunctionArguments.length) {
                                    scopeFunctionArguments.each(function (i, arg) {
                                        arg = arg.trim();

                                        switch (arg) {
                                            case 'this':
                                                arg = dom;
                                                break;
                                            case 'event':
                                                arg = args[0];
                                                break;
                                        }

                                        applys.push(arg);
                                    });
                                } else {
                                    applys.push(args[0]);
                                }

                                scopeFunctionEval(window).apply(this, applys);
                            };
                        };
                        var scopeFunctionArguments = (/\((.*)\)/.exec(scopeNamedEvent) || [null, ''])[1].split(',');

                        switch (scopeEventName.split('-')[0]) {

                            // on-event = 'events | function(event)'

                            case 'event':
                            case 'events':

                                scopeNamedEvent = scopeNamedEvent.split('|');
                                scopeEventName = scopeNamedEvent[1];
                                scopeNamedEvent = scopeNamedEvent[0];

                                break;
                        }

                        // EVENT

                        switch (scopeEventName.split(' ')[0]) {

                            case 'pan':
                            case 'panstart':
                            case 'panmove':
                            case 'panend':
                            case 'pancancel':
                            case 'panleft':
                            case 'panright':
                            case 'panup':
                            case 'pandown':

                            case 'pinch':
                            case 'pinchstart':
                            case 'pinchmove':
                            case 'pinchend':
                            case 'pinchcancel':
                            case 'pinchin':
                            case 'pinchout':

                            case 'press':
                            case 'pressup':

                            case 'rotate':
                            case 'rotatestart':
                            case 'rotatemove':
                            case 'rotateend':
                            case 'rotatecancel':

                            case 'swipe':
                            case 'swipeleft':
                            case 'swiperight':
                            case 'swipeup':
                            case 'swipedown':

                            case 'tap':

                                // dom bind events 

                                dom.Touch().on(scopeEventName, function (event) {
                                    event.self = dom;

                                    var eventData = that.commands('data-event', node).value;
                                    var preventDefault = that.commands('prevent-default', node).key ? true : false;
                                    var stopPropagation = that.commands('stop-propagation', node).key ? true : false;

                                    if (preventDefault) {
                                        event.preventDefault();
                                    }

                                    if (stopPropagation) {
                                        event.stopPropagation();
                                    }

                                    scopeInjectFunction(window)(event);

                                    // trigger

                                    App.trigger('touch', { data: eventData ? eventData.paramsToObject() : {}, event: event });
                                });

                                break;

                            default:

                                dom.on(scopeEventName, scopeInjectFunction(window));

                                break;
                        }
                    });

                    break;
            }

            return value || '';
        },

        /**
         * 文档节点语法拓展
         * @param  {Object}
         * @param  {Node}
         * @param  {Object}
         * @param  {Object}
         * @return {Function}
         */
        tagRule: function tagRule(root, node, scope, react) {
            var that = this;
            var uuid = node.uuid;
            var targid = this.target(node);
            var name = node.nodeName;
            var dom = this.DOMS[uuid];
            var command = dom.attributes;

            // filter

            switch (name) {
                case 'IF':
                case 'ELSE':
                case 'ELSEIF':
                    node.command = true;

                    root.uuid = uuid;
                    root.target = targid;

                    var origin = this.sign(name, command, 'is', -1, ['(', ')']) || this.sign(name, command, 'not', -1, ['!(', ')']) || command[0].name;

                    var pass = this.getValueByRoute(scope, origin);
                    var next = node.nextElementSibling;
                    var factor = node.factor;
                    var nextElse = name !== 'ELSE' && next && next.nodeName === 'ELSE';
                    var nextElseIf = name !== 'ELSE' && next && next.nodeName === 'ELSEIF';
                    var cloneRoot = root.clone();
                    var cloneNode = node.cloneNode(true);

                    // mark command line

                    if (!pass) cloneNode.innerHTML = '\n';

                    // compile source

                    this.insert(cloneRoot, function () {
                        return this.compile(cloneRoot, cloneNode, scope, true);
                    });

                    // next is else or elseif

                    if (nextElse) {
                        next.setAttribute('is', factor ? factor[0] + '&&' + '!(' + factor[1] + ')' : '!(' + origin + ')');
                    } else if (nextElseIf) {
                        factor = ['!(' + origin + ')', next.getAttribute('is')];

                        next.extendProperty('factor', factor);
                        next.setAttribute('is', factor.join('&&'));
                    }

                    // react of origin

                    react.call(this, origin, root, node);

                    break;

                case 'LOOP':
                    node.command = true;

                    root.uuid = uuid;
                    root.target = targid;

                    var origin = this.sign(name, command, 'data', 0);
                    var loops = this.getValueByRoute(scope, origin) || [];
                    var value = command[2] ? command[2].name : '$value';
                    var index = command[3] ? command[3].name : '$index';
                    var cloneRoot;
                    var cloneScope;

                    this.insert(root, function () {

                        var fragment = this.creatFragment();

                        loops.each(function (key, row) {

                            /* 防止污染 cloneRoot cloneNode cloneScope
                             * 注意：clone root 操作要在each中进行
                             * 注意：clone Node 操作要在each中进行
                             */

                            cloneRoot = root.clone();
                            cloneNode = node.cloneNode(true);

                            cloneScope = scope.clone();
                            cloneScope[index] = key;
                            cloneScope[value] = row;

                            var child = that.compile(cloneRoot, cloneNode, cloneScope, true);

                            that.into(cloneRoot, child.uuid, fragment.uuid);
                        });

                        return fragment;
                    });

                    // set DOM

                    /* loop 标签的数据源和主scope为分离的
                     * 如果要通过数据驱动loop 的子集的变化，则通过改变 dom.scope 的子对象来修改视图
                     * 分离只影响loop 数据源的子集，loop整体的数据源对象改变则不受此限制 
                     */

                    dom.extendProperty("scope", cloneScope);

                    // WATCH

                    react.call(this, origin, root, node);

                    break;

                case 'SWITCH':
                    node.command = true;

                    root.uuid = uuid;
                    root.target = targid;

                    var origin = this.sign(name, command, 'case', 0);
                    var accord = this.getValueByRoute(scope, origin) || true;
                    var elements = this.creatFragment();

                    this.insert(root, function () {
                        node.children.each(function (key, childNode) {

                            var cloneRoot = root.clone();
                            var childName = childNode.nodeName;
                            var childAttr = childNode.attributes;
                            var caseExp = that.sign(name, childAttr, accord === true ? 'is' : 'value', 0);
                            var caseConst = accord === true ? that.getValueByRoute(scope, caseExp) : caseExp;

                            if (accord == caseConst || childName == 'default') {

                                elements.appendChild(that.compile(cloneRoot, childNode, scope, true));

                                return false;
                            }
                        });

                        return elements;
                    });

                    // WATCH

                    react.call(this, origin, root, node);

                    break;

                case 'VAR':
                    node.command = true;

                    var id = this.sign(name, command, 'name', 0);
                    var val = node.textContent;

                    // DEBUG

                    if (id == null) {
                        this.debug(name, 'name=?', true);
                    }

                    scope[id] = scope.getValueByRoute(val);

                    break;

                case 'INPUT':
                case 'TEXTAREA':
                case 'HTMLAREA':

                    /* DEMO
                     * 1. <input react="keydown" value="{data.count}">
                     * 2. <input react="data.count|keyup" value="{{data.num + data.count}}">
                     */

                    node.command = false;

                    var normal = this.commands('normal', node).key;
                    var reactEvent = this.commands('react', node);
                    var freeContainer = this.commands('free', node).key || name == 'HTMLAREA';
                    var currentScroller = this.commands('for-scroll', node).value;
                    var reactScroller = this.getElementById(currentScroller, root.scopeid);

                    // 富文本指令

                    if (name == 'HTMLAREA') {
                        dom.attr({
                            "contenteditable": "true",
                            "aria-multiline": "true",
                            "spellcheck": "true",
                            "role": "textbox",
                            "dir": "ltr"
                        }).css({
                            "overflow": "hidden",
                            "word-break": "break-all",
                            "word-wrap": "break-word",
                            "user-select": "text",
                            "cursor": "text"
                        });
                    }

                    // react event

                    if (reactEvent.key) {

                        var binds = reactEvent.value.split('|'),
                            origin = binds[0],
                            eventName = binds[1] || "change",
                            defaultValue = dom.defaultValue;

                        if (!eventName || !origin) break;

                        // DEBUG

                        if (scope.getValueByRoute(origin) !== undefined) {
                            dom.bind(eventName, function (event) {
                                scope.setValueOfHref(origin, name === 'HTMLAREA' ? this.textContent : this.value || this.getAttribute('default-value') || defaultValue || '');
                            });
                        }
                    }

                    // transformstart blur

                    this.module.on('hide', function () {
                        dom.blur();
                    });

                    // input scroll

                    this.mission[root.order].events.push(function (window) {

                        var scroll = null;
                        var factWindowHeight = top.innerHeight;
                        var keyboardHeight = 0;
                        var initialTop = 0;
                        var timeStamp = 0;
                        var rangeOffset = null;
                        var scrollOffsetTop = parseInt(that.commands('scroll-offset-top', node).value || 0) * device.ui.scale;
                        var scrollOffsetBottom = parseInt(that.commands('scroll-offset-bottom', node).value || 0) * device.ui.scale;
                        var reactOffset = that.commands('react-offset', node).value;
                        var reactPosition = that.commands('react-position', node).value;
                        var reactResize = that.module.config.sandbox ? true : that.sign(name, command, 'react-resize', -1, null, true, false);
                        var reactOrigin = reactOffset || reactPosition;

                        var viewWrapper, viewCenter, viewOffset;

                        // up 时默认值

                        var minScrollY = 0;

                        function checkChange() {
                            factWindowHeight = top.innerHeight;
                            initialTop = dom.offset().top;
                            viewCenter = null;
                        }

                        function scrollTo(y, _y, t, s, r) {
                            r = r == undefined ? 1 : r;
                            y = y == undefined ? top.scrollY : y;
                            if (r == 1 ? y > _y : y < _y) return;
                            s = s == undefined ? Math.abs((_y - y) / t * 17.6) : s;
                            rAF(function () {
                                top.scrollTo(0, y += r * s);
                                scrollTo(y, _y, t, s, r);
                            });
                        }

                        function visibility() {
                            if (this.moving || this.wheeling) {
                                var top = dom.offset().top;
                                var height = dom.offsetHeight;
                                var viewTop = keyboardHeight + scrollOffsetTop;
                                var viewBottom = factWindowHeight - scrollOffsetBottom;

                                if (top + height <= viewTop || top >= viewBottom) {
                                    dom.blur();
                                }
                            }
                        }

                        function refreshCursor() {
                            rAF(function () {
                                dom.getSelectionRangeInsert('');
                            });
                        }

                        function getScroll(type) {
                            var scroller = reactScroller || dom.closest('scroll');

                            scroll = scroller ? scroller.scrollEvent : null;

                            if (scroll && type == 1) {
                                minScrollY = scroll.minScrollY;
                            }
                        }

                        function getViewOffset() {
                            // android : (top.scrollY == 0 ? keyboardHeight : 0)
                            viewOffset = viewCenter - rangeOffset.top - (top.scrollY == 0 ? keyboardHeight : 0) + (that.module.config.sandbox ? keyboardHeight : 0);

                            return viewOffset;
                        }

                        function keyboardUp(e) {
                            getScroll(1);

                            if (!scroll) return;

                            // refresh cursor {{

                            if (device.os.ios && device.os.iosVersion < 12) {
                                scroll.on('scroll scrollend', refreshCursor);
                            }

                            // }}

                            if (normal) return;

                            function upend(e) {

                                window.keyboard.height = keyboardHeight = top.scrollY || factWindowHeight - top.innerHeight;

                                // return

                                if (keyboardHeight == 0) return;

                                // change minScrollY

                                scroll.minScrollY = minScrollY + keyboardHeight;
                                scroll.options.minScrollY = scroll.minScrollY;

                                // 光标位置

                                rangeOffset = dom.getSelectionRangeOffset();

                                // 可见视图的中心

                                viewWrapper = factWindowHeight - keyboardHeight - scrollOffsetTop - scrollOffsetBottom;
                                viewCenter = keyboardHeight + viewWrapper / 2;

                                scroll.scrollBy(0, getViewOffset(), 300, null, false);

                                // 滚动到不可见区域时 blur

                                scroll.on('scroll', visibility);

                                window.trigger('keyboardup', {
                                    height: keyboardHeight
                                });

                                if (reactResize) {
                                    scrollTo(null, 0, 300, null, -1);
                                }
                            }

                            setTimeout(function () {

                                top.one('scrollend', upend);

                                // no scroll

                                setTimeout(function () {
                                    if (keyboardHeight == 0) upend();
                                }, 300);

                                // ``` old

                                var offset = 0;

                                if (device.os.mobileSafari && device.os.iosVersion < 12) {
                                    offset = 24 * viewportScale;
                                }

                                // scroll to bottom

                                scrollTo(null, viewportHeight - offset, 300, null, 1);
                            }, 300);
                        }

                        function keyboardDown() {
                            getScroll();

                            if (!scroll) return;

                            // ``` old : refresh cursor {{

                            if (device.os.ios && device.os.iosVersion < 11) {
                                scroll.off('scroll scrollend', refreshCursor);
                            }

                            // }}

                            if (normal) return;
                            if (keyboardHeight == 0) return false;

                            top.scrollTo(0, 0);
                            scroll.wrapper.scrollTop = 0;

                            // change minScrollY

                            scroll.minScrollY = minScrollY;
                            scroll.options.minScrollY = minScrollY;
                            scroll.off('scroll', visibility);
                            scroll._refresh();

                            window.keyboard.height = keyboardHeight = 0;
                        }

                        function selectionRange(e) {
                            getScroll();

                            if (!scroll) return;

                            // 非箭头按键取消

                            if (e.type == 'keyup' && ![8, 13, 37, 38, 39, 40].consistOf(e.keyCode)) return;

                            // 重置光标位置

                            if (reactOffset) {
                                rangeOffset = dom.getSelectionRangeOffset();
                            } else if (reactPosition) {
                                rangeOffset = dom.getSelectionRangePosition();
                            }

                            if (reactOrigin && rangeOffset) {
                                rangeOffset.each(function (i, v) {
                                    scope.setValueOfHref(reactOrigin + '.' + i, v);
                                });
                            }

                            if (normal) return;

                            // 光标居中

                            if (e.type == 'input' && e.timeStamp - timeStamp < 2000) return;
                            if (!scroll || !viewCenter) return;
                            if (!reactOffset) {
                                rangeOffset = dom.getSelectionRangeOffset();
                            }

                            timeStamp = e.timeStamp;

                            scroll.scrollBy(0, getViewOffset(), 300, null, false);
                        }

                        dom.on('click', checkChange);
                        dom.on('focus', keyboardUp);
                        dom.on('blur', keyboardDown);
                        dom.on('focus keyup input paste mouseup', selectionRange);
                    });

                    break;

                case 'COMMIT':
                    node.command = false;
                    root.commiter = dom;

                    // commit

                    dom.extendProperty("commit", function (callback) {
                        var params = {};
                        var method = that.commands("method", node).value;
                        var action = that.commands("action", node).value;

                        dom.find('input, textarea, htmlarea').each(function (i, elem) {
                            var name = elem.name;
                            var value = elem.value;

                            if (name && value !== undefined) {
                                params[name] = value;
                            }
                        });

                        method = ['get', 'post'].indexOf(method) == -1 ? 'get' : method;

                        promise[method](action, params).then(callback);
                    });

                    break;

                case 'IMG':
                case 'VIDEO':
                    node.command = false;

                    var onloadClass = that.commands('onload-class', node).value;

                    // img/video onload or onerror then refresh scroller

                    dom.onload = dom.onerror = dom.onabort = function (event) {

                        that.reflow(dom.previousScroller);

                        if (onloadClass && event.type == "load") {
                            dom.addClass(onloadClass);
                        }
                    };

                    // block ondrag

                    dom.onselectstart = dom.ondragstart = function (event) {
                        event.preventDefault();
                        return false;
                    };

                    break;

                case 'FRAGMENT':
                    node.command = false;
                    root.fragment = dom;

                    break;

                /**
                 * <scroll>
                 * 滚动区域标签
                 * 创建不同滚动类型
                 */
                case 'SCROLL':
                    node.command = false;
                    root.uuid = uuid;
                    root.scroller = dom;

                    /**
                     * 检测infinite类型
                     * @type {Boolean}
                     */
                    var finite = this.sign(name, command, 'finite', -1, null, true, false);
                    var infinite = this.sign(name, command, 'infinite', -1, null, true, false);

                    /**
                     * 创建infinite视图
                     * @param  {[type]} infinite [description]
                     * @return {[type]}          [description]
                     */

                    if (finite) {
                        this.compile(root, this.parser('<scrolling></scrolling>'), {});
                    } else if (infinite) {
                        /**
                         * infiniteViewSize 滚动视图区域
                         * infiniteSimSize 单个item高度
                         * infiniteMinSize 最小item高度
                         * infiniteCycles 最小循环数
                         */
                        var infiniteViewSize = Math.max(dom.offsetHeight, dom.offsetWidth) || Math.max(device.ui.height, device.ui.width);
                        var infiniteSimSize = this.commands('item-size', node).value || false;
                        var infiniteMinSize = infiniteSimSize || this.commands('item-min-size', node).value || 100;
                        var infiniteCycles = Math.max(infiniteMinSize && infiniteViewSize ? Math.ceil(6 * infiniteViewSize / (device.ui.scale * infiniteMinSize)) : this.commands('cycles', node).value || 5, 5);

                        // item infinite list 

                        this.compile(root, this.parser('<scrolling>' + '<infinite></infinite>'.repeat(infiniteCycles) + '</scrolling>'), {});
                    }

                    // event

                    this.mission[root.order].scroller.push(function (window) {

                        var config = {
                            startX: this.sign(name, command, 'start-x', -1, null, true, 0),
                            startY: this.sign(name, command, 'start-y', -1, null, true, 0),
                            scrollX: this.sign(name, command, 'x', -1, null, true, false),
                            scrollY: this.sign(name, command, 'y', -1, null, true, true),
                            freeScroll: this.sign(name, command, 'free', -1, null, true, false),
                            stepLimit: this.sign(name, command, 'step-limit', -1, null, false, 120),
                            speedLimit: this.sign(name, command, 'speed-limit', -1, null, false, 4),
                            speedRate: this.sign(name, command, 'speed-rate', -1, null, false, 1),
                            scrollbars: this.sign(name, command, 'scrollbars', -1, null, true, true),
                            indicator: this.sign(name, command, 'indicator', -1, null, true, null),
                            snap: this.sign(name, command, 'snap', -1, null, true, false),
                            zoom: this.sign(name, command, 'zoom', -1, null, true, false),
                            bounce: this.sign(name, command, 'bounce', -1, null, true, true),
                            momentum: this.sign(name, command, 'momentum', -1, null, true, true),
                            mouseWheel: this.sign(name, command, 'mouse-wheel', -1, null, true, true),
                            deferred: this.sign(name, command, 'deferred', -1, null, true, false),
                            deceleration: this.sign(name, command, 'deceleration', -1, null, false, 0.003),
                            useTransition: this.sign(name, command, 'use-transition', -1, null, true, true),
                            interactive: this.sign(name, command, 'interactive', -1, null, true, true),
                            bindToWrapper: this.sign(name, command, 'bind-event-self', -1, null, true, true),
                            preventDefault: this.sign(name, command, 'prevent-default', -1, null, true, true),
                            stopPropagation: this.sign(name, command, 'stop-propagation', -1, null, true, 'auto'),
                            coverPropagation: this.sign(name, command, 'cover-propagation', -1, null, true, true),
                            directionLockThreshold: this.sign(name, command, 'direction-lock-threshold', -1, null, false, 5),
                            directionLockThresholdX: this.sign(name, command, 'direction-lock-threshold-x', -1, null, false, false),
                            directionLockThresholdY: this.sign(name, command, 'direction-lock-threshold-y', -1, null, false, false)
                        };

                        if (config.indicator || config.scrollbars) {
                            config.extend({
                                fadeScrollbars: this.sign(name, command, 'fade-scrollbars', -1, null, true, true)
                            });
                        }

                        if (config.mouseWheel) {
                            config.extend({
                                mouseWheelSpeed: this.sign(name, command, 'mouse-wheel-speed', -1, null, false, 0.15),
                                mouseWheelAction: this.sign(name, command, 'mouse-wheel-action', -1, null, false, 'normal'),
                                invertWheelDirection: this.sign(name, command, 'invert-wheel-direction', -1, null, false, false)
                            });
                        }

                        if (config.snap) {
                            config.extend({
                                snapEasing: this.sign(name, command, 'snap-easing', -1, null, false, ''),
                                snapDuration: this.sign(name, command, 'snap-duration', -1, null, false, 400),
                                snapThreshold: this.sign(name, command, 'snap-threshold', -1, null, false, 0.15)
                            });
                        } else if (config.zoom) {
                            config.extend({
                                zoomMin: this.sign(name, command, 'zoom-min', -1, null, false, 1),
                                zoomMax: this.sign(name, command, 'zoom-max', -1, null, false, 6),
                                startZoom: this.sign(name, command, 'start-zoom', -1, null, false, 1),
                                zoomOrigin: this.sign(name, command, 'zoom-origin', -1, null, false, '0,0,0')
                            });
                        }

                        // infinite

                        if (finite || infinite) {

                            var source = '';
                            var originNames = this.sign(name, command, 'data-origin', -1);
                            var dataOrigin = originNames ? originNames.split(',') : [];
                            var dataLink = this.sign(name, command, 'data', -1);
                            var dataName = dataLink ? dataLink.split(/\.|\[/).shift() : dataOrigin[0];
                            var dataSets = dataOrigin.length ? dataOrigin : [dataName];
                            var dataRows = scope[dataName] || null;
                            var dataEnds = this.sign(name, command, 'end-flag', -1, null, false, null);
                            var dataLimit = this.sign(name, command, 'limit', -1, null, false, 10);
                            var template = this.sign(name, command, 'template', -1, null, false, null);

                            if (!template) {
                                template = uuid;
                                this.set(root.spacename, template, node.find('scrolling').html());
                            }

                            // 保存模版缓存

                            source = this.take(root.spacename, template, '<fragment>', '</fragment>');

                            // 滚动数据翻页

                            var turnover = function turnover(start, _turnover, callback) {

                                var data = dataRows && this.infiniteDataLength === 0 ? scope : null;

                                that.module.turnover({
                                    id: uuid,
                                    data: data,
                                    start: start,
                                    limit: dataLimit,
                                    linker: dataLink,
                                    origins: dataSets,
                                    endflag: dataEnds,
                                    turnover: _turnover
                                }, function (row, end) {
                                    if (row == null && end == false) that.debug(name, 'data={Array}', null);

                                    // 回调给滚动组件

                                    callback(row, end);

                                    dataRows = null;
                                });
                            };

                            config.extend({
                                maxPage: this.sign(name, command, 'max-page', -1, null, false, 1000)
                            });
                        }

                        if (finite) {
                            config.extend({
                                finite: finite,
                                finiteFragment: this.creatFragment(),
                                getInfiniteDataset: turnover,
                                getFiniteCacheBuffer: function getFiniteCacheBuffer(data, key) {

                                    // no data

                                    if (!data) return;

                                    data.__proto__ = scope;

                                    data.scroll = {
                                        x: this.x,
                                        y: this.y,
                                        index: key

                                        // uuid 多滚动条

                                    };key = uuid + ':' + key;

                                    // reset order

                                    root.uuid = key;
                                    root.order = key;

                                    // compile

                                    that.compile(root, source.cloneNode(true), data);

                                    // Fragment

                                    this.finiteFragment.appendChild(that.DOMS[key]);

                                    // async end, wait view show

                                    setTimeout(function () {
                                        that.end(key);
                                    }, 0);
                                }
                            });
                        } else if (infinite) {
                            config.extend({
                                infinite: infinite,
                                infiniteElements: dom.children[0].children,
                                infiniteItemSize: Number(infiniteSimSize),
                                infiniteCacheBuffer: this.sign(name, command, 'buffer', -1, null, false, 50),
                                getInfiniteDataset: turnover,
                                setInfiniteDataFiller: function setInfiniteDataFiller(nodes, key) {

                                    // uuid 多滚动条

                                    var id = uuid + ':' + key;
                                    var node = nodes.children[0];
                                    var fragment = that.DOMS[id];

                                    if (node) {
                                        fragment.appendChild(node);
                                        node.trigger('hide', { key: key });
                                    }
                                },
                                getInfiniteDataFiller: function getInfiniteDataFiller(tabview, key, rekey) {

                                    // uuid 多滚动条

                                    var curid = uuid + ':' + key;
                                    var preid = uuid + ':' + rekey;

                                    // setInfiniteDataFiller

                                    this.setInfiniteDataFiller(tabview, rekey);

                                    // update doms

                                    if (this.updating) {
                                        that.DOMS[curid] = null;
                                        delete that.DOMS[curid];
                                    }

                                    // append to tabview

                                    tabview.appendChild(that.DOMS[curid] || this.updateInfiniteCache(key));

                                    // fragment show event

                                    tabview.children[0].trigger('show', { key: key });

                                    // end

                                    that.end(curid);
                                },
                                getInfiniteCacheBuffer: function getInfiniteCacheBuffer(data, key) {

                                    // no data

                                    if (!data) return;

                                    data.__proto__ = scope;

                                    data.scroll = {
                                        x: this.x,
                                        y: this.y,
                                        index: key

                                        // uuid 多滚动条

                                    };key = uuid + ':' + key;

                                    // check exists

                                    if (!that.DOMS[key]) {

                                        // reset order

                                        root.uuid = key;
                                        root.order = key;

                                        // compile

                                        that.compile(root, source.cloneNode(true), data);
                                    }

                                    return that.DOMS[key];
                                }
                            });
                        }

                        // new scroll

                        dom.Scroll(config, window);

                        // module hidden stop scroll

                        this.module.on('hide', dom.scrollEvent.stop);
                    });

                    break;

                case 'SCROLLING':
                case 'SCROLLBAR':
                case 'PULLUP':
                case 'PULLDOWN':
                case 'PULLRIGHT':
                case 'PULLLEFT':
                case 'SCROLLCOVER':

                    root.scroller.extendProperty(name.toLowerCase(), dom);

                    break;

                case 'STYLE':
                    node.command = false;

                    var src = node.getAttribute('src');
                    var context = node.textContent;
                    var innerCSSText = function innerCSSText(style, cssText) {

                        // 不支持shadowRoot的css作用域方案

                        cssText = that.css.compile(that.module.id, cssText, scope, {
                            path: root.path,
                            target: that.DOMS[root.target],
                            descendant: root.spacename && !dom.createShadowRoot ? '.shadow-root-' + root.scopeid.replace(/\./g, '-') : false
                        });

                        if (src) {
                            style.innerHTML = cssText;
                        } else {
                            style.textContent = cssText;
                        }
                    };

                    if (src) {
                        promise.get(this.realpath(root, src)).then(function (err, context, xhr) {
                            innerCSSText(dom, context);
                            that.reflow(dom.previousScroller);
                        });
                    } else {
                        innerCSSText(node, context);
                    }

                    break;

                case 'SCRIPT':
                    node.command = true;

                    var src = this.commands('src', node).value;
                    var sync = this.commands('sync', node).key;
                    var global = this.commands('global', node).key;
                    var normal = this.commands('normal', node).key;
                    var rooot = {}.extend(root);
                    var imports = global ? [] : null;
                    var prepath = root.scopeid ? root.path : App.config.root + 'modules/' + this.module.id;
                    var doorplate = this.commands('name', node).value || 'default';
                    var javascript = node.textContent;

                    // scope

                    if (sync) {

                        new this.sandbox.window.Function('scope, root', javascript + '\n')(scope, that.DOM[rooot.scopeid]);

                        node.textContent = null;

                        break;
                    }

                    // run script

                    this.mission[rooot.order].scripts.push(function (window) {

                        function run() {

                            if (imports) {

                                javascript = javascript.replace(REGEXP.imports, function (context, id, path) {
                                    path = prepath + '/' + id;
                                    imports.push('"' + path + '"');

                                    return context.replace(id, path);
                                });

                                javascript = 'var __EVAL__ \n' + 'define("argument", ' + (imports.length ? '[' + imports.join(',') + '], ' : ' ') + 'function (require, module, exports) { \n' + javascript + '\n\n' + '__EVAL__ = function (fn) { return eval("(" + fn.toString() + ").apply(this, [].slice.call(arguments, 1))") } \n' + (global ? '__inject__["' + rooot.spacename + '"].ready()' : '') + '\n' + '}) \n';
                            }

                            if (rooot.scopeid) {

                                if (global) {

                                    if (!that.sandbox.window[rooot.spacename]) {

                                        // global > App.sandbox

                                        new that.sandbox.window.Function('__inject__', javascript + '\n' + 'function __Global__ () { \n' + ' this.init() \n' + '} \n' + '__Global__.prototype = { \n' + ' init : function () { \n' + '  this._readies = [] \n' + '  this._readied = false \n' + ' }, \n' + ' call : function () { \n' + '  if ( !this._readied ) { \n' + '   this._readies.push(arguments) \n' + '  } else { \n' + '   return __EVAL__.apply(this, arguments) \n' + '  } \n' + ' }, \n' + ' ready : function () { \n' + '  var that = this \n' + '    , args = arguments \n' + '  this._readies.each(function (i, args) { \n' + '   return __EVAL__.apply(this, args) \n' + '  }) \n' + '  this._readied = true \n' + ' } \n' + '} \n' + '__inject__["' + rooot.spacename + '"] = new __Global__()')(that.sandbox.window);
                                    }
                                } else {

                                    new window.Function('__inject__, shadow, scope, node, global, components, register, root', javascript + '\n' + '__inject__["' + rooot.scopeid + ':' + doorplate + '"] = ' + 'function (fn) { \n' + 'return eval("(" + fn.toString() + ").apply(this, [].slice.call(arguments, 1))") \n' + '} \n')(window.EVALSCOPE, rooot.shadowroot, scope, function (uuid) {
                                        return that.getElementById(uuid, rooot.scopeid);
                                    }, that.sandbox.window[rooot.spacename], rooot.dom, function (name, fn) {
                                        rooot.dom.extendProperty(name, fn);
                                    }, that.DOMS[rooot.scopeid]);
                                }
                            } else {

                                if (normal) {

                                    window.eval(javascript);
                                } else {

                                    new window.Function('__inject__, scope, node, root', javascript + ' \n' + '__inject__["' + doorplate + '"] = ' + 'function (fn) { \n' + 'return eval("(" + fn.toString() + ").apply(this, [].slice.call(arguments, 1))") \n' + '} \n')(window.EVALSCOPE, scope, function (uuid) {
                                        return that.getElementById(uuid, 0);
                                    }, that.DOM[0]);
                                }
                            }
                        }

                        if (javascript) {
                            run();
                        }

                        if (src) {
                            promise.get(src).then(function (err, data, xhr) {
                                if (err) return;
                                javascript = data;

                                run();
                            });
                        }
                    });

                    node.textContent = null;

                    break;

                case 'TEMPLATE':
                    node.command = true;

                    var id = this.sign(name, command, 'name', 0);

                    this.set(root.spacename, id, node.innerHTML, root.id);

                    break;

                case 'INCLUDE':
                    node.command = true;
                    root.uuid = targid;

                    var id = this.sign(name, command, 'name', 0);
                    var data = this.datar(scope, command, true, 1, 0);
                    var source = this.take(root.spacename, id);
                    var cloneRoot = root.clone();

                    if (source) {
                        node.innerHTML = null;
                        cloneRoot.id = id;
                        this.compile(cloneRoot, source, data);
                    }

                    break;

                case name.indexOf('-') != -1 ? name : 'SHADOW':

                    var data = this.datar(scope, command, true);
                    var blackbox = name === 'SHADOW';
                    var cloneNode = node.cloneNode(true);
                    var shadowRoot = this.createShadowRoot(root, node, dom, data);
                    var shadowId = shadowRoot.id;
                    var shadowDOM = shadowRoot.dom;
                    var rooot = {}.extend(root);
                    var cfg = that.module.config.components || {};
                    var src = this.commands("src", node).value;
                    var pth = this.commands("path", node).value;
                    var demo = this.commands('demo', node).key;
                    var path = src || (pth || cfg.path || App.config.root + 'components') + '/' + name.toLowerCase();
                    var source = blackbox || demo ? that.parser(node.innerHTML) : null;

                    // compile shadowDOM

                    var compile = function compile(source, data, path) {

                        // clear components

                        shadowDOM.innerHTML = null;

                        // pre scope id

                        shadowDOM.scopeid = rooot.scopeid;

                        // insert components

                        rooot.sid = "components";
                        rooot.uuid = shadowId;
                        rooot.dom = dom;
                        rooot.order = shadowId;
                        rooot.scopeid = shadowId;
                        rooot.spacename = name;
                        rooot.path = path;

                        rooot.shadowroot = shadowRoot.shadow || this.window.validWindow.document;

                        // compile

                        this.compile(rooot, source, data);

                        // refresh scroller

                        this.reflow(dom.previousScroller);

                        // bind events

                        this.end(shadowId);

                        // onload

                        dom.trigger('load');
                        dom.loadState = 'complete';
                    };

                    var render = function render(data) {

                        // 组件中数据源引用clone node

                        data.components = cloneNode;

                        if (source) {
                            compile.call(that, source.cloneNode(true), data, null);
                            dom.trigger('ready');
                            dom.readyState = 'complete';
                        }

                        if (!blackbox) {
                            that.get('~/' + path + '/index.html', function (source) {
                                compile.call(that, source, data, path);
                                dom.trigger('ready');
                                dom.readyState = 'complete';
                            });
                        }

                        if (rooot.scroller) {
                            that.observer(shadowDOM, function (record) {
                                that.reflow(dom.previousScroller);
                            });
                        }
                    };

                    // creat shadow set

                    this.DOM[shadowId] = {};

                    // components, include source

                    this.components.waiting++;
                    this.mission[root.order].components.push(function (data) {
                        return function (window) {
                            render(data);
                            this.components.waiting--;
                        };
                    }(data));

                    node.innerHTML = null;

                    dom.extendProperty("update", render);
                    dom.extendProperty("reflow", function () {
                        that.reflow(dom.previousScroller);
                    });
                    dom.extendProperty("ready", function (fn) {
                        if (dom.readyState) fn();
                        dom.on('ready', fn);
                    });
                    dom.extendProperty("load", function (fn) {
                        if (dom.loadState) fn();
                        dom.on('load', fn);
                    });

                    // 简 on

                    dom.extendProperty("register", function (evt) {
                        if (dom[evt] == undefined) {
                            dom.extendProperty(evt, function (callback) {
                                dom.bind(evt, callback);
                            });
                        } else {
                            App.console.error('components register', 'componentsError', '"' + evt + '" is token');
                        }
                    });

                    break;

                default:

                    break;
            }
        },

        /**
         * 根据符号及序列获取值
         * @param  {String}
         * @param  {Attribute}
         * @param  {Srting}
         * @param  {Number}
         * @param  {String}
         * @param  {String}
         * @return {String}
         */
        sign: function sign(tag, command, _sign, index, wrap, boolean, repatriate) {

            // appoint 指定命令

            var appoint, assign, exact, name, value;

            if (index >= 0) {
                appoint = command[index];
            } else {
                exact = true;
                appoint = command.getNamedItem(_sign);
                if (!appoint && index === -1) return repatriate;
            }

            if (!appoint) this.debug(tag, _sign, command);

            name = appoint.name;
            value = appoint.value;

            assign = name === _sign;
            value = assign ? value : exact ? false : name;
            value = value && wrap ? wrap[0] + value + wrap[1] : value;

            if (["false", "none", null].consistOf(value)) {
                value = false;
            } else if (["", "true"].consistOf(value)) {
                value = true;
            } else if (!isNaN(value)) {
                value = Number(value);
            }

            return value;
        },

        /**
         * 根据序列获取数据
         * @param  {Object}
         * @param  {Attribute}
         * @param  {Boolean}
         * @param  {Number}
         * @return {Object}
         */
        datar: function datar(scope, command, ext, index, ignore) {

            return command.length ? function (datar) {

                if (ext) datar.__proto__ = scope;

                command.each(function (i, data, li, length) {
                    var name = data.name;
                    var value = data.value;

                    switch (name) {
                        case 'data':
                            datar.extend(scope.getValueByRoute(value));

                            break;

                        case name.indexOf('data:') === 0 ? name : null:
                            datar[name.slice(5)] = scope.getValueByRoute(value);

                            break;

                        default:
                            if (!value && i === index) {
                                datar.extend(scope.getValueByRoute(name));
                            } else if (i !== ignore) {
                                datar[name] = value || true;
                            }

                            break;
                    }
                }, datar);

                return datar;
            }({}) : scope;
        },

        /**
         * get command
         * @param  {String}
         * @param  {Node}
         * @return {Object}
         */
        commands: function commands(name, node) {
            var dom = this.DOMS[node.uuid];
            var command = node.attributes;
            var acommand = dom.attributes;

            if (acommand.getNamedItem(name)) {
                return {
                    key: true,
                    value: dom.getAttribute(name)
                };
            } else if (command.getNamedItem(name)) {
                return {
                    key: true,
                    value: node.getAttribute(name)
                };
            } else {
                return {
                    key: null,
                    value: null
                };
            }
        },

        /**
         * DOM监视器
         * @param  {HTMLElement}
         * @param  {Function}
         * @return {Object} DOM change data
         */
        observer: function observer(dom, callback) {
            dom.observer({
                childList: true,
                subtree: true,
                characterData: true
            }, callback);
        },

        /**
         * 视图重计算
         * @param  {Scroll}
         */
        reflow: function reflow(scroller) {
            if (scroller) {
                var scroll = scroller.scrollEvent;

                if (scroll) {
                    clearTimeout(scroll.refreshRequestId);
                    scroll.refreshRequestId = setTimeout(function () {
                        // timeout then scroll has been destroy
                        if (typeof scroll.refresh === 'function') {
                            scroll.refresh();
                        }
                    }, 300);
                }
            }
        },

        /**
         * Node类别处理
         * @param  {Object}
         * @param  {Node}
         * @param  {Object}
         */
        step: function step(root, node, scope) {

            // set node uuid

            this.uuid(root, node);

            // step node type

            switch (node.nodeType) {

                case Node.ELEMENT_NODE:

                    // creat element

                    this.createElement(root, node);

                    // set DOM

                    /* 父级和上级scroll 传递
                     * 传递受作用域影响
                     * 在 if, loop 等标签内时 previousScroller 受作用域影响，不会传递给外部
                     */

                    this.setProperty(root, node);

                    // let's replace attributes

                    for (var i = 0, l = node.attributes.length; i < l; i++) {
                        var name = node.attributes[i].name;
                        var value = node.attributes[i].value;

                        // set attribute

                        this.setAttribute(root, node, name, value, scope);
                    }

                    // tag rule

                    this.tagRule(root, node, scope, function (origin, root, node) {

                        // WATCH & reflow

                        this.watch(root, scope, origin, function () {
                            this.step(root, node, scope);

                            // event end

                            this.end(root.order);
                        }, node.uuid);
                    });

                    break;

                case Node.TEXT_NODE:

                    // create text node

                    this.createTextNode(root, node, node.textContent, scope);

                    break;
            }

            // append to parent

            this.append(root, node);
        },

        /**
         * Node walker
         * @param  {Node}
         * @param  {Function}
         */
        walker: function walker(nodes, callback) {
            var node;

            while (node = nodes.nextNode()) {
                callback.call(this, node);
            }
        },

        /**
         * include
         * @param  {Object}
         * @param  {String|Node}
         * @param  {String|Node}
         * @param  {Object}
         * @param  {Boolean}
         * @param  {Boolean}
         */
        include: function include(root, target, source, data, replace, inset) {

            source = typeof source == 'string' ? this.take(root.spacename, source) : source;
            target = typeof target == 'string' ? this.getElementById(target, root.scopeid) : target;

            // empty target

            if (replace) target.innerHTML = null;

            // compiled then refresh scroller

            root.uuid = target.uuid;
            source = this.compile(root, source, data, true);

            switch (inset) {
                case -1:
                    target.before(source);
                    break;

                case 1:
                    target.after(source);
                    break;

                default:
                    target.appendChild(source);
                    break;
            }

            // refresh scroller

            this.reflow(target.previousScroller);

            // event end

            this.end(root.order);
        },

        /**
         * 以数据渲染模版
         * @param  {String}
         * @param  {Object}
         * @param  {Object}
         * @return {HTMLElement}
         */
        render: function render(id, source, data) {
            this.save(source, data);

            // compile

            this.compile(this.state(id), this.get(id), data, true);

            return [this.DOMS[0], this.DOM2[0]];
        },

        /**
         * 编译模版
         * @param  {Object}
         * @param  {Node}
         * @param  {Object}
         * @param  {Boolean}
         * @return {HTMLElement}
         */
        compile: function compile(root, nodes, scope, creat) {
            var uuid = root.uuid;
            var node;

            if (nodes == undefined) return;

            // nodes 子节点为空

            nodes = this.iterator(nodes);
            node = nodes.nextNode();

            // creat mission callback

            uuid = this.creat(root, node, creat);

            // startTime

            this.startTime = Date.now();

            // walker

            this.walker(nodes, function (node) {
                this.step(root, node, scope);
            });

            // close quantum

            root.quantum.splice(-1);

            // endTime

            this.endTime = Date.now();
            this.countTime = this.endTime - this.startTime;
            this.renderCountTime += this.countTime;

            // Performance alerts

            if (this.countTime > (uuid == 0 ? 100 : 10)) {
                App.console.warn('<' + node.nodeName.toLowerCase() + '> Consuming too long', 'Performance warning', this.countTime / 1000 + 's');
            }

            return this.DOMS[uuid];
        },

        /**
         * 事件分发
         * @param  {String}
         * @param  {String}
         */
        dispatch: function dispatch(order, group) {

            // 模块被卸载

            if (!this.mission[order] || this.window !== this.module.elements.sandbox.window) return;

            // 异步事件

            for (var i = 0, l = this.mission[order][group].length; i < l; i++) {
                this.mission[order][group][i].call(this, this.window);
            }

            // 清空事件队列

            this.mission[order][group] = [];
        },

        /**
         * 渲染结束
         * 最后一个组件加载完毕时触发moduleload事件
         */
        over: function over(order) {
            if (order == 0) {
                if (this.window.window) {
                    this.window.trigger('moduleload');
                    App.trigger('moduleload', { id: this.module.id, module: this.module });
                }
            }

            if (this.components.waiting == 0) {
                this.components.waiting = -1;
                this.loaded();
                this.loaded = noop;

                App.console.info('Module [' + this.module.id + ']', 'rendering time-consuming', this.renderCountTime / 1000 + 's');

                if (this.window.window) {
                    this.window.trigger('moduleloadall');
                    App.trigger('moduleloadall', { id: this.module.id, module: this.module });
                }
            }
        },

        /**
         * 渲染结束
         * @param  {String}
         */
        end: function end(order) {

            // 按照顺序执行任务

            this.dispatch(order, 'parallel');
            this.dispatch(order, 'entanglement');
            this.dispatch(order, 'scroller');
            this.dispatch(order, 'components');
            this.dispatch(order, 'scripts');
            this.dispatch(order, 'events');
            this.dispatch(order, 'async');

            this.over(order);
        },

        /**
         * 加载结束
         * @param  {Function}
         * @return {Object}
         */
        load: function load(callback) {
            this.loaded = callback;

            return this;
        },

        /**
         * 错误处理
         * @param  {String}
         * @param  {String}
         * @param  {Object}
         */
        debug: function debug(tagname, type, e, end) {
            App.console.error('<' + tagname + ' ' + type + '=?>', 'DOMError', 'is not defined');
            if (e) App.console.dir([e]);
            if (end) throw '<' + tagname + '> error';
        }
    };

    module.exports = DOM;
});