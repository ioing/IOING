define(function (require, module, exports) {

    module.exports = {
        resources : {
            script : {
            },
            style : {
                style: "style.css"
            },
            source : {
                index: "index.html"
            },
            data : { 
                colorful: [
                    "~/picture/1.jpeg", 
                    "~/picture/2.jpeg", 
                    "~/picture/3.jpeg", 
                    "~/picture/4.jpeg", 
                    "~/picture/5.jpeg", 
                    "~/picture/6.jpeg",
                    "~/picture/7.jpeg"
                ],
            }
        },
        config : {
            level : 8,
            absolute : true,
            background : "#fff",
            style : ["style"],
            script : [],
            source: ["index"],
            data: ["colorful"],
            sandbox : true,
            cache : 0,
            timeout : 60,
            preview : true,
            animation : true
        }
    }
})