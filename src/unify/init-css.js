export const BASE_CSS = `
<style>* { margin : 0; padding : 0 } \n
    html, body { position: absolute; width: 100%; height: 100%; background: #fff; overflow: hidden } \n
    mask, view { position: absolute; width: 100%; height: 100%; overflow: hidden } \n
    module-container[type=module] { display: block; top: 0; right: 0; bottom: 0; left: 0; width: 100%; height: 100% } \n
    iframe[app=true] { width: 100%; height: 100%; border: 0 } \n
</style>
`

export const REST_CSS = `
* { box-sizing: border-box; margin : 0; padding : 0; text-size-adjust: 100%; tap-highlight-color: rgba(0, 0, 0, 0) } \n
html { font-size: 1vw; overscroll-behavior: none } \n
body { font-size: 12dp } \n
html, body { position: absolute; width: 100%; height: 100%; overflow: hidden } \n
a { text-decoration: none } \n
*[href], *[transform], *[on-tap] { cursor: pointer } \n
button { background-color: transparent; border: 0; outline: 0 } \n
input, textarea, htmlarea { user-select: initial; touch-callout: initial; border: 0; outline: 0; appearance: none } \n
htmlarea { display: inline-block; text-rendering: auto; letter-spacing: normal; word-spacing: normal; text-indent: 0px; text-align: start; font: initial } \n
article, aside, details, figcaption, figure, footer, header, hgroup, menu, nav, section { display: block } \n
ol, ul { list-style: none } \n
table { border-collapse: collapse; border-spacing: 0 } \n

shadow-root { font-size: 12dp } \n

scroll, scrolling, scrollbar, indicator { display: block; box-sizing: border-box } \n
scroll { position: relative; padding: 0; border: 0; overflow: hidden } \n
scroll[fullscreen] { position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 2 } \n
scroll > scrolling, scroll > scrolling > infinite { display: block; position: absolute; z-index: 2; backface-visibility: hidden } \n
scroll > scrolling { min-width: 100%; min-height: 100% } \n
scroll[y=false] > scrolling { position: relative; display: table } \n
scroll > scrolling > infinite { top: 0; left: 0; width: 100% } \n
scroll > scrolling > infinite > fragment { display: block; position: relative; z-index: 2; width: 100% } \n
scroll > scrollbar { position: absolute; z-index: 9999; border-radius: 3dp; overflow: hidden } \n
scroll > scrollbar > indicator { position: absolute; z-index: 9; border-radius: 3dp; background: rgba(0, 0, 0, 0.4) } \n

pullup, pullright, pulldown, pullleft { display: block; position: absolute; z-index: 9999; text-align: center } \n
pullup { bottom: 0; width: 100% } \n
pulldown { top: 0; width: 100% } \n
pullright { left: 0; height: 100% } \n
pullleft { right: 0; height: 100% } \n
pullstart, pulling, pullend, pullover { display: none } \n
pullup[pullstart] pullstart, pullright[pullstart] pullstart, pulldown[pullstart] pullstart, pullleft[pullstart] pullstart { display: block } \n
pullup[pulling] pulling, pullright[pulling] pulling, pulldown[pulling] pulling, pullleft[pulling] pulling { display: block } \n
pullup[pullend] pullend, pullright[pullend] pullend, pulldown[pullend] pullend, pullleft[pullend] pullend { display: block } \n
pullup[pullover] pullover, pullright[pullover] pullover, pulldown[pullover] pullover, pullleft[pullover] pullover { display: block } \n

relative-windows, absolute-windows { position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 10000; width: 100%; height: 100%; overflow: hidden } \n
`
