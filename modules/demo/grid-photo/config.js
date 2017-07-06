define([], function (require, module, exports) {

    module.exports = {
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
                main: "main.css",
                common: "frameworks::common"
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
            style : ["common", "main"],
            script : [],
            source: ["index"],
            data : ["list"],
            cache : 120,
            sandbox : true,
            animation : true
        },
        filter : function (data) {
        },
        param : {
            id:7
        }
    }
})