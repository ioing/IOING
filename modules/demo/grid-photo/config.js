export default {
    resources : {
        script: {
            index : "js/index.js"
        },
        source: {
            index: "index.html",
        },
        style: {
            main: "main.css"
        },
        data: {
            list : function (param) {
                return param.id + '.json'
            },
            setting: "frameworks::setting"
        }
    },
    config : {
        level : 6,
        absolute : true,
        style : ["main"],
        script : [],
        source: ["index"],
        data : ["list"],
        update: true,
        sandbox : true,
        animation : true
    },
    filter : function (data) {
    },
    param : {
        id:7
    }
}