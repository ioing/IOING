define({
  resources : {
    script: {
    },
    source: {
      index: "index.html",
    },
    style: {
      common: "frameworks::common",
      main: "main.css"
    },
    data: {
      me: "./list.json",
      lang: "frameworks::lang"
    }
  },
  config : {
    complex: true,
    fragments : ["feedList"],
    style : ["common", "main"],
    script : [],
    source: ["index"],
    data : ["me", "lang"],
    sandbox : true,
    mirroring: {
      clip: [69, 0, 0, 0]
    },
    require: {
      config: {
        base : ".",
        alias : {
          "main01": "modules/me/main.js"
        }
      },
      use: {
        load: ["main01"],
        callback: function (a) {
          //a.start();
        }
      }
    }
  }
})