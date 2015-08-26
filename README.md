#IOING. Frameworks introduction
IOING. Frameworks Is the world's most advanced mobile application development framework open source HTML5,It helps developers to use HTML, CSS and Javascript as the core language quickly build applications,It proposes a new development model, which can make your development experience becomes more simple, if you advance into the era HTML6,The most important is that it has very excellent performance, comparable to a real native applications even beyond native application.

##Features
<ul class="list">
    <li><a href="http://www.ioing.com/?id=module#module-config">Modular Development</a></li>
    <li><a href="http://www.ioing.com/?id=module#module-config-creat-config-sandbox">Module sandboxed : sandbox, shadowRoot, embed</a></li>
    <li><a href="http://www.ioing.com/?id=css#clever-css">Clever CSS Advanced syntax expand</a></li>
    <li><a href="http://www.ioing.com/?id=dom#parallel-dom">Parallel DOM Advanced syntax expand</a></li>
    <li><a href="http://www.ioing.com/?id=dom#dom-tag-scroll">List-based GPU-accelerated large high-performance memory controller to scroll</a></li>
    <li><a href="http://www.ioing.com/?id=dom#dom-components">Asynchronous component to expand</a></li>
    <li>Frosted glass effect to achieve real-time dynamic HTML5 framework <a href="http://www.ioing.com/?id=module#module-config-creat-config-mirroring">ios blur header</a></li>
</ul>




#IOING. Frameworks 简介

IOING. Frameworks 是全球最先进的HTML5开源移动应用程序开发框架之一，它可以帮助开发者使用HTML、CSS 和Javascript做为核心语言快速搭建应用程序。它提出一套全新的开发模式，这能让你的开发体验变的更简，仿佛提前把你带入HTML6时代。最重要的是它拥有无比出色的性能，真正的媲美原生应用甚至超越原生应用。

##特点
<ul class="list">
    <li><a href="http://www.ioing.com/?id=module#module-config">模块化开发</a></li>
    <li><a href="http://www.ioing.com/?id=module#module-config-creat-config-sandbox">模块沙箱化 : 三种隔离机制(sandbox, shadowRoot, embed)</a></li>
    <li><a href="http://www.ioing.com/?id=css#clever-css">Clever CSS 高级语法拓展</a></li>
    <li><a href="http://www.ioing.com/?id=dom#parallel-dom">Parallel DOM 高级语法拓展</a></li>
    <li><a href="http://www.ioing.com/?id=dom#dom-tag-scroll">基于GPU加速的大List内存控制高性能滚动</a></li>
    <li><a href="http://www.ioing.com/?id=dom#dom-components">异步组件拓展 Web Components 及高级组件开发与管理</a></li>
    <li>全球唯一实现实时动态毛玻璃效果的HTML5框架 <a href="http://www.ioing.com/?id=module#module-config-creat-config-mirroring">实时动态毛玻璃 blur header</a></li>
</ul>

##原理详解
<img src="http://www.ioing.com/static/img/start/principle.png">

<p>上图为框架的简化原理图，从右向左是整个视图呈现的基本过程，它们依次为 资源加载－编译CSS和编译DOM－沙箱化－镜像，<a href="?id=module#module-config-creat-resources">资源载入</a>让模块间资源引用变的简单，同时方便维护管理，<a href="?id=css#clever-css">Clever CSS</a> 让CSS变的灵活，你可以使用全新的CSS语法而不必要考虑它的兼容问题，<a href="?id=dom#parallel-dom">Parallel DOM</a> 让HTML标签变的更强大，你可以使用新的HTML语法来构建你的应用。 </p>

###打破传统开发模式
<p>传统的开发模式在面对多人应用开发上不能有效的规范和管理项目，因此开发者需要一个创新的开发模式，能够有效的规范开发流程，有一套能够自动规避耦合性问题的体系方案。</p>

###传统页面切换的弊端
<p>传统使用url跳转的方式切换页面时浏览器在跳转的过程中会失去当前页面所有的DOM结构、样式、状态、存储变量等，且在页面呈现上也不能进行过渡动画的处理，由于DOM的重建也会出现瞬间的白屏画面。</p>

###关于重设viewport
<p>viewport的初衷是为了解决web页面在手机中的呈现问题，而页也带来了一些问题(参考：“<a href="http://www.ioing.com/?id=css#css-unit">为什么要支持dp？</a>”)，viewport的存在让高dpi的设备无法显示真实的一像素值，让线条看起来变的粗糙了，尤其在当下ios发际线效果(UINavigationBar 1px bottom line)很流行时却让viewport的存在变的尤其尴尬。</p>

###关于滚动控件scrollView
<p>区域滚动到现在依旧是移动端设备上浏览器的先天硬伤，目前多数移动设备浏览器对此支持仍不理想，甚至很多设备的浏览器还不支持区域滚动，或部分支持但内容过多时性能也会急剧下降，且不支持弹性、事件、惯性、加速度等特性。面对区域滚动的问题重重，body上的默认滚动也并不理想，虽然body上的滚动性能良好，但是面对大列表视图依然能力有限，同时由于其只存在于body上的特殊性导致其难以实现复杂的应用结构，因而需要更智能的滚动控件来代替(<a href="http://www.ioing.com/?id=dom#dom-tag-scroll">了解滚动控件</a>)。</p>

