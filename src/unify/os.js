export const OS = ((navigator, userAgent, platform, appVersion) => {
  let detect = {}

  detect.webkit = userAgent.match(/WebKit\/([\d.]+)/) ? true : false

  detect.ipod = /iPod/i.test(platform) || userAgent.match(/(iPod).*OS\s([\d_]+)/) ? true : false
  detect.ipad = /iPad/i.test(navigator.userAgent) || userAgent.match(/(iPad).*OS\s([\d_]+)/) ? true : false
  detect.iphone = /iPhone/i.test(platform) || !detect.ipad && userAgent.match(/(iPhone\sOS)\s([\d_]+)/) ? true : false

  detect.ie = userAgent.match(/MSIE 10.0/i) ? true : false
  detect.mac = /Mac/i.test(platform)
  detect.ios = detect.ipod || detect.ipad || detect.iphone
  detect.android = userAgent.match(/(Android)\s+([\d.]+)/) || userAgent.match(/Silk-Accelerated/) ? true : false
  detect.android = detect.android && !detect.webkit
  detect.androidICS = detect.android && userAgent.match(/(Android)\s4/) ? true : false

  detect.chrome = userAgent.match(/Chrome/) ? true : false
  detect.safari = userAgent.match(/Safari/) && !detect.chrome ? true : false
  detect.mobileSafari = detect.ios && !!appVersion.match(/(?:Version\/)([\w\._]+)/)
  detect.opera = userAgent.match(/Opera/) ? true : false
  detect.fennec = userAgent.match(/fennec/i) ? true : userAgent.match(/Firefox/) ? true : false
  detect.MSApp = typeof(MSApp) === "object"
  detect.wechat = userAgent.match(/MicroMessenger/i) ? true : false

  detect.ieTouch = detect.ie && userAgent.toLowerCase().match(/touch/i) ? true : false
  detect.supportsTouch = ((window.DocumentTouch && document instanceof window.DocumentTouch) || 'ontouchstart' in window)

  detect.webos = userAgent.match(/(webOS|hpwOS)[\s\/]([\d.]+)/) ? true : false
  detect.touchpad = detect.webos && userAgent.match(/TouchPad/) ? true : false

  detect.playbook = userAgent.match(/PlayBook/) ? true : false
  detect.blackberry10 = userAgent.match(/BB10/) ? true : false
  detect.blackberry = detect.playbook || detect.blackberry10 || userAgent.match(/BlackBerry/) ? true : false

  // 主流系统版本检测

  if (detect.ios) detect.iosVersion = parseFloat(appVersion.slice(appVersion.indexOf("Version/") + 8)) || -1
  if (detect.android) detect.androidVersion = parseFloat(appVersion.slice(appVersion.indexOf("Android") + 8)) || -1
  if (detect.safari) detect.safariVersion = appVersion.match(/Safari\/([\d.]+)/)[1]
  if (detect.chrome) detect.chromeVersion = appVersion.match(/Chrome\/([\d.]+)/)[1]
  if (detect.chrome) detect.chromeVersion = appVersion.match(/Chrome\/([\d.]+)/)[1]
  if (detect.webkit) detect.webKitVersion = appVersion.match(/WebKit\/([\d.]+)/)[1]

  return detect

})(navigator, navigator.userAgent, navigator.platform, navigator.appVersion || navigator.userAgent)
