define(function (require, module, exports) {

    module.exports = {
        resources : {
            script : {
                "custom":"js/modernizr-custom.js",
                "imagesloaded": "js/imagesloaded.pkgd.min.js",
                "masonry": "js/masonry.pkgd.min.js",
                "classie": "js/classie.js",
                "main": "js/main.js"
            },
            source : {
                index: "index.html"
            },
            style : {
                main: "css/style1.css"
            },
            data : { 
            }
        },
        config : {
            level : 8,
            absolute : true,
            background : "#000",
            style : ["common", "docs", "main"],
            script : ["custom", "imagesloaded", "masonry", "classie", "main"],
            source: ["index"],
            sandbox : false,
            shadowbox : false,
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