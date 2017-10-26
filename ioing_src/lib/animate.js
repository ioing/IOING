// 合抱之木，生於毫末；九层之台，起於累土；千里之行，始於足下。

define('~/animate', [], function (require, module, exports) {
    'use strict'

    const browser = {
            prefixStyle : device.feat.prefixStyle
        }
    const rAF = requestAnimationFrame


    /**
    * CSS Easing functions
    */

    const ease = {
          'in':                'ease-in'
        , 'out':               'ease-out'
        , 'in-out':            'ease-in-out'
        , 'snap':              'cubic-bezier(0, 1, .5, 1)'
        , 'linear':            'cubic-bezier(0.250, 0.250, 0.750, 0.750)'
        , 'ease-in-quad':      'cubic-bezier(0.550, 0.085, 0.680, 0.530)'
        , 'ease-in-cubic':     'cubic-bezier(0.550, 0.055, 0.675, 0.190)'
        , 'ease-in-quart':     'cubic-bezier(0.895, 0.030, 0.685, 0.220)'
        , 'ease-in-quint':     'cubic-bezier(0.755, 0.050, 0.855, 0.060)'
        , 'ease-in-sine':      'cubic-bezier(0.470, 0.000, 0.745, 0.715)'
        , 'ease-in-expo':      'cubic-bezier(0.950, 0.050, 0.795, 0.035)'
        , 'ease-in-circ':      'cubic-bezier(0.600, 0.040, 0.980, 0.335)'
        , 'ease-in-back':      'cubic-bezier(0.600, -0.280, 0.735, 0.045)'
        , 'ease-out-quad':     'cubic-bezier(0.250, 0.460, 0.450, 0.940)'
        , 'ease-out-cubic':    'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
        , 'ease-out-quart':    'cubic-bezier(0.165, 0.840, 0.440, 1.000)'
        , 'ease-out-quint':    'cubic-bezier(0.230, 1.000, 0.320, 1.000)'
        , 'ease-out-sine':     'cubic-bezier(0.390, 0.575, 0.565, 1.000)'
        , 'ease-out-expo':     'cubic-bezier(0.190, 1.000, 0.220, 1.000)'
        , 'ease-out-circ':     'cubic-bezier(0.075, 0.820, 0.165, 1.000)'
        , 'ease-out-back':     'cubic-bezier(0.175, 0.885, 0.320, 1.275)'
        , 'ease-in-out-quad':  'cubic-bezier(0.455, 0.030, 0.515, 0.955)'
        , 'ease-in-out-cubic': 'cubic-bezier(0.645, 0.045, 0.355, 1.000)'
        , 'ease-in-out-quart': 'cubic-bezier(0.770, 0.000, 0.175, 1.000)'
        , 'ease-in-out-quint': 'cubic-bezier(0.860, 0.000, 0.070, 1.000)'
        , 'ease-in-out-sine':  'cubic-bezier(0.445, 0.050, 0.550, 0.950)'
        , 'ease-in-out-expo':  'cubic-bezier(1.000, 0.000, 0.000, 1.000)'
        , 'ease-in-out-circ':  'cubic-bezier(0.785, 0.135, 0.150, 0.860)'
        , 'ease-in-out-back':  'cubic-bezier(0.680, -0.550, 0.265, 1.550)'
    }



    /**
    * Module Dependencies.
    */


    const hasTransitions = device.feat.prefixStyle('transition')

    
    /**
    * Get computed style.
    */

    const style = window.getComputedStyle || window.currentStyle


    /* Animate */

    class Animate {
        constructor (el) {
            if ('string' == typeof el) el = $$(el)[0]
            if (!el) return
            this.el = el
            this._events = {}
            this._props = []
            this._caller = []
            this._transforms = {}
            this._transitionProps = []
            
            el.style.set('transition-duration', '0ms')
        }

        on (types, fn) {
            types.split(' ').each((i, type) => {
                this._events.initial(type, []).push(fn)
            })

            return this
        }

        one (types, fn) {
            function once () {
                fn.apply(this, arguments)
                this.off(types, once)
            }

            types.split(' ').each((i, type) => {
                this._events.initial(type, []).push(once)
            })

            return this
        }

        off (types, fn) {
            types.split(' ').each((i, type) => {
                if ( !this._events[type] ) return

                let index = this._events[type].indexOf(fn)

                if ( index > -1 ) {
                    this._events[type].splice(index, 1)
                }
            })

            return this
        }

        trigger (type) {
            let args = arguments
            let events = this._events[type]

            if ( !events ) return

            for (let event of events) {
                event.apply(this, [].slice.call(args, 1))
            }
        }

        // once fn
        
        _transitionend (fn) {
            if ( !this.getDuration() || !hasTransitions ) return fn()
            this.el.one('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', (e) => {
                if ( e.target == this.el ) {
                    fn()
                }
            })
        }

        /**
        * Buffer `transform`.
        *
        * @param {String} transform
        * @return {Move} for chaining
        * @api private
        */

        transform (transform) {
            let prop = transform.match(/\w+\b/)

            this._transforms[prop] = transform

            return this
        }

        _applyTransform () {
            let transform = []

            if ( !this._transforms['translate3d'] && !this._transforms['translateZ'] ) {
                this._transforms['translateZ'] = 'translateZ(0)'
            }

            for (let i in this._transforms) {
                transform.push(this._transforms[i])
            }

            if ( transform.length ) {
                this.style('transform', transform.join(' '))
            }

            return this
        }

        skew (x, y) {
            return this.transform('skew(' + x + 'deg, ' + (y || 0) + 'deg)')
        }

        skewX (n) {
            return this.transform('skewX(' + n + 'deg)')
        }

        skewY (n) {
            return this.transform('skewY(' + n + 'deg)')
        }

        to (x, y, z) {

            // 3d set

            this.transform('translate3d(' + (x ? x + 'px' : 0) + ',' + (y ? y + 'px' : 0) + ',' + (z ? z + 'px' : 0) + ')')
            this._x = x
            this._y = y
            this._z = z

            return this
        }

        translate () {
            return this.to.apply(this, arguments)
        }

        translate3d () {
            return this.to.apply(this, arguments)
        }

        x (n) {
            this._x = n
            return this.transform('translateX(' + n + 'px)')
        }

        translateX () {
            return this.x.apply(this, arguments)
        }

        y (n) {
            this._y = n
            return this.transform('translateY(' + n + 'px)')
        }

        translateY () {
            return this.y.apply(this, arguments)
        }

        z (n) {
            this._z = z
            return this.transform('translateZ(' + n + 'px)')
        }

        translateZ () {
            return this.z.apply(this, arguments)
        }

        scale (x, y) {
            return this.transform('scale('
              + x + ', '
              + (y || x)
              + ')')
        }

        opacity (val) {
            return this.style('opacity', val)
        }

        scaleX (n) {
            return this.transform('scaleX(' + n + ')')
        }

        matrix (m11, m12, m21, m22, m31, m32) {
            return this.transform('matrix(' + [m11,m12,m21,m22,m31,m32].join(',') + ')')
        }

        scaleY (n) {
            return this.transform('scaleY(' + n + ')')
        }

        rotate (n) {
            return this.transform('rotate(' + n + 'deg)')
        }

        rotateX (n) {
            return this.transform('rotateX(' + n + 'deg)')
        }

        rotateY (n) {
            return this.transform('rotateY(' + n + 'deg)')
        }

        rotateZ (n) {
            return this.transform('rotateZ(' + n + 'deg)')
        }

        rotate3d (x, y, z, d) {
            return this.transform('rotate3d(' + x + ', ' + y + ',' + z +',' + d + 'deg)')
        }

        perspective (z) {
            this.el.parentNode.style.set('transform-style', 'preserve-3d')
            this.el.parentNode.style.set('perspective', z + 'px')
            return this
        }

        ease (fn) {
            fn = ease[fn] || fn || 'ease'
            return this.style('transition-timing-function', fn)
        }

        animate (name, props) {
            for (let i in props) {
                if ( props.hasOwnProperty(i) ) {
                    this.style('animation-' + i, props[i])
                }
            }
            return this.style('animation-name', name)
        }

        duration (n) {
            n = 'string' == typeof n
              ? parseFloat(n) * 1000
              : n

            return this.style('transition-duration', n + 'ms')
        }

        getDuration () {
            let n = 0
            let prop = this._props[0]

            if ( !prop ) return 0

            n = prop['transition-duration']
            n = 'string' == typeof n
              ? parseInt(n)
              : 0

            n = 'number' == typeof n
              ? n
              : 0

            return n
        }

        delay (n) {
            n = this._delay = 'string' == typeof n
              ? parseFloat(n) * 1000
              : n

            return this.style('transition-delay', n + 'ms')
        }

        origin (x, y, n) {
            n = x

            if ( typeof x === 'object' ) {
                y = x[1] || 0
                x = x[0] || 0
            }

            if ( !isNaN(x) && !isNaN(y) ) {
                n = x + 'px' + ' ' + y + 'px'
            } else if ( y ) {
                n = x + ' ' + y
            }

            return this.style('transform-origin', n)
        }

        style (prop, val) {
            if ( this._props.length === 0 ) this.queue()
            this._props[this._props.length - 1][prop] = val === undefined ? '' : val
            return this
        }

        width (val) {
            return this.style('width', val === undefined ? '' : val + 'px')
        }

        height (val) {
            return this.style('height', val === undefined ? '' : val + 'px')
        }

        add (prop, val) {
            if (!style) return
            let self = this
            return this.on('start', function () {
              let curr = parseInt(self.current(prop), 10)
              self.set(prop, curr + val + 'px')
            })
        }

        sub (prop, val) {
            if (!style) return
            let self = this
            return this.on('start', function () {
              let curr = parseInt(self.current(prop), 10)
              self.set(prop, curr - val + 'px')
            })
        }

        current (prop) {
            return style(this.el).getPropertyValue(prop)
        }

        transition (prop) {
            if ( !this._transitionProps.indexOf(prop) ) this._transitionProps.push(prop)
            return this
        }

        queue () {
            this._props.push({})

            return this
        }

        applyProperties () {

            // mark start

            this._transforming = true

            // callback
            
            rAF(() => {
                this.el.css(this._props[0])
                this._transitionend(() => {
                    this.clear()
                    this.next()
                })
            })
            
            return this
        }

        next () {
            this._caller.length && this._caller.shift()()
            if ( this._props.length === 0 ) {
                this._transforming = false
            } else {
                this.applyProperties()
            }
        }

        clear () {
            if ( this.getDuration() !== 0 ) {
                this.el.style.set('transition-duration', '0ms')
            }

            this._props.shift()
            this._transforming = false
            this._transforms = {}
            this._transitionProps = []

            return this
        }

        end (fn) {

            // transforms

            this._applyTransform()

            // transition properties 检索或设置对象中的参与过渡的属性

            this.style('transition-property', this._transitionProps.join(', '))

            // caller

            this._caller.push(() => { fn && fn.call(this) })

            // block

            if ( this._transforming ) return this

            this.applyProperties()

            return this
        }

        then () {
            return this.end.apply(this, arguments).queue()
        }

    }
    

    module.exports = Animate
})