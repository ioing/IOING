'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// 合抱之木，生於毫末；九层之台，起於累土；千里之行，始於足下。

define('~/move', [], function (require, module, exports) {
    'use strict';

    var browser = {
        prefixStyle: device.feat.prefixStyle
    };
    var rAF = requestAnimationFrame;

    /**
    * CSS Easing functions
    */

    var ease = {
        'in': 'ease-in',
        'out': 'ease-out',
        'in-out': 'ease-in-out',
        'snap': 'cubic-bezier(0, 1, .5, 1)',
        'linear': 'cubic-bezier(0.250, 0.250, 0.750, 0.750)',
        'ease-in-quad': 'cubic-bezier(0.550, 0.085, 0.680, 0.530)',
        'ease-in-cubic': 'cubic-bezier(0.550, 0.055, 0.675, 0.190)',
        'ease-in-quart': 'cubic-bezier(0.895, 0.030, 0.685, 0.220)',
        'ease-in-quint': 'cubic-bezier(0.755, 0.050, 0.855, 0.060)',
        'ease-in-sine': 'cubic-bezier(0.470, 0.000, 0.745, 0.715)',
        'ease-in-expo': 'cubic-bezier(0.950, 0.050, 0.795, 0.035)',
        'ease-in-circ': 'cubic-bezier(0.600, 0.040, 0.980, 0.335)',
        'ease-in-back': 'cubic-bezier(0.600, -0.280, 0.735, 0.045)',
        'ease-out-quad': 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
        'ease-out-cubic': 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
        'ease-out-quart': 'cubic-bezier(0.165, 0.840, 0.440, 1.000)',
        'ease-out-quint': 'cubic-bezier(0.230, 1.000, 0.320, 1.000)',
        'ease-out-sine': 'cubic-bezier(0.390, 0.575, 0.565, 1.000)',
        'ease-out-expo': 'cubic-bezier(0.190, 1.000, 0.220, 1.000)',
        'ease-out-circ': 'cubic-bezier(0.075, 0.820, 0.165, 1.000)',
        'ease-out-back': 'cubic-bezier(0.175, 0.885, 0.320, 1.275)',
        'ease-in-out-quad': 'cubic-bezier(0.455, 0.030, 0.515, 0.955)',
        'ease-in-out-cubic': 'cubic-bezier(0.645, 0.045, 0.355, 1.000)',
        'ease-in-out-quart': 'cubic-bezier(0.770, 0.000, 0.175, 1.000)',
        'ease-in-out-quint': 'cubic-bezier(0.860, 0.000, 0.070, 1.000)',
        'ease-in-out-sine': 'cubic-bezier(0.445, 0.050, 0.550, 0.950)',
        'ease-in-out-expo': 'cubic-bezier(1.000, 0.000, 0.000, 1.000)',
        'ease-in-out-circ': 'cubic-bezier(0.785, 0.135, 0.150, 0.860)',
        'ease-in-out-back': 'cubic-bezier(0.680, -0.550, 0.265, 1.550)'

        /**
        * Module Dependencies.
        */

    };var hasTransitions = device.feat.prefixStyle('transition');

    /**
    * Get computed style.
    */

    var style = window.getComputedStyle || window.currentStyle;

    /**
    * Export `ease`
    */

    Move.ease = ease;

    /**
    * Defaults.
    *
    *   `duration` - default duration of 500ms
    *
    */

    Move.select = function (selector) {
        if ('string' != typeof selector) return selector;
        return $$(selector)[0];
    };

    function Move(el) {
        if (!(this instanceof Move)) return new Move(el);
        if ('string' == typeof el) el = $$(el)[0];
        if (!el) return;
        this.el = el;
        this._events = {};
        this._props = {};
        this._rotate = 0;
        this._transitionProps = [];
        this._transforms = {};
        this.duration(0);
    }

    var proto = Move.prototype;

    proto.on = function (types, fn) {
        var that = this;

        types.split(' ').each(function (i, type) {
            that._events.initial(type, []).push(fn);
        });

        return this;
    };

    proto.one = function (types, fn) {
        var that = this;

        function once() {
            fn.apply(this, arguments);
            this.off(types, once);
        }

        types.split(' ').each(function (i, type) {
            that._events.initial(type, []).push(once);
        });

        return this;
    };

    proto.off = function (types, fn) {
        var that = this;

        types.split(' ').each(function (i, type) {
            if (!that._events[type]) return;

            var index = that._events[type].indexOf(fn);

            if (index > -1) {
                that._events[type].splice(index, 1);
            }
        });

        return this;
    };

    proto.trigger = function (type) {
        var that = this;
        var args = arguments;
        var events = this._events[type];

        if (!events) return;

        for (var i = events.length - 1; i >= 0; i--) {
            events[i].apply(that, [].slice.call(args, 1));
        }
    };

    // once fn

    proto._transitionend = function (fn) {
        if (this._duration == 0 || !hasTransitions) return fn();
        this.el.one('transitionend', fn);
    };

    /**
    * Buffer `transform`.
    *
    * @param {String} transform
    * @return {Move} for chaining
    * @api private
    */

    proto.transform = function (transform) {
        var prop = transform.match(/\w+\b/);

        this._transforms[prop] = transform;

        return this;
    };

    proto._applyTransform = function () {
        var transform = [];

        for (var i in this._transforms) {
            transform.push(this._transforms[i]);
        }

        if (transform.length) {
            this.setProperty('transform', transform.join(' '));
        }

        return this;
    };

    proto.skew = function (x, y) {
        return this.transform('skew(' + x + 'deg, ' + (y || 0) + 'deg)');
    };

    proto.skewX = function (n) {
        return this.transform('skewX(' + n + 'deg)');
    };

    proto.skewY = function (n) {
        return this.transform('skewY(' + n + 'deg)');
    };

    proto.translate = proto.translate3d = proto.to = function (x, y, z) {

        // 3d set

        this.transform('translate3d(' + (x ? x + 'px' : 0) + ',' + (y ? y + 'px' : 0) + ',' + (z ? z + 'px' : 0) + ')');

        return this;
    };

    proto.translateX = proto.x = function (n) {
        return this.transform('translateX(' + n + 'px)');
    };

    proto.translateY = proto.y = function (n) {
        return this.transform('translateY(' + n + 'px)');
    };

    proto.translateZ = proto.z = function (n) {
        return this.transform('translateZ(' + n + 'px)');
    };

    proto.scale = function (x, y) {
        return this.transform('scale(' + x + ', ' + (y || x) + ')');
    };

    proto.opacity = function (val) {
        this._props['opacity'] = val;
        return this;
    };

    proto.scaleX = function (n) {
        return this.transform('scaleX(' + n + ')');
    };

    proto.matrix = function (m11, m12, m21, m22, m31, m32) {
        return this.transform('matrix(' + [m11, m12, m21, m22, m31, m32].join(',') + ')');
    };

    proto.scaleY = function (n) {
        return this.transform('scaleY(' + n + ')');
    };

    proto.rotate = function (n) {
        return this.transform('rotate(' + n + 'deg)');
    };

    proto.rotateX = function (n) {
        return this.transform('rotateX(' + n + 'deg)');
    };

    proto.rotateY = function (n) {
        return this.transform('rotateY(' + n + 'deg)');
    };

    proto.rotateZ = function (n) {
        return this.transform('rotateZ(' + n + 'deg)');
    };

    proto.rotate3d = function (x, y, z, d) {
        return this.transform('rotate3d(' + x + ', ' + y + ',' + z + ',' + d + 'deg)');
    };

    proto.perspective = function (z) {
        this.el.parentNode.style.set('transform-style', 'preserve-3d');
        this.el.parentNode.style.set('perspective', z + 'px');
        return this;
    };

    /**
    * Set transition easing function to to `fn` string.
    *
    * When:
    *
    *   - null "ease" is used
    *   - "in" "ease-in" is used
    *   - "out" "ease-out" is used
    *   - "in-out" "ease-in-out" is used
    *
    * @param {String} fn
    * @return {Move} for chaining
    * @api public
    */

    proto.ease = function (fn) {
        fn = ease[fn] || fn || 'ease';
        return this.setProperty('transition-timing-function', fn);
    };

    /**
    * Set animation properties
    *
    * @param {String} name
    * @param {Object} props
    * @return {Move} for chaining
    * @api public
    */

    proto.animate = function (name, props) {
        for (var i in props) {
            if (props.hasOwnProperty(i)) {
                this.setProperty('animation-' + i, props[i]);
            }
        }
        return this.setProperty('animation-name', name);
    };

    /**
    * Set duration to `n`.
    *
    * @param {Number|String} n
    * @return {Move} for chaining
    * @api public
    */

    proto.duration = function (n) {
        n = this._duration = 'string' == typeof n ? parseFloat(n) * 1000 : n;

        return this.setProperty('transition-duration', n + 'ms');
    };

    /**
    * Delay the animation by `n`.
    *
    * @param {Number|String} n
    * @return {Move} for chaining
    * @api public
    */

    proto.delay = function (n) {
        n = this._delay = 'string' == typeof n ? parseFloat(n) * 1000 : n;

        return this.setProperty('transition-delay', n + 'ms');
    };

    proto.origin = function (x, y, n) {
        n = x;

        if ((typeof x === 'undefined' ? 'undefined' : _typeof(x)) === 'object') {
            y = x[1] || 0;
            x = x[0] || 0;
        }

        if (!isNaN(x) && !isNaN(y)) {
            n = x + 'px' + ' ' + y + 'px';
        } else if (y) {
            n = x + ' ' + y;
        }

        return this.setProperty('transform-origin', n);
    };

    /**
    * Set `prop` to `val`, deferred until `.end()` is invoked.
    *
    * @param {String} prop
    * @param {String} val
    * @return {Move} for chaining
    * @api public
    */

    proto.setProperty = function (prop, val) {
        this._props[prop] = val === undefined ? '' : val;
        return this;
    };

    proto.width = function (val) {
        this._props.width = val === undefined ? '' : val + 'px';
        return this;
    };

    proto.height = function (val) {
        this._props.height = val === undefined ? '' : val + 'px';
        return this;
    };

    /**
    * Set `prop` to `value`, deferred until `.end()` is invoked
    * and adds the property to the list of transition props.
    *
    * @param {String} prop
    * @param {String} val
    * @return {Move} for chaining
    * @api public
    */

    proto.style = function (prop, val) {
        this._props[prop] = val === undefined ? '' : val;
        return this;
    };

    /**
    * Increment `prop` by `val`, deferred until `.end()` is invoked
    * and adds the property to the list of transition props.
    *
    * @param {String} prop
    * @param {Number} val
    * @return {Move} for chaining
    * @api public
    */

    proto.add = function (prop, val) {
        if (!style) return;
        var self = this;
        return this.on('start', function () {
            var curr = parseInt(self.current(prop), 10);
            self.set(prop, curr + val + 'px');
        });
    };

    /**
    * Decrement `prop` by `val`, deferred until `.end()` is invoked
    * and adds the property to the list of transition props.
    *
    * @param {String} prop
    * @param {Number} val
    * @return {Move} for chaining
    * @api public
    */

    proto.sub = function (prop, val) {
        if (!style) return;
        var self = this;
        return this.on('start', function () {
            var curr = parseInt(self.current(prop), 10);
            self.set(prop, curr - val + 'px');
        });
    };

    /**
    * Get computed or "current" value of `prop`.
    *
    * @param {String} prop
    * @return {String}
    * @api public
    */

    proto.current = function (prop) {
        return style(this.el).getPropertyValue(prop);
    };

    /**
    * Add `prop` to the list of internal transition properties.
    *
    * @param {String} prop
    * @return {Move} for chaining
    * @api private
    */

    proto.transition = function (prop) {
        if (!this._transitionProps.indexOf(prop)) this._transitionProps.push(prop);
        return this;
    };

    proto.all = function () {
        this._transitionAll = true;
        return this;
    };

    /**
    * Commit style properties, aka apply them to `el.style`.
    *
    * @return {Move} for chaining
    * @see Move#end()
    * @api private
    */

    proto.applyProperties = function (callback) {
        var that = this;

        if (callback) {
            rAF(function () {
                that.el.css(that._props);
                that._props = {};

                // callback

                callback.call(that);
            });
        } else {
            this.el.css(that._props);
            this._props = {};
        }

        return this;
    };

    /**
    * Re-select element via `selector`, replacing
    * the current element.
    *
    * @param {String} selector
    * @return {Move} for chaining
    * @api public
    */

    proto.move = proto.select = function (selector) {
        this.el = Move.select(selector);
        return this;
    };

    /**
    * Defer the given `fn` until the animation
    * is complete. `fn` may be one of the following:
    *
    *   - a function to invoke
    *   - an instanceof `Move` to call `.end()`
    *   - nothing, to return a clone of this `Move` instance for chaining
    *
    * @param {Function|Move} fn
    * @return {Move} for chaining
    * @api public
    */

    proto.then = function (fn) {
        //invoke .end()
        if (fn instanceof Move) {
            this.on('end', function () {
                fn.end();
            });
            // callback
        } else if ('function' == typeof fn) {
            this.on('end', fn);
            // chain
        } else {
            var clone = new Move(this.el);
            clone._transforms = this._transforms.slice(0);
            this.then(clone);
            clone.parent = this;
            return clone;
        }

        return this;
    };

    /**
    * Pop the move context.
    *
    * @return {Move} parent Move
    * @api public
    */

    proto.pop = function () {
        return this.parent;
    };

    /**
    * Reset duration.
    *
    * @return {Move}
    * @api public
    */

    proto.clear = function () {
        this.el.style.set('transition-duration', '');
        this._transforms = {};

        return this;
    };

    proto.instant = function (fn) {

        // emit "start" event

        this.trigger('start');

        // transition properties 检索或设置对象中的参与过渡的属性

        this.setProperty('transition-property', this._transitionAll ? 'all' : this._transitionProps.join(', '));

        // transforms

        this._applyTransform();

        // set properties

        this.applyProperties(fn);
    };

    /**
    * Start animation, optionally calling `fn` when complete.
    *
    * @param {Function} fn
    * @return {Move} for chaining
    * @api public
    */

    proto.end = function (fn) {
        var that = this;

        this.instant(function () {

            // emit "end" when complete

            that._transitionend(function () {
                if (fn) fn.call(that);
                that.clear();
            });
        });

        return this;
    };

    module.exports = Move;
});