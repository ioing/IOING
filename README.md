<p align="center"><a href="https://ioing.com" target="_blank"><img width="320"src="https://github.com/ioing/IOING/blob/master/frameworks/static/iopic.jpeg?raw=true"></a></p>



# 面向未来的前端复引擎

### IOING 不是一个单纯的前端框架，而是提供了一套完整解决方案的次引擎，其包括解决模块化方案、组件化方案、沙盒方案、内存管理方案、内容预加载方案、与原生差异改善方案等一系列难题和应对方案，真正实现用 H5 技术构建大型 web 视图应用

# 媲美原生应用

## 为了让使用者感知到一个更棒的 WEB 应用，我们必须重视这些工作：

| 特性        | 描述           |
| ------------- |:-------------:|
| [物理像素](http://www.ioing.com/#docs-css-units/section/pixel)      | 脱离 viewport 限制，物理像素让应用显示更细致 |
| [模块转场](http://www.ioing.com/#docs-module-config/section/sandbox) | 内置多种模块转场过渡动画，也可自由定制动画 |
| [动画线程控制]() | 使用动画队列来提升动画性能 |
| [无限滚动]() | 统一滚动表现，循环利用 GPU 内存的滚动 |
| [DOM 性能]() | 结合 shandbox 和 shadowroot 来提升 DOM 性能 |
| [图片背景流]() | CSS 新增 onload 语法控制背景图显示时机 |
| [软键盘高度]() | 可获取软键盘谈起时的高度 |
| [光标位置]() | 可获取光标在输入框中的实际位置 |
| [滚动参数]() | 可对滚动的弹性或惯性等参数进行自定义配置 |
| [模块镜像]() | 使用该特性能够使不支持 "backdrop-filter" 的手机获得毛玻璃效果 |
| [路由控制]() | 按照模块等级以历史记录的方式进行单向回退，也可纯粹使用历史记录 |
| [多指操控]() | 支持 20+ 多指手势操控，操作体验更完整 |
| [异步组件]() | 异步载入组件，组件能够独立运作 |
| [模块静默刷新]() | 模块刷新时能够避免出现白屏和闪烁，且能保持阅读痕迹 |
| [资源生命周期]() | 模块的所有资源都可设置单独的有效生命周期 |
| [模块生命周期]() | 模块自身可设置有效生命周期 |
| [数据驱动视图]() | 通过数据绑定实现数据驱动视图，减少 query 的逻辑操作 |


## 云组件

### 开发者可自由对组件分装为文件，封装后可直接使用组件标签来使用该组件

```html
<range-slider value=50></range-slider>
<range-slider value=80 bubble></range-slider>
```

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2013-present, Linyang (Lien) You
