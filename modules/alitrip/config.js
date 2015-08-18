define({
  resources : {
    script: {
    },
    source: {
      index: "index.html",
    },
    style: {
      common: "frameworks::common",
      main: "main.css"
    },
    data: {
      taobao: "./list.json|param"
    }
  },
  config : {
    complex: false,
    style : ["common", "main"],
    script : [],
    source: ["index"],
    data : ["taobao"],
    sandbox : false,
    shadow: true,
    mirroring: {
      clip: [69, 0, 0, 0]
    },
    animation: function (event) {
      var width = device.ui.width;
      var height = device.ui.height;

      var view = event.view;
      var reverse = event.reverse;

      if ( reverse ) {
        //console.log(reverse)
        move(view[0]).duration(0).to(-width/3, 0).end();
        setTimeout(function () {

          move(view[0]).duration('.3s').set('filter', 'brightness(1)').to(0, 0).end();
          move(view[1]).duration('.3s').to(width, 0).end(function () {
            event.callback(true);
          });

        }, 10);
      } else {
        move(view[0]).perspective(1000).set('height', height + 'px').duration(0).to(width, 0).set("transform-origin", "right").rotateY(30).end();
        move(view[1]).set("transform-origin", "left").set('height', height + 'px').duration(0).rotateY(0).end();

        setTimeout(function () {

          move(view[1]).duration('.6s').set('filter', 'brightness(.3)').rotateY(10).to(-width/3, 0).end();
          move(view[0]).duration('.6s').rotateY(0).to(0, 0).end(function () {
            event.callback(true);
          });

        }, 50);
      }
    }
  }
})