export default {
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
            feed: "list.json",
        }
    },
    config : {
        level : 8,
        absolute : true,
        background : "#fff",
        style : ["style"],
        script : [],
        source: ["index"],
        data: ["feed"],
        sandbox : true,
        cache : 0,
        timeout : 60,
        preview : true,
        animation : true
    },
    controller : {
        feed: function (res) {
            return res.sort(function(){ return 0.5 - Math.random() })
        }
    }
}