define(function (require, exports, module) {
	var Scroll = require('Scroll');
	var $ = require('Jquery');

		function loaded () {

			var mainScroll = new Scroll('#wrapper', {
				scrollbars: false,
				mouseWheel: true,
				interactiveScrollbars: true,
				probeType: 3,
				deceleration: 0.003,
				preventDefault: false
			});
				
			document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
			
		}


		return {
			start: loaded
		}

})