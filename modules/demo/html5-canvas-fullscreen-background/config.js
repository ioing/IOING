define(function (require, module, exports) {

    module.exports = {
        resources : {
            script : {
            },
            source : {
                index: function (param) {
                    var id = isNaN(param.id) ? 1 : param.id
                    id = id > 7 ? 1 : id

                    return "index" + id + ".html"
                }
            },
            data : { 
            }
        },
        config : {
            level : 8,
            absolute : true,
            background : "#000",
            style : ["common", "docs"],
            script : [],
            source: ["index"],
            sandbox : true,
            cache : 0,
            timeout : 60,
            data: [],
            animation : true,
            param: {
                id : 0
            }
        }
    }
})