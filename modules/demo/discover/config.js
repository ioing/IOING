export default {
    resources : {
        script : {
            main: "main.js"
        },
        style : {
            main: "main.css"
        },
        source : {
            index: "index.html"
        },
        data: {
            discover: "./list.json"
        }
    },
    config : {
        level : 8,
        absolute : true,
        background : "#fff",
        style : ["main"],
        script : ["main"],
        source: ["index"],
        data: ["discover"],
        sandbox : true,
        cache : 0,
        timeout : 60,
        animation : true
    },
    param : {
      turnover: 0
    }
}