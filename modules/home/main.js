define(function (require, exports, module) {
	var Scroll = require('Scroll');

		function loaded () {

			var mainScroll = new Scroll('#scroller-main', {
				useTransition: false,
				scrollbars: false,
				mouseWheel: true,
				interactiveScrollbars: true,
				shrinkScrollbars: 'scale',
				fadeScrollbars: true,
				probeType: 3,
				deceleration: 0.003,
				preventDefault: true
			});

			var bannerScroll = new Scroll('#banner-wrapper', {
				scrollX: true,
				scrollY: false,
				momentum: false,
				snap: true,
				snapSpeed: 400,
				keyBindings: true,
			});

			document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);

		}

		return {
			start: loaded
		}

})