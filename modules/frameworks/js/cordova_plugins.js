cordova.define('cordova/plugin_list', function(require, exports, module) {
	module.exports = [{
		"file": "inAppBrowser.js",
		"id": "org.apache.cordova.inappbrowser.InAppBrowser",
		"clobbers": [
			"window.open"
		]
	}];
	module.exports.metadata =
	// TOP OF METADATA
	{
		"org.apache.cordova.inappbrowser": "0.3.1"
	}
	// BOTTOM OF METADATA
});