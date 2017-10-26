// 人之所畏不可不畏 ，天之所予不得不受
// 将欲歙之，必故张之；将欲弱之，必故强之；将欲废之，必故兴之；将欲取之，必故与之。是谓微明。

define('~/css', [], function (require, module, exports) {
    "use strict"

    // class & global scope
    
    const CLASS = {}
    const GLOBAL = {}

    // requestAnimationFrame

    const rAF = window.requestAnimationFrame

    /*
     * 语法解释 提取
     * var, unit, url(), Math(), @section ()
    */

    // Capture groups

    const REGEXP = {
            variable : /\[(.*?)(?=\])\]/g,
            factor : /\((.*?)(?=\))\)/,
            url : /\burl\((.*?)(?=\))\)/,
            calc : /\bcalc\((.*)(?=\))\)/,
            fun : /(\w+)\((.*)(?=\))\)/,
            eval : /[\(\)]/g,
            evals : /\@\((.*?)(?=\%\>)\%\>/g,
            media : /\(([^\)]+)(?=\))\)/,
            classes : /\bclass[\s]?([^\s\(]+)[\s]?\((.*?)(?=\))\)/,
            section : /\(([^\)]+)(?=\))\)/,
            comment : /\/\*[\s\S]*?\*\//g,
            onload : /\bonload\(?(.*\b)?\)?(\s+url\(\'(.*?)?(?=\'\))\'\))/gi,
            attr : /([^\:]+):([^\;]*)[\;\}]/,
            alt : /(\/\*[\s\S]*?\*\/)|([^\s\;\{\}][^\;\{\}]*(?=\{))|(\})|([^\;\{\}]+[\;\}](?!\s*\*\/))/gmi
        }

    // Capture groups

    const CAP_COMMENT = 1
        , CAP_SELECTOR = 2
        , CAP_END = 3
        , CAP_ATTR = 4

    // 是为空
    
    let isEmpty = (x) => {
        return typeof x == 'undefined' || x.length == 0 || x == null
    }

    // 适配的前缀

    let getPrefixStyleProp = (prop) => {
        return device.feat.prefixStyle(prop, true)
    }

    // CLASS CSS

    class CSS {
        constructor () {
        }

        init (id, module) {
            this.id = id
            this.module = module
            this._keyFrame = []
            this.sandbox = application.sandbox

            return this
        }

        setup (config) {
            this.config = config || {
                root : "modules/",
                data : {},
                descendant : false
            }

            // 更新模块css配置，同时清空模块css的变量

            this.variable = {
                attributes : {},
                children : {}
            }

            this._descendant = this.config.descendant ? this.config.descendant + ' ' : ''

            // image cache print log >> attr:style

            this.sandbox.window.fileCache = {}
            this.sandbox.window.fileLoading = []
        }

        clear () {

            // 清除当前模块css变量

            this.variable = {
                attributes : {},
                children : {}
            }
        }

        render (list, sids, sources) {
            let css = this.baseCSS()

            if ( !list ) {
                throw 'IOING ERROR { module ' + sids + ' css source is null }'
            }

            for (let name of list) {
                css += this.compile(sids[name], sources[name], { root : 0 })
            }

            return css
        }

        compile (id, source, scope, opts, element) {
            this.id = id
            this.opts = opts || {}
            this.scope = {}.extend(this.config.data, scope)
            this.descendant = this.opts.descendant === false ? '' : this._descendant + (this.opts.descendant ? this.opts.descendant + ' ' : '')
            this.element = element

            if ( source === true ) {
                return this.baseCSS()
            }

            return this.toCSS(this.data = this.toJSON(source))
        }

        baseCSS (css) {
            if ( CompiledCSSBaseStyle ) {
                css = CompiledCSSBaseStyle
            } else {
                css = CompiledCSSBaseStyle = this.compile('frameworks', CSSBaseStyle)
            }

            return css
        }

        toJSON (cssString, args) {
            let node = {
                children: {},
                attributes: {}
            }
            let match = null
            let count = 0

            args = args || {
                ordered: false,
                comments: false,
                stripComments: false,
                split: false
            }

            if ( args.stripComments ) {
                args.comments = false
                cssString = cssString.replace(REGEXP.comment, '')
            }

            while ( (match = REGEXP.alt.exec(cssString)) != null ) {
                if ( !isEmpty(match[CAP_COMMENT]) && args.comments ) {

                    // Comment

                    let add = match[CAP_COMMENT].trim()
                    node[count++] = add
                } else if ( !isEmpty(match[CAP_SELECTOR]) ) {

                    // New node, we recurse

                    let name = match[CAP_SELECTOR].trim()

                    // This will return when we encounter a closing brace

                    let newNode = this.toJSON(cssString, args)

                    if ( args.ordered ) {
                        node[count++] = {
                            name: name,
                            type: 'rule',
                            value: newNode
                        }
                    } else {
                        let bits = args.split ? name.split(',') : [name]

                        for (let i in bits) {
                            let sel = bits[i].trim()
                            let unique = sel in node.children

                            // function unique
                            
                            if ( unique && sel.indexOf('@') == 0 ) {
                                sel = sel + ' '
                                unique = false
                            }
                            if ( unique ) {
                                for (let att in newNode.attributes) {
                                    node.children[sel].attributes[att] = newNode.attributes[att]
                                }
                                for (let cel in newNode.children) {
                                    node.children[sel].children[cel] = newNode.children[cel]
                                }
                            } else {
                                node.children[sel] = newNode
                            }
                        }
                    }
                } else if ( !isEmpty(match[CAP_END]) ) {

                    // Node has finished

                    return node
                } else if ( !isEmpty(match[CAP_ATTR]) ) {
                    let line = match[CAP_ATTR].trim()

                    if ( line.charAt(line.length - 1) == '}' ) {
                        REGEXP.alt.lastIndex = REGEXP.alt.lastIndex - 1
                    }

                    let attr = REGEXP.attr.exec(line)

                    if (attr) {

                        // Attribute

                        let name = attr[1].trim()
                        let value = attr[2].trim()

                        if ( args.ordered ) {
                            node[count++] = {
                                name: name,
                                type: 'attr',
                                value: value
                            }
                        } else {
                            if ( name in node.attributes ) {
                                let currVal = node.attributes[name]

                                if ( !(currVal instanceof Array) ) {
                                    node.attributes[name] = [currVal]
                                }
                                node.attributes[name].push(value)
                            } else {
                                node.attributes[name] = value
                            }
                        }
                    } else {

                        // Semicolon terminated line

                        node[count++] = line
                    }
                }
            }

            return node
        }

        toCSS (node, depth, scope, breaks, parent) {
            let cssString = ''

            if ( typeof depth == 'undefined' ) {
                depth = 0
            }
            if ( typeof scope == 'undefined' ) {
                scope = false
            }
            if ( typeof breaks == 'undefined' ) {
                breaks = false
            }
            if ( node.attributes ) {
                for (let i in node.attributes) {
                    let att = node.attributes[i]

                    if ( att instanceof Array ) {
                        for (let j = 0; j < att.length; j++) {
                            cssString += this._setAttr(i, att[j], depth, scope, parent)
                        }
                    } else {
                        cssString += this._setAttr(i, att, depth, scope, parent)
                    }
                }
            }
            if ( node.children ) {
                let first = true

                for (let i in node.children) {
                    if (breaks && !first) {
                        cssString += '\n'
                    } else {
                        first = false
                    }
                    
                    cssString += this._setNode(i, node.children[i], depth, scope)
                }
            }

            return cssString
        }

        realpath (url) {
            return application.realpath(this.id, this.opts.sid, url, this.opts.path)
        }

        unit (value, data, li, ri) {
            li = 0
            ri = 0
            data = data || this.scope

            if ( value.indexOf('@(') !== -1 ) {
                value = value.replace(REGEXP.eval, function (val, i) {
                    switch (val) {
                        case '(':
                            li++
                        break
                        case ')':
                            ri++
                            if ( li == ri ) {
                                val = '%>'
                            }
                        break
                    }
                    return val
                })

                value = value.replace(REGEXP.evals, function (val, count) { 
                    let translate = false
                    count = data.getValueByRoute(count.replace(UNIT.__unitRegExp__, function (size, length, unit) { 
                        if ( unit == '%' ) {
                            switch (name) {
                                case 'width':
                                    unit = 'vw'

                                    break

                                case 'height':
                                    unit = 'vh'

                                    break
                            }
                        }

                        translate = true

                        return length * (UNIT[unit] || 1)
                    }))
                    
                    return typeof count === 'number' && translate ? count + 'px' : count

                }) 
            }

            value = value.replace(UNIT.__unitRegExp__, function (size, length, unit) { 

                // support view sizing units

                if ( UNIT.__nativeUnits__[unit] ) {
                    return length + unit
                }

                return length * (UNIT[unit] || 1) + 'px'
            })

            return value
        }

        eval (value, data) {

            if ( value.indexOf('(') !== -1 ) {
                if ( !device.feat.supportSizeCalc ) {
                    value = value.replace(REGEXP.calc, function (val, calc) { 
                        return '@(' + calc + ')'
                    })
                }
            }

            value = this.unit(value, data)

            return value
        }

        _loadBackgroundImage (dom, url, src, call, file) {
            let that = this
            let sdoc = this.sandbox.window.document
            let image = sdoc.createElement('IMG')

            image.src = src
            image.onload = function () {

                rAF(function () {
                    dom.style.backgroundImage = file ? '' : url

                    // additional style

                    if ( call ) {
                        let styler = call.split(',')

                        for (let i = 0, l = styler.length; i < l; i++) {
                            let prop = styler[i].split(':')

                            dom.style.set(prop[0], prop[1])
                        }
                    }

                    // removr image

                    image.remove()
                })

                // mark cache
                
                that.sandbox.window.fileCache[src] = true
            }

            image.onerror = function () {

                // removr image
                
                image.remove()
            }

            // append image

            sdoc.documentElement.appendChild(image)
        }

        // $

        _getVariable (value, scope) {
            let data = this.scope
            let config = this.config
            let variable = this.variable

            // 解析变量

            if ( value.indexOf('[') !== -1 ) {
                value = value.replace(REGEXP.variable, function (val, key) { 
                    val = null

                    if ( scope && variable.children[scope] ) {
                       val = variable.children[scope].getValueByRoute(key)
                    }

                    if ( val ) return val
                    
                    return variable.attributes.getValueByRoute(key) 
                        || GLOBAL.getValueByRoute(key) 
                        || data.getValueByRoute(key)
                }) || value
            }

            return value
        }

        // Helpers

        _setAttr (name, value, depth, scope, parent) {
            let that = this

            let id = this.id
            let config = this.config
            let cssString = ''

            // 处理前缀

            name = getPrefixStyleProp(name)

            // 解析变量

            value = this._getVariable(value, scope)

            // 转换单位

            value = this.eval(value)

            // url 相对路径转换

            switch (name) {
                case 'display':
                    if ( ['box', 'inline-box'].consistOf(value) ) {

                        cssString += '\t'.repeat(depth) + name + ': ' + device.feat.prefix + value + ';\n'
                        cssString += '\t'.repeat(depth) + name + ': ' + value + ';\n'

                        return cssString
                    }

                    break
                    
                case 'background-image':
                case 'border-image':
                case 'background':
                case 'content':
                case 'src':
                    
                    // real path
                    
                    if ( value.indexOf('url(') != -1 ) {
                        value = value.replace(REGEXP.url, function (val, url) { 
                            return "url('" + that.realpath(url ? url : '') + "')"
                        })

                        // inline element onload
                        
                        if ( value.indexOf('onload') != -1 ) {
                            value = value.replace(REGEXP.onload, function (context, call, url, src) {

                                // css file

                                if ( src ) {
                                    let dom = that.element
                                    let target = that.opts.target

                                    if ( dom ) {

                                        // is loaded

                                        if ( that.sandbox.window.fileCache[src] ) return url

                                        let fragment = dom.parentFragment
                                        let scroller = dom.previousScroller
                                        let infinite = scroller && scroller.getAttrSign('infinite')
                                        let delaying

                                        if ( infinite ) {
                                            var show, hide
                                        }

                                        // 延时取得图片
                                        
                                        function fetch (time) {
                                            delaying = setTimeout(function () {

                                                requestIdleCallback((deadline) => {
                                                    that._loadBackgroundImage(dom, url, src, call)
                                                })
                                                
                                                if ( infinite ) {
                                                    fragment.off('show', show).off('hide', hide)
                                                }
                                            }, time || 0)
                                        }

                                        // 无限循环时对于 show 的元素之行加载

                                        if ( infinite ) {

                                            // infinite show

                                            show = function (e) {
                                                let scroll = scroller.scrollEvent
                                                let timeout = 0

                                                if ( scroll ) {
                                                    timeout = scroll.wrapperHeight

                                                    if ( scroll.acceleration == 0 ) {
                                                        timeout = Math.min((scroll.speedM || 1) * 500, 2000)
                                                    }
                                                }

                                                fetch(timeout)
                                            }

                                            // infinite hide

                                            hide = function () {
                                                clearTimeout(delaying)
                                            }

                                            // fetch

                                            fragment.on('show', show).on('hide', hide)

                                        } else {

                                            // fetch

                                            fetch(0)
                                        }
                                        
                                    } else {
                                        function load () {
                                            this.find(parent).each(function () {
                                                this.style.backgroundImage = 'none'
                                                requestIdleCallback((deadline) => {
                                                    that._loadBackgroundImage(this, url, src, call, 1)
                                                })
                                            })
                                        }

                                        if ( target ) {
                                            target.on('ready', load)
                                        } else {
                                            that.module.on('load', function () {
                                                target = that.module.elements.context

                                                if ( target ) {
                                                    load.call(target)
                                                }
                                            })
                                        }
                                        
                                        return url
                                    }
                                }

                                return ''
                            })
                        }
                    }

                    // gradient 兼容处理
                    
                    let gradient = value.indexOf('gradient(')

                    if ( gradient >= 0 ) {
                        cssString += '\t'.repeat(depth) + name + ': ' + value + ';\n'
                        value = gradient == 0 ? device.feat.prefix + value : value.replace(/([\b\w\-]+gradient\()/, function (context, val) {
                            if ( val.indexOf('-') == 0 ) {
                                val = val.replace(/\-\w+\-/, '')
                            }
                            return device.feat.prefix + val
                        })
                        cssString += '\t'.repeat(depth) + name + ': ' + value + ';\n'

                        return cssString
                    }

                    break

                case '@extend':
                    let extend = this.data.children[value]

                    if ( extend ) {
                        let attributes = extend.attributes

                        for (name in attributes) {
                            cssString += this._setAttr(name, attributes[name], depth, scope)
                        }

                        return cssString
                    }

                    break

                case '@class':
                    let methods = REGEXP.fun.exec(value),
                        cname = methods[1],
                        args = methods[2].split(/[\s]?\,[\s]?/),
                        classes = this.data.children['@' + cname] || CLASS[cname] || {},
                        argsKey = classes.args,
                        attributes = classes.attr

                        for (let prop in attributes) {
                            cssString += this._setAttr(prop, attributes[prop].replace(REGEXP.variable, function (context, variable) { return args[argsKey[variable]] || context }), depth, scope)
                        }

                        return cssString

                    break
            }

            return '\t'.repeat(depth) + name + ': ' + value + ';\n'
        }

        _setNode (name, value, depth, scope) {
            let cssString = '',
                descendant = value.descendant || this.descendant,
                names = [],
                section = 0,
                fixed = false,
                proto = false,
                command = false,
                attributes = {}


            // 预置大括号语法
            /*
             * @section 定义模块作用域
             * @global 定义全局变量
             * @var 定义变量
            */
            // ”@“ 语法
            // 修正css基本命名适配部分; ”@“ 语法不包含 “&” 并列逻辑，因此不影响下面的并列类 @ : @keyframes

            if ( name.indexOf('@') == 0 ) {
                descendant = ''                    // ”@“ 语法作用域失效
                names = name.split(/\s/)
                switch (names[0]) {
                    case '@keyframes':
                        command = false

                        name = '@' + device.feat.keyframesPrefix + 'keyframes ' + names[1]

                        // 禁止属性作用域
                        
                        if ( this.descendant ) {
                            for (let i in value.children) {
                                value.children[i].descendant = ' '
                            }
                        }
                        
                        break

                    case '@section':
                        command = false

                        // section name
                        
                        let sname = REGEXP.section.exec(name)
                        
                        sname = sname ? sname[1] : 'section:error'
                        scope = scope ? scope + ' ' + sname : sname
                        section = true
                        depth--

                        break

                    case '@media':
                        command = false
                        name = this._getVariable(name, scope)
                        name = this.eval(name)
                        fixed = true

                        break

                    case '@class':
                        command = true

                        name = REGEXP.classes.exec(name)

                        let className = name[1],
                            classArgs = name[2]

                        let argsKey = {}
                        let argsMap = classArgs.split(/[\s]?\,[\s]?/)

                        for (let i = 0, l = argsMap.length; i < l; i++) {
                            argsKey[argsMap[i]] = i
                        }

                        this.data.children['@' + className] = {
                            args : argsKey,
                            attr : value.attributes
                        }

                        // CLASS 定义全局作用域

                        if ( this.id == 'frameworks' ) {
                            CLASS[className] = this.data.children['@' + className]
                        }

                        break

                    case '@global':
                        command = true

                        if ( depth == 0 ) {
                            attributes = value.attributes
                            for (let key in attributes) {
                                GLOBAL[key] = this._getVariable(attributes[key], scope)
                            }
                        }

                        break

                    case '@var':
                        command = true

                        if ( depth == 0 || scope ) {
                            attributes = value.attributes
                            for (let key in attributes) {
                                if ( scope ) {
                                    if ( !this.variable.children[scope] ) this.variable.children[scope] = {}
                                    this.variable.children[scope][key] = attributes[key]
                                } else {
                                    this.variable.attributes[key] = attributes[key]
                                }
                            }
                        }

                        break

                    case '@if':
                        command = false

                        section = true

                        if ( !this.scope.getValueByRoute(REGEXP.factor.exec(name)[1]) ) {
                            delete value.children
                        }

                        break

                }
            }

            if ( command == false ) {
                names = name.split(',')
                name = ''

                for (let i = 0, l = names.length; i < l; i++) {
                    let sname = names[i].trim()

                    // this 关键字替换

                    if ( sname.indexOf('this') == 0 ) {
                        sname = sname.substr(4)
                        proto = true
                    } else if ( sname.match(/\:tap$/) ) {
                        sname = sname.replace(':tap', '.-tap-highlight-')
                    }

                    // 连续声明迭代

                    name += (descendant ? descendant : '') + (typeof scope == 'string' && fixed == false ? scope + (proto ? '' : ' ') : '') + sname + (i == l - 1 ? '' : ', ')
                }

                cssString += section ? '' : '\t'.repeat(depth) + name + ' {\n'
                cssString += this.toCSS(value, depth + 1, scope, false, name)
                cssString += section ? '' : '\t'.repeat(depth) + '}\n'
            }

            return cssString
        }

    }

    module.exports = CSS
})