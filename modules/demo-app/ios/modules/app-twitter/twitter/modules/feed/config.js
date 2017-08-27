export default {
    resources : {
        script : {
        },
        style : {
            style: "style.css"
        },
        source : {
            index: "index.html",
            feed: "feed.html"
        },
        data : { 
            feed: "list.json",
        }
    },
    config : {
        level : 1,
        absolute : false,
        background : "#fff",
        style : ["style"],
        script : [],
        source: ["index", "feed"],
        data: ["feed"],
        sandbox : true,
        cache : 360,
        timeout : 60,
        preview : true,
        animation : true
    },
    helper : {
        urlSplit: function (url) {
            url = url.replace(/\//ig, function () {
                return '---'
            })
            return url
        }
    },
    controller : {
        feed: function (res) {
            return res.sort(function(){ return 0.5 - Math.random() })
        }
    }
}