##快速入门
<p>让开发变的简单是IOING.不变的信念，根据下面指导能让你在短时间内快速掌握。</p>
###学习步骤
<ul class="list">
    <li>了解框架的<a href="http://www.ioing.com/?id=getStart#get-start-why">基本原理</a></li>
    <li>从Demo入手，深入实践，学习<a href="http://www.ioing.com/?id=module#module-config-creat">创建模块</a></li>
    <li>参照文档尝试书写<a href="http://www.ioing.com/?id=css#clever-css">Clever CSS</a></li>
    <li>参照文档尝试使用<a href="http://www.ioing.com/?id=dom#parallel-dom">Parallel DOM</a></li>
    <li>学习使用<a href="http://www.ioing.com/?id=dom#dom-tag-scroll">滚动控件</a>来构建页面</li>
    <li>学习使用<a href="http://www.ioing.com/?id=dom#dom-components">Web Components</a></li>
</ul>

###准备
<p>下载并解压缩到电脑。</p>
###创建模块目录
<p>解压后可以看到 <kbd>index.html</kbd> <kbd>frameworks</kbd> <kbd>modules</kbd> <kbd>components</kbd> 等几个文件，接下来打开 <kbd>modules</kbd> 文件夹，会发现里面包含一个预置的模块：<kbd>frameworks</kbd> 即主视图模块 </p>
<p>在 <kbd>modules</kbd> 文件夹中新建一个命名为 <kbd>demo</kbd> 的文件夹，<kbd>demo</kbd> 就是一个新的模块目录了。</p>
###创建模块配置
<p>在 <kbd>demo</kbd> 模块文件夹下创建一个 <kbd>config.js</kbd> 的空javascript文件，将下面的配置复制后粘贴进入后保存。</p>
```javascript
define({
  resources : {
    source: {
      test: "index.html",
    },
    layout: {
      common: "frameworks::common",
      main: "main.css"
    },
    data: {
      hello: {
        "text" : "Hello world"
      }
    }
  },
  config : {
    complex: true,
    layout : ["common", "main"],
    source: ["test"],
    data : ["home"],
    sandbox : true,
    mirroring: {
      clip: [60,0,60,0]
    }
  }
})
```
###创建模块HTML模版
<p>在 <kbd>demo</kbd> 模块文件夹下创建一个 <kbd>index.html</kbd> 的空html文件，将下面的模版代码复制后粘贴进入后保存。</p>
```html
<h1>
	输出name：{{hello.text}}
</h1>
```
###创建模块CSS模版
```css
body {
	color: blue;
}
```
<p>了解更多关于<a href="http://www.ioing.com/?id=css#clever-css"> Clever CSS语法拓展的用法</a>。</p>

###注册默认模块
<p>打开<kbd>frameworks</kbd>模块文件夹中的<kbd>config.js</kbd>把config中的 'index' 属性改为模块名，如下示例：</p>
```javascript
define({
  resources : {
    script: {
    },
    source: {
      index: "index.html"
    },
    style: {
      common: "css/common.css",
      main: "css/main.css"
    },
    data: {
      lang: "./lang/zh-CN.json"
    }
  },
  config : {
    index : "test",	//设定默认模块为test模块
    style : ["common", "main"],
    script :[],
    source: ["index"],
    data : ["lang"],
    iframe : false,
    update : false
  }
})
```
###恭喜完成！
<p>请打开你的 "web server" 服务，比如"http://localhost/你的项目目录"，到此一个简单的webapp demo就完成了，更多使用方法请详细阅读文档。</p>

##关于性能
<p>性能问题分为两个方面，以webGL或canvas绘图为主的应用主要性能问题可能是javascript运算速度，而对于以DOM结构为主的应用的性能问题多数都是和视图重绘以及内存不足有关。</p>
<p>HTML能够形象的创建视图，同时它也需要一个强大聪明的大脑，这就是浏览器复杂的解释过程，这个过程比起其它语言的视图解释都要复杂得多，因此不是HTML不够快，而是很多时候我们被强大的解释器惯坏了，使用了不合理的布局方案。</p>
<p>关于如何提升性能框架给出了沙箱以及<a href="http://www.ioing.com/?id=dom#dom-tag-scroll">无限滚动</a>的解决方案，但开发在开发过程中依旧应该注意合理使用布局以及CSS3动画，更多提升性能的开发注意事项可查看社区专栏。</p>

##关于发布
<p>IOING.Framework并不包含打包工具，开发者可根据使用自己熟悉的打包工具进行封装。</p>
<p>封装也可以分为两种方案，一种方案是将所有文件放在服务器，客户端需要一个等待主界面，需要增加appcache文件支持，程序只需要第一次从服务器载入以后可以进行离线访问，同时也方便日后直接在服务端对软件直接升级，第二种方案是将所有应用代码直接打到包中，直接访问内部链接(由于phoneGap等都会去除程序跨域限制，不需要考虑跨域问题)。</p>
<p>尽管IOING.Framework 的性能卓越，但速度是没有上限的，对于低版本浏览器推荐使用打包chrome核心的方法，能提高至少一倍的速度体验。</p>
