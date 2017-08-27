export default {
    resources : {
        script : {
        },
        source : {
            index: "index.html"
        },
        style : {
            main: "main.css"
        },
        data : {
            all : "./list.json"
        }
    },
    config : {
        level : 0,
        absolute : false,
        style : ["common", "docs", "main"],
        script : [],
        source: ["index", "footer"],
        data: ["all"],
        sandbox : true,
        cache : 360,
        timeout : 60,
        animation : true
    },
    helper : {
    },
    controller: {
    }
}