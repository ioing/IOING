export const STRING = function(proto) {

  // trim

  if (!proto.trim) {
    proto.extendProperty("trim", function() {
      return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '')
    })
  }

  // split, 只split 字符中的组织结构，即忽略字符中被引号包裹的内容

  if (!proto.splitCells) {
    proto.extendProperty("splitCells", (function() {
      var SPLITES_RE = /(['"])[^'"]*\1/
      return function(reg) {
        var that = this
        that = that.replace(SPLITES_RE, function(v) {
          return encodeURIComponent(v)
        })
        that = that.split(reg)

        return that.map(function(v) {
          return decodeURIComponent(v)
        })
      }
    })())
  }

  // params string trans to Object

  proto.extendProperty("paramsToObject", function(reg, route) {
    var kds = this.split(reg || /[\?\#\,\&\:\=\/]/)
    var index = 0
    var length = (route || kds).length
    var params = {}

    while (index < length) {
      params[(route || kds)[index]] = kds[route ? index : index + 1]
      index = index + (route ? 1 : 2)
    }

    return params
  })

  // 字符重复: str.repeat(3) >> strstrstr

  proto.extendProperty("repeat", function(n) {
    return new Array(1 + n).join(this)
  })

  // 字符静态分析

  proto.extendProperty("staticAnalysis", (function() {
    var SPLITES_RE = /\.|\[/
    var WORDS_RE = /^[a-zA-Z_$]+\w*$/
    var NUMBER_RE = /^[0-9]*\.?[0-9]*$/
    var OBJECT_RE = /window|top/

    // 静态分析模板变量

    var KEYWORDS =
      // 关键字
      'break,case,catch,continue,debugger,default,delete,do,else,false' +
      ',finally,for,function,if,in,instanceof,new,null,return,switch,this' +
      ',throw,true,try,typeof,var,void,while,with'

      // 保留字
      +
      ',abstract,boolean,byte,char,class,const,double,enum,export,extends' +
      ',final,float,goto,implements,import,int,interface,long,native' +
      ',package,private,protected,public,short,static,super,synchronized' +
      ',throws,transient,volatile'

      // ECMA 5 - use strict
      +
      ',arguments,let,yield'

      +
      ',undefined'

    var KEYWORDS_RE = new RegExp("\\b(?:" + KEYWORDS.split(',').join('|') + ")\\b")

    return function() {
      var arrays = this.split(SPLITES_RE)
      var object = arrays[0]
      var result = window.sandboxWindow[object]

      if (result) return typeof result
      if (NUMBER_RE.test(object)) return 'number'
      if (KEYWORDS_RE.test(object)) return 'token'
      if (OBJECT_RE.test(object)) return 'object'
      if (WORDS_RE.test(object)) return 'variable'

      return 'unknown'

      // try {
      //     result = seval("typeof " + object)
      //     if ( result == 'undefined' ) return 'variable'
      // } catch(e) {
      //     return e.message.split(' ')[1]
      // }
    }
  })())
}
