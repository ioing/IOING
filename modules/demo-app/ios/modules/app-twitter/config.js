define(function (require, module, exports) {

    module.exports = {
        config : {
            level : 8,
            absolute : true,
            background : "#fff",
            source: "modules/app-twitter/twitter",
            preview : device.os.android ? 1 : 2,
            animation : "zoom"
        }
    }
})