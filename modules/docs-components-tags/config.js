export default {
    resources : {
        script : {
        },
        source : {
            index: "index.html",
            footer: "frameworks::footer"
        },
        style : {
            common: "frameworks::common",
            main: "frameworks::docs"
        },
        data : {
            test : {
                name : '阳阳'
            }
        }
    },
    config : {
        level : 0,
        absolute : false,
        style : ["common", "main"],
        script : [],
        source: ["index", "footer"],
        data: ['test'],
        sandbox : true,
        cache : 360,
        timeout : 60,
        animation : true
    }
}