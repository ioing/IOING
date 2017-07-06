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
            },
            data: {
                aaa: {
                    a:1,
                    b:2,
                    c:3
                }
            }
        },
        config : {
            level : 2,
            style : ["common"],
            source: ["index"],
            data: ['aaa'],
            cache : 120,
            sandbox : true,
            animation : true
        },
        filter : function (data, name) {
        },
        param : {
        }
    }
})