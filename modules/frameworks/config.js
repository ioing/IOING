// 注释内容为进阶学习内容
export default {
    preload : function () {
    },
    resources : {
        script : {},
        source : {
            index : function () { return ''}  // 空的模版
        },
        style : {},
        data : {}
    },
    config : {
        index : "first-module",
        // system : false,             // 是否有系统级模块，如果有则创建模块 system
        // singleflow : false,         // 历史回退，没有前进，到达首页无回退
        // singlelocking : false,      // 根页面时锁定历史回退
        absolute : false,
        style : [],
        script : [],
        source : ["index"],
        data : [],
        sandbox : false,               // 主框架中 sandbox 和 shadowbox 一般设置为 false
        shadowbox : false,
        animation : 'slide'
    },
    // helper : {
    // },
    // filter : function (id, config) {
    // },
    // controller : {
    // }
}