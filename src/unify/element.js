export const ELEMENT = function(proto) {
  // element.Animate() => new Animate()

  proto.extendProperty("Animate", function(options) {

    if (!this.animateEvent) {
      this.extendProperty("animateEvent", new window.Animate(this))
    }

    return this.animateEvent
  })

  // element.Touch() => new Touch()

  proto.extendProperty("Touch", function(options) {

    // shadow box trans window

    var win = this.ownerDocument.defaultView

    if (!win) return {}

    if (!this.touchEvent) {
      this.extendProperty("touchEvent", new win.Touch(this, options))
    }

    return this.touchEvent
  })

  // element.Scroll() => new Scroll()

  proto.extendProperty("Scroll", function(options, window) {

    // shadow box trans window

    var win = this.ownerDocument.defaultView

    if (!win) return {}

    if (!this.scrollEvent) {
      this.extendProperty("scrollEvent", new win.Scroll(this, options, window))
    }

    return this.scrollEvent
  })

  // get attr

  proto.extendProperty("getAttrSign", function(prop) {
    prop = this.getAttribute(prop)

    if (["false", "none", null].consistOf(prop)) {
      prop = false
    } else if (["", "true"].consistOf(prop)) {
      prop = true
    } else if (!isNaN(prop)) {
      prop = Number(prop)
    }

    return prop
  })

  // getOwnerSelection

  proto.extendProperty("getOwnerSelection", function(context) {
    return (this.parentShadowRoot && device.feat.shadowRoot == true ? this.parentShadowRoot : this.ownerDocument.defaultView).getSelection()
  })

  // getSelectionRange

  proto.extendProperty("getSelectionRange", function(selection) {
    selection = selection || this.getOwnerSelection()

    return selection.createRange ? selection.createRange() : selection.anchorNode ? selection.getRangeAt(0) : null
  })

  // setSelectionRangeAt

  proto.extendProperty("setSelectionRangePos", function(pos) {
    var selection = this.getOwnerSelection()

    switch (this.nodeName) {
      case 'INPUT':
      case 'TEXTAREA':
        pos = pos.getInstanceType() == 'Array' ? pos : [this.selectionStart, this.selectionEnd]

        if (selection.rangeCount > 0) selection.removeAllRanges()

        this.setSelectionRange(pos[0], pos[1])

        break

      case 'HTMLAREA':
        var oDocument = this.ownerDocument
        var fn, found, offset

        if (pos === undefined) {
          pos = this.getSelectionRange(selection)
        }

        if (pos.getInstanceType() == 'Range') {
          selection.removeAllRanges()
          selection.addRange(pos)
        } else if (selection) {
          offset = 0
          found = false

          (fn = function(pos, parent) {
            var node, range, _i, _len, _ref, _results

            _ref = parent.childNodes
            _results = []

            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              node = _ref[_i]

              if (found) {
                break
              }

              if (node.nodeType === 3) {
                if (offset + node.length >= pos) {
                  found = true
                  range = oDocument.createRange()

                  range.setStart(node, pos - offset)
                  selection.removeAllRanges()
                  selection.addRange(range)

                  break
                } else {
                  _results.push(offset += node.length)
                }
              } else {
                _results.push(fn(pos, node))
              }
            }

            return _results

          })(pos, this)
        }

        break
    }
  })

  // getSelectionRangeInsert

  proto.extendProperty("getSelectionRangeInsert", function(context) {
    var selection = this.getOwnerSelection()
    var range = this.getSelectionRange(selection)

    if (range == null) return null
    if (context == undefined) return range

    range.collapse(false)

    var content = range.createContextualFragment(context)
    var lastChild = content.lastChild

    range.insertNode(content)

    if (lastChild) {
      range.setEndAfter(lastChild)
      range.setStartAfter(lastChild)
    }

    this.setSelectionRangePos(range)

    return range
  })


  // getSelectionRangePos

  proto.extendProperty("getSelectionRangePosition", function(pos) {
    switch (this.nodeName) {
      case 'INPUT':
      case 'TEXTAREA':

        var at_rect, end_range, format, html, mirror, start_range

        if (pos === undefined) {
          pos = this.selectionStart
        }

        if (pos == this.preSelectionPos) {
          return this.preSelectionRect
        }

        format = function(value) {
          value = value.replace(/<|>|`|"|&/g, '?').replace(/\r\n|\r|\n/g, "<br/>")
          if (/firefox/i.test(navigator.userAgent)) {
            value = value.replace(/\s/g, '&nbsp;')
          }
          return value
        }

        start_range = this.value.slice(0, pos)
        end_range = this.value.slice(pos)
        html = "<span style='position: relative; display: inline;'>" + format(start_range) + "</span>"
        html += "<span id='mirror' style='position: relative; display: inline;'>|</span>"
        html += "<span style='position: relative; display: inline;'>" + format(end_range) + "</span>"
        mirror = new Mirror(this)

        at_rect = mirror.create(html).rect("#mirror")

        at_rect.left -= this.scrollLeft
        at_rect.top -= this.scrollTop

        this.preSelectionPos = pos
        this.preSelectionRect = at_rect

        return at_rect

        break

      case 'HTMLAREA':

        var inputor_offset, range_offset

        range_offset = this.getSelectionRangeOffset()
        inputor_offset = this.offset()
        range_offset.left -= inputor_offset.left
        range_offset.top -= inputor_offset.top

        return range_offset
        break
    }
  })

  proto.extendProperty("getSelectionRangeOffset", function(pos) {
    switch (this.nodeName) {
      case 'INPUT':
      case 'TEXTAREA':
        var offset = this.offset()
        var position = this.getSelectionRangePosition(pos)

        return offset = {
          left: offset.left + position.left,
          top: offset.top + position.top,
          height: position.height
        }

        break

      case 'HTMLAREA':

        var oWindow = this.ownerDocument.defaultView
        var oDocument = oWindow.document

        var selection = this.getOwnerSelection()
        var range = this.getSelectionRange(selection)

        var clonedRange, offset, rect, shadowCaret

        if (range) {

          range.collapse(false)

          if (range.endOffset - 1 > 0 && range.endContainer !== this) {
            clonedRange = range.cloneRange()
            clonedRange.setStart(range.endContainer, range.endOffset - 1)
            clonedRange.setEnd(range.endContainer, range.endOffset)
            rect = clonedRange.getBoundingClientRect()
            offset = {
              height: rect.height,
              left: rect.left + rect.width,
              top: rect.top
            }
            clonedRange.detach()
          }

          if (!offset || (offset != null ? offset.height : void 0) === 0) {
            clonedRange = range.cloneRange()
            shadowCaret = oDocument.createTextNode("|")
            clonedRange.insertNode(shadowCaret)
            clonedRange.selectNode(shadowCaret)
            rect = clonedRange.getBoundingClientRect()
            offset = {
              height: rect.height,
              left: rect.left,
              top: rect.top
            }
            shadowCaret.remove()
            clonedRange.detach()
          }
        }

        offset.left += top.scrollX
        offset.top += top.scrollY

        return offset

        break
    }
  })
}
