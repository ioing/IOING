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
export function constructor (el, options) {
  this.options = {

    history: true,

    /**
     * 默认事件代理
     * @type {Boolean}
     */
    bindToWrapper: true,

    /**
     * 显示滚动条
     * @type {Boolean}
     */
    scrollbars: true,

    /**
     * 滚动渐变显示滚动条
     * @type {Boolean}
     */
    fadeScrollbars: true,

    /**
     * 伸缩弹性滚动条
     * @type {Boolean}
     */
    resizeScrollbars: true,

    /**
     * infinite 虚拟滚动 滚动条预测精度
     * 数值越小越精，刷新频率也越高
     * @type {Number}
     */
    scrollbarAccuracy: 10,

    /**
     * 控制器
     * @type {Boolean}
     */
    interactive: true,
    indicator: null,

    /**
     * 鼠标事件
     * @type {Boolean}
     */
    mouseWheel: true,
    mouseWheelSpeed: 20,
    mouseWheelAction: 'normal',

    /**
     * 异步加载infinite
     * @type {Boolean}
     */
    deferred: false,

    /**
     * infinte 缓冲数量
     * @type {Number}
     */
    infiniteCacheBuffer: 50,

    /**
     * open momentum
     * @type {Boolean}
     */

    momentum: true,

    /**
     * deceleration 惯性系数
     * @type {Number}
     */
    deceleration: 0.003,

    /**
     * speedLimit 最大滚动速度
     * @type {Number}
     */
    speedLimit: 3,
    stepLimit: 150,

    maxPage: 1000,

    /**
     * 起始位置
     * @type {Number}
     */
    startX: 0,
    startY: 0,

    /**
     * 滚动轴向
     * @type {Boolean}
     */
    scrollX: false,
    scrollY: true,

    /**
     * 方向锁定值
     * @type {Number}
     */
    directionLockThreshold: 5,
    directionLockThresholdX: false,
    directionLockThresholdY: false,

    /**
     * 边缘弹性
     * @type {Boolean}
     */
    bounce: true,

    /**
     * 边缘弹性阻力
     * @type {Number}
     */
    bounceDrag: 2,
    bounceDragRate: 70,

    /**
     * 边缘弹性动画时长
     * @type {Number}
     */
    bounceTime: 400,

    /**
     * 弹性动画
     * @type {String}
     */
    bounceEasing: '',

    /**
     * 边缘弹性最大自然惯性边缘
     * @type {Number}
     */
    boundariesLimit: 0.15,

    /**
     * 是否阻止自然惯性引起的边缘弹性
     * @type {Boolean}
     */
    bounceBreakThrough: true,

    /**
     * pulldown pullup
     * @type {Boolean}
     */
    pull: false,

    /**
     * snap 效果
     * @type {Boolean}
     */
    snap: false,
    snapEasing: '',
    snapDuration: 400,
    snapThreshold: 0.15,

    /**
     * map 效果
     * @type {Boolean}
     */
    zoom: false,
    zoomMin: 1,
    zoomMax: 4,
    startZoom: 1,
    zoomOrigin: '0 0 0',

    /**
     * 默认事件控制
     * @type {Boolean}
     */
    preventDefault: true,
    preventDefaultException: {
      tagName: /^(INPUT|TEXTAREA|HTMLAREA|BUTTON|SELECT)$/
    },
    stopPropagation: 'auto',

    // 父滚动时忽略子滚动触发

    coverPropagation: true,

    /**
     * 窗口resize
     * 滚动刷新延时
     * @type {Number}
     */
    resizePolling: 60,

    /**
     * 是否启用css3d动画
     * @type {Boolean}
     */
    useTransition: true

  }.extend(options)

  // input options

  this._options = options

  /**
   * 关键节点
   * wrapper : 滚动容器scroll
   * scroller : 滚动内容scrolling
   * scroll.scrolling属性记录了该滚动的scrolling元素
   * 当scrolling元素不存在纪律中时会尝试获取scroll中的scrolling元素
   */

  this.uuid = '[[' + App.id + ']]:' + 'scroll::' + (App.name || 'top') + ':' + (el.id || el.uuid)
  this.wrapper = el
  this.scroller = this.scrolling = el.scrolling

  this.pullup = el.pullup
  this.pulldown = el.pulldown
  this.pullright = el.pullright
  this.pullleft = el.pullleft
  this.scrollcover = el.scrollcover

  if (this.pullup || this.pulldown || this.pullright || this.pullleft) {
    this.options.pull = true
  }

  /**
   * 为定义规范的scrolling
   * 当scroll中不存在scrolling元素时，使用第一个子元素替代，但这是不规范的
   * @param  {Boolean} !this.scroller
   * @return false
   */
  if (!this.scroller) {

    // 不规范的使用警告

    App.console.warn('<scrolling>', 'warn', 'is not defined')

    // 获取scroll中的第一个子节点替代scrolling

    this.scroller = this.wrapper.children[0]

    // 当scroll中不存在任何子元素时，终止滚动

    if (!this.scroller) return
  }

  /**
   * 自定义指示器
   * scrollbar为指示器的实例
   */
  if (options.indicator) {
    this.scrollbar = el.scrollbar
  }

  // snap: reset speedLimit

  if (!options.speedLimit && options.snap) {
    this.options.speedLimit = 1
  }

  /**
   * cache style for better performance
   */
  this.scrollerStyle = this.scroller.style

  /**
   * 初始化获得滚动区域宽高
   * get wrapper width & height
   */
  this.wrapperWidth = this.wrapper.offsetWidth
  this.wrapperHeight = this.wrapper.offsetHeight


  // Normalize options

  this.options.useTransition = BROWSER.supportTransition && BROWSER.feat.hasTransition && this.options.useTransition
  this.options.eventPassthrough = this.options.eventPassthrough === true ? 'vertical' : this.options.eventPassthrough
  this.options.preventDefault = !this.options.eventPassthrough && this.options.preventDefault

  // to dp

  this.options.startX = dP(this.options.startX)
  this.options.startY = dP(this.options.startY)
  this.options.stepLimit = dP(this.options.stepLimit)
  this.options.speedLimit = dP(this.options.speedLimit)

  // If you want eventPassthrough I have to lock one of the axes

  this.options.scrollY = this.options.eventPassthrough == 'vertical' ? false : this.options.scrollY
  this.options.scrollX = this.options.eventPassthrough == 'horizontal' ? false : this.options.scrollX

  // With eventPassthrough we also need lockDirection mechanism

  this.options.freeScroll = this.options.freeScroll && !this.options.eventPassthrough
  this.options.directionLockThreshold = this.options.eventPassthrough ? 0 : this.options.directionLockThreshold

  // snap 动画曲线

  this.options.snapEasing = typeof this.options.snapEasing == 'string' ? EASEING[this.options.snapEasing] || EASEING.circular : this.options.snapEasing

  // bounce 动画曲线

  this.options.bounceEasing = typeof this.options.bounceEasing == 'string' ? EASEING[this.options.bounceEasing] || EASEING.quadratic : this.options.bounceEasing

  // resizePolling

  this.options.resizePolling = this.options.resizePolling === undefined ? 60 : this.options.resizePolling

  // 鼠标反向控制

  this.options.invertWheelDirection = this.options.invertWheelDirection ? -1 : 1

  // 设定指示器

  this.options.indicators = this.scrollbar ? {
    el: this.scrollbar,
    interactive: options.interactive
  } : null

  // 初始化 scroll wrapper style

  if (this.options.scrollX && this.options.scrollY) {
    this.wrapper.setAttribute('flow-free', '')
  } else if (this.options.scrollX) {
    this.wrapper.setAttribute('flow-x', '')
  } else if (this.options.scrollY) {
    this.wrapper.setAttribute('flow-y', '')
  }

  // START

  this._init()
  this.revert(true, this.options.deferred ? false : true)
}
