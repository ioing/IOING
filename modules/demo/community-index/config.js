define(function (require, module, exports) {
    var HOST = ''
    var host = location.protocol + "//vap.gw" + HOST + ".weidian.com/h5/vcommunity/";
    var host2 = location.protocol + "//vap.gw" + HOST+ ".weidian.com/h5/community/";
    var host3 = location.protocol + "//vap.gw" + HOST + ".weidian.com/"

    module.exports = {
        resources : {
            script: {
                main:"main.js"
            },
            source: {
                index: "index.html",
            },
            style: {
                main: "main.css"
            },
            data: {
                // index: host2 +'channel/1.0|@param(request:{circleId:-1})|@method(POST)',
                index: "json/channel.json",
                // tablist: host2 + 'queryHybridContent/1.0|@param(context:{apiv:1}, request:{page:turnover+1, pageSize:limit,circleId:circleId})|@method(POST)',
                tablist: "json/tablist.json",
                tabindex: "json/channel.json",
                topicList:host2 + "getTopTopicList/1.0|@param(request:{firstRow:0,pageSize:7,circleId:circleId})|@method(POST)",
                expList: host2 + "getContentList/1.0|@param(request:{firstRow:firstRow,pageSize:limit,status:2,circleId:circleId})|@method(POST)",
                // banner: host3 + "h5/vgate/getSimpleThemeData/1.0|@param(context:{apiv:1},request:{themeCode:community_banner})|@method(POST)|@storeage(10)",
                space: host2 + 'getUserProfileById/1.0|@param(context:{"apiv":1},request:{})|@method(POST)|@storeage(10)',
                // circle: host + 'getCircleInfo/1.0|@param("context":{"apiv":1},request:{id:circleId})|@method(POST)',
                api: {
                    "like": "//vap.gw" + top.HOST + ".weidian.com/h5/interactcenter/like/1.0",
                    "unlike": "//vap.gw" + top.HOST + ".weidian.com/h5/interactcenter/unlike/1.0"
                },
                setting: {
                },
                util : {
                    slice: function (str, l) {
                        var length = str.length
                        return str.slice(0,l) + (length > l ? '...' : '');
                    },
                    clipCounts:function(count){
                        if(count < 10000) return count;
                        if(count < 100000) return (count/10000).toFixed(1)+"万";
                        if(count > 100000) return (count/10000).toFixed(0)+"万";
                    },
                    dealCreateTime:function(time){
                        var createDate = new Date(time);
                        var year = createDate.getFullYear();
                        var month = createDate.getMonth() + 1;
                        var day = createDate.getDate();
                        var currentYear = (new Date()).getFullYear();

                        if(currentYear == year){
                            return month + "月" + day + "日";
                        }else{
                            return year + "年" + month + "月" + day + "日";
                        }
                    },
                    getCdnImageSize: function (url, clip) {
                        var size = url.match(/_(\d+)_(\d+)/);
                        var width = window.innerWidth - clip*device.ui.scale;
                        var height = width / size[1] * size[2]

                        return {
                            url : url,
                            width : width + 'px',
                            height : height + 'px',
                        }
                    },
                    decideImageSize: function(url){
                        var size = url.match(/_(\d+)_(\d+)/);
                        var width = size[1] * 1;
                        var height = size[2] * 1;
                        var realPer = width / height;
                        var scale = device.ui.scale;
                        var className;

                        if(width > height && realPer > 232 / 130){
                            className = 'overw';
                        }else if(width < height && (1 / realPer) > (232 / 153)){
                            className =  'overh';
                        }else {
                            if(width > height){
                                className = 'normalw';
                            } else {
                                className = 'normalh';
                            }
                        }

                        return {
                            className: className,
                            pre : realPer * scale,
                        }
                    },
                    getImgHorV: function (url) {
                        var size = url.match(/_(\d+)_(\d+)/)
                        var width = size[1] * 1
                        var height = size[2] * 1
                        var className

                        if ( width > height ) {
                            className = 'd-v'
                        } else {
                            className = 'd-h'
                        }

                        return className
                    },
                    getTopicBg: function (url) {
                        if ( url ) return url
                        return '/topic/bg/' + Math.floor(Math.random()*4) + '.png'
                    },
                    filterimg: function (url) {
                        var gif = /.gif/.test(url);

                        if ( gif ) return url
                        return url + '?w=600&h=600'
                    }
                }
            }
        },
        config : {
            level : 7,
            absolute : true,
            background: "#fff",
            style : ["main"],
            script : [],
            source: ["index"],
            sandbox : true,
            cache : 0,
            // timeout : 60,
            data: ['index', "api", "util"],
            animation : true
        },
        controller : function(res, name) {
            switch (name) {
                case 'index':
                case 'tabindex':
                    // res.result = res.result || { channel: [] }
                    // res.result.channel = res.result.channel

                    console.log(res.result, name)
                    var tabConf = {
                        nav: [],
                        params: [],
                        content: [],
                        navTitle: [],
                        useScroller: []
                    }
                    res.result.channel.each(function (key, val) {
                        tabConf.nav.push('tab-' + val.circleId)
                        tabConf.content.push('tab-content-' + val.circleId)
                        tabConf.useScroller.push('tab-content-scroll-' + val.circleId)
                        tabConf.navTitle.push(val.circleName)
                        tabConf.params.push({circleId:val.circleId})
                    })

                    res.result.tabConf = tabConf

                    var _slice = function (str, l) {
                        var length = str.length
                        return str.slice(0,l) + (length > l ? '...' : '');
                    }

                    res.result.userInfo = {
                        userpic : (!res.result.user || !res.result.user.headUrl || res.status.code == 2 || !top.applicationIsLogin) ? '//wd.geilicdn.com/611e6e1d618cafa08562e6cae2a7e654.png' : res.result.user && res.result.user.headUrl ? res.result.user.headUrl : '//img.geilicdn.com/u_default.jpg',
                        username : _slice((!res.result.user || !res.result.user.nick || res.status.code == 2 || !top.applicationIsLogin) ? '未登录' : res.result.user && res.result.user.nick ? res.result.user.nick : '未命名', 10)
                    }

                    res.result._status = res.status

                    res.result.applicationIsLogin = true

                    return res.result

                    break

                case 'list':
                    if(this.param._start == 0){
                      res.result.unshift({});
                    } 

                    return res.result

                case 'tablist':
                    if(this.param._start == 0){
                      res.result.unshift({});
                    } 

                    return res.result

                    break
            }

            if(name == 'expList'){
                var data = res && res.result && res.result.data;
                if ( !data ) return
                    

                for (var i=0;i<data.length;i++) {
                  var title = data[i].title

                  if(data[i].authorNick == ''){
                      data[i].authorNick = '未命名'
                  }

                  if(/^\s*$/.test(title)) data[i].title = '[图片经验]';
                }
                if(this.param.firstRow == 0){
                  data.unshift({});
                } 
                var currentFirstRow = this.param.firstRow;
                  var limit = this.param.limit * 1;
                  this.setParam({
                      firstRow: currentFirstRow + limit
                  });  
            }

            if(name == "circle"){
                var data = res && res.result && res.result.data;
                data.features = JSON.parse(data.features);
            }

          return res
        },
        onprefetch: function (data) {
        },
        param: {
            circleId: 0,
            firstRow: 0,
            page: 0,
            start: 0,
            limit: 12,
            tabswitch: 0,
            turnover: 0
        }
    }
})