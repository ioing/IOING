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
      test: {
        follow: "Follow",
        following: "Following"
      }
    }
  },
  config : {
    complex: false,
    components : [],
    style : ["common", "main"],
    script : [],
    source: ["test"],
    data : ["test"],
    sandbox : false,
    shadow : true,
    mirroring: {
      clip: [71, 0, 0, 0]
    }
  }
})