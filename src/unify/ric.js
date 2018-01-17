export const rIC = function(w) {
  if (!w.requestIdleCallback) {
    w.extendProperty("requestIdleCallback", function(callback) {
      return setTimeout(function() {
        callback({
          timeRemaining: function() {
            return Number.MAX_VALUE
          }
        })
      }, 0)
    })
  }
}
