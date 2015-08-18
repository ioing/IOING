define({
  resources : {
    script: {
    },
    source: {
      list: "feed-list.html",
      feed: "index.html"
    },
    style: {
      common: "frameworks::common",
      main: "./main.css",
      list: "./feed-list.css"
    },
    data: {
      feed: "./list.json|param",
      config: "frameworks::config",
      lang: "frameworks::lang"
    }
  },
  config : {
    complex: true,
    style : ["common", "main", "list"],
    script : [],
    source: ["feed", "list"],
    data : ["feed", "lang"],
    sandbox : true,
    shadow : false,
    update : false,
    infinite : false,
    mirroring: {
      clip: [62, 0, 60, 0]
    }
  }
})