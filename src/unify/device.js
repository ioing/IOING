import { DETECT } from './detect'

export const DEVICE = function(w) {
  let UI, UNIT, S, OS = DETECT.OS

  // set ui

  UI = {
    os: OS,
    dpi: w.devicePixelRatio,
    scale: w.viewportScale,
    width: w.innerWidth,
    height: w.innerHeight,
    orientation: w.orientation
  }

  S = UI.scale

  UI.viewportWidth = w.viewportWidth = UI.width / UI.scale
  UI.viewportHeight = w.viewportHeight = UI.height / UI.scale

  // define unit

  UNIT = {
    px: 1,
    dp: S,
    mm: S * 3.76562,
    cm: S * 37.7812,
    pt: S * 1.32812,
    pc: S * 16,
    in: S * 96,
    vw: UI.width / 100,
    vh: UI.height / 100,
    vmin: Math.min(UI.width, UI.height) / 100,
    vmax: Math.max(UI.width, UI.height) / 100,
    __unitRegExp__: /(?=\b|\-|\.)(\-?\.?[0-9]+\.?[0-9]*)(px|mm|cm|pt|pc|in|dp|vw|vh|vm|vmin|vmax|%)\b/ig,
    __nativeUnits__: DETECT.supportSizeUnits
  }

  w.UI = UI
  w.UNIT = UNIT
  w.DP = function(dp) {
    return dp * UI.scale
  }

  return w.device = {
    ui: UI,
    os: OS,
    feat: DETECT,
    unit: UNIT
  }
}
