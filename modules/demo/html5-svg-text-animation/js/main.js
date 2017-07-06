/**
 * main.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2016, Codrops
 * http://www.codrops.com
 */
;(function(window) {

	'use strict';

	// Helper vars and functions.
	function extend( a, b ) {
		for( var key in b ) { 
			if( b.hasOwnProperty( key ) ) {
				a[key] = b[key];
			}
		}
		return a;
	}
	// Concatenate JS objs.
	// From http://stackoverflow.com/a/2454315.
	function collect() {
		var ret = {};
		var len = arguments.length;
		for (var i=0; i<len; i++) {
			for (var p in arguments[i]) {
				if (arguments[i].hasOwnProperty(p)) {
					ret[p] = arguments[i][p];
				}
			}
		}
		return ret;
	}

	/**
	 * LetterPart obj. A letter can be split in several parts. Each part will contain one or more layers/paths.
	 */
	function LetterPart(el, options) {
		this.el = el;
		this.options = extend({}, this.options);
		extend(this.options, options);
		// The layers/paths.
		this.layers = [].slice.call(this.el.querySelectorAll('path'));
		// Total number of layers.
		this.layersTotal = this.layers.length;
		var self = this;
		this.layers.forEach(function(layer, pos) {
			if( self.options.pathOpacityAnim ) {
				// If pathOpacityAnim is true, then set the opacity to 0 for all the paths except the last one. We want to make sure that given 2 or more overlapping paths the ones behind will not be shown.
				layer.style.opacity = pos === self.layersTotal - 1 ? 1 : 0;
			}
			// Set the stroke dasharray to the path´s total length and stroke dashoffset to 0 so the paths are initially rendered.
			layer.style.strokeDashoffset = 0;
			layer.style.strokeDasharray = layer.getTotalLength();
		});
	}

	/**
	 * Show all the layers by setting the opacity to 1.
	 */
	LetterPart.prototype.showLayers = function() {
		this.layers.forEach(function(layer, pos) {
			layer.style.opacity = 1;
		});
	};

	/**
	 * Letter obj. The letter element is a SVG group containing one or more parts (LetterParts).
	 */
	function Letter(el, options) {
		this.el = el;
		this.options = extend({}, this.options);
		extend(this.options, options);
		// Set transform origin (center center).
		var bcr = this.el.getBBox();
		this.el.style.transformOrigin = (bcr.x + bcr.width/2) + 'px ' + (bcr.y + bcr.height/2) + 'px';
		this.parts = [];
		var self = this;
		[].slice.call(this.el.querySelectorAll('g.letter__part')).forEach(function(el) {
			self.parts.push(new LetterPart(el, { pathOpacityAnim : self.options.pathOpacityAnim }));
		});
	}

	/**
	 * Phrase obj. The Phrase element is the SVG element itself containing all the SVG groups that represent each letter.
	 */
	function Phrase(el, options) {
		this.el = el;
		this.options = extend({}, this.options);
		extend(this.options, options);
		this.letterElems = [].slice.call(this.el.querySelectorAll('g.letter'));
		this.letters = [];
		var self = this;
		this.letterElems.forEach(function(el) {
			self.letters.push(new Letter(el, { pathOpacityAnim : self.options.pathOpacityAnim }));
		});
	}

	Phrase.prototype.options = {
		// If true, all the layers/paths of each letter part (except the last one) will animate the opacity to 0.
		// With this, we avoid any overlapping path behind the last one to be shown.
		pathOpacityAnim: false,
		// The animation settings for the ´out´ animation (when we click the button and the letters disappear). We are using the anime.js lib so the syntax is the same.
		outAnimation: {
			translateY: [0, 15],
			opacity: [1, 0],
			duration: 250,
			easing: 'easeInOutQuad'
		},
		// The animation settings for the ´in´ animation (when the letters appear again).
		inAnimation: {
			properties: {
				translateY: {
					value: [-30, 0],
					duration: 900,
					elasticity: 600,
					easing: 'easeOutElastic'
				},
				opacity: {
					value: [0, 1],
					duration: 500,
					easing: 'linear'
				},
			},
			delay: 40 // delay increment per letter.
		},
		// Stroke animation settings
		pathAnimation: {
			duration: 800,
			easing: 'easeOutQuint',
			delay: 200 // delay increment per path.
		}
	};

	Phrase.prototype.animate = function() {
		var self = this,
			animOutProps = {
				targets: this.letterElems,
				complete: function() {
					var animLettersProps = {
						targets: self.letterElems,
						delay: function(el, index) {
							return index * self.options.inAnimation.delay;
						}
					};

					anime(collect(animLettersProps, self.options.inAnimation.properties));

					for(var i = 0, len = self.letters.length; i < len; ++i) {
						var parts = self.letters[i].parts,
							partsTotal = parts.length;

						for(var j = 0, len2 = parts.length; j < len2; ++j) {
							parts[j].showLayers();
							
							var animProps = {
								targets: parts[j].layers,
								strokeDashoffset: function(el) {
									return [el.getTotalLength(), 0];
								},
								easing: self.options.pathAnimation.easing,
								duration: self.options.pathAnimation.duration,
								delay: function(el, index) {
									return index * self.options.pathAnimation.delay + i * self.options.inAnimation.delay;
								}
							};

							if( self.options.pathOpacityAnim ) {
								animProps.opacity = {
									value: function(el, index) {
										return index !== parts[j].layers.length - 1 ? 0 : 1;
									},
									duration: 200,
									delay: function(el, index) {
										return index * self.options.pathAnimation.delay + i * self.options.inAnimation.delay + self.options.pathAnimation.duration - 0.1*self.options.pathAnimation.duration;
									}
								}
							}

							anime(animProps);
						}
					}
				}
			};

		anime(collect(animOutProps, this.options.outAnimation));
	};

	window.Phrase = Phrase;

})(window);