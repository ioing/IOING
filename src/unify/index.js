import { BASE_CSS, REST_CSS } from './init-css'
import { DIR } from './dir'
import { polyfill } from './polyfill'
import { reviewport } from './reviewport'
import { getRootScript } from './root-script'
import { serviceWorker } from './service-worker'
import { proto } from './proto'


export const unify = (w, d) => {

  let __ioi = getRootScript()
  let __dir = DIR(__ioi)

  // init App config

  w.App = {
    config: {
      root: __dir
    }
  }

  // 初始化基础样式

  d.write(BASE_CSS)

  // 动态重置样式

  w.CSSBaseStyle = REST_CSS
  w.CompiledCSSBaseStyle = null

  // 嵌套应用识别

  if (w.parent && w.parent.viewportScale) {
    w.viewportScale = w.parent.viewportScale
  } else {
    reviewport()
  }

  serviceWorker(__ioi)


  w.__defineUnify__ = polyfill
  w.__defineProto__ = proto


  // 统一兼容性

  polyfill(w)
  proto(w)
}
