(function () {
    // menu

    var menu_btn = $('#menu_btn'),
        main_nav = $('#main_nav')
    ;

    menu_btn.on('click', function () {
        
        if (main_nav.hasClass('active')) {
            main_nav.removeClass('active');
            menu_btn.removeClass('active');
        } else {
            main_nav.addClass('active');
            menu_btn.addClass('active');
        }
    })
        
    window.application.on('transformStart', function (e) {


        $("#blurlay").empty();

        var id = e[0],
            od = e[1];

            var nav_id = $("footer [transform=" + id + "]"),
                nav_od = $("footer [transform=" + od + "]");

                nav_id.addClass("active scaleBounce");
                //nav_id[0].style["transition"] = nav_id[0].style["webkitTransition"] = "300ms linear";
                //nav_id[0].style["transform"] = nav_id[0].style["webkitTransform"] = "translate(0px, 0px) translateZ(0px) scale(1)";

                nav_od.removeClass("active scaleBounce").addClass("reScaleBounce");
                //nav_od[0].style["transition"] = nav_od[0].style["webkitTransition"] = "300ms linear";
                //nav_od[0].style["transform"] = nav_od[0].style["webkitTransform"] = "translate(0px, 0px) translateZ(0px) scale(.75)";
    })
})()