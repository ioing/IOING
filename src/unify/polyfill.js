import { DEFINE } from './define'
import { DEVICE } from './device'
import { VENDOR } from './vendor'
import { STRING } from './string'
import { OBJECT } from './object'
import { ARRAY } from './array'
import { NODE } from './node'
import { ELEMENT } from './element'
import { CSSSTYLEDECLARATION } from './css-style-declaration'
import { DOCUMENT } from './document'
import { FUNCTION } from './function'
import { DOMPARSER } from './dom-parser'
import { CUUID } from './uuid'
import { rAF } from './raf'
import { rIC } from './ric'

// noop

const NOOP = function() {}

// preventDefaultEvent

const stopPropagation = function(event) {
  return event.stopPropagation()
}

const preventDefaultEvent = function(event) {
  return event.preventDefault()
}

export const polyfill = function(w) {
  // defineProperty

  w.Object.defineProperty(w.Object.prototype, "extendProperty", {
    configurable: true,
    writable: true
  })

  w.Object.prototype.extendProperty = function(prop, value) {
    try {
      w.Object.defineProperty(this, prop, {
        configurable: true,
        writable: true
      })
      if (value !== undefined) this[prop] = value
    } catch (e) {}
  }

  w.Object.defineProperty(w.Object.prototype, "extendProperties", {
    configurable: true,
    writable: true
  })

  w.Object.prototype.extendProperties = function(object) {
    for (var key in object) {
      this.extendProperty(key, object[key])
    }
  }


  /*=============================================================================*/


  let d = w.document,
    Array = w.Array,
    Object = w.Object,
    String = w.String,
    Node = w.Node,
    Element = w.Element,
    DOMParser = w.DOMParser,
    Function = w.Function,
    CSSStyleDeclaration = w.CSSStyleDeclaration

  // 空函数

  w.noop = NOOP
  w.keyboard = {}

  // 阻止默认事件行为 指针目的:所有preventDefault 函数指向同一内存，可在全局进行 add & remove

  w.stopPropagation = stopPropagation
  w.preventDefaultEvent = preventDefaultEvent

  if (!d.head) {
    d.extendProperty("head", d.getElementsByTagName("head")[0] || d.documentElement)
  }

  /* time */

  if (!w.Date.now) {
    w.Date.extendProperty("now", function() {
      return new Date().getTime()
    })
  }

  // Define & Device

  DEFINE(w)
  DEVICE(w)
  VENDOR(w)
  CUUID(w)
  rAF(w)
  rIC(w)
  STRING(String.prototype)
  OBJECT(Object.prototype, Object)
  ARRAY(Array.prototype)
  NODE(Node.prototype)
  ELEMENT(Element.prototype)
  CSSSTYLEDECLARATION(CSSStyleDeclaration.prototype)
  DOCUMENT(d)
  FUNCTION(Function.prototype)
  DOMPARSER(DOMParser.prototype)
}
