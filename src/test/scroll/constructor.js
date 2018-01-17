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
