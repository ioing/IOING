define(function (require, module, exports) {
    module.exports = {
        resources : {
            script : {
                index: "js/index.js"
            },
            style : {
                main: "main.css"
            },
            source : {
                index: "index.html"
            },
            data: {
                home: "./list.json"
            }
        },
        config : {
            level : 8,
            absolute : true,
            background : "#fff",
            style : ["common", "main"],
            script : ["index"],
            source: ["index"],
            data: ["home"],
            sandbox : true,
            cache : 0,
            timeout : 60,
            animation : true
        },
        param : {
          turnover: 0
        }
    }
})