export default {
    resources : {
        script : {
        },
        style : {
            main: "main.css"
        },
        source : {
            index: "index.html"
        },
        data : { 
            taobao: "./list.json",
            infinite: function (param) {
                var p = param.turnover
                if ( p > 2 ) return {}
                return "./infinitelist-" + p + ".json"
            }
        }
    },
    config : {
        level : 8,
        absolute : true,
        background : "#fff",
        style : ["main"],
        script : [],
        source: ["index"],
        data: ["taobao", "infinite"],
        sandbox : true,
        cache : 360,
        timeout : 60,
        animation : "zoom"
    },
    param : {
      turnover: 0
    }
}