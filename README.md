

## 第一步：sudo npm install -g ioing-cli  （全局安装 ioing）
## 第二部：ioi init （会车后？Template输入 ioing ，按照引导生成项目）
## 第三部：ioi build 或者 ioi dev （运行项目）









Brand new front-end engine
======================
![IOING logo](https://raw.githubusercontent.com/ioing/IOING/master/logo.png)

## Supported
<table>
 <thead>
  <tr>
   <td>IE</td>
   <td>Edge</td>
   <td>Firefox</td>
   <td>Chrome</td>
   <td>Safari</td>
  </tr>
 </thead>
 <tbody>
  <tr>
   <td>>=9</td>
   <td>>=14</td>
   <td>>=52</td>
   <td>>=49</td>
   <td>>=8</td>
  </tr>
 </tbody>
</table>

## HI!

This is a brand new front-end engine which is going to be released officially in this July.
Really grateful to meet you all here and bring the differences of experience to the community within IOING.
Continuous updating would be guaranteed of Docs and Website.

[DEMO](http://www.ioing.com/#discover-index)

## What is IOING?
IOING is not a simple front-end framework. 
As a second engine, it provides a complete solution of modularization, componentization, sandbox, memory management and pre loading of contents to improve the differences of HTML5 in comparison with the native App.

## What can it do？

### Module animation
animation = [type]
<table>
 <thead>
  <tr>
   <td>fade</td>
   <td>slide</td>
   <td>zoom</td>
   <td>flip</td>
  </tr>
 </thead>
 <tbody>
  <tr>
   <td><img src="https://github.com/ioing/IOING-docs/blob/master/ioing_src/preview/fade.gif?raw=true" width="200" /></td>
   <td><img src="https://github.com/ioing/IOING-docs/blob/master/ioing_src/preview/slide.gif?raw=true" width="200" /></td>
   <td><img src="https://github.com/ioing/IOING-docs/blob/master/ioing_src/preview/zoom.gif?raw=true" width="200" /></td>
   <td><img src="https://github.com/ioing/IOING-docs/blob/master/ioing_src/preview/flip.gif?raw=true" width="200" /></td>
  </tr>
 </tbody>
</table>

## Features of IOING
### Cloud Components
```html
<switch-slider src=http://www.ioing.com/components></switch-slider>
<switch-slider value=on></switch-slider>
```
### DOM Plus: Function Tag Development
```html
<scroll>
  <scrolling>
    <loop colorful as value key>
      <div style="color:{value}">{value}</div>
    </loop>
  </scrolling>
</scroll>
```
### Automatic Data Binding
```html
<p>{teacher.name} : Hello, what’you name!</p>
<p>{user.name} : my name is {user.name}</p>
<!-- wang : Hello, what’you name! -->
<!-- yangyang : my name is yangyang -->
```
### Sandbox
### Comparable Native App

  - Physical Pixel
  - Module Sandbox
  - Module Transition
  - Animation Thread Control
  - Infinite Page Scroll
  - Efficiency of DOM
  - Background Stream of Image
  - Height Adjustment of Virtual Keyboard
  - Cursor Position
  - Parameter Rolling
  - Module Mirroring
  - Route Control
  - Manipulation of multi-fingers
  - Asynchronous Components
  - Silent Refresh of Modules
  - Life Cycle of Resources
  - Life Cycle of Modules
  - Data-Driven View

## Documentation
To explore more examples and docs of IOING, please click to <http://www.ioing.com/#docs-started-ioing>

## Questions
Welcome to submit the issues on <https://github.com/ioing/IOING/issues>

## Stay In Touch
To learn the latest releases and announcements, welcome to follow the Wechat: ioingroot

## Folder Structure
The folder structure should look like


    --- frameworks(folder)
        --- lib(folder)
            --- application.js
            --- css.js
            --- dom.js
            --- fetch.js
            --- loader.js
            --- move.js
            --- promise.js
            --- proto.js
            --- query.js
            --- sandbox.js
            --- scroll.js
            --- template.js
            --- touch.js
            --- transform.js
            --- unify.js
    --- modules(folder)
    --- components(folder)
  

## License

[GPL](https://opensource.org/licenses/GPL-3.0)

Copyright (c) 2013-present, Linyang (Lien) You
