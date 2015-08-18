define({
  resources : {
    script: {
      "index" : "js/index.js"
    },
    source: {
      index: "index.html",
    },
    style: {
      main: "main.css",
      common: "frameworks::common"
    },
    data: {
      config: ""
    }
  },
  config : {
    style : ["common", "main"],
    script : ["index"],
    source: ["index"],
    data : [],
    sandbox : true
  }
})