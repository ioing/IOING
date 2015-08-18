function moderation (window) {

    var document = window.document;

    function Inject () {

    }

    Inject.prototype = {
        //定义模块
        define : function(id, deps, factory, post) { //模块名,依赖列表,模块本身
            if ( modules[id] ) {
                throw "module " + id + " 模块已存在!";
            }
            //存在依赖导入
            if ( arguments.length > 2 ) {
                modules[id] = {
                    id: id,
                    deps: deps,
                    factory: factory
                };
                //后加载
                post && this.require(id, function(this) {
                    post(this)
                })
            } else {
                factory = deps;
                modules[id] = {
                    id: id,
                    factory: factory
                };
            }
        },

        require : function(id, callback) {
            //数组形式
            //require(['domReady', 'App'], function(domReady, app) {});
            if ( isArray(id) ) {
                if (id.length > 1) {
                    return makeRequire(id, callback);
                }
                id = id[0];
            }

            if ( !modules[id] ) {
                throw "module " + id + " not found";
            }

            if ( callback ) {
                var module = build(modules[id]);
                callback(module)
                return module;
            } else {
                if (modules[id].factory) {
                    return build(modules[id]);
                }
                return modules[id].exports;
            }
        },

        import : function () {
            var node = document.createElement("script")
        },

        config : function (config) {

        }
    }

    window.define = Inject.define;
    window.require = Inject.require;
}