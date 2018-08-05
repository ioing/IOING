export default {
  debug: 1,
  version: "1.0.2",
  resources: {
    script: {},
    source: {
      index: "index.html"
    },
    style: {
    },
    data: {
    }
  },
  config: {
    index: "test",
    singleflow: false,
    singlelocking: false,
    absolute: false,
    style: [],
    script: [],
    source: ["index"],
    data: [],
    sandbox: false,
    shadowbox: false,
    animation: true,
    design: 750
  },
  helper: {
  },
  filter: function (id, config) {
    // 批处理所有模块配置
  },
  events: {
    transformstart () {
    }
  },
  controller: {
  },
  baseStyles: `
    body:lang(zh-CN) {
      font-family: "SF Pro SC","HanHei SC","SF Pro Text","Myriad Set Pro",system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI","SF Pro Icons","Apple Legacy Icons","PingFang SC","Helvetica Neue","Helvetica","Arial",sans-serif;
    }
    body {
      font-family: "SF Pro Text","Myriad Set Pro",system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI","SF Pro Icons","Apple Legacy Icons","Helvetica Neue","Helvetica","Arial",sans-serif;
    }
    input, textarea, select, button {
      font-synthesis: none;
      -moz-font-feature-settings: 'kern';
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      direction: ltr;
      text-align: left;
    }t
  `
}