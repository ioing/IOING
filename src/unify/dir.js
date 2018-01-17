export const DIR = (ioi) => {

  let root = ioi.getAttribute('root')

  // get root

  let paths = []

  if (root) {
    if (root.match(/^\w+\:/) === null && root.indexOf('//') !== 0) {
      paths = location.pathname.split('/')
      paths.pop()
      root = location.origin + paths.join('/') + root
    }
  } else {
    paths = ioi.src.split('/')
    paths.pop()

    root = paths.join('/') + '/'
  }

  return root
}
