export const UI = device.ui;
export const DPR = UI.scale;
export const FEAT = device.feat;
export const PREFIX = FEAT.prefixStyle;
export const EASEING = {

  /**
   * linear
   * @type {Object}
   */
  linear: {
    style: 'cubic-bezier(0, 0, 1, 1)',
    fn: function(k) {
      return k
    }
  },

  /**
   * quadratic
   * @type {Object}
   */
  quadratic: {
    style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    fn: function(k) {
      return k * (2 - k)
    }
  },

  /**
   * circular
   * cubic-bezier(0.1, 0.57, 0.1, 1) or cubic-bezier(0, 0, 0.1, 1) new cubic-bezier(0, 0, 0.165, 1) cubic-bezier(0.23, 1, 0.32, 1)
   * Not properly "circular" but this looks better, it should be (0.075, 0.82, 0.165, 1)
   * @type {Object}
   */
  circular: {
    style: 'cubic-bezier(0.23, 1, 0.32, 1)',
    fn: function(k) {
      return Math.sqrt(1 - (--k * k))
    }
  },

  /**
   * back
   * @type {Object}
   */
  back: {
    style: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    fn: function(k) {
      const b = 4
      return (k = k - 1) * k * ((b + 1) * k + b) + 1
    }
  },

  /**
   * bounce
   * @type {Object}
   */
  bounce: {
    style: '',
    fn: function(k) {
      if ((k /= 1) < (1 / 2.75)) {
        return 7.5625 * k * k
      } else if (k < (2 / 2.75)) {
        return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75
      } else if (k < (2.5 / 2.75)) {
        return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375
      } else {
        return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375
      }
    }
  },

  /**
   * elastic
   * @type {Object}
   */
  elastic: {
    style: '',
    fn: function(k) {
      const f = 0.22,
        e = 0.4

      if (k === 0) {
        return 0
      }
      if (k == 1) {
        return 1
      }

      return (e * Math.pow(2, -10 * k) * Math.sin((k - f / 4) * (2 * Math.PI) / f) + 1)
    }
  }
}
export const BROWSER = {

  /**
   * touch 特性支持
   * @type {[type]}
   */
  touch: FEAT.touch,

  /**
   * 设备Transition兼容性检测
   * @type {Boolean}
   */
  isBadTransition: FEAT.isBadTransition,
  supportTransition: FEAT.supportTransition,

  /**
   * 特性检测
   * @type {Object}
   */
  feat: {
    hasObserver: FEAT.observer,
    hasPointer: navigator.msPointerEnabled,
    hasTouch: FEAT.touch,
    hasTransform: PREFIX('transform') !== false,
    hasTransition: PREFIX('transition'),
    hasPerspective: PREFIX('perspective')
  },

  /**
   * get prefixStyle
   * @type {Object}
   */
  prefixStyle: {
    transform: PREFIX('transform'),
    transition: PREFIX('transition'),
    transitionTimingFunction: PREFIX('transitionTimingFunction'),
    transitionDuration: PREFIX('transitionDuration'),
    transitionDelay: PREFIX('transitionDelay'),
    transformOrigin: PREFIX('transformOrigin')
  },

  /**
   * get prefixPointerEvent
   * @param  {String} pointerEvent
   * @return {String}
   */
  prefixPointerEvent: function(pointerEvent) {
    return window.MSPointerEvent ?
      'MSPointer' + pointerEvent.charAt(9).toUpperCase() + pointerEvent.substr(10) :
      pointerEvent;
  }
}

export const METHOD = {

  /**
   * 基本事件类型
   * @type {Object}
   */
  eventType: {
    touchstart: 1,
    touchmove: 1,
    touchend: 1,

    mousedown: 2,
    mousemove: 2,
    mouseup: 2,

    MSPointerDown: 3,
    MSPointerMove: 3,
    MSPointerUp: 3
  },

  /**
   * 事件绑定
   * @param {Element}  el
   * @param {String}   type
   * @param {Function} fn
   * @param {Boolean}  capture
   */
  addEvent: function(el, type, fn, capture) {
    el.addEventListener(type, fn, !!capture)
  },

  /**
   * 事件解除
   * @param {Element}  el
   * @param {String}   type
   * @param {Function} fn
   * @param {Boolean}  capture
   */
  removeEvent: function(el, type, fn, capture) {
    el.removeEventListener(type, fn, !!capture)
  },

  /**
   * 获取矩形
   * @param  {Element/SVGAElement} el
   * @return {Object} 矩形宽高
   */
  getRect: function(el) {
    if (el instanceof SVGElement) {
      let rect = el.getBoundingClientRect()
      return {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        clientWidth: rect.width,
        clientHeight: rect.height
      }
    } else {
      return {
        top: el.offsetTop,
        left: el.offsetLeft,
        width: el.offsetWidth,
        height: el.offsetHeight,
        clientWidth: el.clientWidth,
        clientHeight: el.clientHeight
      }
    }
  },

  /**
   * 获取位置
   * @param  {Element} el
   * @return {Object} 元素位置
   */
  offset: function(el) {
    let left = -el.offsetLeft,
      top = -el.offsetTop

    while (el = el.offsetParent) {
      left -= el.offsetLeft
      top -= el.offsetTop
    }

    return {
      left: left,
      top: top
    }
  }
}
