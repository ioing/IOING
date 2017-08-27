export default {
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
            s : {
                activeMainNav: null
            }
        }
    },
    config : {
        index : "feed",
        singleflow : false, // 历史归类，没有前进，到达首页无回退
        singlelocking : false,
        absolute : false,
        style : [],
        script : [],
        source : ["index"],
        data : ["s"],
        sandbox : false,
        shadowbox : false,
        animation : 'slide'
    },
    helper : {
    },
    filter : function (id, config) {
    },
    controller : {
    }
}