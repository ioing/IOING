export default {
    resources : {
        source: {
            index: "index.html"
        },
        style: {
            main: "main.css"
        },
        data: {
            "photo": function (param) {
                return "../grid-photo/" + param.group + '.json'
            }
        }
    },
    config : {
        level : 8,
        absolute : true,
        style : ["main"],
        source: ["index"],
        data: ["photo"],
        cache : 120,
        sandbox : true,
        shadowbox: false,
        animation : true
    },
    param : {
        group: 1,
        id : 1
    },
    helper : {
        getpic : function (pics, param) {
            return pics[param.ev].pics[param.id].src
        }
    }
}