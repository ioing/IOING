export const rAF = function(w) {
  /* requestAnimationFrame & cancelAnimationFrame */

  if (!w.requestAnimationFrame || !w.cancelAnimationFrame) {

    w.extendProperty("requestAnimationFrame", (function() {
      var lastTime = 0

      return function(callback) {
        var now = Date.now()
        var nextTime = Math.max(lastTime + 16.78, now)
        return setTimeout(function() {
          callback(lastTime = nextTime)
        }, nextTime - now)
      }
    })())

    w.extendProperty("cancelAnimationFrame", w.clearTimeout)
  }
}
