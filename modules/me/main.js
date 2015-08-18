define(function (require, exports, module) {
	var Scroll = require('Scroll');

		function loaded () {
			//console.log(window.parent.document.getElementById("blur-c").style)
			var myScroll = new Scroll('#me_viewport', {
				useTransition: true,
				scrollbars: false,
				mouseWheel: true,
				interactiveScrollbars: false,
				//shrinkScrollbars: 'clip',
				//fadeScrollbars: true,
				probeType: 3,
				preventDefault: false
				// indicators: [{
				// 	el: window.parent.document.getElementById("blur-c"),
				// 	resize: false,
				// 	ignoreBoundaries: true,
				// 	speedRatioY: 1
				// }]
			});

			var bg = document.getElementById('bg');
			var bgHeight = bg.offsetHeight;
			myScroll.on("scroll", function () {
				if (this.y < 0) return;
				var scale = this.y / this.wrapperHeight;
				bg.style[Scroll.browser.prefixStyle.transform] = 'translate(0, 0)' + this.translateZ + ' scale(' + (1 + scale) + ')';
				if ( $.os.ios ) {
					bg.style["webkitFilter"] = 'blur(' + scale*scale*100 + 'px)';
				}
			})

			// oblurlay({
			//     'upper':'oblurlay-upper',
			//     'contents':'oblurlay-contents',
			//     'clone':'oblurlay-contents-clone',
			//     'svgBlur':30
			// });
		}

		document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);

		return {
			start: loaded
		}

})