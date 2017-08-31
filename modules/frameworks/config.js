export default {
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
                                background: '#ff5252 onload(opacity:1) url({id})'
                            },
                            {
                                color: '#00bc9c',
                                background: '#00bc9c onload(opacity:1) url({id})'
                            },
                            {
                                color: '#ff7752',
                                background: '#ff7752 onload(opacity:1) url({id})'
                            },
                            {
                                color: '#43d297',
                                background: '#43d297 onload(opacity:1) url({id})'
                            }
                        ]


                    var i = 0
                    var earth = [5310,6356,6160,6293,5044,5181,6161,2056,1494,5957,1199,1056,2284,6578,6543,1212]

                    try {
                        i = sessionStorage.getItem('_theme') || -1
                        i++
                        if ( i >= theme.length - 1 ) i = 0
                        sessionStorage.setItem('_theme', i)
                    } catch (e) {}

                    if ( i > 1 ) {
                        theme = theme.sort(function(){ return 0.5 - Math.random() })
                    }
                    earth = earth.sort(function(){ return 0.5 - Math.random() })
                    theme[i].background = theme[i].background.replace('{id}', 'https://www.gstatic.com/prettyearth/assets/full/' + earth[i] + '.jpg')

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
                            title : "快速上手" , 
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
                                "变量",
                                "CSS变量"
                            ]
                        },
                        { 
                            title : "书写标准", 
                            href: "docs-css-common" ,
                            keys : [
                                "书写标准",
                                "CSS书写标准"
                            ]
                        },
                        { 
                            title : "单位/运算", 
                            href: "docs-css-units" ,
                            keys : [
                                "单位/运算"
                            ]
                        },
                        { 
                            title : "onload url()", 
                            href: "docs-css-background-onload" ,
                            keys : [
                                "onload url()",
                                "背景图加载完毕显示"
                            ]
                        },
                        { 
                            title : "@var", 
                            href: "docs-css-var" ,
                            keys : [
                                "@var",
                                "定义变量"
                            ]
                        },
                        { 
                            title : "@global", 
                            href: "docs-css-global" ,
                            keys : [
                                "@global",
                                "定义全局变量"
                            ]
                        },
                        { 
                            title : "@section", 
                            href: "docs-css-section" ,
                            keys : [
                                "@section",
                                "作用区块"
                            ]
                        },
                        { 
                            title : "@if", 
                            href: "docs-css-if" ,
                            keys : [
                                "@if",
                                "逻辑语句"
                            ]
                        },
                        { 
                            title : "@class", 
                            href: "docs-css-class" ,
                            keys : [
                                "@class",
                                "CSS 原型类"
                            ]
                        },
                        { 
                            title : "@extend", 
                            href: "docs-css-extend" ,
                            keys : [
                                "@extend",
                                "继承"
                            ]
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
                            href : "docs-dom-echo" ,
                            keys : [
                                "{data} 数据绑定和输出"
                            ]
                        },
                        { 
                            title : "if / else / elseif" , 
                            href : "docs-dom-if" ,
                            keys : [
                                "if",
                                "else", 
                                "elseif"
                            ]
                        },
                        { 
                            title : "switch / case" , 
                            href : "docs-dom-switch" ,
                            keys : [
                                "switch",
                                "case"
                            ] 
                        },
                        { 
                            title : "loop" , 
                            href : "docs-dom-loop" ,
                            keys : [
                                "loop"
                            ] 
                        },
                        { 
                            title : "style" , 
                            href : "docs-dom-style" ,
                            keys : [
                                "style"
                            ] 
                        },
                        { 
                            title : "script" , 
                            href : "docs-dom-script" ,
                            keys : [
                                "script"
                            ] 
                        },
                        { 
                            title : "commit" , 
                            href : "docs-dom-commit" ,
                            keys : [
                                "commit"
                            ] 
                        },
                        { 
                            title : "include" , 
                            href : "docs-dom-include" ,
                            keys : [
                                "include"
                            ] 
                        },
                        { 
                            title : "scroll" , 
                            href : "docs-dom-scroll" ,
                            keys : [
                                "scroll"
                            ] 
                        },
                        { 
                            title : "shadow" , 
                            href : "docs-dom-shadow" ,
                            keys : [
                                "shadow"
                            ] 
                        },
                        { 
                            title : "input / textarea/ htmlarea" , 
                            href : "docs-dom-input" ,
                            keys : [
                                "input",
                                "textarea",
                                "htmlarea"
                            ] 
                        },
                        { 
                            title : "pullup / pulldown / pullright / pullleft" , 
                            href : "docs-dom-pulling" ,
                            keys : [
                                "pullup",
                                "pulldown",
                                "pullright",
                                "pullleft"
                            ] 
                        },
                        { 
                            title : "template" , 
                            href : "docs-dom-template" ,
                            keys : [
                                "template"
                            ] 
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
                            href : "docs-attr-on" ,
                            keys : [
                                "on-"
                            ] 
                        },
                        { 
                            title : "id/uuid" , 
                            href : "docs-attr-uuid" ,
                            keys : [
                                "id",
                                "uuid"
                            ] 
                        },
                        { 
                            title : "transform" , 
                            href : "docs-attr-transform" ,
                            keys : [
                                "transform"
                            ] 
                        },
                        { 
                            title : "href" , 
                            href : "docs-attr-href" ,
                            keys : [
                                "href"
                            ] 
                        },
                        { 
                            title : "src/path/..." , 
                            href : "docs-attr-src" ,
                            keys : [
                                "src",
                                "path",
                                "link",
                                "href",
                                "src:",
                                "path:",
                                "link:",
                                "href:"
                            ] 
                        },
                        { 
                            title : "toggle-class" , 
                            href : "docs-attr-toggle-class" ,
                            keys : [
                                "toggle-class"
                            ] 
                        },
                        { 
                            title : "tap-highlight" , 
                            href : "docs-attr-tap-highlight" ,
                            keys : [
                                "tap-highlight"
                            ] 
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
                            href : "docs-api-string" ,
                            keys : [
                                "String"
                            ] 
                        },
                        { 
                            title : "Object" , 
                            href : "docs-api-object" ,
                            keys : [
                                "Object"
                            ] 
                        },
                        { 
                            title : "Array" , 
                            href : "docs-api-array" ,
                            keys : [
                                "Array"
                            ] 
                        },
                        { 
                            title : "Node" , 
                            href : "docs-api-node" ,
                            keys : [
                                "Node"
                            ] 
                        },
                        { 
                            title : "Element : Query" , 
                            href : "docs-api-element-query" ,
                            keys : [
                                "Element : Query"
                            ] 
                        },
                        { 
                            title : "Element : Move" , 
                            href : "docs-api-element-Move" ,
                            keys : [
                                "Element : Move"
                            ] 
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
                            href : "docs-components-tags" ,
                            keys : [
                                "标签式引入"
                            ] 
                        },
                        { 
                            title : "组件文件" , 
                            href : "docs-components-files" ,
                            keys : [
                                "组件文件"
                            ] 
                        },
                        { 
                            title : "数据" , 
                            href : "docs-components-data" ,
                            keys : [
                                "数据"
                            ] 
                        },
                        { 
                            title : "特性" , 
                            href : "docs-components-props" ,
                            keys : [
                                "特性"
                            ] 
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
                    "demo/code-highlight",
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
        system : true,
        singleflow : false, // 历史归类，没有前进，到达首页无回退
        singlelocking : false,
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

            id.split(',').each(function (i,_id) {
                if ( nav == _id ) {
                    id = t
                }
            })

            return id == t ? t : f
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