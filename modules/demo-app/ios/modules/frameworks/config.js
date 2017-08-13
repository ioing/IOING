define([], function (require, module, exports) {
    
    module.exports = {
        preload : function () {
        },
        resources : {
            script : {
            },
            source : {
                index : "index.html"
            },
            style : {
            },
            data : {
                dock : [
                    {
                        id: "app-message",
                        name: "消息"
                    },
                    {
                        id: "app-twitter",
                        name: "twitter"
                    },
                    {
                        id: "app-photos",
                        name: "照片"
                    },
                    {
                        id: "app-tele",
                        name: "电话"
                    }
                ],
                screen : {
                    row : 7,
                    apps : [
                        [
                            {
                                id: "app-twitter",
                                name: "twitter"
                            },
                            {
                                id: "app-photos",
                                name: "照片"
                            },
                            {
                                id: "app-map",
                                name: "地图"
                            },
                            {
                                id: "app-mail",
                                name: "邮件"
                            },
                            {
                                id: "app-message",
                                name: "消息"
                            },
                            {
                                id: "../../../demo/taobao",
                                name: "淘宝"
                            }
                        ],
                        [
                            {
                                id: "app-twitter",
                                name: "twitter"
                            },
                            {
                                id: "app-photos",
                                name: "照片"
                            }
                        ]
                    ]
                }
            }
        },
        config : {
            index : null,
            system : true,
            singleflow : true, // 历史归类，没有前进，到达首页无回退
            singlelocking : 0,
            absolute : false,
            style : [],
            script : [],
            source : ["index"],
            data : ["screen", "dock"],
            sandbox : false,
            shadowbox : false,
            animation : 'slide'
        },
        helper : {
        },
        filter : function (id, config) {
        },
        controller : {
            screen: function (res) {
                var w = device.ui.width
                var h = device.ui.height

                if ( h < DP(700) ) {
                    res.row = h/DP(w > DP(800) ? 96 : 91)
                }
            }
        }
    }
})