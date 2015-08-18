define({
  resources : {
    script: {
      "main": "js/main.js"
    },
    source: {
      index: "index.html"
    },
    style: {
      common: "css/common.css",
      main: "css/main.css"
    },
    data: {
      lang: "./lang/zh-CN.json",
      nav: [
        {"text": "activity", "module":"activity"},
        {"text": "discover", "module":"discover"},
        {"text": "boutique", "module":"boutique"},
        {"text": "test1", "module":"test1"}
      ]
    }
  },
  config : {
    index : "activity",
    style : ["common", "main"],
    script :["main"],
    source: ["index"],
    data : ["lang", "nav"],
    iframe : false,
  }
})