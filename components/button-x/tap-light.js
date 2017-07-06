define(function (require, module, exports) {
  var canvas,
      centerX = 0,
      centerY = 0,
      color = '',
      context = {},
      element = {},
      radius = 0,
      width,

      init = function (element, options) {
        can = document.createElement('canvas');
        element.appendChild(can);
        can.addEventListener('click', function (event) {
          if ( canvas ) {
            canvas.css({
              "opacity" : "0",
              "transition" : "opacity 0.15s linear"
            })
          }
          press(event, this, element, options.color)
        }, false);
        can.style.width ='100%';
        can.style.height='100%';
        can.width  = can.offsetWidth;
        can.height = can.offsetHeight;
      },
        
      press = function (event, el, cont, col) {
        color = col
        canvas = el
        containers = cont
        canvas.css({
            "opacity" : "0.25",
            "transition" : ""
          })
        color = color || '#ffffff';
        context = canvas.getContext('2d');
        radius = 0;
        centerX = event.offsetX;
        centerY = event.offsetY;
        context.clearRect(0, 0, canvas.width, canvas.height);
        width = containers.width()
        draw();
      },
        
      draw = function () {
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        context.fillStyle = color;
        context.fill();
        radius += width / 40;

        if (radius < width) {
          requestAnimationFrame(draw);
        } else {
          canvas.css({
            "opacity" : "0",
            "transition" : "opacity 0.15s linear"
          })
        }
      }

  module.exports = {
    init : init,
    press : press
  }

})