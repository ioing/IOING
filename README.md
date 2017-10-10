
Brand new front-end engine
======================
![IOING logo](https://raw.githubusercontent.com/ioing/IOING/master/logo.png)

## 支持
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

这是一个全新的前端引擎，并即将在七月份正式上线。很高兴能在此遇到大家，并由此体验到 IOING 所带来的不同。文档持续更新，网站内容将不断丰富。
 
> This is a brand new front-end engine which is going to be released officially in this July.
Really grateful to meet you all here and bring the differences of experience to the community within IOING.
Continuous updating would be guaranteed of Docs and Website.

[DEMO](http://www.ioing.com/#components-store)

## What is IOING?
IOING 是一款高性能的前端开发引擎。它为创建一个大型应用提供一整套的完备方案，如页面模块化拆分、层级路由控制、可编程CSS、热拔插组件、双向数据绑定、DOM语法扩展、自动兼容处理等

> IOING is not a simple front-end framework. 
As a second engine, it provides a complete solution of modularization, componentization, sandbox, memory management and pre loading of contents to improve the differences of HTML5 in comparison with the native App.

## What can it do？

### Module animation
为模块配置 animation = [type]
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
- 云组件 Cloud Components
```html
<switch-slider src=http://www.ioing.com/components></switch-slider>
<switch-slider value=on></switch-slider>
```
- DOM+：功能标签扩展 DOM Plus: Function Tag Development
```html
<scroll>
  <scrolling>
    <loop colorful as value key>
      <div style="color:{value}">{value}</div>
    </loop>
  </scrolling>
</scroll>
```
- 自动数据绑定 Automatic Data Binding
```html
<p>{teacher.name} : Hello, what’you name!</p>
<p>{user.name} : my name is {user.name}</p>
<!-- wang : Hello, what’you name! -->
<!-- yangyang : my name is yangyang -->
```
- 沙盒技术 Sandbox
- 媲美原生应用 Comparable Native App

  - *物理像素 Physical Pixel*
  - *模块沙盒 Module Sandbox*
  - *模块转场 Module Transition*
  - *动画线程控制 Animation Thread Control*
  - *无限滚动 Infinite Page Scroll*
  - *DOM 性能 Efficiency of DOM*
  - *图片背景流 Background Stream of Image*
  - *软键盘高度 Height Adjustment of Virtual Keyboard*
  - *光标位置 Cursor Position*
  - *滚动参数 Parameter Rolling*
  - *模块镜像 Module Mirroring*
  - *路由控制 Route Control*
  - *多指操控 Manipulation of multi-fingers*
  - *异步组件 Asynchronous Components*
  - *模块静默刷新 Silent Refresh of Modules*
  - *资源生命周期 Life Cycle of Resources*
  - *模块生命周期 Life Cycle of Modules*
  - *数据驱动视图 Data-Driven View*

## Documentation
想要了解更多 IOING 实例和文档？请点击：<http://www.ioing.com/#docs-started-ioing>

> To explore more examples and docs of IOING, please click to <http://www.ioing.com/#docs-started-ioing>

## Questions
欢迎提交 issues 至<https://github.com/ioing/IOING/issues>

> Welcome to submit the issues on <https://github.com/ioing/IOING/issues>

## Stay In Touch
关于 IOING 的近况，我们可以通过微信深度讨论。我的微信是：ioingroot

> To learn the latest releases and announcements, welcome to follow the Wechat: ioingroot

## Folder Structure
文件夹结构如下

> The folder structure should look like


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
    
    
            
## Library referred in IOING
该项目中有使用/借鉴修改以下仓库，对这些仓库表示感谢

> Thanks for these libraries to provide helpful and reliable references for IOING

1. 转动的 canvas 菊花 loader.js : [CanvasLoader.js](https://github.com/heartcode/CanvasLoader)
2. 选择器 query.js : [jquery.js](https://github.com/jquery/jquery)
3. 多手势库 touch.js : [hammer.js](https://github.com/hammerjs/hammer.js)
4. 动画库 move.js (80%) : [move.js](https://github.com/visionmedia/move.js)
5. 滚动库 iscroll.js (60%) : [iscroll.js](https://github.com/cubiq/iscroll)
  

## License

[GPL](https://opensource.org/licenses/GPL-3.0)

Copyright (c) 2013-present, Linyang (Lien) You
