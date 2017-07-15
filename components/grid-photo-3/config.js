define([], function (require, module, exports) {

    module.exports = {
        resources : {
            script: {
                index : "js/index.js"
            },
            source: {
                index: "index.html",
            },
            style: {
                main: "main.css",
                common: "frameworks::common"
            },
            data: {
                list : function () {
                    return [{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}]
                }
            }
        },
        config : {
            level : 6,
            style : ["common", "main"],
            script : [],
            source: ["index"],
            data : ["list"],
            cache : 120,
            sandbox : true,
            animation : true
        },
        filter : function (data) {
        },
        param : {
            limit: 20,
            page: 1
        }
    }
})