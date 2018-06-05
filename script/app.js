(function (window) {

    window.isDev = $api.getStorage("isDev") || false;
    isDev = isDev == "true" ? true : false;

    var __config = {};
    __config.serverUrl = "http://47.94.85.133/";
    __config.lang = {"zh-CN": "简体中文", "en-US": "English"};
    __config.defaultLang = "zh-CN";
    __config.login = {
        qq: false,
        wechat: false,
        weibo: false
    }
    window.globalConfig = __config;


    window.isLoad = false;

    window.loadAppConfig = function () {
        var __appConfig = $api.getStorage('appConfig');
        if (!__appConfig) {
            __appConfig = {};
            __appConfig.user = null;
        }

        __appConfig.globalConfig = __appConfig.globalConfig || {};
        __appConfig.globalConfig.lang = __appConfig.globalConfig.lang || "zh-CN";

        window.appConfig = __appConfig;
        window.isLoad = true;
        if (appConfig.globalConfig.serverIp && isDev) {
            globalConfig.serverUrl = "http://" + appConfig.globalConfig.serverIp + ":9090/";
            console.log("Develop mode:" + globalConfig.serverUrl);
        }

    }

    window.saveAppConfig = function (config) {
        appConfig = config || appConfig;
        $api.setStorage('appConfig', appConfig);
    }

    if (!isLoad) loadAppConfig();

    window.init = function () {
        var backSecond = 0;
        api.addEventListener({
            name: 'keyback'
        }, function (ret, err) {
            var curSecond = new Date().getSeconds();
            if (Math.abs(curSecond - backSecond) > 2) {
                backSecond = curSecond;
                api.toast({
                    msg: '连续按两次关闭系统',
                    duration: 2000,
                    location: 'bottom'
                });
            } else {
                api.closeWidget({
                    id: api.appId,
                    retData: {
                        name: 'closeWidget'
                    },
                    silent: true
                });
            }
        });
    };

    window.checkLogin = function () {
        if (!appConfig.isLogin) {
            gotoLogin();
        }
        return appConfig.isLogin;
    }

    window.isJSON = function (str) {
        if (typeof str == 'string') {
            try {
                var obj = JSON.parse(str);
                if (str.indexOf('{') > -1) {
                    return true;
                } else {
                    return false;
                }
            } catch (e) {
                return false;
            }
        }
        return false;
    }

})(window);

function deepCopy(p, c) {
    var c = c || {};
    for (var i in p) {
        if (typeof p[i] === 'object' && p[i] != null) {
            c[i] = (p[i].constructor === Array) ? [] : {};
            deepCopy(p[i], c[i]);
        } else {
            c[i] = p[i];
        }
    }
    return c;
}

Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
String.prototype.endWith = function (str) {
    var reg = new RegExp(str + "$");
    return reg.test(this);
}

