module.exports = {
  path: {
    root: "static/", // ioing.js 相对 index.html 的引用路径
    build: "build/", // build 目录
    pages: "build/", // 应用 index.html 位置
    static: "build/static/" // 应用 cdn 资源位置
  },
  // 默认不需要修改，host 缺省时默认为 ip 访问，host 设置为域名时不能使用二维码和局域网访问
  browser: {
    host: 'test.tmall.com',
    // href: 'index.html',
    // port: 8000,
    // https: false
  },
  // 打包到首次加载的模块 id，[A, B, C], 也可设置 "all" (不建议设置 all，建议缺省))
  bundle: 'all'
}