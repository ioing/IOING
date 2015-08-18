define(function (require, exports, module) {
	'use strict';

	return function () {
		var template = require('Template'),
			transform = require('Transform')
		;

		window.application = {
			modules     : {},
			get         : function (ids, callback, that) {
				ids = ids instanceof Array ? ids : [ids];

				var url = [];

				for ( var i = 0, l = ids.length; i < l; i++ ) {
					var id = ids[i];
					
					if ( !application.modules[id] ) {
						url.push("modules/" + id + "/config.js");
					}
				}

				require.async(url, function () {
	                for (var i = 0, l = arguments.length; i < l; i++) {
	                	var id = ids[i],
	                		module = arguments[i];
						
						if ( !module ) return;

						module.id = id;

						application.modules[id] = module;
					}
	                
	                callback && callback.call(that);
	            })
			}
		};

		document.ready(function () {
			var modules	= {},
				fragments = {}
			;

			// load module config;
			
			application.get(['frameworks'], function () {

				// start App;

				application.modules["frameworks"].elements = {
					container : document.body
				}

				application.transform = transform();
				application.template = template();

				// 创建框架主视图;

				application.template.include(application.complexViewport, "frameworks", function () {
					try {
						var index = application.modules.frameworks.config.index,
							hash = document.location.hash.replace("#","").split("$"),
							id = hash[0],
							param = hash[1]
						;
					} catch (e) {
						throw 'Missing configuration module front view. path: frameworks > config.js > config > index';
						return;
					}

					/* 外部路由, 把首页推入历史纪录 */

					if ( id ) {
						application.transform.hash(index).to([id, param]);

						return;
					}

					application.transform.to(index);
				})
			})

		})
	};
})