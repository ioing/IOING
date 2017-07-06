define(null, function (require, module, exports) {

    module.exports = {
        preload : function () {
            document.title = "range"
        },
        resources : {
            source: {
                index: "index.html"
            },
            style: {
                common: "frameworks::common"
            }
        },
        config : {
            level : 2,
            style : ["common"],
            source: ["index"],
            cache : 1200,
            sandbox : true,
            animation : true
        },
        filter : function (data, name) {
        },
        param : {
        }
    }
})