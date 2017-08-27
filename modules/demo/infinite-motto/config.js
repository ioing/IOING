export default {
    resources : {
        script : {
        },
        style : {
            main: "main.css",
            list: "feed-list.css"
        },
        source : {
            list: "feed-list.html",
            feed: "index.html"
        },
        data: {
            feed: "list.json",
            config: "frameworks::config",
            lang: "frameworks::lang"
        }
    },
    config : {
        level : 8,
        absolute : true,
        background : "#fff",
        style : ["common", "main", "list"],
        script : [],
        source: ["feed", "list"],
        data: ["feed"],
        sandbox : true,
        cache : 0,
        timeout : 60,
        animation : true
    },
    param : {
      turnover: 0
    }
}