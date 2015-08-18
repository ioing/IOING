define(function (require, exports, module) {
	"use strict";

	var Loader = function (images, callback) {
		if ( !(this instanceof Loader) ) {
			return new Loader(images, callback);
		}

		callback = callback || (typeof images === "function" ? images : null);
		
		if ( callback ) this.reset(callback);

		if ( images && images.length ) {
			this.add(images);
		}
	}

	Loader.prototype = {
		on: function (type, fn) {
            if ( !this._events[type] ) {
                this._events[type] = [];
            }

            this._events[type].push(fn);
        },

        off: function (type, fn) {
            if ( !this._events[type] ) {
                return;
            }

            var index = this._events[type].indexOf(fn);

            if ( index > -1 ) {
                this._events[type].splice(index, 1);
            }
        },

        trigger: function (type) {
            if ( !this._events[type] ) {
                return;
            }

            var i = 0,
                l = this._events[type].length;

            if ( !l ) {
                return;
            }

            for ( ; i < l; i++ ) {
                this._events[type][i].apply(this, [].slice.call(arguments, 1));
            }
        },

		start : function () {
			this._paused = false;
			this._complete = false;

			this.next();
			return this;
		},

		stop : function () {
			this._paused = true;
			return this;
		},

		clear : function () {
			this._queue = [];
			return this;
		},

		reset : function (callback) {
			this._events = [];
			this._queue = [];
			this._cached = {};
			this._limit = 3;
			this._parallel = 0;
			this._paused = true;
			this._complete = false;
			this._callback = callback;
		},

		limit : function (n) {
			this._limit = n;
			return this;
		},

		add : function () {
			var i = 0,
				l = arguments.length - 1,
				src;

			for ( ; i <= l; i++ ) {
				src = arguments[i];
				if ( Object.prototype.toString.call(src) === '[object Array]' ) {
					this.add.apply(this,src);
				} else if ( (typeof src === 'string') || src.hasOwnProperty('src') ) {
					this._queue.push(src);
				}
			}

			return this;
		},

		next : function () {
			if ( this._paused === true ) return this;

			if ( !this._queue.length ) {
				if ( !this._complete ) {
					this._complete = true;
					this._paused = true;

					this.trigger("complete");
				}
				return;
			}

			while ( this._parallel < this._limit && this._queue.length ) {
				this._load(this._queue.shift());
			}
			
			return this;
		},

		isCached : function (src) {
			return this._cached[src];
		},

		_done : function (image, uuid, src) {
			image.onerror = image.onabort = image.onload = null;

			var image = image.complete ? image : false;

			this._parallel--;
			this._cached[uuid] = image ? true : false;
			this.dispatch(image, src);

			this.next();
		},

		_load : function (src) {
			var that = this;
			var image = new Image();
			var url = ( typeof src === 'string' ) ? src : src.src;
			var uuid = src.uuid || url;

			this._parallel++;

			image.onerror = image.onabort = image.onload = function () {
				that._done(image, uuid, src);
			};

			image.src = url;

			if ( image.complete ) {
				this._done(image, uuid, src);
			}

			return this;
		},

		dispatch : function (e, src) {
			if ( this._paused === true ) return this;

			try {
				this._callback.call(this, e, src);
			} catch (e) {
				console.log(this._callback);
			}
			
		}
	}

	return Loader;
})