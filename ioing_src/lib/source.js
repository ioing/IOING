// 道生一，一生二，二生三，三生万物。万物负阴而抱阳，冲气以为和。

define('~/source', function (require, module, exports) {
    "use strict"

    // 为学日益，为道日损。损之又损，以至於无为。
    // 圣人常无心，以百姓之心为心。善者，吾善之；不善者，吾亦善之，德善。信者，吾信之；

    class Get {
        constructor () {
           if ( !(this instanceof Get) ) {
                return new Get()
            } 
        }

        uri (id, param, name, type, callback) {
            let uri,
                remote,
                rename,
                output,
                module = App.modules[id]

            // 获取依赖模块配置

            if ( !module ) {
                return App.get(id, () => {
                    this.uri.apply(this, arguments)
                })
            }

            // 被映射数据源的真实 key 和映射 key

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
                uri = callback.call(this, id, rename, (callback) => uri.call(module, param, callback), "function")

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
                    let urs = uri.split(/\|\@/)
                    let url = urs[0]

                    uri = {
                        url : url,
                        remote : remote,
                        method : 'GET',
                        cache : 600,
                        param : {},
                        headers : {},
                        settings : {},
                        storeage : sessionStorage
                    }

                    for (var i = 1, l = urs.length; i < l; i++) {
                        let helpher = /(\w+)\((.*)?\)/g.exec(urs[i]),
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
                                uri.cache = value || 0

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
                            case 'callee':
                                uri.method = 'JSONP'
                                uri.settings[helper] = value

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
                        cache : 600,
                        param : {},
                        headers : {},
                        settings : {},
                        storeage : sessionStorage
                    }
                }

                return callback.call(this, id, rename, uri, 'url')
            }
        }

        ajax (id, type, sid, sname, suri, stack, cacid, resolve) {
            let module = App.get(id)
            let sendTime

            // server请求发起时间

            if ( suri.remote ) {
                sendTime = Date.now()
            }

            promise.ajax(suri.method, suri.url, suri.param, suri.headers, suri.settings, type, id, this.sessioncache).then((results) => {

                let data = results[0]
                let xhr = results[1]

                // 数据缓存 

                if ( cacid ) {
                    if ( type == 'source' || type == 'style' ) {
                        App.setFileCache(sid, cacid, xhr.response)
                    } else {
                        try {
                            stack.setItem(cacid, '[' + Date.now() + ']=' + xhr.response)

                            // storagemaps
                            
                            let maps = stack.getItem()
                            module.storagemaps.push(cacid)
                        } catch (e) {}
                    }
                }

                if ( type == 'data' ) {
                    data = this.filter(module, data, sname)
                }

                // request 请求用时统计
                
                requestIdleCallback(() => {
                    if ( suri.remote ) {
                        App.trigger('requestserver', { url : suri.url, time : Date.now() - sendTime })
                    }
                })

                resolve([sid, sname, suri.url, data])

            }).catch(() => {
                App.trigger('sourceerror', {
                    id : id,
                    url : suri.url,
                    params : suri.param
                })
                
                return this.error()
            })
        }

        cache (id, sid, cacid, suri, sname, cache, stack, type, resolve) {
            let module = App.modules[id]
            let config = module.config
            let clife, ctime

            // 查看cache生命周期

            if ( cache ) {
                clife = /\[([0-9]+)\]\=/.exec(cache) || [0, 0]
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

                            App.console[typeof cache === 'object' ? 'warn' : 'error']('url[' + suri.url + ']', 'SyntaxError', 'Unexpected token in JSON')
                        }
                    }

                    cache = cache ? this.filter(module, cache, sname) : null
                }

                // 模块 cache 超时

                if ( App._EXISTS === false && suri.permanent && typeof module.config.expires === 'number' && Date.now() - ctime >= module.config.expires * 1000 ) {
                    module.timeout = true
                }

                if ( cache ) {

                    resolve([sid, sname, suri.url, cache])

                    App.console.info('Data [' + sname + ']', 'From cache', sid)

                    return
                }
            }

            // fetch

            this.ajax(id, type, sid, sname, suri, stack, cacid, resolve)
        }

        filter (module, data, name) {
            let con = module.controller
 
            if ( typeof con == 'function' ) {
                return con.call(module, data, name) || data
            } else if ( typeof con[name] == 'function' ) {
                return con[name].call(module, data) || data
            } else {
                return data
            }
        }

        async (id, param, source, type, resolve) {
            let gets = []
            let module = App.get(id)

            for (let i in source) {
                gets.push(new Promise((resolve, reject) => {
                    this.uri(id, param, source[i], type, (sid, sname, suri, stype) => {

                        switch (stype) {
                            case 'object':

                                // filter
                                
                                if ( type == 'data' ) {
                                    suri = this.filter(module, suri, sname)
                                }

                                resolve([sid, sname, null, suri])
                                
                            break

                            case 'function':
                                let callback = (data) => {
                                        resolve([sid, sname, suri, data])
                                    }
                                let data = suri(callback)

                                // filter

                                if ( type == 'data' ) {
                                    data = this.filter(module, data, sname)
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
                                let stack = suri.storeage 
                                let dimen = JSON.stringify(suri.param)
                                let cacid = suri.cache > 0 ? suri.url + (dimen == '{}' ? '' : '$' + encodeURI(dimen)) : null
                                let cache

                                if ( cacid && !App.config.debug ) {
                                    if ( type == 'source' || type == 'style' ) {
                                        App.getFileCache(sid, cacid, suri.cache).then((res) => {
                                            resolve([sid, sname, suri.url, res])
                                        }).catch(() => {
                                            this.ajax(id, type, sid, sname, suri, stack, cacid, resolve)
                                        })
                                    } else {
                                        try {
                                            cache = stack.getItem(cacid)
                                        } catch (e) {}
                                        this.cache(id, sid, cacid, suri, sname, cache, stack, type, resolve)
                                    }
                                } else {
                                    this.ajax(id, type, sid, sname, suri, stack, cacid, resolve)
                                }

                            break
                        }

                    })
                }))
            }

            Promise.all(gets).then((results) => {
                    let sids = []
                    let suri = []
                    let source = []

                    for (let i = 0, l = results.length; i < l; i++) {
                        let data = results[i]
                        let id = data[0]
                        let sid = data[1]
                        let uri = data[2]
                        let context = data[3]

                        sids[sid] = id
                        suri[sid] = uri
                        source[sid] = context
                    }

                    resolve([sids, suri, source, type])
                }
            )
        }

        source (id, param, config, type) {
            return new Promise((resolve, reject) => {
                if ( !config[type] || !config[type].length ) {
                    resolve([id, null, {}, type])
                } else {
                    this.async(id, param, config[type], type, resolve)
                }
            })
        }

        get (id, config, param, callback, error) {
            this.error = error || noop

            Promise.all([
                this.source(id, param, config, 'data'),
                this.source(id, param, config, 'style'),
                this.source(id, param, config, 'source')
            ]).then(
                (results) => {
                    let sids = [],
                        suri = [],
                        source = []

                    for (let i = 0, l = results.length; i < l; i++) {
                        let data = results[i],
                            type = data[3]

                        sids[type] = data[0] || {}
                        suri[type] = data[1] || {}
                        source[type] = data[2] || {}
                    }

                    callback(sids, suri, source)
                }
            )
        }

        fetch () {
            this.sessioncache = false
            this.get.apply(this, arguments)
        }

        prefetch () {
            this.sessioncache = true
            this.get.apply(this, arguments)
        }
    }

    module.exports = Get
})