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
                    "liked": "0",
                    "content": {
                        "like": "17",
                        "reply": "9",
                        "retweet": "97"
                    }
                },
                {
                    "uid": "5",
                    "at": "@Heyyy_Ty",
                    "certification": "1",
                    "name": "Ty💋",
                    "text": "I really be trying to bond with Carla and her ass go under the rock. 🙄",
                    "time": "1小时",
                    "liked": "0",
                    "content": {
                        "like": "",
                        "reply": "",
                        "retweet": ""
                    }
                },
                {
                    "uid": "10",
                    "at": "@Rosie",
                    "certification": "1",
                    "name": "ROSIE",
                    "text": "i remind u as she reminded us -",
                    "time": "2小时",
                    "liked": "1",
                    "content": {
                        "like": "4",
                        "reply": "10",
                        "retweet": "74"
                    }
                }
            ]
        }
    },
    config : {
        level : 3,
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