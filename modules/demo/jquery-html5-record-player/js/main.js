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
	function objsize(obj) {
		var size = 0;
		for (var key in obj) {
			if (obj.hasOwnProperty(key)){
				size++;
			}
		}
		return size;
	};
	// From https://davidwalsh.name/javascript-debounce-function.
	function debounce(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	};
	// From http://stackoverflow.com/a/12221389.
	function circleIntersection(x0, y0, r0, x1, y1, r1) {
		var a, dx, dy, d, h, rx, ry;
		var x2, y2;

		/* dx and dy are the vertical and horizontal distances between
		 * the circle centers.
		 */
		dx = x1 - x0;
		dy = y1 - y0;

		/* Determine the straight-line distance between the centers. */
		d = Math.sqrt((dy*dy) + (dx*dx));

		/* Check for solvability. */
		if (d > (r0 + r1)) {
			/* no solution. circles do not intersect. */
			return false;
		}
		if (d < Math.abs(r0 - r1)) {
			/* no solution. one circle is contained in the other */
			return false;
		}

		/* 'point 2' is the point where the line through the circle
		 * intersection points crosses the line between the circle
		 * centers.  
		 */

		/* Determine the distance from point 0 to point 2. */
		a = ((r0*r0) - (r1*r1) + (d*d)) / (2.0 * d) ;

		/* Determine the coordinates of point 2. */
		x2 = x0 + (dx * a/d);
		y2 = y0 + (dy * a/d);

		/* Determine the distance from point 2 to either of the
		 * intersection points.
		 */
		h = Math.sqrt((r0*r0) - (a*a));

		/* Now determine the offsets of the intersection points from
		 * point 2.
		 */
		rx = -dy * (h/d);
		ry = dx * (h/d);

		/* Determine the absolute intersection points. */
		var xi = x2 + rx;
		var xi_prime = x2 - rx;
		var yi = y2 + ry;
		var yi_prime = y2 - ry;

		//return [xi, xi_prime, yi, yi_prime];
		return {
			x : xi,
			y : yi
		};
	};

	var winsize = {width : window.innerWidth, height : window.innerHeight};

	/**
	 * Turntable obj.
	 */
	function Turntable(el, options) {
		// Player HTML elem.
		this.el = el;

		// Audio Context.
		this.audioCtx = new AudioContext();

		// Options/Settings.
		this.options = extend( {}, this.options );
		extend( this.options, options );

		// Current noise value (the turntable scratch effect).
		this.noiseVal = this.options.noiseGain;
		// Delay (in seconds) for the buffer to start (min:1).
		this.bufferDelay = 2;
		// Current arm rotation.
		this.armRotation = 0;
		// Audio context destination / output.
		this.speakers = this.audioCtx.destination;
		// Room effect idx (for the web audio convolver). 
		// All the effects available should be in the options.effectBuffers array.
		this.effect = -1; // None by default.
		// Create convolver for the room effects.
		this.convolver = this.audioCtx.createConvolver();
		
		// UI stuff.
		this.ui = {
			player : this.el.querySelector('.player__element--lp'),
			recordCover : this.el.querySelector('.player__svg-lp > path#cover'),
			arm : this.el.querySelector('.player__element--tonearm > svg'),
			visualizer : this.el.querySelector('.player-stand > .visualizer')
		};
		// Controls
		this.ctrls = {
			back : this.el.querySelector('.control-button--back'),
			play : this.el.querySelector('.player__controls > button.player-button--playstop'),
			playStatus : this.el.querySelector('.player__controls > button.player-button--playstop .icon--play'),
			stopStatus : this.el.querySelector('.player__controls > button.player-button--playstop .icon--stop'),
			rotate : this.el.querySelector('.player__controls > button.player-button--rotate'),
			vinylFx : this.el.querySelector('.effects > button.effects__button--vinyleffect'),
			roomFx : [].slice.call(this.el.querySelectorAll('.effects > .effects__irs > .effects__button'))
		};
		// Record Info
		this.infoElems = {
			artist : this.el.querySelector('.player-info > .artist--player'),
			title : this.el.querySelector('.player-info > .title--player'),
			year : this.el.querySelector('.player-info > .year--player'),
			song : this.el.querySelector('.player-stand > .song')
		};
		// Arm element center point (we will need this to calculate future rotations of the arm).
		var armOffset = this.ui.arm.getBoundingClientRect();
		this.armCenterPoint = { x: armOffset.left + armOffset.width/2, y : armOffset.top + armOffset.height/2 };
		// Arm rotation angle boundaries.
		this.cartridgeMargin = 8 // Since the cartridge is rotated we need to take this in consideration when rotating the arm.
		this.angleInterval = {
			min : this._getAngle(this.ui.player),
			max : this._getAngle(this.ui.recordCover)
		}

		// Create the audio analyser and the canvas element to visualize the waveform.
		this._createAnalyser();
		
		// Init/Bind events.
		this._initEvents();
	}

	/**
	 * Turntable options/settings.
	 */
	Turntable.prototype.options = {
		// Noise/Scratch buffer
		noiseBuffer : '',
		// Noise/Scratch gain value
		noiseGain : 0.5,
		// Effect buffers
		effectBuffers : [],
		// Callbacks:
		onGoBack : function() { return false; }
	};

	/**
	 * Loads assets usong the AbbeyLoad script.
	 */
	Turntable.prototype._loadAssets = function(assets, callback, onProgress) {
		new AbbeyLoad(assets, function(bufferList) {
			callback(bufferList);
		}, onProgress);
	};

	/**
	 * Loads a record obj.
	 * {
	 * 	artist : [artist name],
	 * 	title : [album title name]
	 * 	side : {
	 * 	 side1 : [list of file urls],
	 * 	 side2 : [list of file urls]
	 * 	}
	 * }
	 */
	Turntable.prototype.loadRecord = function(record, callback, onProgress) {
		var self = this;

		this.recordData = {
			artist : record.artist,
			title : record.title,
			side1 : {
				totalDuration : 0,
				totalBuffers : 0,
				bufferList : [],
				bufferNames : []
			},
			side2 : {
				totalDuration : 0,
				totalBuffers : 0,
				bufferList : [],
				bufferNames : []
			}
		};

		var sidesLoaded = 0;

		// load buffers for this record
		var loadAssetsSide = function(side, assets, onLoaded) {
			self._loadAssets(assets, function(bufferList) {
				var _side = self.recordData[side];
				_side.bufferList = bufferList;
				// Total number of buffers.
				_side.totalBuffers = objsize(_side.bufferList);
				// Total duration of all buffers (in seconds)
				for(var i = 0; i < _side.totalBuffers; ++i) {
					_side.totalDuration += _side.bufferList['buffer' + (i+1)].duration;
				}
				
				++sidesLoaded;

				if( sidesLoaded === 2 ) {
					// Current buffer (playing or to be played).
					self.currentBuffer = 1;
					self.currentSide = 1;
					self.isReady = true;
					callback();
				}
				else {
					onLoaded();
				}
			}, function(progress) {
				var p = 0;
				if(sidesLoaded < 1) {
					p = progress*50/100;
				}
				else {
					p = (progress+100)/2;
				}
				onProgress(p);
			});
		};

		var buildAssetsList = function(side) {
			var arr = [], obj = {};
			for(var i = 0, len = record.sides[side].length; i < len; ++i) {
				obj['buffer' + (i+1)] = record.sides[side][i];
			}
			arr.push(obj);
			self.recordData[side].bufferNames = arr;
			return arr;
		};
		
		loadAssetsSide('side1', buildAssetsList('side1'), function() {
			loadAssetsSide('side2', buildAssetsList('side2'));
		});
	};
	
	/**
	 * Starts the turntable and starts playing the record.
	 */
	Turntable.prototype.start = function() {
		if( !this.isReady ) {
			return;
		}
		// Play all the buffers/tracks.
		this._play();
		// Extra turntable stuff (noise, arm and platter rotations)
		this._operate();
		// Control the play/stop ctrls status.
		this._ctrlPlay('play');
	};

	/**
	 * Gets the current record side.
	 */
	Turntable.prototype._getCurrentSide = function() {
		return this.recordData['side' + this.currentSide];
	};

	/**
	 * Plays all the buffers/tracks.
	 */
	Turntable.prototype._play = function(bufferOffset) {
		// Create a source.
		this.source = this.audioCtx.createBufferSource();
		// Set up its buffer.
		this.source.buffer = this._getCurrentSide().bufferList['buffer' + this.currentBuffer];
		// Update song name.
		this.infoElems.song.innerHTML = this._getSongName(this._getCurrentSide().bufferNames[0]['buffer' + this.currentBuffer]);
		// Set up the room effect and the right audio nodes´ connections.
		this.setEffect();
		// Start playing the current buffer. 
		// If bufferOffset is passed then start playing it from then on. 
		// Also, if starting from the beginning add a delay of [bufferDelay] seconds before playing the track.
		this.source.start(bufferOffset && bufferOffset > 0 ? this.audioCtx.currentTime : this.audioCtx.currentTime + this.bufferDelay, bufferOffset ? bufferOffset : 0);
		// start analysing
		var self = this;
		if( this.analyserTimeout ) {
			clearTimeout(this.analyserTimeout);
		}
		this.analyserTimeout = setTimeout(function() { self._analyse(); }, bufferOffset && bufferOffset > 0 ? 0 : this.bufferDelay*1000);
		// When the current buffer ends playing, jump to the next buffer in the list.
		var self = this;
		
		this.sourceEnded = function() {
			// If isDragging is true it means the User lifted the tonearm.
			if( self.isDragging ) return;
			if( self.currentBuffer < self._getCurrentSide().totalBuffers && self.isPlatterRotating ) { // keep on playing
				// Update current buffer and stop the current source.
				self.source.stop(0);
				self.currentBuffer++;
				// Recursive..
				self._play();
			}
			else {
				// Stop everything..
				self.stop();
			}
		};
		//this.source.addEventListener('ended', this.sourceEnded);
		this.source.onended = this.sourceEnded;
	};

	/**
	 * Gets the song name from a song url. (for this demo the url is "mp3/songname.mp3")
	 */
	Turntable.prototype._getSongName = function(url) {
		return url.substring(4, url.indexOf('.mp3'));
	};

	/**
	 * Creates the analyser and canvas element.
	 */
	Turntable.prototype._createAnalyser = function() {
		this.analyser = this.audioCtx.createAnalyser();
		
		// set up canvas context for visualizer
		this.canvas = document.createElement('canvas');
		this.ui.visualizer.appendChild(this.canvas);
		this.canvasCtx = this.canvas.getContext('2d');

		// Set canvas sizes
		this.canvasSize = {width : this.ui.visualizer.clientWidth, height : this.ui.visualizer.clientHeight};

		this.canvas.setAttribute('width', this.canvasSize.width);
		this.canvas.setAttribute('height', this.canvasSize.height);
	};

	/**
	 * Shows the waveform/oscilloscope.
	 * based on : 
	 * https://github.com/mdn/voice-change-o-matic/blob/gh-pages/scripts/app.js#L123-L167
	 * https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API
	 */
	Turntable.prototype._analyse = function() {
		window.cancelAnimationFrame(this.drawVisual);

		this.analyser.fftSize = 2048;
		var bufferLength = this.analyser.frequencyBinCount,
			dataArray = new Uint8Array(bufferLength),
			WIDTH = this.canvasSize.width,
  			HEIGHT = this.canvasSize.height,
  			self = this;

		this.canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
		
		var draw = function() {
			self.drawVisual = requestAnimationFrame(draw);
			self.analyser.getByteTimeDomainData(dataArray);

			self.canvasCtx.fillStyle = '#45bd94';
			self.canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

			self.canvasCtx.lineWidth = 1;
			self.canvasCtx.strokeStyle = '#474283';

			self.canvasCtx.beginPath();

			var sliceWidth = WIDTH * 1.0 / bufferLength;
			var x = 0;

			for(var i = 0; i < bufferLength; i++) {
				var v = dataArray[i] / 128.0,
					y = v * HEIGHT/2;

				if(i === 0) {
					self.canvasCtx.moveTo(x, y);
				} else {
					self.canvasCtx.lineTo(x, y);
				}

				x += sliceWidth;
			}

			self.canvasCtx.lineTo(WIDTH, HEIGHT/2);
			self.canvasCtx.stroke();
		};
		draw();
	};

	/**
	 * Stops the waveform/oscilloscope.
	 */
	Turntable.prototype._stopAnalysing = function() {
		window.cancelAnimationFrame(this.drawVisual);
		this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	};

	/**
	 * Turns on everything else: tonearm rotation, platter rotation and noise/scratch sound.
	 * @param Number status: 
	 * none || 1 - start all: creates and plays the noise; moves arm to platter; starts the arm rotation; starts the platter rotation.
	 * 2 - turntable is already on and running but tone arm is lifted, so: creates and plays the noise; starts the arm rotation for the @param remainingTime.
	 */
	Turntable.prototype._operate = function(status, remainingTime) {
		var status = status || 1;
		// Create record noise effect.
		this._createNoise();
		// Play it
		this._playNoise();
		
		if( status === 1 ) {
			// Moves the arm to the platter.
			this._moveArmTo(1);
			// Animates the arm along the record by changing its rotation value.
			var self = this;
			this.armtimeout = dynamics.setTimeout(function() {
				self._animateArm();
			}, this.bufferDelay * 1000);
			// Starts the Platter rotation.
			this._startPlatterRotation();
		}
		else if( status === 2 ) {
			var self = this;
			this.armtimeout = dynamics.setTimeout(function() {
				self._animateArm(remainingTime);
			}, remainingTime === this.totalDuration ? this.bufferDelay * 1000 : 0);
		}
	};
	
	/**
	 * Stops playing. If the User is not dragging the tonearm it turns of any other extra (arm and platter rotation and noise effect).
	 */
	Turntable.prototype.stop = function() {
		// Clear the armtimeout (this would make the tonearm start moving).
		if( this.armtimeout ) {
			dynamics.clearTimeout(this.armtimeout);
		}
		// Stop the current source.
		this.source.removeEventListener('ended', this.sourceEnded);
		this.source.stop(0);
		// Reset the current buffer idx.
		this.currentBuffer = 1;
		// Stop the noise/scratch effect.
		this._stopNoise();
		// Stop analysing.
		this._stopAnalysing();
		// stop the animation of the arm.
		dynamics.stop(this.ui.arm);
		// If the action causing it to stop was the User lifting up the tonearm, then the tonearm stays where it was and the platter continues to rotate. 
		// Otherwise the tonearm moves back to its resting position and the platter stops rotating.
		if( !this.isDragging ) {
			this._moveArmTo(0);
			this._stopPlatterRotation();
			// Control the play/stop ctrls status.
			this._ctrlPlay('stop');
		}
		if( this.analyserTimeout ) {
			clearTimeout(this.analyserTimeout);
		}
	};

	/**
	 * Resume playing the list of buffers after the User drops the tonearm on the platter.
	 */
	Turntable.prototype._resume = function() {
		// Check if the tonearm is being dropped "on" the platter (keep playing) or outside of it (stop everything and return the arm to its resting position).
		if( this.armRotation < this.angleInterval.min || this.armRotation >= this.angleInterval.max ) {
			this._moveArmTo(0);
			this._stopPlatterRotation();
			// Control the play/stop ctrls status.
			this._ctrlPlay('stop');
		}
		else {
			// Calculate which current buffer and in which part of it the pointer/needle is at.
			var currentInfo = this._getCurrentInfoFromAngle();
			// Update the current buffer idx.
			this.currentBuffer = currentInfo.bufferIdx;
			// Play all the buffers/tracks from this point on.
			this._play(currentInfo.bufferOffset);
			// Extra turntable stuff (noise, arm and platter rotations)
			this._operate(2, currentInfo.remainingTime);
		}
	};

	/**
	 * Gets the info of the current buffer and the total remaining time given the current tonearm rotation.
	 */
	Turntable.prototype._getCurrentInfoFromAngle = function() {
		var bufferIdx = -1,
			durations = 0,
			prevDurations = 0,
			bufferOffset = -1,
			offsetDuration = this.armRotation * this._getCurrentSide().totalDuration / (this.angleInterval.max - this.angleInterval.min) - (this.angleInterval.min * this._getCurrentSide().totalDuration / (this.angleInterval.max - this.angleInterval.min));
		
		for(var i = 0; i < this._getCurrentSide().totalBuffers; ++i) {
			durations += this._getCurrentSide().bufferList['buffer' + (i+1)].duration;
			if( offsetDuration < durations ) {
				bufferIdx = i+1;
				bufferOffset = offsetDuration - prevDurations;
				break;
			}
			else {
				prevDurations = durations;
			}
		}

		return {
			// Total remaining time.
			remainingTime : this._getCurrentSide().totalDuration - offsetDuration,
			// Current buffer position.
			bufferIdx : bufferIdx,
			// Current buffer time.
			bufferOffset : bufferOffset
		}
	};

	/**
	 * Creates the Audio Node for the noise/scratch effect.
	 */
	Turntable.prototype._createNoise = function() {
		this.noise = this.audioCtx.createBufferSource();
		this.noise.buffer = this.options.noiseBuffer;
		this.noiseGain = this.audioCtx.createGain();
		this.noiseGain.gain.value = this.noiseVal;
		this.noise.connect(this.noiseGain);
		this.noiseGain.connect(this.audioCtx.destination);
		this.noise.loop = true;
	};

	/**
	 * Plays the noise/scratch effect.
	 */
	Turntable.prototype._playNoise = function() {
		this.noise.start(0);
	};

	/**
	 * Stops the noise/scratch effect.
	 */
	Turntable.prototype._stopNoise = function(until) {
		this.noise.stop(0);
	};

	/**
	 * Adjusts the noise/scratch gain value.
	 */
	Turntable.prototype._adjustNoiseGain = function(val) {
		if( this.noiseGain ) {
			this.noiseGain.gain.value = val;
		}
	};

	/**
	 * Sets the noise/scratch gain value.
	 */
	Turntable.prototype.setNoise = function(status) {
		this.noiseVal = status ? this.options.noiseGain : 0;
		this._adjustNoiseGain(this.noiseVal);
	};

	/**
	 * Set up the room effect and the right audio nodes´ connections.
	 */
	Turntable.prototype.setEffect = function(idx) {
		this.effect = idx != undefined ? idx : this.effect;

		if( !this.source ) { return; }
		
		if( this.effect === -1 ) { // No effect.
			// readjust the nodes´ connections.
			this.source.disconnect();
			this.convolver.disconnect();
			this.source.connect(this.analyser);
			this.analyser.connect(this.speakers);
		}
		else {
			// Set up the Convolver buffer and adjust the nodes´ connections.
			this.convolver.buffer = this.options.effectBuffers[this.effect];
			this.source.connect(this.analyser);
			this.analyser.connect(this.convolver);
			this.convolver.connect(this.speakers);
		}
	};

	/**
	 * Gets the min/max angle that the tonearm needs to be rotated to start/finish playing the record.
	 * Calcuations are based on the principle of circle intersection (in this case the LP record with the arm trajectory circle).
	 * Formulas explained here: http://paulbourke.net/geometry/circlesphere/ & http://stackoverflow.com/a/12221389.
	 */
	Turntable.prototype._getAngle = function(el1) {
		var el1Offset = el1.getBoundingClientRect(),
			armOffset = this.ui.arm.getBoundingClientRect(),
			
			// radius and center points of both circles
			r1 = el1Offset.width/2,
			x1 = el1Offset.left + el1Offset.width/2,
			y1 = el1Offset.top + el1Offset.height/2,
			r2 = armOffset.width/2,
			x2 = armOffset.left + armOffset.width/2,
			y2 = armOffset.top + armOffset.height/2,

			// circle intersection
			intersection = circleIntersection(x1,y1,r1,x2,y2,r2),

			// angle
			deg = Math.atan2(this.armCenterPoint.y - intersection.y,this.armCenterPoint.x - intersection.x)*180/Math.PI;
		
		// since the cartridge is rotated we need to take this in consideration when rotating the arm
		return deg + 90 - this.cartridgeMargin;
	};

	/**
	 * Moves the tonearm to the platter (position = 1) or to the resting position (position = 0).
	 */
	Turntable.prototype._moveArmTo = function(position, duration) {
		dynamics.stop(this.ui.arm);
		dynamics.animate(this.ui.arm, {
			rotateZ : position ? this.angleInterval.min : 0
		},{
			duration: duration || 1000,
			type: dynamics.spring,
			frequency: 200,
			friction: 400
		});

		// update current rotation
		this.armRotation = position ? this.angleInterval.min : 0
	};

	/**
	 * Moves the tonearm along the platter while the tracks are playing.
	 */
	Turntable.prototype._animateArm = function(duration) {
		var self = this,
			// Angle intervals.
			angleMax = this.angleInterval.max,
			angleMin = this.armRotation > 0 ? this.armRotation : this.angleInterval.min;

		dynamics.stop(this.ui.arm);
		dynamics.animate(this.ui.arm, {
			rotateZ : this.angleInterval.max
		}, {
			duration: duration != undefined && duration !== this._getCurrentSide().totalDuration ? duration * 1000 : (this._getCurrentSide().totalDuration + this.bufferDelay) * 1000,
			type: dynamics.linear,
			change: function(el, progress) {
				// Update current rotation.
				self.armRotation = (angleMax - angleMin)*progress + angleMin;
			}
		});
	};

	/**
	 * Starts the rotation animation of the Platter.
	 */
	Turntable.prototype._startPlatterRotation = function() {
		this.isPlatterRotating = true;
		classie.add(this.ui.player, 'player__element--lp-spin');
	};

	/**
	 * Stops the rotation animation of the Platter.
	 */
	Turntable.prototype._stopPlatterRotation = function() {
		this.isPlatterRotating = false;
		classie.remove(this.ui.player, 'player__element--lp-spin');
	};

	/**
	 * Sets the turntable record info.
	 */
	Turntable.prototype.setRecordInfo = function(record) {
		this.infoElems.artist.innerHTML = record.artist;
		this.infoElems.title.innerHTML = record.title;
		this.infoElems.year.innerHTML = record.year;
	};

	/**
	 * Init/Bind events.
	 */
	Turntable.prototype._initEvents = function() {
		// Dragging functionality based on http://tutorialzine.com/2011/11/pretty-switches-css3-jquery/
		var self = this, 
			startDeg = -1, currentDeg = 0, rad2deg = 180/Math.PI;

		// Mousedown event.
		this.startDragging = function() {
			// Start dragging. 
			self.isDragging = true;
			// Current rotation.
			currentDeg = self.armRotation ? self.armRotation : currentDeg;
			// If playing then stop playing and stop the animation of the tonearm element.
			if( self.source ) {
				self.stop();
			}

			document.addEventListener('mousemove', self.dragging);
			document.addEventListener('mouseup', self.stopDragging);
		};

		// Mousemove event.
		this.dragging = function(ev) {
			var deg = Math.atan2(self.armCenterPoint.y - ev.pageY, self.armCenterPoint.x - ev.pageX) * rad2deg;
			// Save the starting position of the drag.
			if( !startDeg || startDeg == -1 ){
				startDeg = deg;
			}
			// Calculating the current rotation.
			var tmp = (deg-startDeg) + self.armRotation;
			// Making sure the current rotation stays between 0 and this.angleInterval.max.
			if( tmp < 0 ){
				tmp = 0;
			}
			else if( tmp > self.angleInterval.max ){
				tmp = self.angleInterval.max;
			}
			currentDeg = tmp;
			
			// update the tonearm rotation value
			dynamics.css(self.ui.arm, { rotateZ : currentDeg });
		};

		// Mouseup event.
		this.stopDragging = function() {
			self.isDragging = false;

			document.removeEventListener('mousemove', self.dragging);
			document.removeEventListener('mouseup', self.stopDragging);

			// Saving the current rotation.
			self.armRotation = currentDeg;
			// Marking the starting degree as invalid.
			startDeg = -1;
			// If isPlatterRotating = true then keep playing.
			if( self.isPlatterRotating ) {
				self._resume();
			}
		};

		// Start dragging the tonearm elem.
		this.ui.arm.addEventListener('mousedown', this.startDragging);

		// Window resize.
		this.debounceResize = debounce(function(ev) {
			// Recalculate arm center point.
			var armOffset = self.ui.arm.getBoundingClientRect();
			self.armCenterPoint = { x: armOffset.left + armOffset.width/2, y : armOffset.top + armOffset.height/2 };
			
			// Recalculate angle interval.
			self.angleInterval = {
				min : self._getAngle(self.ui.player),
				max : self._getAngle(self.ui.recordCover)
			};

			// reset Canvas/Analyser sizes
			if( self.drawVisual ) {
				self.canvasSize = {width : self.ui.visualizer.clientWidth, height : self.ui.visualizer.clientHeight};
				self.canvas.setAttribute('width', self.canvasSize.width);
				self.canvas.setAttribute('height', self.canvasSize.height);
				self._analyse();
			}
		}, 10);
		window.addEventListener('resize', this.debounceResize);

		// Controls.
		// Back to the Slideshow/Single view
		this.ctrls.back.addEventListener('click', function() {
			self._ctrlBack();
		});

		// Play/Stop turntable.
		this.ctrls.play.addEventListener('click', function() {
			if( classie.has(self.ctrls.playStatus, 'icon--hidden') ) {
				self._ctrlPlay('stop');
				self.stop();
			}
			else {
				self._ctrlPlay('play');
				self.start();
			}			
		});

		// Vinyl fx.
		this.ctrls.vinylFx.addEventListener('click', function() {
			self._ctrlVinylFx();
		});

		// Room fx
		this.ctrls.roomFx.forEach(function(ctrl, pos) {
			ctrl.addEventListener('click', function() {
				self._ctrlRoomFx(ctrl, pos);
			})
		});

		// Rotate record.
		this.ctrls.rotate.addEventListener('click', function() {
			self._ctrlRotate();
		});

		this.touchStartFix = function() {
			var buffer = self.audioCtx.createBuffer(1, 1, 22050);
			var source = self.audioCtx.createBufferSource();

			source.buffer = buffer;
			source.connect(self.audioCtx.destination);
			source.start(0);
			window.removeEventListener('touchstart', self.touchStartFix);
		};
		window.addEventListener('touchstart', this.touchStartFix);
	};

	/**
	 * User clicks the back button on the Turntable view. 
	 * Turntable stops.
	 */
	Turntable.prototype._ctrlBack = function() {
		// Stop all.
		this.stop();
		// Callback.
		this.options.onGoBack();
		// Reset side / Show side A.
		if( classie.has(this.ui.player, 'player__element--lp-flip') ) {
			classie.remove(this.ui.player, 'player__element--lp-flip');	
		}
	};

	/**
	 * Play/Stop button.
	 */
	Turntable.prototype._ctrlPlay = function(status) {
		classie.remove(status === 'stop' ? this.ctrls.playStatus : this.ctrls.stopStatus, 'icon--hidden');
		classie.add(status === 'stop' ? this.ctrls.stopStatus : this.ctrls.playStatus, 'icon--hidden');
	};

	/**
	 * Add/Remove the vinyl scratch effect.
	 */
	Turntable.prototype._ctrlVinylFx = function() {
		var hasFx = classie.has(this.ctrls.vinylFx, 'effects__button--active');
		
		this.setNoise(!hasFx);
		
		if( hasFx ) {
			classie.remove(this.ctrls.vinylFx, 'effects__button--active');
		}
		else {
			classie.add(this.ctrls.vinylFx, 'effects__button--active');
		}
	};

	/**
	 * Set a room effect.
	 */
	Turntable.prototype._ctrlRoomFx = function(ctrl, fx) {
		this.ctrls.roomFx.forEach(function(ctrlEl) {
			if( classie.has(ctrlEl, 'effects__button--active') && ctrlEl != ctrl ) {
				classie.remove(ctrlEl, 'effects__button--active');
			}
		});

		var hasFx = classie.has(ctrl, 'effects__button--active');

		if( hasFx ) {
			classie.remove(ctrl, 'effects__button--active');
			this.setEffect(-1);
		}
		else {
			classie.add(ctrl, 'effects__button--active');
			this.setEffect(fx);
		}
	};

	/**
	 * Rotate the record.
	 */
	Turntable.prototype._ctrlRotate = function(ctrl, fx) {
		if( this.isPlatterRotating ) {
			this.stop();
		}
		this.currentSide = this.currentSide === 1 ? 2 : 1;
		if( classie.has(this.ui.player, 'player__element--lp-flip') ) {
			classie.remove(this.ui.player, 'player__element--lp-flip');	
		}
		else {
			classie.add(this.ui.player, 'player__element--lp-flip');
		}
	}
		

	/**
	 * Record obj.
	 */
	function Record(el) {
		this.wrapper = el;
		this.cover = this.wrapper.querySelector('.img-wrap--single');
		this.position = this.wrapper.querySelector('.number');
		this.artist = this.wrapper.querySelector('.artist');
		this.title = this.wrapper.querySelector('.title');
		this.year = this.wrapper.querySelector('.year');

		this.info = {
			coverImg : this.cover.querySelector('img').src,
			artist : this.artist.innerHTML,
			title : this.title.innerHTML,
			year : this.year.innerHTML,
			sides : {
				side1 : this.wrapper.getAttribute('data-side1') ? this.wrapper.getAttribute('data-side1').split(',') : [],
				side2 : this.wrapper.getAttribute('data-side2') ? this.wrapper.getAttribute('data-side2').split(',') : [],
			}
		};
	}

	/**
	 * Position the record.
	 */
	Record.prototype.layout = function(place) {
		switch(place) {
			case 'down' :
				dynamics.css(this.cover, { opacity: 1, translateY : winsize.height });
				dynamics.css(this.position, { opacity: 1, translateY : winsize.height - 200 });
				dynamics.css(this.artist, { opacity: 1, translateY : winsize.height - 200 });
				dynamics.css(this.title, { opacity: 1, translateY : winsize.height - 180 });
				dynamics.css(this.year, { opacity: 1, translateY : winsize.height - 250 });
				break;
			case 'right' :
				dynamics.css(this.cover, { opacity: 1, translateX : winsize.width + 600 });
				dynamics.css(this.position, { opacity: 1, translateX : winsize.width + 150 });
				dynamics.css(this.artist, { opacity: 1, translateX : winsize.width });
				dynamics.css(this.title, { opacity: 1, translateX : winsize.width + 150 });
				dynamics.css(this.year, { opacity: 1, translateX : winsize.width + 50 });
				break;
			case 'left' :
				dynamics.css(this.cover, { opacity: 1, translateX : -winsize.width - 600 });
				dynamics.css(this.position, { opacity: 1, translateX : -winsize.width - 150 });
				dynamics.css(this.artist, { opacity: 1, translateX : -winsize.width });
				dynamics.css(this.title, { opacity: 1, translateX : -winsize.width - 150 });
				dynamics.css(this.year, { opacity: 1, translateX : -winsize.width - 50 });
				break;
			case 'hidden' :
				dynamics.css(this.cover, { opacity: 0 });
				dynamics.css(this.position, { opacity: 0 });
				dynamics.css(this.artist, { opacity: 0 });
				dynamics.css(this.title, { opacity: 0 });
				dynamics.css(this.year, { opacity: 0 });
				break;
		};
	};

	/**
	 * Animate the record.
	 */
	Record.prototype.animate = function(direction, callback) {
		var duration = 600,
			type = dynamics.bezier,
			points = [{"x":0,"y":0,"cp":[{"x":0.2,"y":1}]},{"x":1,"y":1,"cp":[{"x":0.3,"y":1}]}],
			transform = {
				'left' : { translateX : -winsize.width, translateY : 0, opacity : 1 },
				'right' : { translateX : winsize.width, translateY : 0, opacity : 1 },
				'center' : { translateX : 0, translateY : 0, opacity : 1 }
			};

		dynamics.animate(this.cover, transform[direction], { duration : duration, type : type, points : points, complete : function() { 
			if( typeof callback === 'function' ) {
				callback();
			}
		} });
		dynamics.animate(this.position, transform[direction], { duration : duration, type : type, points : points });
		dynamics.animate(this.artist, transform[direction], { duration : duration, type : type, points : points });
		dynamics.animate(this.title, transform[direction], { duration : duration, type : type, points : points });
		dynamics.animate(this.year, transform[direction], { duration : duration, type : type, points : points });
	};

	/**
	 * Slideshow obj.
	 */
	function RecordSlideshow(el, options) {
		this.el = el;

		// Options/Settings.
		this.options = extend( {}, this.options );
		extend( this.options, options );

		// Slideshow items.
		this.records = [];
		var self = this;
		[].slice.call(this.el.querySelectorAll('.single')).forEach(function(el) {
			var record = new Record(el);
			self.records.push(record);
		});
		// Total items.
		this.recordsTotal = this.records.length;
		// Current record idx.
		this.current = 0;
		// Slideshow controls.
		this.ctrls = {
			next : this.el.querySelector('.controls__navigate > button.control-button--next'),
			prev : this.el.querySelector('.controls__navigate > button.control-button--prev'),
			play : this.el.querySelector('button.control-button--play'),
			back : this.el.querySelector('button.control-button--back')
		};

		this.lpPlayCtrlPath = this.ctrls.play.querySelector('svg.icon--progress > path');
		this.lpPlayCtrlPathLen = this.lpPlayCtrlPath.getTotalLength();
		dynamics.css(this.lpPlayCtrlPath, {strokeDasharray : this.lpPlayCtrlPathLen, strokeDashoffset : this.lpPlayCtrlPathLen});
		
		this._initEvents();
	}

	/**
	 * RecordSlideshow options/settings.
	 */
	RecordSlideshow.prototype.options = {
		// On stop callback.
		onStop : function() { return false; },
		// On load record callback.
		onLoadRecord : function() { return false; },
		// On show record callback.
		onShowRecord : function() { return false; }
	};

	/**
	 * Shows the first record.
	 */
	RecordSlideshow.prototype.start = function(pos) {
		this.current = pos;
		var currentRecord = this.records[this.current];
		classie.add(currentRecord.wrapper, 'single--current');
		currentRecord.layout('down');
		currentRecord.animate('center');
		// show play ctrl
		this._showPlayCtrl();
	};

	/**
	 * Restart where it was. Called when transitioning from the player view to the slideshow/single view.
	 */
	RecordSlideshow.prototype.restart = function(callback) {
		var currentRecord = this.records[this.current];
		classie.add(currentRecord.wrapper, 'single--current');
		currentRecord.layout('left');
		currentRecord.animate('center', callback);
		// show play ctrl
		this._showPlayCtrl();
	};

	/**
	 * Init/Bind events.
	 */
	RecordSlideshow.prototype._initEvents = function() {
		var self = this;
		this.ctrls.next.addEventListener('click', function() {
			self._navigate('right');
		});
		this.ctrls.prev.addEventListener('click', function() {
			self._navigate('left');
		});
		this.ctrls.back.addEventListener('click', function() {
			self._stop();
		});
		this.ctrls.play.addEventListener('click', function() {
			self._loadRecord();
		});
	};

	/**
	 * Navigate.
	 */
	RecordSlideshow.prototype._navigate = function(direction) {
		var self = this;

		// If the user clicked play on a previous record, then cancel it.
		if( this.isLoading ) {
			this._cancelRecordLoading();
		}

		// hide play ctrl
		this._hidePlayCtrl();

		var currentRecord = this.records[this.current];
		
		if( direction === 'right' ) {
			this.current = this.current < this.recordsTotal - 1 ? this.current + 1 : 0;
		} 
		else {
			this.current = this.current > 0 ? this.current - 1 : this.recordsTotal - 1;
		}

		var nextRecord = this.records[this.current];
		classie.add(nextRecord.wrapper, 'single--current');

		currentRecord.animate(direction === 'right' ? 'left' : 'right', function() {
			classie.remove(currentRecord.wrapper, 'single--current');
		});

		nextRecord.layout(direction);
		nextRecord.animate('center', function() {
			// show play ctrl
			self._showPlayCtrl();
		});
	};

	/**
	 * Load the record.
	 */
	RecordSlideshow.prototype._loadRecord = function() {
		// If already pressed return.
		if( this.isLoading ) {
			return false;
		}
		// Hide play symbol
		classie.add(this.ctrls.play, 'control-button--active');

		// Loading...
		this.isLoading = true;
		// Callback.
		this.options.onLoadRecord(this.records[this.current], this.lpPlayCtrlPath, this.lpPlayCtrlPathLen);
	};

	/**
	 * Show record.
	 */
	RecordSlideshow.prototype._showRecord = function() {
		var self = this;
		
		// If the user didn't click play then return.
		if( !this.isLoading ) {
			return false;
		}

		var currentRecord = this.records[this.current];
		currentRecord.animate('left', function() {
			currentRecord.layout('hidden');
			classie.remove(currentRecord.wrapper, 'single--current');
		});
		
		// hide play ctrl
		this._hidePlayCtrl();

		// Callback.
		this.options.onShowRecord(currentRecord);

		// Invalidate.
		this._cancelRecordLoading();
	};

	/**
	 * Stop the slideshow.
	 */
	RecordSlideshow.prototype._stop = function() {
		// If the user clicked play on a previous record, then cancel it.
		if( this.isLoading ) {
			this._cancelRecordLoading();
		}

		var currentRecord = this.records[this.current];
		currentRecord.layout('hidden');
		classie.remove(currentRecord.wrapper, 'single--current');

		// hide play ctrl
		this._hidePlayCtrl();

		// Callback.
		this.options.onStop();
	};

	/**
	 * Cancel the loading of a record (either because the user pressed the navigation keys, or closed the slideshow after clicking the play ctrl of a specific record).
	 */
	RecordSlideshow.prototype._cancelRecordLoading = function() {
		this.isLoading = false;
		// Show play symbol
		classie.remove(this.ctrls.play, 'control-button--active');
		dynamics.stop(this.lpPlayCtrlPath);
		dynamics.css(this.lpPlayCtrlPath, {strokeDasharray : this.lpPlayCtrlPathLen, strokeDashoffset : this.lpPlayCtrlPathLen});
	};

	/**
	 * Shows the play ctrl.
	 */
	RecordSlideshow.prototype._showPlayCtrl = function() {
		dynamics.animate(this.ctrls.play, { opacity : 1 }, { duration : 200, type : dynamics.easeOut });
	};

	/**
	 * Hides the play ctrl.
	 */
	RecordSlideshow.prototype._hidePlayCtrl = function() {
		dynamics.css(this.ctrls.play, { opacity : 0 });
	};
	
	/* UI */

	// Grid, Single/Slideshow/ Player views.
	var views = {
			grid : document.querySelector('.view--grid'),
			single : document.querySelector('.view--single'),
			player : document.querySelector('.view--player')
		},
		// The initial grid element.
		lpGrid = views.grid.querySelector('ul.grid'),
		// The initial grid items.
		lps = [].slice.call(lpGrid.querySelectorAll('li.grid__item')),
		expanderEl = document.querySelector('.deco-expander'),
		// The LP svg behing each Slideshow record
		recordEl = views.player.querySelector('.player__element--lp'),
		slideshow, turntable;

	/**
	 * Preload grid images and some turntable assets. Once that's done, initialize events.
	 */
	function init() {
		var onready = function() {
			classie.add(lpGrid, 'grid--loaded');
			initEvents();
			// Initialize slideshow.
			slideshow = new RecordSlideshow(document.querySelector('.view--single'), {
				// Stopping/Closing the slideshow: return to the initial grid.
				onStop : function() {
					changeView('single', 'grid');
					hideExpander();
				},
				onLoadRecord : function(record, progressEl, progressElLen) {
					// Load the record info into the turntable.
					turntable.loadRecord(record.info, function() {
						// Update record info on the turntable
						turntable.setRecordInfo(record.info);
						setTimeout(function() { slideshow._showRecord(); }, 50);
					}, function(progress) {
						if( slideshow.isLoading ) {
							dynamics.animate(progressEl, {strokeDashoffset : progressElLen * ( 1 - progress/100 )}, {duration : 100, type : dynamics.linear});
						}
					});
				},
				onShowRecord : function(record) {
					// Show record element.
					dynamics.css(recordEl, { opacity : 1 });
					// Change the cover of the record.
					recordEl.querySelector('image').setAttribute('xlink:href', record.info.coverImg);
					// Change view.
					changeView('single', 'player');

					setTimeout(function() { turntable.start(); }, 600);
				}
			});
		};
		preload(onready);
	}

	/**
	 * Preload grid images and some turntable assets. Initialize the turntable.
	 */
	function preload(callback) {
		var loaded = 0,
			checkLoaded = function() {
				++loaded;
				if( loaded === 2 && typeof callback === 'function' ) {
					callback();
				}
			};
		
		// Initialize Masonry after all images are loaded.
		initGridLayout(checkLoaded);
		// Load the turntable assets (noise and effects sounds).
		loadTurntableAssets(function(bufferList) {
			initTurntable(bufferList);
			checkLoaded();
		});
	}

	/**
	 * Call Masonry on the initial grid.
	 */
	function initGridLayout(callback) {
		imagesLoaded(views.grid, function() {
			new Masonry( '.grid', {
				itemSelector: '.grid__item'
			});
			if( typeof callback === 'function' ) {
				callback();
			}
		});
	}

	function loadTurntableAssets(callback) {
		new AbbeyLoad([{ 
			'room1' : 'mp3/room1.mp3',
			'room2' : 'mp3/room2.mp3',
			'room3' : 'mp3/room3.mp3',
			'noise' : 'mp3/noise1.mp3'
		}], function(bufferList) {
			if( typeof callback === 'function' ) {
				callback(bufferList);
			}
		});
	};

	function initTurntable(bufferList) {
		// initialize turntable
		turntable = new Turntable(views.player, {
			noiseBuffer	: bufferList['noise'],
			effectBuffers : [bufferList['room1'],bufferList['room2'],bufferList['room3']],
			onGoBack : function() {
				// Change view.
				changeView('player', 'single');
				slideshow.restart(function() {
					// Hide record element.
					dynamics.css(recordEl, { opacity : 0 });
				});
			}
		});
		// force to be checked by default (firefox)
		// ctrls.noise.checked = true;
	}

	function changeView(old, current) {
		classie.remove(views[old], 'view--current');
		classie.add(views[current], 'view--current');
	}

	function initEvents() {
		lps.forEach(function(lp, pos) {
			lp.addEventListener('click', function(ev) {
				ev.preventDefault();
				showExpander({x: ev.pageX, y: ev.pageY}, function() {
					changeView('grid', 'single');
				});
				// Start the slideshow.
				setTimeout(function() { slideshow.start(pos);}, 80);
			});
		});

		// Window resize.
		var debounceResize = debounce(function(ev) {
			// Recalculate window sizes.
			winsize = {width : window.innerWidth, height : window.innerHeight};
		}, 10);
		window.addEventListener('resize', debounceResize);
	}

	function showExpander(position, callback) {
		dynamics.css(expanderEl, { opacity: 1, left : position.x, top : position.y, backgroundColor : '#45918e', scale : 0 });
		dynamics.animate(expanderEl, { 
			scale : 1.5, 
			backgroundColor : '#45cb96' 
		}, { 
			duration : 500, 
			type : dynamics.easeOut,
			complete : function() {
				if( typeof callback === 'function' ) {
					callback();
				}
			}
		});
	}

	function hideExpander() {
		dynamics.css(expanderEl, { left : window.innerWidth/2, top : window.innerHeight/2 });
		dynamics.animate(expanderEl, { 
			opacity : 0
		}, { 
			duration : 500, 
			type : dynamics.easeOut
		});
	}

	init();

	window.AudioContext = window.AudioContext||window.webkitAudioContext;

})(window);