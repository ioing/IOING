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
      discover: "./list.json"
    }
  },
  config : {
    complex: true,
    style : ["common", "main"],
    script : [],
    source: ["index"],
    data : ["discover"],
    sandbox : true,
    update : false,
    infinite: false,
    mirroring: {
      clip: [62, 0, 60, 0]
    }
  }
})