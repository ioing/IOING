export class Module {
  constructor (inputor) {
    this.inputor = inputor
    this.css_attr = [
      "borderBottomWidth",
      "borderLeftWidth",
      "borderRightWidth",
      "borderTopStyle",
      "borderRightStyle",
      "borderBottomStyle",
      "borderLeftStyle",
      "borderTopWidth",
      "boxSizing",
      "fontFamily",
      "fontSize",
      "fontWeight",
      "height",
      "letterSpacing",
      "lineHeight",
      "marginBottom",
      "marginLeft",
      "marginRight",
      "marginTop",
      "outlineWidth",
      "overflow",
      "overflowX",
      "overflowY",
      "paddingBottom",
      "paddingLeft",
      "paddingRight",
      "paddingTop",
      "textAlign",
      "textOverflow",
      "textTransform",
      "whiteSpace",
      "wordBreak",
      "wordWrap"
    ]
    return this
  }

  rect (select) {
    var flag = this.mirror.find(select)
    var pos = flag.position()
    var rect = {
      left: pos.left,
      top: pos.top,
      height: flag[0].offsetHeight
    }

    this.mirror.remove()

    return rect
  }

  create (html) {
    var that = this
    var css = this.mirrorCss()

    this.mirror = document.createElement('div')

    css.each(function(i, p) {
      that.mirror.style[i] = p
    })

    this.mirror.html(html)
    this.inputor.after(this.mirror)

    return this
  }

  mirrorCss () {
    var that = this
    var css = {
      position: 'absolute',
      left: -9999,
      top: 0,
      zIndex: -20000
    }

    if (this.inputor.nodeName === 'TEXTAREA') {
      this.css_attr.push('width')
    }

    this.css_attr.each(function(i, p) {
      return css[p] = that.inputor.css(p)
    })

    return css
  }
}
