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
      taobao: "./list.json|param"
    }
  },
  config : {
    complex: false,
    style : ["common", "main"],
    script : [],
    source: ["index"],
    data : ["taobao"],
    sandbox : false,
    shadow: true,
    mirroring: {
      clip: [69, 0, 0, 0]
    }
  }
})