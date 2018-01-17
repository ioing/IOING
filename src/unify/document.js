export const DOCUMENT = function(proto) {
  // setCookie

  proto.extendProperty("setCookie", function(name, value, domain, path) {
    var Days = 30
    var exp = new Date()
    exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000)
    document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString() + (domain ? ";path=" + (path ? path : "/") + ";domain=" + domain : "")
  })

  proto.extendProperty("getCookie", function(name) {
    var arr
    var reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)")
    if (arr = document.cookie.match(reg))
      return unescape(arr[2])
    else
      return null
  })

  proto.extendProperty("delCookie", function(name) {
    var exp = new Date()
    exp.setTime(exp.getTime() - 1)
    var cval = getCookie(name)
    if (cval != null) {
      document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString()
    }
  })
}
