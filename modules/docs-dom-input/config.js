export default {
    resources : {
        script : {
        },
        source : {
            index: "index.html",
            htmlareaContent: function (p, c) {
                var html = '<img src="https://www.google.com.hk/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png"><p>试试把 HTML 文档粘贴进来</p>'
                c(html)
            }
        },
        data : {
            test : {
                name : '阳阳',
                range : {
                    top:0,
                    left:0
                }
            }
        }
    },
    config : {
        level : 0,
        absolute : false,
        style : ["common", "docs"],
        script : [],
        source : ["index", "htmlareaContent", "footer"],
        data : ["test"],
        sandbox : false,
        shadowbox: false,
        cache : 360,
        timeout : 60,
        animation : true
    },
    controller : {
    }
}