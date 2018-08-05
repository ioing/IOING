const path = require("path")

module.exports = {
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules)/,
      use: [{
        loader: 'babel-loader',
        //如果有这个设置则不用在添加.babelrc
        options: {
          presets: [['es2015', {modules: false}]],
          plugins: ['syntax-dynamic-import']
        }
      }]
    }]
  }
}