export const getUI = function(_window) {

  let UI, UNIT

  // set ui

  UI = {
    os: OS,
    dpi: window.devicePixelRatio,
    scale: window.viewportScale,
    width: window.innerWidth,
    height: window.innerHeight,
    orientation: window.orientation
  }

  UI.viewportWidth = _window.viewportWidth = UI.width / UI.scale
  UI.viewportHeight = _window.viewportHeight = UI.height / UI.scale

  // define unit

  UNIT = {
    px: 1,
    dp: UI.scale,
    mm: UI.scale * 3.76562,
    cm: UI.scale * 37.7812,
    pt: UI.scale * 1.32812,
    pc: UI.scale * 16,
    in: UI.scale * 96,
    vw: UI.width / 100,
    vh: UI.height / 100,
    vmin: Math.min(UI.width, UI.height) / 100,
    vmax: Math.max(UI.width, UI.height) / 100,
    __unitRegExp__: /(?=\b|\-|\.)(\-?\.?[0-9]+\.?[0-9]*)(px|mm|cm|pt|pc|in|dp|vw|vh|vm|vmin|vmax|%)\b/ig,
    __nativeUnits__: DETECT.supportSizeUnits
  }

  // device

  return {
    ui: UI,
    os: OS,
    feat: DETECT
  }
}
