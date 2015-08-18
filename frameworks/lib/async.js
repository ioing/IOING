define(function (require, exports, module) {
    "use strict";

    var Get = function () {
        if ( !(this instanceof Get) ) {
            return new Get();
        }
    }

    Get.prototype = {
        uri : function (id, name, type, callback) {
            var uri,
                module = application.modules[id];

            // 模块配置

            if ( !module ) {

                application.get(id, function () {
                    this.uri(id, name, type, callback);
                }, this);

                return false;
            }

            // get uri;

            try {

                uri = module.resources[type][name];

            } catch (e) {

                throw type + ":" + name + " uri error";

                return false;

            }

            if ( typeof uri === "string" ) {
                // 映射;
                if ( uri.indexOf('::') > 0 ) {
                    uri = uri.split(/\:\:/);

                    if ( uri.length === 2 ) return this.uri(uri[0], uri[1], type, callback);
                }

                if ( uri.indexOf('!SQL:') === 0 ) {
                    uri = uri.split(/\:/)[1];
                    
                    return callback.call(this, id, name, uri, 'sql');

                } else if ( uri.indexOf('://') > 0 ) {
                    application.modules[id].network = true;
                } else if ( uri.indexOf('/') === 0 ) {
                    uri = 'modules/' + uri.substr(1);
                } else if ( uri.indexOf('./') === 0 ) {
                    uri = 'modules/' + id + uri.substr(1);
                } else {
                    uri = 'modules/' + id + '/' + uri;
                }

                // helpher;
                if ( uri.indexOf("|") > -1 ) {
                    uri = uri.split(/\|/);

                    var url = uri[0],
                        helpher = uri[1];

                    switch (helpher) {
                        case 'param':
                            uri = {
                                url : url,
                                param : module.param
                            };
                            break;
                    }
                } else {
                    uri = {
                        url : uri
                    }
                }

                return callback.call(this, id, name, uri, 'url');
            }

            if ( typeof uri === "object" ) {
                return callback.call(this, id, name, uri, "object");
            }

            if ( typeof uri === "function" ) {
                return callback.call(this, id, name, function (callback) { return uri(module.param, callback) }, "function");
            }
        },

        async : function (id, source, type, geter) {
            var gets = [];

            for (var i in source) {
                gets.push(
                    (function () {
                        var geter = new Promise();

                        this.uri(id, source[i], type, function (sid, sname, suri, stype) {

                            switch (stype) {
                                case 'object':
                                    geter.done(null, sid, sname, suri);
                                    
                                    break;

                                case 'function':
                                    var callback = function (data) {
                                            geter.done(null, sid, sname, data);
                                        },
                                        data = suri(callback)
                                    ;
                                    
                                    // 如果function返回的方式是异步则需要callback;

                                    data && callback(data);
                                    
                                    break;

                                case 'url':
                                    promise.get(suri.url, suri.param).then(function (err, data, xhr) {
                                        if ( type == 'data' ) {
                                            try {
                                                data = JSON.parse(xhr.responseText);
                                            } catch (e) {
                                                err = e;
                                            }
                                        }
                                        geter.done(err, sid, sname, data);
                                    })

                                    break;
                            }

                        })

                        return geter;
                    }).call(this)
                )
            };

            promise.join(gets).then(
                function (results) {
                    var sids = [],
                        source = []
                    ;

                    for (var i = 0, l = results.length; i < l; i++) {
                        var data = results[i],
                            id = data[1],
                            sid = data[2],
                            context = data[3]
                        ;

                        sids[sid] = id;
                        source[sid] = context;
                    }

                    geter.done(null, sids, source, type);
                }
            )
        },

        source : function (id, config, type) {
            var geter = new Promise();
            
            if ( !config[type] || !config[type].length ) {
                geter.done(null, id, {}, type);
            } else {
                this.async(id, config[type], type, geter);
            }

            return geter;
        },

        get : function (id, config, callback) {

            promise.join([
                this.source(id, config, 'data'),
                this.source(id, config, 'style'),
                this.source(id, config, 'source')
            ]).then(
                function(results) {
                    var sids = [],
                        source = []
                    ; 

                    for (var i = 0, l = results.length; i < l; i++) {
                        var data = results[i],
                            type = data[3]
                        ;

                        sids[type] = data[1] || {};
                        source[type] = data[2] || {};
                    }

                    callback(sids, source);
                }
            );
        },
    }

    return Get;
})