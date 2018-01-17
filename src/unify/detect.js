import { OS } from './os'

export const DETECT = (function(w, d) {

  let detect = {
    OS : OS
  }

  // ELEMENT

  let _ELEMENT = d.createElement('div')
  let _STYLE = _ELEMENT.style

  _STYLE.position = "fixed"
  _STYLE.top = "0"
  _STYLE.left = "0"
  _STYLE.zIndex = "1"

  d.documentElement.appendChild(_ELEMENT)

  // features - 功能检测 or 返回最适合特性

  detect.touch = ('ontouchstart' in w) || w.DocumentTouch && d instanceof DocumentTouch
  detect.vendor = OS.webkit ? "Webkit" : OS.fennec ? "Moz" : OS.ie ? "ms" : OS.opera ? "O" : ""
  detect.prefix = OS.webkit ? "-webkit-" : OS.fennec ? "-moz-" : OS.ie ? "-ms-" : OS.opera ? "-O-" : ""
  detect.cssTransformStart = !OS.opera ? "3d(" : "("
  detect.cssTransformEnd = !OS.opera ? ",0)" : ")"

  // viewport 起效检测

  detect.viewportScale = w.viewportScale

  // js or css 前缀支持

  let _JSPROPMAPS = {},
    _CSSPROPMAPS = {},
    VENDORS = ['webkit', 'Moz', 'ms', 'O'],
    PREFIXS = ['-webkit-', '-moz-', '-ms-', '-O-']

  detect.CSSSupport = detect.prefixStyle = function(prop, css) {

    if (css && prop in _CSSPROPMAPS) {
      return _CSSPROPMAPS[prop]
    } else if (!css && prop in _JSPROPMAPS) {
      return _JSPROPMAPS[prop]
    }

    let i = 0,
      l = VENDORS.length + 1

    while (i < l) {
      let property = ((VENDORS[i] ? VENDORS[i] + '-' : '') + prop).replace(/-(\w)/g, function() {
        return arguments[1].toUpperCase()
      })
      let prefix = (PREFIXS[i] || '') + prop
      if (property in _STYLE) return css ? _CSSPROPMAPS[prop] = prefix : _JSPROPMAPS[prop] = property
      i++
    }

    return css ? _CSSPROPMAPS[prop] = prop : _JSPROPMAPS[prop] = false
  }

  detect.hasTranslate3d = detect.prefixStyle('transform') && w.getComputedStyle ? true : false

  /**
      This should find all Android browsers lower than build 535.19 (both stock browser and webview)
      - galaxy S2 is ok
      - 2.3.6 : `AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1`
      - 4.0.4 : `AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30`
      - galaxy S3 is badAndroid (stock brower, webview)
      `AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30`
      - galaxy S4 is badAndroid (stock brower, webview)
      `AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30`
      - galaxy S5 is OK
      `AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Mobile Safari/537.36 (Chrome/)`
      - galaxy S6 is OK
      `AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Mobile Safari/537.36 (Chrome/)`
   */

  detect.isBadTransition = (function() {

    // Android browser is not a chrome browser.

    if (OS.android) {
      if (OS.webkit && parseFloat(OS.webKitVersion) < 535.19) return true
      if (OS.chrome && parseFloat(OS.chromeVersion) < 53) return true
      if (OS.safari && parseFloat(OS.safariVersion) < 535.19) return true

      return false
    } else if (OS.ios) {
      return false
    } else {
      return true
    }
  })()

  // 是否支持observer

  detect.observer = (w.MutationObserver || w.WebKitMutationObserver || w.MozMutationObserver) ? true : false

  // 是否支持ShadowRoot

  detect.shadowRoot = d.documentElement.createShadowRoot ? true : false

  // 是否支持svg

  detect.svg = w.SVGAngle ? true : false

  // 获取贞动画前缀

  detect.keyframesPrefix = w.CSSRule.WEBKIT_KEYFRAMES_RULE ? '-webkit-' : false || w.CSSRule.MOZ_KEYFRAMES_RULE ? '-moz-' : false || w.CSSRule.MS_KEYFRAMES_RULE ? '-ms-' : false || w.CSSRule.O_KEYFRAMES_RULE ? '-o-' : false || w.CSSRule.KEYFRAMES_RULE ? '' : false

  // 是否支持贞动画

  detect.keyframes = detect.keyframesPrefix === false ? false : true

  // 无贞动画前缀

  detect.keyframesPrefix = detect.keyframesPrefix || ''

  // 支持动画

  detect.supportTransition = detect.keyframes

  // iframeInputBlurBug

  detect.iframeInputBlurBug = OS.ios && OS.iosVersion < 9

  // css support view sizing units

  detect.supportSizeUnits = (function() {
    let initialWidth, initialHeight, supportSizeUnits = {
      'px': true,
      'dp': false,
      'vw': false,
      'vh': false,
      'vmin': false,
      'vmax': false,
      'mm': false,
      'cm': false,
      'pt': false,
      'pc': false,
      'in': false,
      '%': true
    }

    // get initial width

    initialWidth = _ELEMENT.offsetWidth
    initialHeight = _ELEMENT.offsetHeight

    // set width 10vw

    _ELEMENT.style.width = 0
    _ELEMENT.style.width = '10vw'
    supportSizeUnits.vw = supportSizeUnits.vh = _ELEMENT.offsetWidth == Math.round(d.documentElement.offsetWidth / 10) ? true : false

    // set width 10vmin

    _ELEMENT.style.width = 0
    _ELEMENT.style.width = '10vmin'
    supportSizeUnits.vmin = _ELEMENT.offsetWidth == Math.round(Math.min(initialWidth, initialHeight) / 10) ? true : false

    // set width 10vmax

    _ELEMENT.style.width = 0
    _ELEMENT.style.width = '10vmax'
    supportSizeUnits.vmax = _ELEMENT.offsetWidth == Math.round(Math.max(initialWidth, initialHeight) / 10) ? true : false

    // set width 10mm

    _ELEMENT.style.width = 0
    _ELEMENT.style.width = '10mm'
    supportSizeUnits.mm = _ELEMENT.offsetWidth > 0 ? true : false

    // set width 10cm

    _ELEMENT.style.width = 0
    _ELEMENT.style.width = '10cm'
    supportSizeUnits.cm = _ELEMENT.offsetWidth > 0 ? true : false

    // set width 10cm

    _ELEMENT.style.width = 0
    _ELEMENT.style.width = '10pt'
    supportSizeUnits.pt = _ELEMENT.offsetWidth > 0 ? true : false

    // set width 10pc

    _ELEMENT.style.width = 0
    _ELEMENT.style.width = '10pc'
    supportSizeUnits.pc = _ELEMENT.offsetWidth > 0 ? true : false

    // set width 10in

    _ELEMENT.style.width = 0
    _ELEMENT.style.width = '10in'
    supportSizeUnits.in = _ELEMENT.offsetWidth > 0 ? true : false

    // set width 10dp

    // _ELEMENT.style.width = 0
    // _ELEMENT.style.width = '10dp'
    // supportSizeUnits.dp = _ELEMENT.offsetWidth > 0 ? true : false


    return supportSizeUnits
  })()

  detect.supportSizeCalc = (function() {
    let initialWidth, supportSizeCalc

    // get initial width

    _ELEMENT.style.width = '100%'
    initialWidth = _ELEMENT.offsetWidth

    // set width 10vw

    _ELEMENT.style.width = 'calc((100vw/10 - 1px) / 2)'

    // calc(100%/10) == initialWidth / 10 ? true : false

    supportSizeCalc = _ELEMENT.offsetWidth == Math.round((initialWidth / 10 - 1) / 2) ? true : false

    return supportSizeCalc
  })()

  //判断浏览器是否支持DOM树结构改变

  // detect.mutations = (function () {
  //     var type = [
  //             "DOMSubtreeModified",
  //             "DOMNodeInserted",
  //             "DOMNodeRemoved",
  //             "DOMNodeRemovedFromDocument",
  //             "DOMNodeInsertedIntoDocument",
  //             "DOMAttrModified",
  //             "DOMCharacterDataModified"
  //         ]
  //       , documentElement = document.documentElement
  //       , method = "EventListener"
  //       , data = "deleteData"
  //       , p = document.createElement("p")
  //       , mutations = {}
  //       , i

  //     function check(addOrRemove) {
  //         for (i = type.length; i--;) {
  //             p[addOrRemove](type[i], cb, false)
  //             documentElement[addOrRemove](type[i], cb, false)
  //         }
  //     }

  //     function cb(e) {
  //         mutations[e.type] = true
  //     }

  //     check("add" + method)

  //     documentElement.insertBefore(
  //         p,
  //         documentElement.lastChild
  //     )

  //     p.setAttribute("i", i)
  //     p = p.appendChild(document.createTextNode(i))
  //     data in p && p[data](0, 1)
  //     documentElement.removeChild(p = p.parentNode)
  //     check("remove" + method)
  //     return (p = mutations)

  // }())

  d.documentElement.removeChild(_ELEMENT)

  return detect
})(window, document)
