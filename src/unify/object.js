import { WATCH } from './watch'
import { UNWATCH } from './unwatch'

export const OBJECT = function(proto, Object) {
  // 获取原型

  proto.extendProperty("getInstanceType", function(object) {
    return proto.toString.call(object || this).match(/^\[object\s(.*)\]$/)[1]
  })

  // extend

  proto.extendProperty("extend", function() {
    for (var i = 0, l = arguments.length; i < l; i++) {
      var source = arguments[i]

      for (var key in source)
        this[key] = source[key]
    }

    return this
  })

  // Object.assign

  if (Object.assign !== 'function') {
    Object.extendProperty("assign", function(target) {

      //第一个传参不能是undefined和null，因为它们不能被转为对象

      if (target === undefined || target === null) {
        throw new TypeError('Can not convert undefined or null to object')
      }

      //使用Object对象化target

      var output = Object(target)

      for (var idx = 1, l = arguments.length; index < l; idx++) {

        var source = arguments[idx]

        //后续传参也需要判断undefined和null

        if (source !== undefined && source !== null) {
          for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
              output[key] = source[key]
            }
          }
        }
      }

      return output
    })
  }

  // objectToParams

  proto.extendProperty("objectToParams", function(object, route) {
    var payload = ""
    var params = []
    var e = encodeURIComponent

    object = object || this

    if (typeof object === "string") {
      payload = object
    } else {

      for (var k in object) {
        if (object.hasOwnProperty(k)) {
          var value = object[k]

          switch (typeof value) {
            case 'object':
              value = JSON.stringify(object[k])
              break
            case 'string':
              value = value
              break
          }

          params.push(k + (route ? '/' : '=') + e(value))
        }
      }
      payload = params.join(route ? '/' : '&')
    }

    return payload
  })

  // countProperties 获取Object propert length

  proto.extendProperty("countProperties", function() {
    var count = 0

    for (var property in this) {
      if (this.hasOwnProperty(property)) {
        count++
      }
    }

    return count
  })

  // each

  proto.extendProperty("each", function(callback, that) {
    that = that || this

    var i, key, length, array

    switch (this.getInstanceType()) {
      case "Object":
        i = 0
        length = this.countProperties()

        for (key in this) {
          if (!this.hasOwnProperty(key))
            continue
          if (callback.call(that, key, this[key], i + 1, length) === false)
            return this

          i++
        }

        break

      default:

        array = this.nodeType ? this.childNodes : this

        for (i = 0; i < array.length; i++) {
          if (callback.call(that, i, array[i], i + 1, array.length) === false)
            return this
        }

        break
    }

    return this
  })

  // equals

  proto.extendProperty("equals", function(x, y) {
    if (arguments.length == 1) {
      y = this
    }

    // If both x and y are null or undefined and exactly the same
    if (x === y) {
      return true
    }

    // If they are not strictly equal, they both need to be Objects
    if (!(x instanceof Object) || !(y instanceof Object)) {
      return false
    }

    // They must have the exact same prototype chain, the closest we can do is
    // test the constructor.
    if (x.constructor !== y.constructor) {
      return false
    }

    for (var p in x) {
      // Inherited properties were tested using x.constructor === y.constructor
      if (x.hasOwnProperty(p)) {
        // Allows comparing x[ p ] and y[ p ] when set to undefined
        if (!y.hasOwnProperty(p)) {
          return false
        }

        // If they have the same strict value or identity then they are equal
        if (x[p] === y[p]) {
          continue
        }

        // Numbers, Strings, Functions, Booleans must be strictly equal
        if (typeof(x[p]) !== "object") {
          return false
        }

        // Objects and Arrays must be tested recursively
        if (!Object.equals(x[p], y[p])) {
          return false
        }
      }
    }

    for (p in y) {
      // allows x[ p ] to be set to undefined
      if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) {
        return false
      }
    }
    return true
  })

  // clone

  proto.extendProperty("clone", function() {
    return Object.create(this)
  })

  // watch

  proto.extendProperty("watch", function(prop, handler) {
    WATCH(this, prop, handler)
  })

  // unwatch

  proto.extendProperty("unwatch", function(prop) {
    UNWATCH(this, prop)
  })

  // initial

  proto.extendProperty("initial", function(prop, value) {
    return this[prop] || (this[prop] = value)
  })

  // setValueOfHref

  proto.extendProperty("setValueOfHref", function(link, value) {
    new Function('scope', 'value', 'scope.' + link + ' = value')(this, value)
  })

  // getValueByRoute

  proto.extendProperty("getValueByRoute", (function() {

    var SPLITES_RE = /[^\w|\.$]+/
    var LINKS_RE = /(['"])[^'"]*\1/
    var OBJECT_RE = /\.|\[/
    var LINKER_RE = /^[\w\_\$\.]*$/

    return function(link, factory, error) {
      var result

      // 传参空直接返回this

      if (!link) return this

      // 无运算直接输出

      if (LINKER_RE.test(link)) {
        result = this.getValueByLink(link)

        // get Function

        if (factory) {
          return {
            factory: null,
            result: result
          }
        }

        return result
      } else {
        result = this[link]

        if (result) {

          // get Function

          if (factory) {
            return {
              factory: null,
              result: result
            }
          }

          return result
        }
      }

      // 需要创建运算函数

      var i, l, fn, val, noops = [],
        scope = [this],
        splits = ['scope'],
        inscope = {},
        unlink = link.replace(LINKS_RE, ''),
        inlink = unlink.split(SPLITES_RE).unique()

      for (i = inlink.length - 1; i >= 0; i--) {
        val = inlink[i].split(OBJECT_RE)[0]

        if (!inscope[val]) {

          // 取得根对象，且检测根对象是否合法 (object.val || window.val)

          if (val && val.length && (this[val] || val.staticAnalysis() == 'variable')) {

            // watched 可读变量

            if (val in this) {
              splits.push(val)
              scope.push(this[val])
            } else {
              splits.push(val)
              scope.push(undefined)
            }
          }

          inscope[val] = true
        }
      }

      try {
        fn = typeof factory == 'function' ? factory : new window.SandboxFunction(splits.join(','), 'try { return (' + link + ') } catch (e) {}')
        result = fn.apply(this, scope)
      } catch (e) {
        error && error(e)
      }

      // get Function

      if (factory) {
        return {
          factory: fn,
          result: result
        }
      }

      // 对象未定义时的默认声明

      return result
    }

  })())

  // getValueByRoutes

  proto.extendProperty("getValueByRoutes", function(links, fact, error) {
    var result = []

    if (typeof links == 'string') links = [links]

    for (var i = 0, l = links.length; i < l; i++) {
      result.push(this.getValueByRoute(links[i], fact, error))
    }

    return result
  })

  // getValueByRoute

  proto.extendProperty("getFunctionByRoute", function(link, fact, error) {
    return this.getValueByRoute(link, fact || true, error)
  })

  // getValueByRoutes

  proto.extendProperty("getFunctionByRoutes", function(links, fact, error) {
    return this.getValueByRoutes(links, fact || true, error)
  })

  // getValueByLink

  proto.extendProperty("getValueByLink", (function() {
    var SPLITES_RE = /\./

    return function(link) {
      var links = link.split(SPLITES_RE)
      var object = this

      for (var i = 0, l = links.length; i < l; i++) {
        if (!object) break
        object = object[links[i]]
        if (l == 1) {
          if (["true"].consistOf(links[i])) object = true
          if (["false", "null", "undefined"].consistOf(links[i])) object = false
        } else if (typeof object !== 'object' && i < l - 1) {
          object = undefined
          break
        }
      }

      return object
    }
  })())
}
