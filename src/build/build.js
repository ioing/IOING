const fs = require('fs')

let out = ''
let root = __dirname + '/..'
// let libs = [
//   'scroll/base.js',
//   'scroll/constructor.js'
// ]
let libs = {
  'unify': ["open.js"]
}

let getFile = (path, file) => {
  console.log(root + '/' + path + '/' + file)
  file = fs.readFileSync(root + '/' + path + '/' + file, 'utf-8')
  return file.replace(/\/\* @import\(([\s\S]*)\) \*\//ig, function (c, f) {
    return getFile(path, f)
  })
}


for (let i in libs) {
  let files = libs[i]
  out += '/* ' + i + '.js */'
  files.forEach((file) => {
    out += getFile(i, file)
  })
}

fs.writeFileSync(root + '/dist/ioing.js', out)
