$(".button").click(function(){
    $(this).toggleClass("active");
    return false;
});


// LOL CODEPEN FRONTPAGE ALERT
// Sorry @codepen! :D
var i = 0;
if(document.location.pathname != "/pen/secure_iframe") {
  var interval = setInterval(function(){
    $("html, body").toggleClass("blinking");
    if(i >= 7)
       clearInterval(interval); 
    else
       i++;
  }, 250);
}

