export const NODE = function(proto) {
  // observer

  proto.extendProperty("observer", function(options, callback) {
    var MutationObserver = window.MutationObserver

    /**
     * @param {Object} options
     * @param {Function} callback
     * 元素attr change 监听
     * childList：子元素的变动。
     * attributes：属性的变动。
     * characterData：节点内容或节点文本的变动。
     * subtree：所有下属节点（包括子节点和子节点的子节点）的变动。
     */

    var options = options || {
      attributes: true,
      childList: true,
      characterData: true,
      attributeOldValue: true,
      attributeFilter: ["id", "class", "style", "src", "width", "height"]
    }

    try {
      if (MutationObserver) {
        new MutationObserver(function(record) {
          callback(record)
        }).observe(this, options)
      } else {
        var queue = [],
          eventName = []

        if (options) {
          options.each(function(key, on) {
            switch (key) {
              case 'attributes':
                on && eventName.push("DOMAttrModified")
                break;
              case 'childList':
                on && eventName.push("DOMNodeInserted")
                on && eventName.push("DOMNodeRemoved")
                break
              case 'characterData':
                on && eventName.push("DOMCharacterDataModified")
                break;
              case 'subtree':
                on && eventName.push("DOMNodeInserted")
                on && eventName.push("DOMNodeRemoved")
                on && eventName.push("DOMNodeInsertedIntoDocument")
                on && eventName.push("DOMNodeRemovedFromDocument")
                break
            }
          })

          if (eventName.length == 8) {
            eventName = "DOMSubtreeModified"
          } else {
            eventName = eventName.join(' ')
          }
        } else {
          eventName = "DOMSubtreeModified"
        }

        this.bind(eventName, function(e) {
          if (queue.length == 0) {
            setTimeout(function() {
              callback([].concat(queue))
              queue = []
            }, 0)
          }

          queue.push(e)
        })
      }
    } catch (e) {}
  })
}
