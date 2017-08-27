export default {
    preload : function () {
    },
    transformstart : function () {
    },
    resources : {
        source: {
            index: "index.html"
        },
        style: {
            index: "index.css"
        },
        script: {
        },
        data: {
            content: "detail::content",
            api: "detail::api",
        }
    },
    config : {
        level : 9,
        style : ["index"],
        script: [],
        source: ["index"],
        // data: ["content","api"],
        cache : 120,
        sandbox : true,
        shadowbox : false,
        animation : true
    },
    param : {  
    }
}