define(function (require, module, exports) {

    module.exports = {
        config : {
            level : 8,
            absolute : true,
            background : "#000",
            source: "modules/demo-app/ios",
            preview : device.os.android ? 1 : 2,
            update: true,
            animation : "zoom"
        }
    }
})