(function () {
    window.application.transform.on('transformStart', function (e) {

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