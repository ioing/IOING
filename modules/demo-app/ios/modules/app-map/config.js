export default {
    resources : {
        script: {
            es5: "http://cache.amap.com/lbs/static/es5.min.js",
            map : "http://webapi.amap.com/maps?v=1.3&key=3baa71235476ba8e6b3c14db04f3d14b"
        },
        source: {
            index: "index.html",
        },
        style: {

        },
        data: {
        }
    },
    config : {
        level : 2,
        absolute : true,
        background: "#fff",
        style : [],
        script : ["es5", "map"],
        source: ["index"],
        data : [],
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