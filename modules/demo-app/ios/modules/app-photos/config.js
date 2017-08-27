export default {
    transformstart: function () {
        var title
        switch ( this.param.id ) {
            case "1":
                title = "上海徐汇区Hackathon活动"
                break
            case "2":
                title = "上海徐汇区Hackathon活动2"
                break
        }

        application.modules.frameworks.resources.data.setting.title = title || "上海徐汇区Hackathon活动"
        application.modules.frameworks.resources.data.setting.whiteTitleBar = false
        application.modules.frameworks.resources.data.setting.hiddenFooter = true

        var that = this
        setTimeout(function () {
            that.clipView([60, 0, 0, 0])

            application.modules.frameworks.resources.data.setting.experience = true
        }, 300)
    },
    resources : {
        script: {
            index : "js/index.js"
        },
        source: {
            index: "index.html",
        },
        style: {
            main: "main.css"
        },
        data: {
            list : function (param) {
                return param.id + '.json'
            },
            setting: "frameworks::setting"
        }
    },
    config : {
        level : 2,
        absolute : true,
        background: "#fff",
        style : ["main"],
        script : [],
        source: ["index"],
        data : ["list"],
        preview: true,
        sandbox : true,
        animation : "zoom"
    },
    filter : function (data) {
    },
    param : {
        id:7
    }
}