export const UNWATCH = function (target, prop) {
  var val = target[prop]

  delete target[prop] // remove accessors
  target[prop] = val

  return this
}
