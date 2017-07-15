define([], function (require, module, exports) {
    
    module.exports = {
        preload : function () {
        },
        resources : {
            script : {
            },
            source : {
                index : "index.html",
                nav : "nav.html",
                footer : "footer.html"
            },
            style : {
                global : function (param, callback) {
                    callback('@global {'
                        + 'header-height : 50dp;'
                        + 'footer-height : 50dp;'
                        + 'aside-width : 300dp;'
                        + 'article-width : 586dp;'
                        + 'active-color: [scope.setting.theme.color];'
                        + 'main-background: [scope.setting.theme.background];'
                        + 'main-background-size: [scope.setting.theme.backgroundSize || "cover"];'
                        + 'max-width: 923dp;'
                    + '}')
                },
                common : "css/common.css",
                main : "css/main.css",
                docs : "css/docs.css"
            },
            data : {
                setting : {
                    articleWidth : 559,
                    status : {
                        showMoreNav : false,
                        showMenuBtn : device.ui.width < 923 ? false : true,
                        showDocsNav : device.ui.width < 923 ? false : true,
                        activeMainNav : null,
                        activeSubNav : null,
                        showAside : false,
                        exists : App.exists
                    },
                    theme : (function () {
                        var theme = [
                                {
                                    color: '#ff5252',
                                    background: '#ff5252'
                                },
                                {
                                    color: '#ff5252',
                                    background: '#f1f1f1'
                                },
                                {
                                    color: '#00bc9c',
                                    background: '#00bc9c'
                                },
                                {
                                    color: '#ff7752',
                                    background: '#ff7752'
                                },
                                {
                                    color: '#42b983',
                                    background: '#42b983'
                                },
                                // {
                                //     color: '#ab5115',
                                //     background: '#403e28 url(bg/4.jpg) no-repeat 50% 50%;'
                                // },
                                // {
                                //     color: '#e24b1e',
                                //     background: '#27272b url(bg/5.jpg) no-repeat 50% 50%;'
                                // },
                                // {
                                //     color: '#9cc12a',
                                //     background: '#9cc12a url(bg/7.jpg) no-repeat 50% 50%;'
                                // },
                                // {
                                //     color: '#fc8554',
                                //     background: '#fc8554 url(bg/8.png) no-repeat 80% 0;',
                                //     backgroundSize: '"contain"'
                                // },
                                // {
                                //     color: '#8bc34a',
                                //     background: '#dae2da url(bg/11.png) no-repeat 80% 50%;',
                                //     backgroundSize: '"contain"'
                                // },
                                // {
                                //     color: '#565767',
                                //     background: '#565767 url(bg/12.jpg) no-repeat 50% 50%;',
                                // },
                                // {
                                //     color: '#366988',
                                //     background: '#366988 url(bg/13.jpg) no-repeat 50% 50%;',
                                // },
                                // {
                                //     color: '#a96539',
                                //     background: '#a96539'
                                // },
                                {
                                    color: '#43d297',
                                    background: '#f1f1f1'
                                }
                            ]


                        var i = 0

                        try {
                            i = sessionStorage.getItem('_theme') || -1
                            i++
                            if ( i >= theme.length - 1 ) i = 0
                            sessionStorage.setItem('_theme', i)
                        } catch (e) {}

                        if ( i > 1 ) {
                            theme = theme.sort(function(){ return 0.5 - Math.random() })
                        }

                        // if ( Math.random() > 0.7 ) {
                        //     theme[i].background = '#fff'
                        // }

                        return theme[i]
                    })()
                },
                nav : [
                    {   
                        id : "started",
                        title : "Get started",
                        desc : "开始掌握 IOING",
                        list : [
                            { 
                                title : "IOING 是什么？" , 
                                href : "docs-started-ioing", 
                                keys : [
                                    '了解IOING',
                                    '现在开始掌握'
                                ] 
                            },
                            { 
                                title : "工作原理" , 
                                href : "docs-started-prototype" ,
                                keys :[
                                    '工作原理',
                                    '原型图'
                                ] 
                            },
                            { 
                                title : "开始上手" , 
                                href : "docs-started-step" ,
                                keys :[
                                    '开始上手-创建一个模块'
                                ] 
                            }
                        ]
                    },
                    {   
                        id : "module",
                        title : "Module",
                        desc : "建立模块及配置模块",
                        list : [
                            { 
                                title : "类型" , 
                                href : "docs-module-type" ,
                                keys : [
                                    "注册类型"
                                ] 
                            },
                            { 
                                title : "路由" , 
                                href : "docs-module-route" ,
                                keys : [
                                    "注册路由"
                                ] 
                            },
                            { 
                                title : "config.js" , 
                                href : "docs-module-register" ,
                                keys : [
                                    "注册模块"
                                ] 
                            },
                            { 
                                title : "资源库/引用规则" , 
                                href : "docs-module-resources" ,
                                keys : [
                                    "资源库",
                                    "资源配置",
                                    "URI 资源引用规则",
                                    "资源引用类型",
                                    "URL 解析规则",
                                    ""
                                ]
                            },
                            { 
                                title : "资源" , 
                                href : "docs-module-source",
                                keys : [
                                    "资源引用",
                                    "配置引用模版",
                                    "配置引用数据",
                                    "配置引用JS",
                                    "配置引用CSS"
                                ]
                            },
                            { 
                                title : "特性" , 
                                href : "docs-module-config" ,
                                keys : [
                                    "模块特性",
                                    "sandbox",
                                    "沙盒特性",
                                    "shandowbox",
                                    "影子特性"
                                ]
                            },
                            { 
                                title : "事件项" , 
                                href : "docs-module-event" ,
                                keys : [
                                    "模块事件"
                                ]
                            }
                        ]
                    },
                    {   
                        id : "css",
                        title : "CSS",
                        desc : "基于 CSS3 新增语法",
                        list : [
                            { 
                                title : "变量", 
                                href: "docs-css-scope" ,
                                keys : [
                                    "变量"
                                ]
                            },
                            { 
                                title : "书写标准", 
                                href: "docs-css-common"
                            },
                            { 
                                title : "单位/运算", 
                                href: "docs-css-units" 
                            },
                            { 
                                title : "var", 
                                href: "docs-css-var" 
                            },
                            { 
                                title : "global", 
                                href: "docs-css-global" 
                            },
                            { 
                                title : "section", 
                                href: "docs-css-section" 
                            },
                            { 
                                title : "if", 
                                href: "docs-css-if" 
                            },
                            { 
                                title : "class", 
                                href: "docs-css-class" 
                            },
                            { 
                                title : "extend", 
                                href: "docs-css-extend" 
                            }
                        ]
                    },
                    {
                        id : "dom",
                        title : "DOM",
                        desc : "基于 HTML5 新增标签及特性",
                        list : [
                            { 
                                title : "{data} 数据绑定和输出" , 
                                href : "docs-dom-echo" 
                            },
                            { 
                                title : "if / else / elseif" , 
                                href : "docs-dom-if" 
                            },
                            { 
                                title : "switch / case" , 
                                href : "docs-dom-switch" 
                            },
                            { 
                                title : "loop" , 
                                href : "docs-dom-loop" 
                            },
                            { 
                                title : "style" , 
                                href : "docs-dom-style" 
                            },
                            { 
                                title : "script" , 
                                href : "docs-dom-script" 
                            },
                            { 
                                title : "commit" , 
                                href : "docs-dom-commit" 
                            },
                            { 
                                title : "include" , 
                                href : "docs-dom-include" 
                            },
                            { 
                                title : "scroll" , 
                                href : "docs-dom-scroll" 
                            },
                            { 
                                title : "shadow" , 
                                href : "docs-dom-shadow" 
                            },
                            { 
                                title : "input / textarea/ htmlarea" , 
                                href : "docs-dom-input" 
                            },
                            { 
                                title : "pullup / pulldown / pullright / pullleft" , 
                                href : "docs-dom-pulling" 
                            },
                            { 
                                title : "var" , 
                                href : "docs-dom-var" 
                            },
                            { 
                                title : "template" , 
                                href : "docs-dom-template" 
                            }
                        ]
                    },
                    {
                        id : "attr",
                        title : "Attr",
                        desc : "新增基准的 Attr 特性",
                        list : [
                            { 
                                title : "on" , 
                                href : "docs-attr-on" 
                            },
                            { 
                                title : "id/uuid" , 
                                href : "docs-attr-uuid" 
                            },
                            { 
                                title : "transform" , 
                                href : "docs-attr-transform" 
                            },
                            { 
                                title : "href" , 
                                href : "docs-attr-href" 
                            },
                            { 
                                title : "src/path/..." , 
                                href : "docs-attr-src" 
                            },
                            { 
                                title : "toggle-class" , 
                                href : "docs-attr-toggle-class" 
                            },
                            { 
                                title : "tap-highlight" , 
                                href : "docs-attr-tap-highlight" 
                            }
                        ]
                    },
                    {
                        id : "api",
                        title : "API",
                        desc : "基于 javascript es5 新增 API",
                        list : [
                            { 
                                title : "String" , 
                                href : "docs-api-string" 
                            },
                            { 
                                title : "Object" , 
                                href : "docs-api-object" 
                            },
                            { 
                                title : "Array" , 
                                href : "docs-api-array" 
                            },
                            { 
                                title : "Node" , 
                                href : "docs-api-node" 
                            },
                            { 
                                title : "Element : Query" , 
                                href : "docs-api-element-query" 
                            },
                            { 
                                title : "Element : Move" , 
                                href : "docs-api-element-Move" 
                            }
                        ]
                    },
                    {
                        id : "components",
                        title : "Components",
                        desc : "组件化与组件开发",
                        list : [
                            { 
                                title : "标签式引入" , 
                                href : "docs-components-tags" 
                            },
                            { 
                                title : "组件文件" , 
                                href : "docs-components-files" 
                            },
                            { 
                                title : "数据" , 
                                href : "docs-components-data" 
                            },
                            { 
                                title : "特性" , 
                                href : "docs-components-props" 
                            }
                        ]
                    }
                ],
                keys: function () {
                    var nav = this.resources.data.nav
                    var keys = []

                    nav.each(function (key, value) {
                        var list = [].concat(value.list)
                        keys.push(list.sort(function(){ return 0.5 - Math.random() }))
                    })

                    keys.sort(function(){ return 0.5 - Math.random() })

                    return keys
                },
                comp: function () {
                    var comp = [
                        "demo/banner-slider",
                        "demo/photo-tilt",
                        "demo/scroll-to-top",
                        "demo/date-picker",
                        "demo/range-slider",
                        "demo/code-light",
                        "demo/alert-dialog",
                        "demo/switch-slider"
                    ]
                    comp = comp.sort(function(){ return 0.5 - Math.random() })
                    comp = comp.slice(0, 3)

                    return comp
                }
            }
        },
        config : {
            index : "docs-started-ioing",
            singleflow : false, // 历史归类，没有前进，到达首页无回退
            absolute : false,
            style : ["global", "common", "main"],
            script : [],
            source : ["index", "nav"],
            data : ["setting", "nav", "keys", "comp"],
            sandbox : false,
            shadowbox : false,
            animation : 'slide'
        },
        helper : {
            activeMainNav : function (nav, id, t, f) {
                t = t || 'active'
                f = f || ''

                return nav == id ? t : f
            },
            activeSubNav : function (nav, value) {
                nav = nav || ''
                value = typeof value == 'object' ? value.href : value

                return nav.indexOf(value) == 0 ? 'active' : ''
            },
            showAsideNav : function (id, sid) {
                id = (id || '').split('-')[0]
                sid = (sid || '').split(',')
                
                return sid.indexOf(id) !== -1 ? 'visible' : 'hidden'
            },
            currentNavSection : function (key, nav) {
                return key == 0 ? 'sup' : key == nav.length - 1 ? 'sub' : 'sub sup'
            },
            cpath: function (v) {
                v = typeof v == "string" ? v : ''
                return v.indexOf('/') > 0 ? '/' + v : '../../components/' + v
            }
        },
        filter : function (id, config) {
            config.mirroring = false
        },
        controller : {
        }
    }
})