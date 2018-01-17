export const DOMPARSER = function(proto) {
  proto.extendProperty("parseFromStringToNode", (function() {
    var DOMParser_proto = proto
    var real_parseFromString = DOMParser_proto.parseFromString

    // Firefox/Opera/IE throw errors on unsupported types

    try {

      // WebKit returns null on unsupported types

      if ((new DOMParser).parseFromString("", "text/html")) {

        // text/html parsing is natively supported
        var isParseHtmlFromString = true
      }

    } catch (ex) {}

    return function(markup, type) {

      switch (type) {
        case 'text/html':
          var doc
          var body

          if (isParseHtmlFromString) {
            doc = real_parseFromString.apply(this, arguments)

            try {
              body = doc.body
            } catch (e) {}
          }

          if (!body) {

            doc = document.implementation.createHTMLDocument("")

            if (markup.toLowerCase().indexOf('<!doctype') > -1) {
              doc.documentElement.innerHTML = markup
            } else {

              try {
                body = doc.body
              } catch (e) {}

              // android parseFromString then body is not definde

              if (!body) {
                doc.documentElement.innerHTML = markup

                var node
                var nodes = document.createNodeIterator(doc.documentElement, NodeFilter.SHOW_ALL, null, false)

                while (node = nodes.nextNode()) {
                  if (node.nodeName === 'BODY') {
                    break
                  }
                }

                nodes.body = node

                doc = nodes
              } else {
                doc.body.innerHTML = markup
              }

            }
          }

          return doc

          break

        default:
          return real_parseFromString.apply(this, arguments)

          break
      }
    }

  })())
}
