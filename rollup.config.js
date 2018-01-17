const path = require('path')

const resolve = (p) => path.resolve(__dirname, './', p)
export default {
  input: resolve('src/index.js'),
  output: {
    file: resolve('dist/ioing-es.js'),
    name: "IOING",
    format: 'es'
  }
}
