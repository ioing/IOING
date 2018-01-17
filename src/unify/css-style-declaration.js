export const CSSSTYLEDECLARATION = function(proto) {
  // style.set(propertyName, value)

  proto.extendProperty("set", function(propertyName, value) {
    if (propertyName === undefined || value === undefined) return

    value = typeof value === 'string' ?
      value.replace(UNIT.__unitRegExp__, function(size, length, unit) {
        return length * UNIT[unit] + 'px'
      }) :
      value

    this.setProperty(device.feat.prefixStyle(propertyName, true), value)
  })

  // style.remove

  proto.extendProperty("remove", function(propertyName) {

    var vendors = [device.feat.prefix + propertyName, propertyName]

    for (var i = 0, l = vendors.length; i < l; i++) {
      var propertyName = vendors[i]

      if (this.propertyIsEnumerable(propertyName)) {
        this.removeProperty(propertyName)
      }
    }
  })
}
