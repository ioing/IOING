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
            
        }
    },
    config : {
        level : 0,
        absolute : false,
        style : ["common", "main"],
        script : [],
        source: ["index", "footer"],
        sandbox : true,
        cache : 360,
        timeout : 60,
        data: [],
        mirroring: {
          clip: [60, 0, 60, 0],
          filter: "blur(20px)"
        },
        animation : true
    },
    filter : function(res, name) {
    },
    param : {
    }
}