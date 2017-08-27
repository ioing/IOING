// 道生一，一生二，二生三，三生万物。万物负阴而抱阳，冲气以为和。

define('~/fetch', ['~/promise'], function (require, module, exports) {
    "use strict"

    var promise = require('~/promise')
    var Promise = promise.Promise

    // 为学日益，为道日损。损之又损，以至於无为。
    
    var Get = function () {
        if ( !(this instanceof Get) ) {
            return new Get()
        }
    }

    // 圣人常无心，以百姓之心为心。善者，吾善之；不善者，吾亦善之，德善。信者，吾信之；
    // 不信者，吾亦信之，德信。圣人在天下，歙歙焉为天下浑其心，百姓皆注其耳目，圣人皆孩之。

    Get.prototype = {
        uri : function (id, param, name, type, callback) {
            var that = this,
                uri,
                remote,
                rename,
                module = App.modules[id],
                inputs = arguments,
                output

            // 获取依赖模块配置

            if ( !module ) {
                return App.get(id, function () {
                    that.uri.apply(this, inputs)
                })
            }

            // 被映射数据源的真实key和映射key

            if ( typeof name === 'string' ) {
                rename = name
            } else {
                rename = name[0]
                name = name[1]
            }

            // 第一页加速

            output = document.getElementById(id + '/' + type + '/' + name)

            if ( output ) {
                callback.call(this, id, rename, output.innerHTML || '', "object")
                output.remove()

                return
            }

            // get uri

            uri = module.resources
            uri = uri ? uri[type] : null
            uri = uri ? uri[name] : null

            // debug

            if ( !uri ) {
                if ( id !== 'frameworks' ) {
                    uri = 'frameworks::' + name
                } else {
                    App.console.error('resources.' + type + '[' + name + ']', 'Config error', 'is not definde')
                }
            }

            // DATA TYPE

            if ( typeof uri === "function" ) {
                uri = callback.call(this, id, rename, function (callback) { return uri.call(module, param, callback) }, "function")

                // uri 的继续类型， 若uri == undefined, 则认为为异步数据，终止以下
                if ( uri === undefined ) return
            } 

            if ( typeof uri === "object" ) {
                return callback.call(this, id, rename, uri, "object")
            } 

            if ( typeof uri === "string" ) {

                // trim

                uri = uri.trim()

                // 映射

                if ( uri.indexOf('::') > 0 ) {
                    uri = uri.split(/\:\:/)

                    if ( uri.length === 2 ) return this.uri(uri[0], param, [name, uri[1]], type, callback)
                }

                // real path

                uri = App.realpath(id, null, uri)

                // mark module network

                if ( uri.indexOf('//') == 0 || uri.indexOf('://') > 0 ) {

                    // 网络请求类型标记
                    
                    remote = App.get(id).network = true
                } 

                // helpher

                if ( uri.indexOf("|@") > -1 ) {
                    var urs = uri.split(/\|\@/)
                    var url = urs[0]

                    uri = {
                        url : url,
                        remote : remote,
                        method : 'GET',
                        cache : 0,
                        param : {},
                        headers : {},
                        settings : {},
                        storeage : sessionStorage
                    }

                    for (var i = 1, l = urs.length; i < l; i++) {
                        var helpher = /(\w+)\((.*)?\)/g.exec(urs[i]),
                            helper = helpher[1],
                            value = helpher[2]

                        switch (helper) {
                            case 'param':
                            case 'headers':
                            case 'settings':
                                value = value || ''
                                value = value.indexOf('{') === 0 ? value : '{' + value + '}'
                                uri[helper] = uri[helper].extend(param.getValueByRoute(value) || {})

                            break

                            case 'cache':
                                uri.cache = value || 60

                            break

                            case 'storeage':
                                uri.cache = value || 2592000000
                                uri.storeage = localStorage
                                uri.permanent = true

                            break

                            case 'origin':
                                uri.settings.origin = value

                            break

                            case 'caller':
                                uri.settings.caller = value

                            break

                            case 'method':
                                uri.method = value
                            break
                        }

                    }    
                    
                } else {
                    uri = {
                        url : uri,
                        remote : remote,
                        method : 'GET',
                        cache : 0,
                        param : {},
                        headers : {},
                        settings : {},
                        storeage : sessionStorage
                    }
                }

                return callback.call(this, id, rename, uri, 'url')
            }
        },

        ajax : function (id, type, sid, sname, suri, stack, cacid, geter) {
            var that = this
            var module = App.get(id)

            // server请求发起时间

            if ( suri.remote ) {
                var sendTime = Date.now()
            }

            promise.ajax(suri.method, suri.url, suri.param, suri.headers, suri.settings, type, id).then(function (err, data, xhr) {
                if ( err ) {
                    App.trigger('sourceerror', {
                        id : id,
                        url : suri.url,
                        params : suri.param
                    })
                    
                    return that.error()
                }

                // 数据缓存 

                if ( cacid ) {
                    try {
                        stack.setItem(cacid, '[' + Date.now() + ']=' + xhr.response)

                        // storagemaps
                        
                        module.storagemaps.push(cacid)
                    } catch (e) {}
                }

                if ( type == 'data' ) {
                    data = that.filter(module, data, sname)
                }

                if ( geter ) geter.done(err, sid, sname, suri.url, data)

                // request 请求用时统计
                
                if ( suri.remote ) {
                    App.trigger('requestserver', { url : suri.url, time : Date.now() - sendTime })
                }
            })
        },

        filter : function (module, data, name) {
            var con = module.controller
 
            if ( typeof con == 'function' ) {
                return con.call(module, data, name) || data
            } else if ( typeof con[name] == 'function' ) {
                return con[name].call(module, data) || data
            } else {
                return data
            }
        },

        async : function (id, param, source, type, geter) {
            var that = this
              , gets = []
              , module = App.get(id)

            for (var i in source) {
                gets.push((function () {
                    var geter = new Promise()

                    this.uri(id, param, source[i], type, function (sid, sname, suri, stype) {

                        switch (stype) {
                            case 'object':

                                // filter
                                
                                if ( type == 'data' ) {
                                    suri = that.filter(module, suri, sname)
                                }

                                geter.done(null, sid, sname, null, suri)
                                
                            break

                            case 'function':
                                var callback = function (data) {
                                        geter.done(null, sid, sname, suri, data)
                                    }
                                  , data = suri(callback)

                                // filter

                                if ( type == 'data' ) {
                                    data = that.filter(module, data, sname)
                                }

                                // suri return fn (param, callback) param 为模块参数
                                
                                // 支持同步和异步, 如果function返回的方式是异步则需要callback

                                if ( typeof data === 'object' || data === false ) {
                                    callback(data)
                                } else {
                                    return data
                                }
                                
                            break

                            case 'url':
                                var stack = suri.storeage 
                                var cacid = suri.cache ? suri.url + '$' + JSON.stringify(suri.param) : false
                                var cache, clife, ctime

                                try {
                                    cache = cacid ? stack.getItem(cacid) : false
                                } catch (e) {}

                                // 查看cache生命周期

                                if ( cache ) {
                                    clife = /\[(\d+)\]\=/.exec(cache) || [0, 0]
                                    ctime = clife[1]

                                    cache = !ctime 
                                            ? null 
                                            : App._EXISTS && Date.now() - ctime > suri.cache * 1000 
                                            ? null 
                                            : cache.substr(clife[0].length)
                                }

                                // 如果cache符合条件则从cache读取数据

                                if ( cache ) {

                                    if ( type === 'data' ) {

                                        if ( typeof cache === 'string' ) {
                                            try {
                                                cache = JSON.parse(cache)
                                            } catch (e) {

                                                try {
                                                    cache = App.sandbox.window.eval('(' + cache + ')')
                                                } catch (e) {
                                                    cache = null 
                                                }

                                                App.console[typeof cache === 'object' ? 'Warning' : 'error']('url[' + suri.url + ']', 'SyntaxError', 'Unexpected token in JSON')
                                            }
                                        }

                                        cache = cache ? that.filter(module, cache, sname) : null
                                    }

                                    if ( App._EXISTS === false && suri.permanent && Date.now() - ctime > module.config.timeout * 1000 ) {
                                        module.timeout = true
                                    }

                                    if ( cache ) {

                                        geter.done(null, sid, sname, suri.url, cache)

                                        setTimeout(function () {

                                            // fetch

                                            that.ajax(id, type, sid, sname, suri, stack, cacid)
                                            
                                        }, 2000)

                                        App.console.info('Data [' + sname + ']', 'From cache', sid)

                                        break
                                    }
                                }
                                

                                // fetch

                                that.ajax(id, type, sid, sname, suri, stack, cacid, geter)

                            break
                        }

                    })

                    return geter

                }).call(this))
            }

            promise.join(gets).then(
                function (results) {
                    var sids = [],
                        suri = [],
                        source = []

                    for (var i = 0, l = results.length; i < l; i++) {
                        var data = results[i],
                            id = data[1],
                            sid = data[2],
                            uri = data[3],
                            context = data[4]

                        sids[sid] = id
                        suri[sid] = uri
                        source[sid] = context
                    }

                    geter.done(null, sids, suri, source, type)
                }
            )
        },

        source : function (id, param, config, type) {
            var geter = new Promise()
            
            if ( !config[type] || !config[type].length ) {
                geter.done(null, id, null, {}, type)
            } else {
                this.async(id, param, config[type], type, geter)
            }

            return geter
        },

        get : function (id, config, param, callback, error) {
            this.error = error || noop

            promise.join([
                this.source(id, param, config, 'data'),
                this.source(id, param, config, 'style'),
                this.source(id, param, config, 'source')
            ]).then(
                function (results) {
                    var sids = [],
                        suri = [],
                        source = []

                    for (var i = 0, l = results.length; i < l; i++) {
                        var data = results[i],
                            type = data[4]

                        sids[type] = data[1] || {}
                        suri[type] = data[2] || {}
                        source[type] = data[3] || {}
                    }

                    callback(sids, suri, source)
                }
            )
        },

        fetch : function () {
            this.sessioncache = false
            this.get.apply(this, arguments)
        },

        prefetch : function () {
            this.sessioncache = true
            this.get.apply(this, arguments)
        }
    }

    module.exports = Get
})