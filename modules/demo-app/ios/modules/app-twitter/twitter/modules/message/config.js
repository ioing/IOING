export default {
    resources : {
        style : {
            "style" : "feed::style"
        },
        source : {
            index: "feed::index",
            feed: "feed::feed"
        },
        data : { 
            feed: [
                {
                    "uid": "10",
                    "at": "@Rosie",
                    "certification": "1",
                    "name": "ROSIE",
                    "text": "can he not say - here is rachel maddow ?",
                    "time": "2小时",
                    "liked": "0"
                }
            ]
        }
    },
    config : {
        level : 4,
        absolute : false,
        background : "#fff",
        style : ["style"],
        script : [],
        source: ["index", "feed"],
        data: ["feed"],
        sandbox : true,
        preview : true,
        animation : true
    }
}