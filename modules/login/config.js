define({
  resources : {
    script: {
      main: "main.js"
    },
    source: {
      index: "index.html"
    },
    style: {
      common: "frameworks::common",
      main: "main.css"
    }
  },
  config : {
    complex: false,
    style : ["common", "main"],
    script : ["main"],
    source: ["index"],
    data : [],
    sandbox : true
  }
})