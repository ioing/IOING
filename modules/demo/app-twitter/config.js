define(function (require, module, exports) {

    module.exports = {
        config : {
            level : 8,
            absolute : true,
            background : "#fff",
            source: "modules/demo-app/ios#app-twitter",
            preview : device.os.android ? 1 : 2,
            update: true,
            animation : "zoom"
        }
    }
})