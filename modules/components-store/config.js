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
            discover : "./list.json"
        }
    },
    config : {
        level : 0,
        absolute : false,
        preview : 2,
        style : ["common", "docs", "main"],
        script : [],
        source: ["index", "footer"],
        data: ["discover"],
        sandbox : true,
        cache : 360,
        timeout : 60,
        animation : false
    },
    helper : {
    },
    controller: {
        discover: function (res) {
            var banner = res.banner.sort(function(){ return 0.5 - Math.random() })
            
            res.banner = banner.slice(0, 4)

            var components = res.components.sort(function(){ return 0.5 - Math.random() })

            res.components = components.slice(0, 7)
        }
    }
}