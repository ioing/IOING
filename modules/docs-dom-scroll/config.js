export default {
    resources : {
        script : {
        },
        source : {
            index: "index.html"
        },
        style : {
            common: "frameworks::common",
            main: "frameworks::docs"
        },
        data : {
            colorful: ["#00bc9c", "#1aaf5e", "#2e97df", "#e97e06", "#ea4b36", "#33495f"],
            testgridlist: [{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}]
        }
    },
    config : {
        level : 0,
        absolute : false,
        style : ["common", "main"],
        script : [],
        source: ["index", "footer"],
        cache : 360,
        timeout : 60,
        data: ["colorful", "testgridlist"],
        sandbox : true,
        shadowbox : false,
        animation : true
    },
    param : {
    }
}