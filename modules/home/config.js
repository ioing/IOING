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
      home: "./list.json"
    }
  },
  config : {
    complex: true,
    components : ["x-button"],
    style : ["common", "main"],
    script : [],
    source: ["index"],
    data : ["home"],
    sandbox : true,
    // shadow : true,
    mirroring: {
      target: "#blurlay",
      puppet: false
    },
    update : false,
    infinite: false
  }
})