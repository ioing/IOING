// 天下莫柔弱於水，而攻坚强者莫之能胜，以其无以易之。

define('~/scroll', [], function (require, module, exports) {

	"use strict"

	/**
	 * UI 设备UI描述
	 * @type {Object}
	 */
	var UI = device.ui
	var DPR = devicePixelRatio

	/**
	 * 设备属性描述
	 * @type {Object}
	 */
	var FEAT = device.feat
	var PREFIX = FEAT.prefixStyle

	/**
	 * EASEING 动画
	 * @type {Object}
	 */
	var EASEING = {

		/**
		 * linear
		 * @type {Object}
		 */
		linear: {
			style: 'cubic-bezier(0, 0, 1, 1)',
			fn: function (k) {
				return k
			}
		},

		/**
		 * quadratic
		 * @type {Object}
		 */
		quadratic: {
			style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
			fn: function (k) {
				return k * ( 2 - k )
			}
		},

		/**
		 * circular
		 * cubic-bezier(0.1, 0.57, 0.1, 1) or cubic-bezier(0, 0, 0.1, 1)
		 * Not properly "circular" but this looks better, it should be (0.075, 0.82, 0.165, 1)
		 * @type {Object}
		 */
		circular: {
			style: 'cubic-bezier(0, 0, 0.165, 1)',
			fn: function (k) {
				return Math.sqrt( 1 - ( --k * k ) )
			}
		},

		/**
		 * back
		 * @type {Object}
		 */
		back: {
			style: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
			fn: function (k) {
				var b = 4
				return ( k = k - 1 ) * k * ( ( b + 1 ) * k + b ) + 1
			}
		},

		/**
		 * bounce
		 * @type {Object}
		 */
		bounce: {
			style: '',
			fn: function (k) {
				if ( ( k /= 1 ) < ( 1 / 2.75 ) ) {
					return 7.5625 * k * k
				} else if ( k < ( 2 / 2.75 ) ) {
					return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75
				} else if ( k < ( 2.5 / 2.75 ) ) {
					return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375
				} else {
					return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375
				}
			}
		},

		/**
		 * elastic
		 * @type {Object}
		 */
		elastic: {
			style: '',
			fn: function (k) {
				var f = 0.22,
					e = 0.4

				if ( k === 0 ) { return 0 }
				if ( k == 1 ) { return 1 }

				return ( e * Math.pow( 2, - 10 * k ) * Math.sin( ( k - f / 4 ) * ( 2 * Math.PI ) / f ) + 1 )
			}
		}
	}
	
	/**
	 * BROWSER 特性描述
	 * @type {Object}
	 */
	var BROWSER = {

		/**
		 * touch 特性支持
		 * @type {[type]}
		 */
      	touch : FEAT.touch,

      	/**
      	 * 设备Transition兼容性检测
      	 * @type {Boolean}
      	 */
      	isBadTransition : FEAT.isBadTransition,
      	supportTransition : FEAT.supportTransition,

      	/**
      	 * 特性检测
      	 * @type {Object}
      	 */
      	feat : {
			hasObserver : FEAT.observer,
            hasTransform : PREFIX('transform') !== false,
			hasPerspective : PREFIX('perspective'),
			hasTouch : FEAT.touch,
			hasPointer : navigator.msPointerEnabled,
			hasTransition : PREFIX('transition')
        },

        /**
         * get prefixStyle
         * @type {Object}
         */
        prefixStyle : {
           	transform : PREFIX('transform'),
           	transition : PREFIX('transition'),
			transitionTimingFunction : PREFIX('transitionTimingFunction'),
			transitionDuration : PREFIX('transitionDuration'),
			transitionDelay : PREFIX('transitionDelay'),
			transformOrigin : PREFIX('transformOrigin')
        },

        /**
         * get prefixPointerEvent
         * @param  {String} pointerEvent
         * @return {String}
         */
        prefixPointerEvent : function (pointerEvent) {
			return window.MSPointerEvent ? 
				'MSPointer' + pointerEvent.charAt(9).toUpperCase() + pointerEvent.substr(10):
				pointerEvent;
		}
    }

    /**
     * METHOD 公共方法
     * @type {Object}
     */
    var METHOD = {

		/**
		 * 基本事件类型
		 * @type {Object}
		 */
    	eventType : {
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
    	addEvent : function (el, type, fn, capture) {
			el.addEventListener(type, fn, !!capture)
		},

		/**
		 * 事件解除
		 * @param {Element}  el
		 * @param {String}   type    
		 * @param {Function} fn
		 * @param {Boolean}  capture
		 */
		removeEvent : function (el, type, fn, capture) {
			el.removeEventListener(type, fn, !!capture)
		},

		/**
		 * 获取矩形
		 * @param  {Element/SVGAElement} el
		 * @return {Object} 矩形宽高
		 */
		getRect : function (el) {
			if ( el instanceof SVGElement ) {
				var rect = el.getBoundingClientRect()
				return {
					top : rect.top,
					left : rect.left,
					width : rect.width,
					height : rect.height,
					clientWidth : rect.width,
					clientHeight : rect.height
				}
			} else {
				return {
					top : el.offsetTop,
					left : el.offsetLeft,
					width : el.offsetWidth,
					height : el.offsetHeight,
					clientWidth : el.clientWidth,
					clientHeight : el.clientHeight
				}
			}
		},

		/**
		 * 获取位置
		 * @param  {Element} el
		 * @return {Object} 元素位置
		 */
		offset : function (el) {
			var left = -el.offsetLeft,
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

	module.exports = function (window, document, Math) {
		'use strict'

		var gCS = window.getComputedStyle
	  	var rAF = window.requestAnimationFrame
	  	var rIC = window.requestIdleCallback
	  	var dP  = function (px) { return px * UI.scale }

	  	/**
	  	 * 滚动主函数
	  	 * @param {Element} el
	  	 * @param {Object} options
	  	 */
		function Scroll (el, options) {
			this.options = {

				history : true,

				/**
				 * 默认事件代理
				 * @type {Boolean}
				 */
				bindToWrapper : true,

				/**
				 * 显示滚动条
				 * @type {Boolean}
				 */
				scrollbars : true,

				/**
				 * 滚动渐变显示滚动条
				 * @type {Boolean}
				 */
				fadeScrollbars : true,

				/**
				 * 伸缩弹性滚动条
				 * @type {Boolean}
				 */
				resizeScrollbars : true,

				/**
				 * infinite 虚拟滚动 滚动条预测精度
				 * 数值越小越精，刷新频率也越高
				 * @type {Number}
				 */
				scrollbarAccuracy : 10,

				/**
				 * 控制器
				 * @type {Boolean}
				 */
				interactive : true,
				indicator : null,

				/**
				 * 鼠标事件
				 * @type {Boolean}
				 */
				mouseWheel : true,
				mouseWheelSpeed : 20,
				mouseWheelAction : 'normal',

				/**
				 * 异步加载infinite
				 * @type {Boolean}
				 */
				deferred : false,

				/**
				 * infinte 缓冲数量
				 * @type {Number}
				 */
				infiniteCacheBuffer : 50,

				/**
				 * open momentum
				 * @type {Boolean}
				 */
				
				momentum : true,

				/**
				 * deceleration 惯性系数
				 * @type {Number}
				 */
				deceleration : 0.0006,

				/**
				 * speedLimit 最大滚动速度
				 * @type {Number}
				 */
				speedLimit : 3,
				speedRate : 1,
				stepLimit : 150,

				maxPage : 1000,

				/**
				 * 起始位置
				 * @type {Number}
				 */
				startX : 0,
				startY : 0,

				/**
				 * 滚动轴向
				 * @type {Boolean}
				 */
				scrollX : false,
				scrollY : true,

				/**
				 * 方向锁定值
				 * @type {Number}
				 */
				directionLockThreshold : 5,
				directionLockThresholdX : false,
				directionLockThresholdY : false,

				/**
				 * 边缘弹性
				 * @type {Boolean}
				 */
				bounce : true,

				/**
				 * 边缘弹性阻力
				 * @type {Number}
				 */
				bounceDrag : 3,
				bounceDragRate : 20,

				/**
				 * 边缘弹性动画时长
				 * @type {Number}
				 */
				bounceTime : 400,

				/**
				 * 弹性动画
				 * @type {String}
				 */
				bounceEasing : '',

				/**
				 * 边缘弹性最大自然惯性边缘
				 * @type {Number}
				 */
				boundariesLimit : 0.6,

				/**
				 * 是否阻止自然惯性引起的边缘弹性
				 * @type {Boolean}
				 */
				bounceBreakThrough : true,

				/**
				 * pulldown pullup
				 * @type {Boolean}
				 */
				pull : false,

				/**
				 * snap 效果
				 * @type {Boolean}
				 */
				snap : false,
				snapEasing : '',
				snapDuration : 400,
				snapThreshold : 0.15,

				/**
				 * map 效果
				 * @type {Boolean}
				 */
				zoom : false,
				zoomMin : 1,
				zoomMax : 4, 
				startZoom : 1,
				zoomOrigin : '0 0 0',

				/**
				 * 默认事件控制
				 * @type {Boolean}
				 */
				preventDefault : true,
				preventDefaultException : { tagName: /^(INPUT|TEXTAREA|HTMLAREA|BUTTON|SELECT)$/ },
				stopPropagation : 'auto',

				// 父滚动时忽略子滚动触发
				
				coverPropagation : true,

				/**
				 * 窗口resize
				 * 滚动刷新延时
				 * @type {Number}
				 */
				resizePolling : 60,

				/**
				 * 是否启用css3d动画
				 * @type {Boolean}
				 */
				useTransition : true
				
			}.extend(options)

			this._options = options

			/**
			 * 关键节点
			 * wrapper : 滚动容器scroll
			 * scroller : 滚动内容scrolling
			 * scroll.scrolling属性记录了该滚动的scrolling元素
			 * 当scrolling元素不存在纪律中时会尝试获取scroll中的scrolling元素
			 */
			this.uuid = 'scroll::' + (App.name || 'top') + ':' + App.id + ':' + (el.id || el.uuid)
			this.wrapper = el
			this.scroller = this.scrolling = el.scrolling

			this.pullup = el.pullup
			this.pulldown = el.pulldown
			this.pullright = el.pullright
			this.pullleft = el.pullleft
			this.scrollcover = el.scrollcover

			if ( this.pullup || this.pulldown || this.pullright || this.pullleft ) {
				this.options.pull = true
			}

			/**
			 * 为定义规范的scrolling
			 * 当scroll中不存在scrolling元素时，使用第一个子元素替代，但这是不规范的
			 * @param  {Boolean} !this.scroller
			 * @return false
			 */
			if ( !this.scroller ) {
				
				// 不规范的使用警告
				
				App.console.warn('<scrolling>', 'warn', 'is not defined')

				// 获取scroll中的第一个子节点替代scrolling
				
				this.scroller = this.wrapper.children[0]

				// 当scroll中不存在任何子元素时，终止滚动
				
				if ( !this.scroller ) return
			}

			/**
			 * 自定义指示器
			 * scrollbar为指示器的实例
			 */
			if ( options.indicator ) {
				this.scrollbar = el.scrollbar 
			}

			// snap: reset speedLimit
			
			if ( !options.speedLimit && options.snap ) {
				this.options.speedLimit = dP(1)
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

			this.options.useTransition = BROWSER.feat.hasTransition && this.options.useTransition
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
			
			this.options.indicators = this.scrollbar ? { el: this.scrollbar, interactive: options.interactive } : null
			
			// !supportTransition

			if ( !BROWSER.supportTransition ) this.options.useTransition = false

			// 初始化 scroll wrapper style

			if ( this.options.scrollX && this.options.scrollY ) {
                this.wrapper.setAttribute('flow-free', '')
            } else if ( this.options.scrollX ) {
                this.wrapper.setAttribute('flow-x', '')
            } else if ( this.options.scrollY ) {
                this.wrapper.setAttribute('flow-y', '')
            }

			// START

			this._init()
			this.revert(true, this.options.deferred ? false : true)
		}

		/**
		 * Scroll 原型扩展
		 * 下划线_开头的命名为私用方法
		 * @type {Object}
		 */
		Scroll.prototype = {

			on : function (types, fn) {
				var that = this

	            types.split(' ').each(function (i, type) {
	            	that._events.initial(type, []).push(fn)
	            })
	        },

	        one : function (types, fn) {
	        	var that = this

	        	function once () {
	        		fn.apply(this, arguments)
	        		this.off(types, once)
	        	}

	        	types.split(' ').each(function (i, type) {
	        		that._events.initial(type, []).push(once)
	        	})
	        },

	        off : function (types, fn) {
	        	var that = this

	            types.split(' ').each(function (i, type) {
	            	if ( !that._events[type] ) return

	            	var index = that._events[type].indexOf(fn)

	            	if ( index > -1 ) {
	                    that._events[type].splice(index, 1)
	                }
	            })
	        },

			disable : function () {
				this.enabled = false
			},

			enable : function () {
				this.enabled = true
			},

			stop : function () {
				this.isInTransition = false
				this.isAnimating = false
			},

			revert : function (reset, sync) {

				if ( !sync ) return
					
				this._initKaleidoscope()

				this._refresh()

				// 重置位置

				if ( reset ) {
					this.scrollTo(this.options.startX, this.options.startY, -1)
				}

				this.enable()

				this._execEvent('revert')
			},

			destroy : function () {
				this._initEvents(true)

				this._execEvent('destroy')
			},

			refresh : function () {
				var that = this

				// 当前手指moving时不触发刷新操作
				
				if ( this.isMoving() || this.isScrolling() ) {
					this.one('scrollend', function () {
						rAF(function () {
							that._refresh()
						})
					}.bind(this))

					return
				}

				rAF(function () {
					that._refresh()
				})
			},

			getComputedPosition : function () {
				var matrix = gCS(this.scroller, null),
					x, y

				matrix = matrix[BROWSER.prefixStyle.transform].split(')')[0].split(', ')
				x = +(matrix[12] || matrix[4])
				y = +(matrix[13] || matrix[5])

				return { x: x, y: y }
			},

			drawingEnd : function () {
				return
				if ( this.options.infinite ) return
				if ( (this.options.scrollY && this.scrollerHeight !== this.scroller.offsetHeight) || (this.options.scrollX && this.scrollerWidth !== this.scroller.offsetWidth) ) {
					this.refresh()
				}
			},

			isScrolling : function () {
				return this.isInTransition || this.isAnimating || false
			},

			isMoving : function () {
				return this.moving
			},

			isBounce : function () {
				var x = this.x,
					y = this.y

				var bouncing = false
				var bouncpos

				if ( !this.hasHorizontalScroll ) {
					x = this.x
				} else {
					if ( this.x > this.minScrollX ) {
						x = this.minScrollX
						bouncing = true
						bouncpos = "left"
					} else if ( this.x < this.maxScrollX ) {
						x = this.maxScrollX
						bouncing = true
						bouncpos = "right"
					}
				}


				if ( !this.hasVerticalScroll ) {
					y = this.y
				} else {
					if ( this.y > this.minScrollY ) {
						y = this.minScrollY
						bouncing = true
						bouncpos = "top"
					} else if ( this.y < this.maxScrollY ) {
						y = this.maxScrollY
						bouncing = true
						bouncpos = "bottom"
					}
				}

				if ( !bouncing ) return false

				return {
					x : x,
					y : y,
					pos : bouncpos
				}
			},

			resetPosition : function (time) {
				var bouncing = this.isBounce()

				time = time || 0

				if ( bouncing ) {
					this.scrollTo(bouncing.x, bouncing.y, time, EASEING.quadratic)
					this._execEvent('bouncing', bouncing.pos)
				} else {
					this.bounceDragPhase = 0
				}

				// 边缘弹性时触发刷新, 当滑到底部

				this.borderBouncing = bouncing

				return bouncing
			},

			zoom : function (scale, x, y, time) {
				if ( scale < this.options.zoomMin ) {
					scale = this.options.zoomMin
				} else if ( scale > this.options.zoomMax ) {
					scale = this.options.zoomMax
				}

				if ( scale == this.scale ) return

				var relScale = scale / this.scale

				x = x === undefined ? this.wrapperWidth / 2 : x
				y = y === undefined ? this.wrapperHeight / 2 : y
				time = time === undefined ? 300 : time

				x = x + this.wrapperOffset.left - this._x
				y = y + this.wrapperOffset.top - this._y

				x = x - x * relScale + this._x
				y = y - y * relScale + this._y

				this.scale = scale

				this._refresh()	// update boundaries

				if ( x > 0 ) {
					x = 0
				} else if ( x < this.maxScrollX ) {
					x = this.maxScrollX
				}

				if ( y > 0 ) {
					y = 0
				} else if ( y < this.maxScrollY ) {
					y = this.maxScrollY
				}

				this.scrollTo(x, y, time)
			},

			next : function (time, easing) {
				var x = this.currentPage.pageX,
					y = this.currentPage.pageY

				x++

				if ( x >= this.pages.length && this.hasVerticalScroll ) {
					x = 0
					y++
				}

				this.goToPage(x, y, time, easing)
			},

			prev : function (time, easing) {
				var x = this.currentPage.pageX,
					y = this.currentPage.pageY

				x--

				if ( x < 0 && this.hasVerticalScroll ) {
					x = 0
					y--
				}

				this.goToPage(x, y, time, easing)
			},

			goToPage : function (x, y, time, easing) {
				easing = easing || this.options.bounceEasing

				if ( x >= this.pages.length ) {
					x = this.pages.length - 1
				} else if ( x < 0 ) {
					x = 0
				}

				if ( y >= this.pages[x].length ) {
					y = this.pages[x].length - 1
				} else if ( y < 0 ) {
					y = 0
				}

				var posX = this.pages[x][y].x,
					posY = this.pages[x][y].y

				time = time === undefined ? this.options.snapDuration || Math.max(
					Math.max(
						Math.min(Math.abs(posX - this.x), 1000),
						Math.min(Math.abs(posY - this.y), 1000)
					), 300) : time

				this.currentPage = {
					x: posX,
					y: posY,
					pageX: x,
					pageY: y
				}

				this.scrollTo(posX, posY, time, easing)
			},

			scrollBy : function (x, y, time, easing, bounce) {
				if ( x === 0 && y === 0 ) return

				x = this._x + x
				y = this._y + y
				time = time || 0

				this.scrollTo(x, y, time, easing, bounce)
			},

			scrollTo : function (x, y, time, easing, bounce) {
				time = time || 0
				easing = easing || EASEING.circular

				this.isInTransition = this.options.useTransition && time > 0

				if ( x === this._x && y === this._y && time !== -1 ) {
					if ( time ) this._execEvent('scrollend', 'end')
					return
				}

				if ( bounce === false ) {
					if ( x >= this.minScrollX ) {
						x = this.minScrollX
                    } else if ( x < this.maxScrollX ) {
                        x = this.maxScrollX
                    }

					if ( y >= this.minScrollY ) {
						y = this.minScrollY
                    } else if ( y < this.maxScrollY ) {
                        y = this.maxScrollY
                    }
				}

				if ( time <= 0 ) {
					this._promiseKeyFrame('translate', [x, y], true)
					this._promiseKeyFrame('transitionTime', null, true)
					this._drawing()

					return
				}

				this.transitionStartTime = Date.now()
				this.transitionCountTime = time

				if ( this.options.useTransition && easing.style ) {
					/**
					 * 注意顺序:_transitionScroll置后执行
					 */
					this._promiseKeyFrame('translate', [x, y], true)
					this._promiseKeyFrame('transitionTimingFunction', [easing.style], true)
					this._promiseKeyFrame('transitionTime', [time], true)
					this._drawing()
					this._transitionScroll()
				} else {
					this._animate(x, y, time, easing.fn)
				}
			},

			scrollToElement : function (el, time, offsetX, offsetY, easing) {
				el = el.nodeType ? el : this.scroller.querySelector(el)

				if ( !el ) {
					return
				}

				var pos = METHOD.offset(el)

				pos.left -= this.wrapperOffset.left
				pos.top  -= this.wrapperOffset.top

				// if offsetX/Y are true we center the element to the screen

				var elRect = METHOD.getRect(el)
				var wrapperRect = METHOD.getRect(this.wrapper)

				if ( offsetX === true ) {
					offsetX = Math.round(elRect.offsetWidth / 2 - wrapperRect.offsetWidth / 2)
				}
				if ( offsetY === true ) {
					offsetY = Math.round(elRect.offsetHeight / 2 - wrapperRect.offsetHeight / 2)
				}

				pos.left -= offsetX || 0
				pos.top  -= offsetY || 0

				pos.left = pos.left > this.minScrollX ? this.minScrollX : pos.left < this.maxScrollX ? this.maxScrollX : pos.left
				pos.top  = pos.top  > this.minScrollY ? this.minScrollY : pos.top  < this.maxScrollY ? this.maxScrollY : pos.top

				time = time === undefined || time === null || time === 'auto' ? Math.max(Math.abs(this.x-pos.left), Math.abs(this.y-pos.top)) : time

				this.scrollTo(pos.left, pos.top, time, easing)
			},

			setupFinite : function () {

				this.infiniteCache = []
				this.infiniteDataLength = 0
				this.datasetInfiniteLock = false

				this.minScrollX = 0
				this.minScrollY = 0

				this.turnoverTimes = 0
			},

			setupInfinite : function () {
				this.scrollerHeight = 0

				this.infiniteCache = []
				this.infinitePhase = 0
				this.infiniteMaxPhase = 0
				this.infiniteContentWidth = 0
				this.infiniteContentHeight = 0
				this.infiniteContentPos = [0, 0]
				this.infiniteContentCenter = 0
				this.infiniteContainerCenter = 0
				this.infiniteElementsEdge = [0, 0]
				this.infiniteElementsPos = []
				this.infiniteUpdatePos = []
				this.infiniteDataLength = 0
				this.datasetInfiniteLock = false

				this.minScrollX = 0
				this.minScrollY = 0

				this.turnoverTimes = 0
			},

			resetInfinite : function () {
				if ( !this.infiniteElements ) this._initInfinite()

				this.infiniteElements.each(function (key, element) {
					this.setInfiniteDataFiller(element, element._phase)
				}, this)

				this.scrollTo(0, 0)

				this.setupInfinite()
				this.reorderInfinite()	
			},

			// 加载数据回调

			datasetInfinite : function (callback) {

				if ( this.datasetInfiniteLock === true ) {
					this._execEvent('infinitedataend')

					return
				}

				var that = this
				var start = this.infiniteCache.length
				var turnover = this.turnoverTimes

				// ajax lock

				this.datasetInfiniteLock = true

				// getInfiniteDataset

				this.getInfiniteDataset.call(this, start, turnover, function (data, end) {

					/*
						data [type : Array]
						datasetInfinite.lock: 数据加载完毕，不再尝试更新
					*/

					if ( (!data || !data.length) || (that.turnoverTimes > that.options.maxPage) ) {
						that._execEvent('infinitedataend')
						that.datasetInfiniteLock = true

						return
					}

					that.turnoverTimes++

					// 如果数据未至最后

					if ( !end ) {

						// open lock

						that.datasetInfiniteLock = false
					}

					// infiniteDataLoaded
					
					that._execEvent('infinitedataready')

					// 更新数据缓存

					that.updateInfiniteData(start, data)

					// 如果first
					
					that._execEvent('infinitedataloaded')

					// 修改滚动位置
					
					that._execEvent("modify")

					callback && callback.call(that)

					// 数据结束

					if ( end ) {
						that._execEvent('infinitedataend')
						that.datasetInfiniteLock = true
					}
				})
			},

			checkInfiniteDataBuffer : function () {

				// 数据缓冲不足

				if ( !this.datasetInfiniteLock && this.infiniteSurplusBuffer <= this.options.infiniteCacheBuffer ) {
					this.datasetInfinite()
				}
			},

			detectInfiniteBalance : function (trend) {

				if ( this.broken || this.moving ) return 0
				if ( trend == 1 && this.infinitePhase < this.infiniteLength ) return -1
				if ( trend == 1 && this.y > -this.wrapperHeight && this.infinitePhase == this.infiniteLength ) return 0

				// 记录中心位置

				this.infiniteContainerCenter = -this.y + this.wrapperHeight / 2

				// 记录内容中心位置

				this.infiniteContentCenter = this.infiniteContentPos[0] + this.infiniteContentHeight / 2

				// 中心偏离
				
				return this.infiniteContentCenter - this.infiniteContainerCenter - trend * this.wrapperHeight
			},

			// TO-DO: clean up the miss

			reorderInfinite : function (callback) {

				if ( this.updating ) {
					return this.infiniteContentPos = [0, 0]
				}

				// 滚动内容高度

				this.infiniteContentHeight = this.infiniteContentPos[1] - this.infiniteContentPos[0]

				// 剩余容量

				this.infiniteSurplusBuffer = this.infiniteDataLength - this.infinitePhase

				// 检测剩余容量

				this.checkInfiniteDataBuffer()

				// 如果没有数据，停止排序

				if ( this.infiniteDataLength === 0 ) return

				// 重新排序

				this.rearrangeInfinite(this.directionY || 1, callback)
			},

			rearrangeInfinite : function (supplement, callback) {

				if ( this.infiniteRearranging ) return

				var that = this
				  , item
				  , pos
				  , size
				  , phase
				  , index
				  , round
				  , i = 0
				  , limit = Math.min(this.infiniteLength, this.infiniteDataLength) / 2
				  
				// lock

				this.infiniteRearranging = true

				function end (end) {

					that.infiniteRearranging = false

					// updateInfinitePos
					
					that.updateInfinitePos()

					// callback
					
					callback && callback.call(that)
					
					if ( end ) {
						that._execEvent('infinitecachedend')
					}
				}

				function subStep () {
					/*
						if > 如果缓冲不足 或者 初始化
						detectInfiniteBalance: 上下缓冲平衡检测 and 初始化
						infinitePhase: 当前step id
						infiniteLength: 循环数量
					*/

					if ( that.detectInfiniteBalance(1) >= 0 ) return end()

					// infiniteSurplusBuffer: 过剩的缓存数据

					that.infiniteSurplusBuffer = that.infiniteDataLength - that.infinitePhase

					// 如果数据全部展示完毕则停止

					if ( that.infiniteSurplusBuffer <= 0 ) return end(1)

					// 当前操作data序列

					phase = that.infinitePhase++

					// 当前操作dom序列

					index = phase % that.infiniteLength

					// 循环序列

					round = Math.max((phase + 1 - that.infiniteLength) % that.infiniteLength, 0)
					
					// set item

					item = that.infiniteElements[index]
					item._index = index
					item.__phase = item._phase || 0
					item._phase = phase

					// update item content

					that.updateInfiniteContent(item)

					// content item size

					size = that.infiniteItemSize || item._offsetHeight

					// infinite of content border top and bottom pos

					pos = that.infiniteContentPos[1]

					// update item pos

					that.promiseInfinitePos(item, pos)

					// mark item pos

					that.infiniteElementsPos[index] = [pos, pos + size]
					
					// update infinite of content border top and bottom pos

					that.infiniteElementsEdge = [round, index]
					that.infiniteContentPos[0] = that.infiniteElementsPos[round][0]
					that.infiniteContentPos[1] += size

					// update maxScrollY and scrollerHeight

					that.refreshInfinitePos(phase, pos + size)

					// limit

					i++

					// while

					if ( that.updating ) {
						subStep()
					} else {
						rAF(subStep)
					}
				}

				function supStep () {
					/*
						if > 如果缓冲不足
						detectInfiniteBalance: 上下缓冲平衡检测
						infinitePhase: 当前step id
						infiniteLength: 循环数量
					*/
					
					if ( that.detectInfiniteBalance(-1) <= 0 ) return end()

					// ignore init phase

					if ( that.infinitePhase - that.infiniteLength <= 0 ) return end()

					// step phase

					phase = --that.infinitePhase

					// dom of index id

					index = phase % that.infiniteLength

					// dom of round id

					round = (phase - 1) % that.infiniteLength

					// set item

					item = that.infiniteElements[index]
					item._index = index
					item.__phase = item._phase
					item._phase = phase - that.infiniteLength

					// update item content

					that.updateInfiniteContent(item)

					// content item size

					size = that.infiniteItemSize || item._offsetHeight

					// infinite of content border top and bottom pos

					pos = that.infiniteContentPos[0] - size

					// update item content

					that.promiseInfinitePos(item, pos)

					// mark item pos

					that.infiniteElementsPos[index] = [pos, pos + size]

					// update infinite of content border top and bottom pos

					that.infiniteElementsEdge = [index, round]
					that.infiniteContentPos[0] -= size
					that.infiniteContentPos[1] = that.infiniteElementsPos[round][1]

					// update minScrollY and scrollerHeight

					if ( item._phase === 0 || pos < that.minScrollY ) {
						that.minScrollY = -pos
					}

					// limit

					i++

					// while

					if ( that.updating ) {
						supStep()
					} else {
						rAF(supStep)
					}
				}

				switch (supplement) {
					case 1:
						if ( this.updating ) {
							subStep()
						} else {
							rAF(subStep)
						}
					break

					case -1:
						if ( this.updating ) {
							supStep()
						} else {
							rAF(supStep)
						}
					break
				}
				
			},

			addInfiniteElements : function () {
				var item = document.createElement('infinite')

				this.scroller.appendChild(item)
				this.infiniteElements.push(item)
				this.infiniteLength = this.infiniteElements.length
			},

			refreshInfinitePos : function (phase, pos) {

				phase = phase + 1

				// 如果增量没有超出或者不进行强制更新位置

				if ( phase < this.infiniteMaxPhase ) return

				// 如果还有缓存数据，则增加两倍视图高度的虚拟缓冲区

				this.scrollerHeight = pos + (this.infiniteSurplusBuffer - 1) * (pos / phase)
				this.maxScrollY = Math.min(this.wrapperHeight - this.scrollerHeight, this.minScrollY)

				// 数据剩余为0或每十次循环刷新一次滚动条

				if ( this.infiniteSurplusBuffer === 1 || phase % (this.infiniteLength * this.options.scrollbarAccuracy) === 0 ) {
					this._execEvent("modify")
				}

				this.infiniteMaxPhase = phase
			},

			refreshInfiniteAllPos : function (start) {
				var i = start || 0,
					l = this.infiniteLength,
					minPhase = this.infiniteElementsEdge[0],
					index,
					item,
					pos,
					size,
					supplement,
					contentHeight = this.infiniteContentPos[1] - this.infiniteContentPos[0]

				this.infiniteContentPos[1] = this.infiniteContentPos[0]

				for (; i < l; i++) {
					index = (minPhase + i) % this.infiniteLength
					item = this.infiniteElements[index]
					size = item.offsetHeight

					// _offsetHeight

			    	item._offsetHeight = size

					pos = this.infiniteContentPos[1]
					this.promiseInfinitePos(item, pos)

					this.infiniteElementsPos[index] = [pos, pos+size]

					this.infiniteContentPos[1] += size
				}

				this.updateInfinitePos()

				// item改变后总高度变化

				supplement = this.infiniteContentPos[1] - this.infiniteContentPos[0] - contentHeight

				// 修正最大滚动高度受内容改变的影响

				this.scrollerHeight += supplement
				this.maxScrollY = Math.min(this.wrapperHeight - this.scrollerHeight, 0)

				this._execEvent("modify")
			},

			promiseInfinitePos : function (item, pos) {
				this.infiniteUpdatePos.push(arguments)
			},

			setInfiniteTranslate : function (item, pos) {
				
				// set item pos

				item.style[BROWSER.prefixStyle.transform] = 'translate3d(0px, ' + pos + 'px, 0px)'
			},

			updateInfinitePos : function () {
				var that = this

				// 可插入贞时排布
				
				rAF(function () {
					that.infiniteUpdatePos.each(function (i, args) {
						that.setInfiniteTranslate.apply(that, args)
					})
					that.infiniteUpdatePos = []
				})
			},

			updateInfiniteContent : function (item) {
				/**
			    * dataFiller
			    * @param  element {Object} replace box
			    * @param  index {Number} cur index
			    * @param  oldindex {Number} pre index
			    */
			    
			    item.style[BROWSER.prefixStyle.transform] = 'translate3d(-10000px, -10000px, 0px)'
			    this.getInfiniteDataFiller.call(this, item, item._phase, item.__phase)

			    // _offsetHeight

			    item._offsetHeight = item.offsetHeight
			},

			updateInfiniteData : function (start, data, clear) {
				var that = this

				data.each(function (i, scope) {
					that.infiniteCache[start++] = scope

					// finite 时全部渲染
					
					if ( that.options.finite ) {
						that.getFiniteCacheBuffer.call(that, scope, start - 1)
					}
				})

				// 当前数据总数
				
				this.infiniteDataLength = start
			},

			updateInfiniteCache : function (index) {
				return this.getInfiniteCacheBuffer.call(this, this.infiniteCache[index], index)
			},

			update : function (callback, keep) {
				this.updating = true

				if ( !keep ) {
					this.updated = true
					this.datasetInfiniteLock = false

					if ( this.options.finite ) {
						this.setupFinite()
					} else {
						this.setupInfinite()
					}
				} else {
					this.updated = false
				}

				this.datasetInfinite(function () {

					// finite 时将frag放入视图
				
					if ( this.options.finite ) {
						if ( !keep ) this.scroller.innerHTML = null
						this.scroller.appendChild(this.finiteFragment)
						this.updating = false
					} else {
						this.rearrangeInfinite(1, function () {
							this.updateInfinitePos()
							this.updating = false
						})
					}

					callback && callback.call(this)
				})
			}
		}

		!(function (proto) {
			proto.extendProperties({
				_execEvent : function (type) {
		        	var that = this,
		        		args = arguments,
		        		events = this._events[type]

		            if ( !events ) return

		        	for (var i = events.length - 1; i >= 0; i--) {
		        		events[i].apply(that, [].slice.call(args, 1))
		        	}
				},

				_refresh : function () {
					var wrapperRect = METHOD.getRect(this.wrapper)
					var scrollerRect = METHOD.getRect(this.scroller)

					this.wrapperWidth	= wrapperRect.clientWidth
					this.wrapperHeight	= wrapperRect.clientHeight
					
					// infinite 模式时高度为虚拟值
					
					if ( !this.options.infinite ) {
						this.scrollerWidth	= Math.round(scrollerRect.width * this.scale)
						this.scrollerHeight	= Math.round(scrollerRect.height * this.scale)

						this.minScrollX = this.options.minScrollX || 0
						this.minScrollY = this.options.minScrollY || 0
					}

					// 最大滚动范围

					this.maxScrollX		= this.wrapperWidth - this.scrollerWidth - this.minScrollX
					this.maxScrollY		= this.wrapperHeight - this.scrollerHeight - this.minScrollY

					// 事件滚动情况

					this.canHorizontalScroll = this.maxScrollX < this.minScrollX
					this.canVerticalScroll   = this.maxScrollY < this.minScrollY
					
					// 重设滚动方向
					
					this.hasHorizontalScroll	= this.options.scrollX == 'auto' ? this.canHorizontalScroll : this.options.scrollX
					this.hasVerticalScroll		= this.options.scrollY == 'auto' ? this.canVerticalScroll : this.options.scrollY

					// infinite 模式 始终保持纵向
					
					if ( this.options.infinite ) {
						this.hasVerticalScroll = true
					}

					// 无横向滚动时
					
					if ( !this.hasHorizontalScroll ) {
						this.maxScrollX = this.minScrollX
						this.scrollerWidth = this.wrapperWidth
					}

					// 无纵向滚动时

					if ( !this.hasVerticalScroll ) {
						this.maxScrollY = this.minScrollY
						this.scrollerHeight = this.wrapperHeight
					}

					this.endTime = 0
					this.directionX = 0
					this.directionY = 0

					this.wrapperOffset = METHOD.offset(this.wrapper)

					this._execEvent('refresh')
					this.resetPosition()
				},

				_call : function (callback) {
					callback.call(this)
				},

				_drawing : function (callback) {
					var that = this
					rAF(function () {
						that._drawKeyFrame.call(that, callback || noop)
					})
				},

				_clearKeyFrame : function () {
					this._keyFrame = []
				},

				/**
				 * 关键帧promise
				 * @param  {String} property style-property
				 * @param  {Array}  value    style-value   
				 */
				_promiseKeyFrame : function (property, value, join) {
			  		var fs = this._keyFrame
			  		var style = {}

					// push to queue
					
					if ( join ) {
						var tail = fs[fs.length-1]

						if ( tail ) {
							tail[property] = value

							return
						}
					}

					style[property] = value

					fs.push(style)
				},

				_drawKeyFrame : function (callback) {

					// shift queue
						
					var frame = this._keyFrame.shift()
					
					// end
					
					if ( !frame ) return callback.call(this)

					// apply style

					for (var key in frame) {
						this['_' + key].apply(this, frame[key])
					}

					// requestAnimationFrame
					
					this._drawing()
				},

				_translate : function (x, y, z, s, v) {
					/**
					 * 下一贞位置
					 * 没有位置数据，设位置为下一位置贞
					 */
					if ( x == null ) {
						s = this.getComputedPosition()
						x = s.x + this.dropX
						y = s.y + this.dropY
						s = null

						if ( isNaN(x) ) return
					}

					x = x || 0
					y = y || 0
					z = z || 0
					s = s || this.options.zoom ? this.scale : null

					if ( x === this.x && y === this.y && z === this.z && s === this.s ) return

					this.scrollerStyle[BROWSER.prefixStyle.transform] = 'translate3d(' + x + 'px' + ',' + y + 'px' + ', ' + z + 'px' + ')' + (s ? ' scale(' + s + ')' : '')

					this.x = x
					this.y = y
					this.z = z
					this.s = s

					if ( !v ) {
						this._x = x
						this._y = y
					}

					if ( this.indicators ) {
						for ( var i = this.indicators.length; i--; ) {
							this.indicators[i].updatePosition()
						}
					}
				},

				_transitionTime : function (time) {

					if ( time === this.transitionDuration ) return

					this.scrollerStyle[BROWSER.prefixStyle.transitionDuration] = time ? time + 'ms' : ''

					this.transitionDuration = time

					if ( this.indicators ) {
						for ( var i = this.indicators.length; i--; ) {
							this.indicators[i].transitionTime(time)
						}
					}

				},

				_transformOrigin : function (postion) {
					this.scrollerStyle[BROWSER.prefixStyle.transformOrigin] = postion || this.options.zoomOrigin
				},

				_transitionTimingFunction : function (easing) {
					easing = easing || ''

					if ( easing === this.transitionTimingFunction ) return

					this.scrollerStyle[BROWSER.prefixStyle.transitionTimingFunction] = easing
					this.transitionTimingFunction = easing

					if ( this.indicators ) {
						for ( var i = this.indicators.length; i--; ) {
							this.indicators[i].transitionTimingFunction(easing)
						}
					}

				},

				_transitionScroll : function (x, y, time) {
					var that = this

					// useTransition 的scroll事件

					function step () {

						if ( !that.isInTransition ) return
						if ( Date.now - that.transitionStartTime > 2 * that.transitionCountTime ) return that._execEvent('scrollend', 'end')

						var pos = that.getComputedPosition()

						// lost rate

						that.dropX = Math.round(pos.x - that.x) || that.dropX || 0
						that.dropY = Math.round(pos.y - that.y) || that.dropY || 0

						that.x = Math.round(pos.x)
						that.y = Math.round(pos.y)
						
						that._execEvent('scroll', 'scrolling')

						rAF(step)
					}

					step()
				},

				_checkPerformance : function () {
					this.transitionDelayTime = -this._transitionTimeLeft()
					this.transitionDelayRate = this.transitionDelayTime / this.transitionCountTime

					if ( this.transitionDelayRate > 0.15 ) {
						application.console.warn('滚动性能过低，总延迟为' + this.transitionDelayTime + 'ms', '性能警告', '延迟率为' + this.transitionDelayRate)
						application.console.warn('减除无必要的滚动事件绑定', '性能建议', '延迟率应小于0.15')
					}
				},

				_transitionTimeLeft : function () {
					return Math.max(this.transitionCountTime - (Date.now() - this.transitionStartTime), 0)
				},

				_transitionEnd : function (e) {
					if ( e.target != this.scroller || !this.isInTransition ) return

					this._transitionTime()
					this._checkPerformance()

					// css3 动画无效自动切换, weixin webview bug

					if ( BROWSER.supportTransition && this.transitionDelayTime < 0 ) {
						this.options.useTransition = false

						// 设备标记不支持动画过渡

						BROWSER.supportTransition = false
						device.feat.supportTransition = false
					}

					// 非边缘弹性时进行end

					if ( !this.resetPosition(this.options.bounceTime) ) {
						this.isInTransition = false
						this._promiseKeyFrame('translate', [this.x, this.y], true)
						this._drawing()
						this._execEvent('scrollend', 'end')
					}

					// drawingEnd

					this.drawingEnd()
				},

				_animate : function (destX, destY, duration, easingFn) {
					var that = this,
						startX = this._x,
						startY = this._y,
						now = Date.now(),
						fs = 1000/60,
						startTime = now - fs,
						destTime = startTime + duration

					if ( this.isAnimating ) return

					function step () {
						var timestamp = Date.now(),
							stepTime = timestamp - startTime,
							newX, newY,
							easing

						if ( timestamp >= destTime ) {
							that.isAnimating = false
							that._translate(destX, destY)

							that._checkPerformance()
							
							if ( !that.resetPosition(that.options.bounceTime) ) {
								that._execEvent('scrollend', 'end')
							}

							return
						}

						easing = easingFn(stepTime / duration)
						newX = ( destX - startX ) * easing + startX
						newY = ( destY - startY ) * easing + startY
						that._translate(Math.round(newX), Math.round(newY))

						if ( that.isAnimating ) rAF(step)
						
						that._execEvent('scroll', 'scrolling')
					}

					this.isAnimating = true

					step()
				},

				/**
				 * 惯性甩出计算
				 * @param  {Number} current    
				 * @param  {Number} start       
				 * @param  {Number} time        
				 * @param  {Number} upperMargin 
				 * @param  {Number} lowerMargin 
				 * @param  {Number} wrapperSize 
				 * @return {Number}             
				 */
				_momentum : function (current, start, time, upperMargin, lowerMargin, wrapperSize) {
					var speed, distance, distances, direction, duration, destination, deceleration
					
					distances = current - start,
					direction = distances < 0 ? -1 : 1
					speed = Math.min(Math.abs(distances) * DPR / time, this.options.speedLimit)
					speed = this.speedM == undefined ? speed : Math.min(this.speedM * DPR, speed)
					deceleration = Math.max(this.options.deceleration - this.acceleration, 0.003)
					distance = speed * speed / deceleration / DPR / 2 * direction
					duration = speed / deceleration * this.options.speedRate
					destination = current + distance

					if ( destination < lowerMargin ) {
						destination = wrapperSize ? lowerMargin - (wrapperSize * this.options.boundariesLimit * (speed / dP(8))) : lowerMargin
						distance = Math.abs(destination - current)
						duration = distance / speed
					} else if ( destination > upperMargin ) {
						destination = wrapperSize ? wrapperSize * this.options.boundariesLimit * (speed / dP(8)) : 0
						distance = Math.abs(current) + destination
						duration = distance / speed
					}

					return {
						destination: Math.round(destination),
						duration: duration,
						speed: speed
					}
				},

				/**
				 * 重力加速度
				 * @param  {Number} scrollTrendX
				 * @param  {Number} scrollTrendY
				 */
				_acceleration : function () {

					// 两次连续滚动且两次滚动方向一致则重力加速
						
					if ( this.isScrolling() && this.scrollTrendY != -1 && this.scrollTrendX != -1 ) {
						if ( this.gapTime < 1000 ) {
							this.acceleration = Math.min(this.acceleration + 0.0005, 0.001)
						} else {
							this.acceleration = Math.min(this.acceleration - 0.0005, 0)
						}
					} else {
						this.acceleration = 0
					}
				},

				_observer : function (element, callback) {
					var that = this
					var timeid

					element.observer({
	                    childList: true,
	                    subtree: true,
	                    characterData: true,
	                    attributeFilter: ["id", "class", "style", "src", "width", "height"]
					}, function (records) {
						clearTimeout(that.observerTimeout)
						if ( records.length ) {
							that.observerTimeout = setTimeout(function () {
								callback.call(that, records)
							}, 300)
						}
					})
				},

				_resize : function () {
					var that = this

					clearTimeout(this.resizeTimeout)

					this.resizeTimeout = setTimeout(function () {
						that.refresh()
					}, this.options.resizePolling)
				},

				_directionLocked : function (absDistX, absDistY, deltaX, deltaY) {

					// We need to move at least 10 pixels for the scrolling to initiate

					if ( this.broken === false && this.moveTime - this.endTime > 200 && (absDistX < dP(10) && absDistY < dP(10)) ) return

					// If you are scrolling in one direction lock the other

					if ( this.options.directionLockThresholdX ) {
						if ( absDistX > absDistY + dP(this.options.directionLockThresholdX) ) {
							this.directionLocked = 'h'
						} else {
							this.directionLocked = 'v'
						}
					}

					if ( this.options.directionLockThresholdY ) {
						if ( absDistY > absDistX + dP(this.options.directionLockThresholdY) ) {
							this.directionLocked = 'v'
						} else {
							this.directionLocked = 'h'
						}
					}

					if ( !this.directionLocked && !this.options.freeScroll ) {
						if ( absDistX > absDistY + dP(this.options.directionLockThreshold) ) {
							this.directionLocked = 'h'
						} else if ( absDistY >= absDistX + dP(this.options.directionLockThreshold) ) {
							this.directionLocked = 'v'
						} else {
							this.directionLocked = 'n'
						}
					}

					if ( this.directionLocked == 'h' ) {
						if ( this.options.eventPassthrough == 'vertical' ) {
							e.preventDefault()
						} else if ( this.options.eventPassthrough == 'horizontal' ) {
							this.initiated = false
							return
						}

						deltaY = 0
					} else if ( this.directionLocked == 'v' ) {
						if ( this.options.eventPassthrough == 'horizontal' ) {
							e.preventDefault()
						} else if ( this.options.eventPassthrough == 'vertical' ) {
							this.initiated = false
							return
						}

						deltaX = 0
					}

					return { x: deltaX, y : deltaY }
				},

		        _initPrevant : function () {
					this.scroller.on('preventscroll', function (e) {
						var scroll = e.data.scroll
						var prevent = e.data.prevent

						this.preventscroll = prevent
						
						if ( prevent ) this._execEvent('scrollend', 'end')

						if ( scroll.options.coverPropagation && this.isScrolling() ) {
							scroll.stopAnimation = true
							this.preventscroll = false
						}

					}.bind(this))
				},

				_pieceEvent : function (e) {
					/**
		        	 * 两次的事件类型检测
		        	 * @type {[type]}
		        	 */
					return METHOD.eventType[e.type] === this.initiated
				},

				_preventscroll : function (prevent) {
					this.wrapper.trigger('preventscroll', { prevent : prevent, scroll : this })
				},

		        _prevent : function (e, order, x, y, ex, ey) {
		        	var prevent = false

		        	x = Math.round(x || this._x)
		        	y = Math.round(y || this._y)

		        	// enabled
		        	
		        	if ( !this.enabled ) return true

					switch ( order ) {
		        		case 1:
		        			if ( this.initiated && !this._pieceEvent(e) ) return true

		        			this.preventscroll = false
		        			this.stopAnimation = false

							// React to left mouse button only
							
							if ( METHOD.eventType[e.type] != 1 ) {

							  	// for button property
							  
							  	var button
						    
							    if ( !e.which ) {
							      
							      	/* IE case */
							      
							      	button = (e.button < 2) ? 0 :
							               	((e.button == 4) ? 1 : 2)
							    } else {

							      	/* All others */
							      
							      	button = e.button
							    }

								if ( button !== 0 ) {
									return true
								}
							}

							break
						case 2:
							if ( !this._pieceEvent(e) ) return true
							if ( this.preventscroll ) return true

							break
						case 3:
							if ( !this._pieceEvent(e) ) return true
							if ( e.touches && e.touches.length > 0 ) return true
							
							break
						case 4:
							this.preventscroll = false

							break
						case 5:
							e.preventDefault()
							if ( this.preventscroll ) return true

							break
						case 6:

							break
		        	}


		        	// preventDefault
					
					if ( this.options.preventDefault && [1,3].consistOf(order) && e.changedTouches && !App.preventDefaultException(e, this.options.preventDefaultException) ) {
						e.preventDefault()
					}

					// stopPropagation

					if ( this.options.stopPropagation != false ) {
						if ( [2,5].consistOf(order) ) {
							if ( this.options.stopPropagation == true ) {
								e.stopPropagation()
							} else {
								if ( 
									this.options.stopPropagation == "auto"
									&&
									((this.canHorizontalScroll && this.directionLocked == 'h' && !(x >= this.minScrollX || x <= this.maxScrollX)) 
									||
									(this.canVerticalScroll && this.directionLocked == 'v' && !(y >= this.minScrollY || y <= this.maxScrollY)))
								) {
									prevent = true
								}

								if ( this.options.stopPropagation == "x" && Math.abs(ex) > Math.abs(ey) ) {
									prevent = true
								} else if ( this.options.stopPropagation == "y" && Math.abs(ey) > Math.abs(ex) ) {
									prevent = true
								}

								this._preventscroll(prevent)

								// 限制地性能设备的动画线程和边远弹性
							
								if ( this.options.coverPropagation ) {
									if ( order == 1 && this.stopAnimation ) return true					
								}
							}
						}
					}

		        	return false
		        },

				_start : function (e) {
					
					if ( this._prevent(e, 1) ) return

					var point = e.touches ? e.touches[e.touches.length - 1] : e

					this.initiated	= METHOD.eventType[e.type]
					this.moved		= false
					this.moving     = false
					this.broken     = false
					this.holding    = true
					this.distX		= 0
					this.distY		= 0
					this.moveTrendX = 0
					this.moveTrendY = 0
					this.directionX = 0
					this.directionY = 0
					this.directionLocked = 0

					this._clearKeyFrame()

					if ( this.options.useTransition && this.isInTransition ) {

						/*
							=== 动画终止锁定 ===
							锁定防止被 scrolling 刷新位置 
							重要－置顶处理
						*/

						this.broken = true
						this.isInTransition = false

						this._promiseKeyFrame('translate', [null, null, null, null])
						this._promiseKeyFrame('transitionTime', null, true)

						/*
							动画积压bug
							当前置动画未执行完时，元素被设置了新的动画，0ms暂停无效时
							后置的动画会积压到gpu内存中，因前置动画时间结束才能被释放
							此时gpu内存则可能溢出，导致gpu性能直线下降，此处采用0.0001ms
							动画进行快速释放gpu内存
						*/

						if ( BROWSER.isBadTransition ) {

							// 针对 0ms停止无效 做处理

							this._promiseKeyFrame('transitionTime', [0.0001], true)
						}

						// clear TimingFunction
					
						this._promiseKeyFrame('transitionTimingFunction', null, true)
						this._drawing()

						// 动画时间清零

						this._execEvent('scrollend', "break")
				
					} else if ( !this.options.useTransition && this.isAnimating ) {
						this.broken = true
						this.isAnimating = false
						this._execEvent('scrollend', "break")
					}

					// startTime
					
					this.startTime = Date.now()

					this.startX    = this.x
					this.startY    = this.y
					this.absStartX = this.x
					this.absStartY = this.y
					this.pointX    = point.pageX
					this.pointY    = point.pageY

					this._execEvent('beforescrollstart', 'hold')
				},

				_move : function (e) {

					if ( this._prevent(e, 2) ) return

					var point		= e.touches ? e.touches[e.touches.length - 1] : e,
						delta       = 0,
						deltaX		= point.pageX - this.pointX,
						deltaY		= point.pageY - this.pointY,
						timestamp	= Date.now(),
						movedTime   = Math.min(timestamp - this.movedTimestamp, 300),
						newX, newY,
						absDistX, absDistY,
						directionX, directionY

					
					// 当前Touch move 时间
					
					this.moveTime = timestamp
					
					// 当前移动方向
					
					directionX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0
					directionY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0
					
					// move 偏移值

					deltaX = Math.min(Math.abs(deltaX), this.options.stepLimit) * -directionX
					deltaY = Math.min(Math.abs(deltaY), this.options.stepLimit) * -directionY

					this.pointX		= point.pageX
					this.pointY		= point.pageY

					this.distX		+= Math.round(deltaX)
					this.distY		+= Math.round(deltaY)
					absDistX		= Math.abs(this.distX)
					absDistY		= Math.abs(this.distY)

					this.speedX     = Math.abs(deltaX) / movedTime
					this.speedY     = Math.abs(deltaY) / movedTime
					this.speedM     = Math.max(this.speedX, this.speedY)

					this.bounceDragPhase++

					delta = this._directionLocked(absDistX, absDistY, deltaX, deltaY)

					if ( !delta ) return

					deltaX = this.hasHorizontalScroll ? delta.x : 0
					deltaY = this.hasVerticalScroll ? delta.y : 0

					newX = this._x + deltaX
					newY = this._y + deltaY

					// Slow down if outside of the boundaries

					if ( newX > this.minScrollX || newX < this.maxScrollX ) {
						this.bounceDragPhase++
						newX = this.options.bounce ? this._x + deltaX / (this.options.bounceDrag + this.bounceDragPhase / this.options.bounceDragRate) : newX > this.minScrollX ? this.minScrollX : this.maxScrollX
					}
					if ( newY > this.minScrollY || newY < this.maxScrollY ) {
						this.bounceDragPhase++
						newY = this.options.bounce ? this._y + deltaY / (this.options.bounceDrag + this.bounceDragPhase / this.options.bounceDragRate) : newY > this.minScrollY ? this.minScrollY : this.maxScrollY
					}

					this.moveTrendX = this.hasHorizontalScroll ? (this.directionX == directionX ? 1 : -1) : 0
					this.moveTrendY = this.hasVerticalScroll ? (this.directionY == directionY ? 1 : -1) : 0

					// 反向趋势时清除关键帧

					if ( this.moveTrendX == -1 || this.moveTrendY == -1 ) {
						this._clearKeyFrame()
					}

					this.directionX = directionX
					this.directionY = directionY


					if ( this._prevent(e, 2, newX, newY, delta.x, delta.y) ) return

					// 是否有效的move

					if ( this._x !== newX || this._y !== newY ) {
						if ( !this.moved ) {
							this._execEvent('scrollstart')

							// startTime 防止事件造成延时过长

							this.startTime = Date.now()
						}

						this.moved = true
						this.moving = true
						this.broken = false
						this.holding = false

						this._x = newX
						this._y = newY
						
						this._promiseKeyFrame('translate', [newX, newY, null, null, true])
						this._promiseKeyFrame('transitionTime', null, true)
						this._drawing()
					}

					this.movedTimestamp = timestamp

					if ( timestamp - this.startTime > 300 ) {
						this.startTime = timestamp
						this.startX = this._x
						this.startY = this._y

						return this._execEvent('scroll', 'movestep')
					}
					
					this._execEvent('scroll', 'moving')
				},

				_end : function (e) {

					if ( this._prevent(e, 3) ) return

					var changedTouches = e.changedTouches ? e.changedTouches.length : 0,
						point = changedTouches ? e.changedTouches[changedTouches] : e,
						momentumX,
						momentumY,
						duration = Date.now() - this.startTime,
						newX = Math.round(this._x),
						newY = Math.round(this._y),
						stepX = newX - this.startX,
						stepY = newY - this.startY,
						distanceX = Math.abs(stepX),
						distanceY = Math.abs(stepY),
						directionX = stepX > 0 ? -1 : stepX < 0 ? 1 : 0,
						directionY = stepY > 0 ? -1 : stepY < 0 ? 1 : 0,
						time = 0,
						easing = ''

					this.moving = false
					this.isInTransition = false
					this.initiated = 0
					this.gapTime = Date.now() - this.endTime
					this.endTime = Date.now()

					// reset if we are outside of the boundaries

					if ( this.resetPosition(this.options.bounceTime) ) return

					// we scrolled less than 10 pixels

					if ( !this.moved && !this.options.snap ) return this._execEvent('scrollcancel')
		
					// start momentum animation if needed

					if ( this.options.momentum && duration < 300 ) {
						momentumX = this.hasHorizontalScroll ? this._momentum(this._x, this.startX, duration, this.minScrollX, this.maxScrollX, this.options.bounce && this.options.bounceBreakThrough ? this.wrapperWidth : 0) : { destination: newX, duration: 0 }
						momentumY = this.hasVerticalScroll ? this._momentum(this._y, this.startY, duration, this.minScrollY, this.maxScrollY, this.options.bounce && this.options.bounceBreakThrough ? this.wrapperHeight : 0) : { destination: newY, duration: 0 }
						newX = momentumX.destination
						newY = momentumY.destination
						time = Math.max(momentumX.duration, momentumY.duration)

						this.speed = Math.max(momentumX.speed || 0, momentumY.speed || 0)

						this.isInTransition = true
					}

					if ( this.options.snap ) {
						var snap = this._nearestSnap(newX, newY)
						this.currentPage = snap
						time = this.options.snapDuration || Math.max(
								Math.max(
									Math.min(Math.abs(newX - snap.x), 1000),
									Math.min(Math.abs(newY - snap.y), 1000)
								), 300)
						newX = snap.x
						newY = snap.y

						this.directionX = 0
						this.directionY = 0
						easing = this.options.snapEasing
					}

					if ( newX != this._x || newY != this._y ) {

						// change easing function when scroller goes out of the boundaries

						if ( newX > this.minScrollY || newX < this.maxScrollX || newY > this.minScrollY || newY < this.maxScrollY ) {
							easing = EASEING.quadratic
						}

						this.scrollTrendX = this.hasHorizontalScroll ? (this._directionX == directionX ? 1 : -1) : 0
						this.scrollTrendY = this.hasVerticalScroll ? (this._directionY == directionY ? 1 : -1) : 0

						this._acceleration()

						// direction 手指的每次走向记录

						this.directionX = directionX
						this.directionY = directionY
						this._directionX = directionX
						this._directionY = directionY

						this.moved = false
						this.moving = false

						this.scrollTo(newX, newY, time, easing)
						
						return
					}

					// def event

					this._execEvent('scrollend', 'end')
				},

				_zoomStart : function (e) {
					var c1 = Math.abs( e.touches[0].pageX - e.touches[1].pageX ),
						c2 = Math.abs( e.touches[0].pageY - e.touches[1].pageY )

					this.touchesDistanceStart = Math.sqrt(c1 * c1 + c2 * c2)
					this.startScale = this.scale

					this.originX = Math.abs(e.touches[0].pageX + e.touches[1].pageX) / 2 - this.x
					this.originY = Math.abs(e.touches[0].pageY + e.touches[1].pageY) / 2 - this.y

					this._execEvent('zoomStart')
				},

				_zoom : function (e) {

					if ( this._prevent(e, 2) ) return

					var c1 = Math.abs( e.touches[0].pageX - e.touches[1].pageX ),
						c2 = Math.abs( e.touches[0].pageY - e.touches[1].pageY ),
						distance = Math.sqrt( c1 * c1 + c2 * c2 ),
						scale = 1 / this.touchesDistanceStart * distance * this.startScale,
						lastScale,
						x, y

					this.scaled = true

					if ( scale < this.options.zoomMin ) {
						scale = 0.5 * this.options.zoomMin * Math.pow(2.0, scale / this.options.zoomMin)
					} else if ( scale > this.options.zoomMax ) {
						scale = 2.0 * this.options.zoomMax * Math.pow(0.5, this.options.zoomMax / scale)
					}

					lastScale = scale / this.startScale
					x = this.originX - this.originX * lastScale + this.startX
					y = this.originY - this.originY * lastScale + this.startY

					this.scale = scale

					this.scrollTo(x, y, 0)
				},

				_zoomEnd : function (e) {

					if ( this._prevent(e, 3) ) return

					var newX, newY,
						lastScale

					this.isInTransition = 0
					this.initiated = 0

					if ( this.scale > this.options.zoomMax ) {
						this.scale = this.options.zoomMax
					} else if ( this.scale < this.options.zoomMin ) {
						this.scale = this.options.zoomMin
					}

					// Update boundaries
					
					this._refresh()

					lastScale = this.scale / this.startScale

					newX = this.originX - this.originX * lastScale + this.startX
					newY = this.originY - this.originY * lastScale + this.startY

					if ( newX > 0 ) {
						newX = 0
					} else if ( newX < this.maxScrollX ) {
						newX = this.maxScrollX
					}

					if ( newY > 0 ) {
						newY = 0
					} else if ( newY < this.maxScrollY ) {
						newY = this.maxScrollY
					}

					if ( this._x != newX || this._y != newY ) {
						this.scrollTo(newX, newY, this.options.bounceTime)
					}

					this.scaled = false

					this._execEvent('zoomEnd')
				},

				_wheelZoom : function (e) {
					var wheelDeltaY,
						deltaScale,
						that = this

					if ( this.wheelTimeout === undefined ) {
						if ( this._prevent(e, 4) ) return
						that._execEvent('scrollstart')
					}

					if ( this._prevent(e, 5) ) return

					// Execute the zoomEnd event after 400ms the wheel stopped scrolling
					
					clearTimeout(this.wheelTimeout)
					this.wheelTimeout = setTimeout(function () {
						if ( that._prevent(e, 6) ) return

						that._execEvent('zoomEnd')
					}, 400)

					if ( 'deltaX' in e ) {
						wheelDeltaY = -e.deltaY / Math.abs(e.deltaY)
					} else if ('wheelDeltaX' in e) {
						wheelDeltaY = e.wheelDeltaY / Math.abs(e.wheelDeltaY)
					} else if('wheelDelta' in e) {
						wheelDeltaY = e.wheelDelta / Math.abs(e.wheelDelta)
					} else if ('detail' in e) {
						wheelDeltaY = -e.detail / Math.abs(e.wheelDelta)
					} else {
						return
					}

					deltaScale = this.scale + (wheelDeltaY || 0) / 5

					this.zoom(deltaScale, e.pageX, e.pageY, 0)
				},

				_wheel : function (e) {

					var wheelDeltaX, wheelDeltaY,
						absWheelDeltaX, absWheelDeltaY,
						newX, newY,
						deltaX, deltaY,
						delta = 0,
						that = this

					if ( this.preventWheel ) return
					if ( this.wheelTimeout === undefined ) {
						if ( this._prevent(e, 4) ) return
						this._execEvent('scrollstart')
					}

					if ( this._prevent(e, 5) ) return
					if ( this.bounceDragPhase > 10 ) {
						this.preventWheel = true
						setTimeout(function () {
							that.preventWheel = false
						}, 1200)
						return
					}

					// Execute the scrollend event after 400ms the wheel stopped scrolling

					clearTimeout(this.wheelTimeout)
					this.wheelTimeout = setTimeout(function () {
						if ( that._prevent(e, 6) ) return

						if ( that.resetPosition(that.options.bounceTime) ) return

						that._promiseKeyFrame('translate', [that._x, that._y])
						that._drawing()
						that._execEvent('scrollend', 'end')
						that.wheeling = false
						that.borderBouncing = false
						that.directionLocked = undefined
						that.wheelTimeout = undefined
					}, 400)

					if ( 'deltaX' in e ) {
						wheelDeltaX = -e.deltaX
						wheelDeltaY = -e.deltaY
					} else if ( 'wheelDeltaX' in e ) {
						wheelDeltaX = e.wheelDeltaX / 120 * this.options.mouseWheelSpeed
						wheelDeltaY = e.wheelDeltaY / 120 * this.options.mouseWheelSpeed
					} else if ( 'wheelDelta' in e ) {
						wheelDeltaX = wheelDeltaY = e.wheelDelta / 120 * this.options.mouseWheelSpeed
					} else if ( 'detail' in e ) {
						wheelDeltaX = wheelDeltaY = -e.detail / 3 * this.options.mouseWheelSpeed
					} else {
						return
					}

					wheelDeltaX *= this.options.invertWheelDirection
					wheelDeltaY *= this.options.invertWheelDirection
					absWheelDeltaX = Math.abs(wheelDeltaX)
					absWheelDeltaY = Math.abs(wheelDeltaY)

					if ( this.options.snap ) {
						newX = this.currentPage.pageX
						newY = this.currentPage.pageY

						if ( wheelDeltaX > 0 ) {
							newX--
						} else if ( wheelDeltaX < 0 ) {
							newX++
						}

						if ( wheelDeltaY > 0 ) {
							newY--
						} else if ( wheelDeltaY < 0 ) {
							newY++
						}

						this.goToPage(newX, newY)

						return
					}

					if ( !this.hasWheelDeltaX && wheelDeltaX ) {
						this.hasWheelDeltaX = true
					}

					if ( !this.hasVerticalScroll && !this.hasWheelDeltaX && absWheelDeltaX < absWheelDeltaY ) {
						wheelDeltaX = wheelDeltaY
						wheelDeltaY = 0

						this.directionLocked == 'h'
					}

					delta = this._directionLocked(absWheelDeltaX, absWheelDeltaY, wheelDeltaX, wheelDeltaY)

					if ( !delta ) return

					deltaX = this.hasHorizontalScroll ? delta.x : 0
					deltaY = this.hasVerticalScroll ? delta.y : 0

					newX = this._x + deltaX
					newY = this._y + deltaY

					// Slow down if outside of the boundaries

					if ( newX > this.minScrollX || newX < this.maxScrollX ) {
						if ( this.options.bounce === 'all' ) {
							this.bounceDragPhase++
							newX = this._x + wheelDeltaX / (this.options.bounceDrag + this.bounceDragPhase)
						} else {
							newX = newX > this.minScrollX ? this.minScrollX : this.maxScrollX
						}
					}
					if ( newY > this.minScrollY || newY < this.maxScrollY ) {
						if ( this.options.bounce === 'all' ) {
							this.bounceDragPhase++
							newY = this._y + wheelDeltaY / (this.options.bounceDrag + this.bounceDragPhase) 
						} else {
							newY = newY > this.minScrollY ? this.minScrollY : this.maxScrollY
						}
					}

					this.directionX = this.hasHorizontalScroll ? (this._x - newX > 0 ? 1 : -1) : 0
					this.directionY = this.hasVerticalScroll ? (this._y - newY > 0 ? 1 : -1) : 0

					this.wheeling = true
					this.scrollTo(newX, newY, 0)

					this._execEvent('scroll', 'wheel')
					this._execEvent('wheel', 'wheel')
				},

				_key : function (e) {
					if ( !this.enabled ) {
						return
					}

					var snap = this.options.snap,	// we are using this alot, better to cache it
						newX = snap ? this.currentPage.pageX : this._x,
						newY = snap ? this.currentPage.pageY : this._y,
						now = Date.now(),
						prevTime = this.keyTime || 0,
						acceleration = 0.250,
						pos

					if ( this.options.useTransition && this.isInTransition ) {
						pos = this.getComputedPosition()

						this._promiseKeyFrame('translate', [Math.round(pos.x), Math.round(pos.y)])
						this._drawing()
						this.isInTransition = false
					}

					this.keyAcceleration = now - prevTime < 200 ? Math.min(this.keyAcceleration + acceleration, 50) : 0

					switch ( e.keyCode ) {
						case this.options.keyBindings.pageUp:
							if ( this.hasHorizontalScroll && !this.hasVerticalScroll ) {
								newX += snap ? 1 : this.wrapperWidth
							} else {
								newY += snap ? 1 : this.wrapperHeight
							}
							break
						case this.options.keyBindings.pageDown:
							if ( this.hasHorizontalScroll && !this.hasVerticalScroll ) {
								newX -= snap ? 1 : this.wrapperWidth
							} else {
								newY -= snap ? 1 : this.wrapperHeight
							}
							break
						case this.options.keyBindings.end:
							newX = snap ? this.pages.length-1 : this.maxScrollX
							newY = snap ? this.pages[0].length-1 : this.maxScrollY
							break
						case this.options.keyBindings.home:
							newX = this.minScrollX
							newY = this.minScrollY
							break
						case this.options.keyBindings.left:
							newX += snap ? -1 : 5 + this.keyAcceleration>>0
							break
						case this.options.keyBindings.up:
							newY += snap ? 1 : 5 + this.keyAcceleration>>0
							break
						case this.options.keyBindings.right:
							newX -= snap ? -1 : 5 + this.keyAcceleration>>0
							break
						case this.options.keyBindings.down:
							newY -= snap ? 1 : 5 + this.keyAcceleration>>0
							break
						default:
							return
					}

					if ( snap ) {
						this.goToPage(newX, newY)
						return
					}

					if ( newX > this.minScrollX ) {
						newX = this.minScrollX
						this.keyAcceleration = 0
					} else if ( newX < this.maxScrollX ) {
						newX = this.maxScrollX
						this.keyAcceleration = 0
					}

					if ( newY > this.minScrollY ) {
						newY = this.minScrollY
						this.keyAcceleration = 0
					} else if ( newY < this.maxScrollY ) {
						newY = this.maxScrollY
						this.keyAcceleration = 0
					}

					this.scrollTo(newX, newY)

					this.keyTime = now
				},

				_nearestSnap : function (x, y) {
					if ( !this.pages.length ) {
						return { x: 0, y: 0, pageX: 0, pageY: 0 }
					}

					var i = 0,
						l = this.pages.length,
						m = 0

					// Check if we exceeded the snap threshold

					if ( Math.abs(x - this.absStartX) < this.snapThresholdX &&
						Math.abs(y - this.absStartY) < this.snapThresholdY ) {
						return this.currentPage
					}

					if ( x > this.minScrollX ) {
						x = this.minScrollX
					} else if ( x < this.maxScrollX ) {
						x = this.maxScrollX
					}

					if ( y > this.minScrollY ) {
						y = this.minScrollY
					} else if ( y < this.maxScrollY ) {
						y = this.maxScrollY
					}

					for ( ; i < l; i++ ) {
						if ( x >= this.pages[i][0].cx ) {
							x = this.pages[i][0].x
							break
						}
					}

					l = this.pages[i] ? this.pages[i].length : 0

					for ( ; m < l; m++ ) {
						if ( y >= this.pages[0][m].cy ) {
							y = this.pages[0][m].y
							break
						}
					}

					if ( i == this.currentPage.pageX ) {
						i += this.directionX

						if ( i < 0 ) {
							i = 0
						} else if ( i >= this.pages.length ) {
							i = this.pages.length - 1
						}

						x = this.pages[i][0].x
					}

					if ( m == this.currentPage.pageY ) {
						m += this.directionY

						if ( m < 0 ) {
							m = 0
						} else if ( m >= this.pages[0].length ) {
							m = this.pages[0].length - 1
						}

						y = this.pages[0][m].y
					}

					return {
						x: x,
						y: y,
						pageX: i,
						pageY: m
					}
				},

				_pulling : function (el, r) {
					var that = this
					var u = 1
					var pos = 0
					var upos = 0
					var status = 0
					var style = el.style
					var threshold = -dP(el.getAttribute('threshold') || 50)
					var riseOffset = -dP(el.getAttribute('rise') || threshold)
					var autoControl = el.attributes.getNamedItem('auto') ? true : false
					var eventTarget = el.getAttribute('event-target') || 'scroll'
					var preventDefault = el.getAttribute('prevent-default') || (!this.options.finite && !this.options.infinite)

					if ( eventTarget !== 'scroll' ) {
						preventDefault = true
					}

					switch (r) {
						case -1:
							r = "minScrollX"
							u = -1
						break

						case 1:
							r = "maxScrollX"
							u = 1
						break

						case -2:
							r = "minScrollY"
							u = -1
						break

						case 2:
							r = "maxScrollY"
							u = 1
						break
					}

					this.on('scroll', function (type) {
						pos = (this.y - this[r] + (status > 3 ? u*threshold : 0))
						upos = u*pos

						if ( upos <= 0 ) {
							if ( status == 0 || (this.updated && status == -2) ) status = 1

							if ( status == 1 ) {
								status = 2
								el.removeAttribute('pullend')
								el.removeAttribute('pullover')
								el.setAttribute('pullstart', '')
							}

							if ( status == 2 ) {
								status = 3
								this._execEvent('pullstart', null)
							}

							if ( status == 3 && upos < threshold && (autoControl ? true : type == 'moving') ) {
								status = 4

								this.pulling = true
								this._execEvent('pulling', null)
								el.removeAttribute('pullstart')
								el.setAttribute('pulling', '')
								this[r] += u*threshold

								if ( preventDefault ) {
									this.one('scrollend', function () {
										status = -1
										el.removeAttribute('pulling')
										el.setAttribute('pullend', '')
										this._execEvent('pulling', null)

										switch (eventTarget) {
											case 'module':
												application.modules[application.id].refresh(null, function (render) {
													that.one('scrollend', function () {
														status = 0
														el.removeAttribute('pullend')
														render()
													})

													that.pulling = false
													that._execEvent('pullend', null)
													that._refresh()
													that.resetPosition(that.options.bounceTime)

													if ( that.isBounce() == false ) that._execEvent('scrollend', null)
												})
											break
										}
									})

								} else {
									this.one('scrollend', function () {
										if ( u < 0 ) status = -1

										el.removeAttribute('pulling')
										el.setAttribute('pullend', '')
										this._execEvent('pulling', null)

										this.update(function () {
											
											this.one('scrollend', function () {
												if ( u < 0 ? status == -1 : status == 4 ) status = 0
												el.removeAttribute('pullend')
											})

											this.pulling = false
											this._execEvent('pullend', null)
											this._refresh()
											if ( u > 0 ) {
												this.scrollBy(this.hasHorizontalScroll ? riseOffset : 0, this.hasVerticalScroll ? riseOffset : 0, this.options.bounceTime)
											} else {
												this.resetPosition(this.options.bounceTime)
											}
										}, u > 0)
									})

									if ( u > 0 ) {
										this.one('infinitedataend', function () {
											status = -1
											this.one('scrollend', function () {
												status = -2
											})

											el.removeAttribute('pulling')
											el.removeAttribute('pullend')
											el.setAttribute('pullover', '')

											this.pulling = false
											this._execEvent('pullover', null)
											this._refresh()
											this.resetPosition(this.options.bounceTime)
										})
									}
								}
							}

						}

						if ( status ) {
							style[BROWSER.prefixStyle.transform] = 'translate3d(0px' + ',' + pos + 'px' + ', 0px)'

							el.trigger('pull', {
								pos : pos
							})
						}
					})
				}
			})
		})(Scroll.prototype)

		// 初始化相关
		
		!(function (proto) {
			proto.extendProperties({
				handleEvent : function (e) {
					switch (e.type) {
						case 'touchstart':
						case 'MSPointerDown':
						case 'mousedown':
							this._start(e)

							// zoom start
							
							if ( this.options.zoom && e.touches && e.touches.length > 1 ) this._zoomStart(e)

							break
						case 'touchmove':
						case 'MSPointerMove':
						case 'mousemove':

							if ( this.options.zoom && e.touches && e.touches[1] ) {
								this._zoom(e)
								return
							}

							this._move(e)
							break
						case 'touchend':
						case 'MSPointerUp':
						case 'mouseup':
						case 'touchcancel':
						case 'MSPointerCancel':
						case 'mousecancel':
							if ( this.scaled ) {
								this._zoomEnd(e)
								return
							}

							this._end(e)
							break
						case 'orientationchange':
						case 'resize':
							this._resize()
							break
						case 'transitionend':
						case 'webkitTransitionEnd':
						case 'oTransitionEnd':
						case 'MSTransitionEnd':
							this._transitionEnd(e)
							break
						case 'wheel':
						case 'DOMMouseScroll':
						case 'mousewheel':
							if ( this.options.mouseWheelAction == 'zoom' ) {
								this._wheelZoom(e)
								return
							}

							this._wheel(e)
							break
						case 'keydown':
							this._key(e)
							break
						case 'click':
							if ( !e._constructed ) {
								e.preventDefault()
								e.stopPropagation()
							}
							break
					}
				},

				_init : function () {
					this._initBase()
					this._initEvents()
					this._initPrevant()
					this._initHistory()
					this._initObserver()
				},

				_initBase : function () {
					// event

					this._events = {}

					// 被卸载后的重置项

					this.initiated = false

					// Some defaults	

					this.x = 0
					this.y = 0
					this._x = 0
					this._y = 0
					this.minScrollX = 0
					this.minScrollY = 0
					this.maxScrollX = 0
					this.maxScrollY = 0
					this.scale = Math.min(Math.max(this.options.startZoom, this.options.zoomMin), this.options.zoomMax)
					this.directionX = 0
					this.directionY = 0
					this.acceleration = 0
					this.bounceDragPhase = 0

					this.transitionDelayRate = 0
					this.transitionDelayTime = 0

					// 贞队列
					
					this._keyFrame = []
				},

				_initHistory : function () {
					var uuid = this.uuid
					var sessionPosition
					if ( this.options.history == true ) {
		            	try {
							sessionPosition = sessionStorage.getItem(uuid)
							sessionPosition = sessionPosition.split(',')

							if ( sessionPosition.length == 2 ) {
								this.options.startX = Number(sessionPosition[0])
								this.options.startY = Number(sessionPosition[1])
							}
						} catch (e) {}
		            }

					this.on('scrollend', function () {
						try {
							sessionStorage.setItem(uuid, this.x + ',' + this.y)

							// remove
					
							App.on('transformstart background', function () {
								sessionStorage.removeItem(uuid)
							})

						} catch (e) {}
					})
				},

				_initKaleidoscope : function () {

					if ( this.options.zoom ) {
						this._initZoom()
					}

					if ( this.options.mouseWheel ) {
						this._initWheel()
					}

					if ( this.options.keyBindings ) {
						this._initKeys()
					}

					if ( this.options.snap ) {
						this._initSnap()
					}

					if ( this.options.pull ) {
						this._initPull()
					}

					if ( this.options.finite ) {
						this._initFinite()
					}

					if ( this.options.infinite ) {
						this._initInfinite()
					}

					if ( this.options.scrollbars || this.options.indicators ) {
						this._initIndicators()
					}
				},

				/**
				 * 事件初始化
				 * @param  {Boolean} remove 事件类型 add / remove
				 */
				_initEvents : function (remove) {
					var bind = remove ? METHOD.removeEvent : METHOD.addEvent
					var target = this.options.bindToWrapper ? this.wrapper : window

					bind(window, 'orientationchange', this)
					bind(window, 'resize', this)

					if ( !this.options.disableMouse ) {
						bind(this.wrapper, 'mousedown', this)
						bind(target, 'mousemove', this)
						bind(target, 'mousecancel', this)
						bind(target, 'mouseup', this)
					}

					if ( BROWSER.feat.hasPointer && !this.options.disablePointer ) {
						bind(this.wrapper, BROWSER.prefixPointerEvent('pointerdown'), this)
						bind(target, BROWSER.prefixPointerEvent('pointermove'), this)
						bind(target, BROWSER.prefixPointerEvent('pointercancel'), this)
						bind(target, BROWSER.prefixPointerEvent('pointerup'), this)
					}

					if ( BROWSER.feat.hasTouch && !this.options.disableTouch ) {
						bind(this.wrapper, 'touchstart', this)
						bind(target, 'touchmove', this)
						bind(target, 'touchcancel', this)
						bind(target, 'touchend', this)
					}

					bind(this.scroller, 'transitionend', this)
					bind(this.scroller, 'webkitTransitionEnd', this)
					bind(this.scroller, 'oTransitionEnd', this)
					bind(this.scroller, 'MSTransitionEnd', this)
				},

				/**
				 * 初始化Observer
				 * 高度改变时执行刷新
				 */
				_initObserver : function () {

					// set refresh event

					if ( !this.options.infinite ) {
						this._observer(this.scroller, function (records) {
							if ( this.updating ) return
							if ( 
								this.hasVerticalScroll && this.scroller.offsetHeight !== this.scrollerHeight 
								|| 
								this.hasHorizontalScroll && this.scroller.offsetWidth !== this.scrollerWidth 
							) this.refresh()
						})
					}
				},

				_indicatorsMap : function (fn) {
					if ( this.indicators ) {	
						for ( var i = this.indicators.length; i--; ) {
							fn.call(this.indicators[i])
						}
					}
				},

				_initIndicators : function () {
					var interactive = this.options.interactive,
						customStyle = typeof this.options.scrollbars != 'string',
						indicators = [],
						indicator

					var that = this

					this.indicators = []

					if ( this.options.scrollbars ) {

						// Vertical scrollbar

						if ( this.options.scrollY ) {
							indicator = {
								el: createDefaultScrollbar('v', interactive, this.options.scrollbars),
								interactive: interactive,
								defaultScrollbars: true,
								customStyle: customStyle,
								resize: this.options.resizeScrollbars,
								drag: this.options.bounceDrag,
								fade: this.options.fadeScrollbars,
								listenX: false
							}

							this.wrapper.appendChild(indicator.el)
							indicators.push(indicator)
						}

						// Horizontal scrollbar

						if ( this.options.scrollX ) {
							indicator = {
								el: createDefaultScrollbar('h', interactive, this.options.scrollbars),
								interactive: interactive,
								defaultScrollbars: true,
								customStyle: customStyle,
								resize: this.options.resizeScrollbars,
								drag: this.options.bounceDrag,
								fade: this.options.fadeScrollbars,
								listenY: false
							}

							this.wrapper.appendChild(indicator.el)
							indicators.push(indicator)
						}
					}

					if ( this.options.indicators ) {

						// TODO: check concat compatibility

						indicators = indicators.concat(this.options.indicators)
					}

					for ( var i = indicators.length; i--; ) {
						this.indicators.push( new Indicator(this, indicators[i]) )
					}

					// init event
					
					if ( this.options.fadeScrollbars ) {
						this.on('scrollend scrollcancel', function (type) {
							if ( type === 'break' ) return
							this._indicatorsMap(function () {
								this.fade()
							})
						})

						this.on('scrollstart beforescrollstart', function (type) {
							this._indicatorsMap(function () {
								this.fade(1, type === 'hold')
							})
						})
					}

					this.on('refresh', function () {
						this._indicatorsMap(function () {
							this.refresh()
						})
					})

					this.on('modify', function () {
						this._indicatorsMap(function () {
							this.refresh()
						})
					})

					this.on('destroy', function () {
						this._indicatorsMap(function () {
							this.destroy()
						})

						delete this.indicators
					})
				},

				_initWheel : function () {
					METHOD.addEvent(this.wrapper, 'wheel', this)
					METHOD.addEvent(this.wrapper, 'mousewheel', this)
					METHOD.addEvent(this.wrapper, 'DOMMouseScroll', this)

					this.on('destroy', function () {
						METHOD.removeEvent(this.wrapper, 'wheel', this)
						METHOD.removeEvent(this.wrapper, 'mousewheel', this)
						METHOD.removeEvent(this.wrapper, 'DOMMouseScroll', this)
					})
				},

				_initKeys : function (e) {

					// default key bindings

					var keys = {
						pageUp: 33,
						pageDown: 34,
						end: 35,
						home: 36,
						left: 37,
						up: 38,
						right: 39,
						down: 40
					}
					var i

					// if you give me characters I give you keycode

					if ( typeof this.options.keyBindings == 'object' ) {
						for ( i in this.options.keyBindings ) {
							if ( typeof this.options.keyBindings[i] == 'string' ) {
								this.options.keyBindings[i] = this.options.keyBindings[i].toUpperCase().charCodeAt(0)
							}
						}
					} else {
						this.options.keyBindings = {}
					}

					for ( i in keys ) {
						this.options.keyBindings[i] = this.options.keyBindings[i] || keys[i]
					}

					METHOD.addEvent(window, 'keydown', this)

					this.on('destroy', function () {
						METHOD.removeEvent(window, 'keydown', this)
					})
				},

				_initSnap : function () {
					if ( this._options.mouseWheel == undefined ) {
						this.options.mouseWheel = false
					}

					if ( this._options.speedLimit == undefined ) {
						this.options.speedLimit = dP(.5)
					}

					if ( this._options.fadeScrollbars == undefined ) {
						this.options.fadeScrollbars = false
					}

					if ( this.options.indicators ) {
						if ( this._options.resizeScrollbars == undefined ) {
							this.options.indicators.resize = false
						}
					}

					this.currentPage = {}

					if ( typeof this.options.snap === 'string' ) {
						this.options.snap = this.scroller.querySelectorAll(this.options.snap)
					}

					this.on('refresh', function () {
						var i = 0, l,
							m = 0, n,
							cx, cy,
							x = 0, y,
							stepX = this.options.snapStepX || this.wrapperWidth,
							stepY = this.options.snapStepY || this.wrapperHeight,
							el,
							rect

						this.pages = []

						if ( !this.wrapperWidth || !this.wrapperHeight || !this.scrollerWidth || !this.scrollerHeight ) {
							return
						}

						if ( this.options.snap === true ) {
							cx = Math.round( stepX / 2 )
							cy = Math.round( stepY / 2 )

							while ( x > -this.scrollerWidth ) {
								this.pages[i] = []
								l = 0
								y = 0

								while ( y > -this.scrollerHeight ) {
									this.pages[i][l] = {
										x: Math.max(x, this.maxScrollX),
										y: Math.max(y, this.maxScrollY),
										width: stepX,
										height: stepY,
										cx: x - cx,
										cy: y - cy
									}

									y -= stepY
									l++
								}

								x -= stepX
								i++
							}
						} else {
							el = this.options.snap
							l = el.length
							n = -1

							for ( ; i < l; i++ ) {
								rect = METHOD.getRect(el[i])
								if ( i === 0 || rect.left <= METHOD.getRect(el[i-1]).left ) {
									m = 0
									n++
								}

								if ( !this.pages[m] ) {
									this.pages[m] = []
								}

								x = Math.max(-rect.left, this.maxScrollX)
								y = Math.max(-rect.top, this.maxScrollY)
								cx = x - Math.round(rect.width / 2)
								cy = y - Math.round(rect.height / 2)

								this.pages[m][n] = {
									x: x,
									y: y,
									width: rect.width,
									height: rect.height,
									cx: cx,
									cy: cy
								}

								if ( x > this.maxScrollX ) {
									m++
								}
							}
						}

						this.goToPage(this.currentPage.pageX || 0, this.currentPage.pageY || 0, 0)

						// Update snap threshold if needed

						if ( this.options.snapThreshold % 1 === 0 ) {
							this.snapThresholdX = this.options.snapThreshold
							this.snapThresholdY = this.options.snapThreshold
						} else {
							this.snapThresholdX = Math.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].width * this.options.snapThreshold)
							this.snapThresholdY = Math.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].height * this.options.snapThreshold)
						}
					})
				},

				_initZoom : function () {
					this._transformOrigin('0 0')
				},

				_initPull : function () {
					
					// 下拉加载更多
					
					if ( this.pullup ) {
						this._pulling(this.pullup, 2)
					}

					// 上拉刷新页面

					if ( this.pulldown ) {
						this._pulling(this.pulldown, -2)
					}

					// 下拉加载更多
					
					if ( this.pullright ) {
						this._pulling(this.pullright, 1)
					}

					// 上拉刷新页面

					if ( this.pullleft ) {
						this._pulling(this.pullleft, -1)
					}
				},

				_initFinite : function () {
					this.minScrollX = 0
					this.minScrollY = 0

					this.fragments = {}
					this.infiniteCache = []
					this.turnoverTimes = 0
					this.finiteFragment = this.options.finiteFragment

					// data filler & cache buffer

					this.getInfiniteDataset = this.options.getInfiniteDataset
					this.getFiniteCacheBuffer = this.options.getFiniteCacheBuffer

					// 开始infinite >> 获取数据 >> 排序

					this.update(function () {

						// 移除封面
					
						if ( this.scrollcover ) {
							this.scrollcover = this.scrollcover.remove()
						}

						this._refresh()
					})
				},

				_initInfinite : function () {
					var that = this

					this.minScrollX = 0
					this.minScrollY = 0

				    this.infiniteElements = this.options.infiniteElements
					this.infiniteLength = this.infiniteElements.length
					this.infiniteCache = []
					this.turnoverTimes = 0
					this.infiniteDataLength = 0
					this.scrollerHeight = 0

					this.preReorderInfiniteY = this.options.startY

					this.infiniteItemSize = this.options.infiniteItemSize ? dP(this.options.infiniteItemSize) : false

					// data filler & cache buffer

					this.getInfiniteDataset = this.options.getInfiniteDataset
					this.setInfiniteDataFiller = this.options.setInfiniteDataFiller
				    this.getInfiniteDataFiller = this.options.getInfiniteDataFiller
				    this.getInfiniteCacheBuffer = this.options.getInfiniteCacheBuffer

				    // setup

					this.setupInfinite()

					// !important : this.infiniteLength - item._index
					// Element has a sibling with a lower z-index which has a compositing layer (in other words the it’s rendered on top of a composited layer)
					// 向下 z-index 递减

					this.infiniteElements.each(function (i, item) {
						item.style["z-index"] = i + 1
					}.bind(this))

					// 默认节点不可见

					this.one('infinitedataloaded', function () {
						that._refresh()
					})

					// 滚动事件触发排序

					this.on('scroll scrollend', function (type) {
						if ( this.borderBouncing ) return
						if ( type == "scrolling" && this.scrollTrendY === 1 && this.transitionCountTime - this._transitionTimeLeft() > this.transitionCountTime * .6 ) return

						this.reorderInfinite()
					})

					// 开始infinite >> 获取数据 >> 排序

					this.update(function () {
						if ( this.scrollcover ) {
							this.scrollcover.remove()
						}

						// scroll刷新后更新计算数据

						this.on('refresh', function () {
							this.refreshInfiniteAllPos()
							this.reorderInfinite()
						})

						// 监听节点变化后刷新

						this.infiniteElements.each(function (i, item) {
							that._observer(item, function () {
								if ( this.infiniteRearranging !== true && item.offsetHeight !== item._offsetHeight ) {
									this.refreshInfiniteAllPos()
									this.reorderInfinite()
								}
							})
						})

						this._refresh()
					})
				}
			})
		})(Scroll.prototype)

		
		/**
		 * createDefaultScrollbar
		 * @param  {String} 方向
		 * @param  {Boolen} 可控
		 * @param  {Boolen} type
		 * @return {Object}
		 */
		function createDefaultScrollbar (direction, interactive, type) {
			var scrollbar = document.createElement('scrollbar'),
				indicator = document.createElement('indicator')

			if ( direction == 'h' ) {
				if ( type === true ) {
					scrollbar.css({
						"height": "3dp",
						"right": "2dp",
						"bottom": "3dp",
						"left": "2dp"
					})

					indicator.css({
						"height": "100%"
					})
				}
				scrollbar.setAttribute('x', '')
			} else {
				if ( type === true ) {
					scrollbar.css({
						"width": "3dp",
						"top": "2dp",
						"right": "3dp",
						"bottom": "2dp"
					})

					indicator.css({
						"width": "100%"
					})
				}
				scrollbar.setAttribute('y', '')
			}

			if ( !interactive ) {
				scrollbar.style.pointerEvents = 'none'
			}

			scrollbar.appendChild(indicator)

			return scrollbar
		}

		/**
		 * Indicator 指示器
		 * @param {Object} scroller
		 * @param {Object} options
		 */
		function Indicator (scroller, options) {
			this.wrapper = typeof options.el == 'string' ? document.querySelector(options.el) : options.el
			this.wrapperStyle = this.wrapper.style
			this.indicator = this.wrapper.children[0]
			this.indicatorStyle = this.indicator.style
			this.scroller = scroller

			this.options = {
				listenX: true,
				listenY: true,
				interactive: false,
				resize: true,
				defaultScrollbars: false,
				drag: 3,
				fade: false,
				speedRatioX: 0,
				speedRatioY: 0
			}

			for ( var i in options ) {
				this.options[i] = options[i]
			}

			this.sizeRatioX = 1
			this.sizeRatioY = 1
			this.maxPosX = 0
			this.maxPosY = 0

			if ( this.options.interactive ) {
				if ( !this.options.disableTouch ) {
					METHOD.addEvent(this.indicator, 'touchstart', this)
					METHOD.addEvent(window, 'touchend', this)
				}
				if ( !this.options.disablePointer ) {
					METHOD.addEvent(this.indicator, 'MSPointerDown', this)
					METHOD.addEvent(window, 'MSPointerUp', this)
				}
				if ( !this.options.disableMouse ) {
					METHOD.addEvent(this.indicator, 'mousedown', this)
					METHOD.addEvent(window, 'mouseup', this)
				}
			}

			if ( this.options.fade ) {
				this.wrapperStyle[BROWSER.prefixStyle.transitionDuration] = '0ms'
				this.wrapperStyle.opacity = '0'
			}
		}

		Indicator.prototype = {
			
			destroy : function () {
				if ( this.options.interactive ) {
					METHOD.removeEvent(this.indicator, 'touchstart', this)
					METHOD.removeEvent(this.indicator, 'MSPointerDown', this)
					METHOD.removeEvent(this.indicator, 'mousedown', this)

					METHOD.removeEvent(window, 'touchmove', this)
					METHOD.removeEvent(window, 'MSPointerMove', this)
					METHOD.removeEvent(window, 'mousemove', this)

					METHOD.removeEvent(window, 'touchend', this)
					METHOD.removeEvent(window, 'MSPointerUp', this)
					METHOD.removeEvent(window, 'mouseup', this)
				}

				if ( this.options.defaultScrollbars ) {
					this.wrapper.remove()
				}
			},

			fade : function (val, hold) {
				if ( (val && this.visible) || (!val && !this.visible) ) return
				if ( hold && !this.visible ) return

				var that = this

				/**
				 * clearTimeout
				 */
				clearTimeout(this.fadeTimeout)
				this.fadeTimeout = null

				var time = val ? 0 : 250
				var delay = val ? 0 : 100

				/**
				 * 剪掉滚动条的fade效果
				 * 设定最小事件消除之前动画
				 * 因为某些机型不接受0ms动画的终止
				 * @param  {Boolean} BROWSER.isBadTransition
				 */
				if ( BROWSER.isBadTransition ) {
					time = 0.0001
				}

				this.wrapperStyle[BROWSER.prefixStyle.transitionDuration] = time + 'ms'

				this.fadeTimeout = setTimeout(function () {
					rAF(function () {
						val = val ? '1' : '0'
						that.wrapperStyle.opacity = val
						that.visible = +val
					})
				}, delay)
			},

			transitionTime : function (time) {
				this.indicatorStyle[BROWSER.prefixStyle.transitionDuration] = time ? time + 'ms' : ''
			},

			transitionTimingFunction : function (easing) {
				this.indicatorStyle[BROWSER.prefixStyle.transitionTimingFunction] = easing
			},

			updatePosition : function () {
				var scroll = this.scroller,
					_x = scroll._x,
					_y = scroll._y,
					x = this.options.listenX && Math.round(this.sizeRatioX * (_x - scroll.minScrollX)) || 0,
					y = this.options.listenY && Math.round(this.sizeRatioY * (_y - scroll.minScrollY)) || 0

				if ( !this.options.ignoreBoundaries ) {
					if ( _x > scroll.minScrollX ) {
						x = this.options.resize ? Math.max(x - _x, dP(8) - this.indicatorWidth) : this.minBoundaryX
					} else if ( _x < scroll.maxScrollX ) {
						x = this.options.resize ? Math.min(x + (scroll.maxScrollX - _x), this.maxBoundaryX - dP(8)) : this.maxBoundaryX
					}

					if ( _y > scroll.minScrollY ) {
						y = this.options.resize ? Math.max(y - _y, dP(8) - this.indicatorHeight) : this.minBoundaryY
					} else if ( _y < scroll.maxScrollY ) {
						y = this.options.resize ? Math.min(y + (scroll.maxScrollY - _y), this.maxBoundaryY - dP(8)) : this.maxBoundaryY
					}
				}

				this.x = x
				this.y = y

				this.indicatorStyle[BROWSER.prefixStyle.transform] = 'translate3d(' + x + 'px,' + y + 'px, 0)'
			},

			refresh : function () {
				var scroll = this.scroller

				this.transitionTime()

				if ( this.options.listenX && !this.options.listenY ) {
					this.indicatorStyle.display = scroll.hasHorizontalScroll ? 'block' : 'none'
				} else if ( this.options.listenY && !this.options.listenX ) {
					this.indicatorStyle.display = scroll.hasVerticalScroll ? 'block' : 'none'
				} else {
					this.indicatorStyle.display = scroll.hasHorizontalScroll || scroll.hasVerticalScroll ? 'block' : 'none'
				}

				if ( scroll.hasHorizontalScroll && scroll.hasVerticalScroll ) {
					this.wrapper.removeAttribute('lone')
					this.wrapper.setAttribute('both', '')

					if ( this.options.defaultScrollbars && this.options.customStyle ) {
						if ( this.options.listenX ) {
							this.wrapper.style.right = dP(8) + 'px'
						} else {
							this.wrapper.style.bottom = dP(8) + 'px'
						}
					}
				} else {
					this.wrapper.removeAttribute('both')
					this.wrapper.setAttribute('lone', '')

					if ( this.options.defaultScrollbars && this.options.customStyle ) {
						if ( this.options.listenX ) {
							this.wrapper.style.right = dP(2) + 'px'
						} else {
							this.wrapper.style.bottom = dP(2) + 'px'
						}
					}
				}

				// snap pos

				this.minIndicatorWidth = scroll.options.snap ? this.indicator.offsetWidth : dP(4)
				this.minIndicatorHeight = scroll.options.snap ? this.indicator.offsetHeight : dP(4)

				var r = this.wrapper.offsetHeight	// force refresh

				if ( this.options.listenX ) {
					this.wrapperWidth = this.wrapper.offsetWidth
					if ( this.options.resize ) {
						this.indicatorWidth = Math.max(Math.round(this.wrapperWidth * this.wrapperWidth / (scroll.scrollerWidth || this.wrapperWidth || dP(1))), this.minIndicatorWidth)
						this.indicatorStyle.width = this.indicatorWidth + 'px'
					} else {
						this.indicatorWidth = this.indicator.offsetWidth
					}

					this.maxPosX = this.wrapperWidth - this.indicatorWidth

					this.minBoundaryX = -this.indicatorWidth + dP(4)
					this.maxBoundaryX = this.wrapperWidth - dP(4)

					this.sizeRatioX = this.options.speedRatioX || (scroll.maxScrollX && (this.maxPosX / (scroll.maxScrollX - scroll.minScrollX)))
				}

				if ( this.options.listenY ) {
					this.wrapperHeight = this.wrapper.offsetHeight
					if ( this.options.resize ) {
						this.indicatorHeight = Math.max(Math.round(this.wrapperHeight * this.wrapperHeight / (scroll.scrollerHeight || this.wrapperHeight || dP(1))), this.minIndicatorHeight)
						this.indicatorStyle.height = this.indicatorHeight + 'px'
					} else {
						this.indicatorHeight = this.indicator.offsetHeight
					}

					this.maxPosY = this.wrapperHeight - this.indicatorHeight

					this.minBoundaryY = -this.indicatorHeight + dP(4)
					this.maxBoundaryY = this.wrapperHeight - dP(4)

					this.maxPosY = this.wrapperHeight - this.indicatorHeight
					this.sizeRatioY = this.options.speedRatioY || (scroll.maxScrollY && (this.maxPosY / (scroll.maxScrollY - scroll.minScrollY)))
				}

				this.updatePosition()
			}
		}

		!(function (proto) {
			proto.extendProperties({
				handleEvent : function (e) {
					switch (e.type) {
						case 'touchstart':
						case 'MSPointerDown':
						case 'mousedown':
							this._start(e)
							break
						case 'touchmove':
						case 'MSPointerMove':
						case 'mousemove':
							this._move(e)
							break
						case 'touchend':
						case 'MSPointerUp':
						case 'mouseup':
						case 'touchcancel':
						case 'MSPointerCancel':
						case 'mousecancel':
							this._end(e)
							break
					}
				},

				_start : function (e) {
					var point = e.touches ? e.touches[0] : e

					e.preventDefault()
					e.stopPropagation()

					this.transitionTime()

					this.initiated = true
					this.moved = false
					this.lastPointX	= point.pageX
					this.lastPointY	= point.pageY

					this.startTime	= Date.now()

					if ( !this.options.disableTouch ) {
						METHOD.addEvent(window, 'touchmove', this)
					}
					if ( !this.options.disablePointer ) {
						METHOD.addEvent(window, 'MSPointerMove', this)
					}
					if ( !this.options.disableMouse ) {
						METHOD.addEvent(window, 'mousemove', this)
					}

					this.scroller._execEvent('beforescrollstart', 'hold')
				},

				_move : function (e) {
					var point = e.touches ? e.touches[0] : e,
						deltaX, deltaY,
						newX, newY,
						timestamp = Date.now()

					if ( !this.moved ) {
						this.scroller._execEvent('scrollstart')
					}

					this.moved = true

					deltaX = point.pageX - this.lastPointX
					this.lastPointX = point.pageX

					deltaY = point.pageY - this.lastPointY
					this.lastPointY = point.pageY

					newX = this.x + deltaX
					newY = this.y + deltaY

					this._pos(newX, newY)

			// INSERT POINT: indicator._move

					e.preventDefault()
					e.stopPropagation()
				},

				_end : function (e) {
					if ( !this.initiated ) {
						return
					}

					this.initiated = false

					e.preventDefault()
					e.stopPropagation()

					METHOD.removeEvent(window, 'touchmove', this)
					METHOD.removeEvent(window, 'MSPointerMove', this)
					METHOD.removeEvent(window, 'mousemove', this)

					var scroll = this.scroller

					if ( scroll.options.snap ) {
						var _x = scroll._x
						var _y = scroll._y

						var snap = scroll._nearestSnap(_x, _y)

						var time = this.options.snapDuration || Math.max(
								Math.max(
									Math.min(Math.abs(_x - snap.x), 1000),
									Math.min(Math.abs(_y - snap.y), 1000)
								), 300)

						if ( _x != snap.x || _y != snap.y ) {
							scroll.directionX = 0
							scroll.directionY = 0
							scroll.currentPage = snap
							scroll.scrollTo(snap.x, snap.y, time, scroll.options.snapEasing)
						}
					}

					if ( this.moved ) {
						scroll._execEvent('scrollend')
					}
				},

				_pos : function (x, y) {
					var scroll = this.scroller
					var _x = scroll._x
					var _y = scroll._y

					if ( x < 0 ) {
						x = 0
					} else if ( x > this.maxPosX ) {
						x = this.maxPosX
					}

					if ( y < 0 ) {
						y = 0
					} else if ( y > this.maxPosY ) {
						y = this.maxPosY
					}

					x = this.options.listenX ? Math.round(x / this.sizeRatioX) : _x
					y = this.options.listenY ? Math.round(y / this.sizeRatioY) : _y

					scroll.scrollTo(x, y)
				}
			})
		})(Indicator.prototype)

		// extend

		Scroll.METHOD = METHOD
		Scroll.BROWSER = BROWSER
		Scroll.EASEING = EASEING

		return Scroll
	}
})