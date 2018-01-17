import { OS } from './os'

export const reviewport = () => {

  // 创建 viewport meta

  function creat(id, scale, tdpi) {
    document.write('<meta ' +
      'id="' + id + '" ' +
      'name="viewport" ' +
      'content="' +
      'width=device-width,' +
      'initial-scale=' + scale + ',' +
      'minimum-scale=' + scale + ',' +
      'maximum-scale=' + scale + ',' +
      'user-scalable=no' +
      (tdpi && OS.androidVersion < 5 ? ',target-densitydpi=device-dpi' : '') +
      '">')
    return document.getElementById(id)
  }

  let windowInitWidth = window.innerWidth


  // init viewport {{

  let testViewport = creat('test-viewport', '1.0')

  // mark document init width

  let windowRestWidth = window.innerWidth
  let documentElementInitWidth = document.documentElement.offsetWidth

  // remove test viewport

  testViewport.parentNode.removeChild(testViewport)

  // }}


  // setting new viewport

  let realViewport = creat('real-viewport', 1 / devicePixelRatio, true)

  /* viewport is ok?
   * 由屏幕斜角排列导致dpi缩放不精准，宽度相减值应小于 w * 0.01
   * devicePixelRatio floor * documentElementInitWidth 在某些设备上约等于实际像素
   * document.documentElement.offsetWidth 在部分手机中渲染完会发生变更
   */

  /*
      !!! viewport 具有刷新缓存, 因此可能是物理值也可能是虚拟值
   */

  let realScreenWidth = Math.max(window.innerWidth, window.document.documentElement.offsetWidth)
  let realWindowWidth = devicePixelRatio * Math.min(windowRestWidth, documentElementInitWidth)
  let scale = ((window.innerWidth != window.screen.width && windowRestWidth != windowInitWidth) || ((window.innerWidth == window.screen.width || window.innerWidth == realScreenWidth) && windowRestWidth == windowInitWidth && realScreenWidth == realWindowWidth)) ?
    Math.max(window.innerWidth / windowRestWidth, document.documentElement.offsetWidth / documentElementInitWidth) :
    null

  // rest viewport

  if (scale == null) {

    // remove real viewport

    realViewport.parentNode.removeChild(realViewport)

    creat('real-viewport', '1.0')

    scale = 1
  }

  // }}

  // exports

  window.viewportScale = scale
}
