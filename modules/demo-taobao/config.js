define(function (require, module, exports) {

    module.exports = {
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
          taobao: "./list.json",
          list: "./infinitelist.json"
        }
      },
      config : {
        style : ["common", "main"],
        script : [],
        source: ["index"],
        data : ["taobao", "list"],
        sandbox : false,
        shadow: true,
        mirroring: {
          clip: [69, 0, 0, 0],
          filter: "blur(20px)"
        }
      }
    }
})