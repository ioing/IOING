export default {
    resources : {
        script : {
        },
        source : {
            index: "index.html",
            common: "common.html",
            docs: function (param) {
                return "/demo/" + param.demo + "/_docs.html"
            }
        },
        data : { 
        }
    },
    config : {
        level : 1,
        absolute : device.ui.width < 923 ? true : false,
        preview : true,
        style : ["common", "docs"],
        script : [],
        source: ["index", "common", "footer", "docs"],
        data: [],
        sandbox : true,
        cache : 360,
        timeout : 60,
        animation : device.ui.width < 923 ? "slide" : "flip"
    }
}