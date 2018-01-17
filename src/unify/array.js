export const ARRAY = function(proto) {
  // inArray

  if (!proto.consistOf) {
    proto.extendProperty("consistOf", function(obj) {
      var i = this.length

      while (i--) {
        if (this[i] === obj) {
          return true
        }
      }

      return false
    })
  }

  // map

  if (!proto.map) {
    proto.extendProperty("map", function(fn) {
      var a = []
      for (var i = 0; i < this.length; i++) {
        var value = fn(this[i], i)

        if (value == null) {
          continue
        }

        a.push(value)
      }
      return a
    })
  }

  // unique 数组去重

  if (!proto.unique) {
    proto.extendProperty("unique", function() {
      var result = [],
        hash = {}
      for (var i = 0, elem;
        (elem = this[i]) != null; i++) {
        if (!hash[elem]) {
          result.push(elem)
          hash[elem] = true
        }
      }
      return result
    })
  }
}
