define(function (require, exports, module) {

	// 很久前的test页面，乱写的，这里什么都没有，只有一个css翻转动画控制，无借鉴意义

	var myScroll;
	var once = 0;
	var picQueue = [];

	var infiniteElements = document.querySelectorAll("#scroller dl");
	var _infiniteElements = {};
	var infiniteElementsLength = infiniteElements.length - 1;

	for (var i = infiniteElementsLength; i >= 0; i--) {
		var el = $(infiniteElements[i]);
		var banner = el.find('.banner');
		var icons = el.find('.icon');

		_infiniteElements[i] = {
			el : el,
			banner : banner,
			icons : icons
		}
	};

	delete el, banner, icons



	function start () {
		var flipStop = false;
		var fliped = [];

		myScroll = scroller["scroller"];


		myScroll.on('beforeScrollStart', function () {
			flipStop = true;

			if ( fliped.length ) {
				_infiniteElements[fliped[0].id].el.className = "cl";

				if ( fliped[0].type == "banner" ) {
					_infiniteElements[fliped[0].id]["banner"][0].className = "banner";
				} else if ( fliped[0].type == "icon1" ) {
					_infiniteElements[fliped[0].id]["icons"][0].className = "icon";
				} else if ( fliped[0].type == "icon2" ) {
					_infiniteElements[fliped[0].id]["icons"][1].className = "icon";
				}

				fliped = [];
			}
		})

		myScroll.on('scrollEnd infiniteCachedReady', function () {
			if ( arguments[0] == "break" ) return;

			flipStop = false;

			function step () {
				var i = Math.round(Math.random()*infiniteElementsLength);
				var time = Math.round(Math.random()*1000);

				setTimeout(function () {
					if ( flipStop == true ) return;
					var n = Math.round(Math.random()*3);

					if ( fliped.length ) {
						_infiniteElements[fliped[0].id].el.className = "cl";
					}

					if ( !_infiniteElements[i] || !_infiniteElements[i].el ) return;

					_infiniteElements[i].el.className = "cl viewport-flip";

					fliped = [];

					if ( n == 1 ) {
						if ( _infiniteElements[i].banner[0].getAttribute("data-flip") != "true" ) {
							_infiniteElements[i].banner[0].className = "banner flip front";
							_infiniteElements[i].banner[0].setAttribute("data-flip", "true");
						} else {
							_infiniteElements[i].banner[0].className = "banner flip back";
							_infiniteElements[i].banner[0].setAttribute("data-flip", "true");
						}
						fliped.push({
							id : i,
							type : "banner"
						});
					} else if ( n == 2 ) {
						if ( _infiniteElements[i].icons[0].getAttribute("data-flip") != "true" ) {
							_infiniteElements[i].icons[0].className = "icon flip front";
							_infiniteElements[i].icons[0].setAttribute("data-flip", "true");
						} else {
							_infiniteElements[i].icons[0].className = "icon flip back";
							_infiniteElements[i].icons[0].setAttribute("data-flip", "true");
						}
						fliped.push({
							id : i,
							type : "icon1"
						});
					} else if ( n == 3 ) {
						if ( _infiniteElements[i].icons[1].getAttribute("data-flip") != "true" ) {
							_infiniteElements[i].icons[1].className = "icon flip front";
							_infiniteElements[i].icons[1].setAttribute("data-flip", "true");
						} else {
							_infiniteElements[i].icons[1].className = "icon flip back";
							_infiniteElements[i].icons[1].setAttribute("data-flip", "true");
						}
						fliped.push({
							id : i,
							type : "icon2"
						});
					}

					step();
				}, time)
				
			}

			step();
		})
	}
	

	document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);

	start();

})