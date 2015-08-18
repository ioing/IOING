// 这里的代码是在dom ready 后执行的
// 最传统的过程化代码即可运行，不必担心兼容问题
// 同时可以使用 define() 

var phone_content_bg = $("#phone_content_bg");
var phone_content_box = $("#phone_content_box");

function show (e) {
	phone_content_bg.addClass('show_login_bg');
	phone_content_box.addClass('show_login_box');
}

document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
