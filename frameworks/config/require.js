modules.config({
    base : ".",
    paths : {
    	"lib" 	  : "frameworks/lib",
    	"extend"  : "frameworks/extend"
    },
    vars : {
	},
    alias : {
    	"Init"				: "lib/init.js",			// 预处理;
    	"Query" 			: "lib/query.js",			// query;
    	"Extend" 			: "lib/extend.js",			// extend;
		"Loader" 			: "lib/loader.js",			// loader;
		"Async"			    : "lib/async.js",			// 数据;
		"CSS"				: "lib/css.js",				// cssX to css;
		"DOM"				: "lib/dom.js",				// html to dom;
		"Promise"			: "lib/promise.js",			// promise;
		"Template"			: "lib/template.js",		// 模版页面组合;
		"Transform"			: "lib/transform.js",		// 模块转换;
		"Storage" 			: "lib/storage.js",			// localStorage api;
		"WebSql" 			: "lib/webSql.js",			// web sql 数据库api;
		"Touch"				: "lib/touch.js",			// touch 事件;
		"Scroll" 			: "lib/scroll.js",			// 滚动;

		/* ------------------------ 框架辅助资源 ------------------------ */
		
		"Move"				: "extend/move.js",		    // Move;
		"PicLoader"			: "extend/PicLoader.js",	// 图片队列;
		"Html2canvas"		: "extend/html2canvas.js"	// 截图;
    }
}).use(["Extend", "Init"], function (extend, init) {
	extend(window)
	init()
})