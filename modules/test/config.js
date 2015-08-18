define({
  resources : {
    script: {
    },
    source: {
      test: "index.html",
    },
    style: {
      common: "frameworks::common",
      main: "main.css"
    },
    data: {
    }
  },
  config : {
    complex: true,
    components : [],
    style : ["common", "main"],
    script : [],
    source: ["test"],
    data : [],
    sandbox : true,
    shadow : false,
    mirroring: {
      clip: [62, 0, 60, 0]
    }
  }
})