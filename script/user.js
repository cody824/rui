(function (window) {
    var fs;

    var __user = {

        init: function () {
            fs = fs || api.require("fs");
        },

        saveAvatar: function (imagePath, callback) {
            api.ajax({
                url: globalConfig.serverUrl + "app/user/avatar",
                method: 'post',
                headers: {
                    ruitoken: 'rui' + appConfig.token,
                    Accept: 'application/json'
                },
                data: {
                    files: {
                        file: imagePath
                    }
                }
            }, callback);
        },

        saveUser: function (user, callback) {
            api.ajax({
                url: globalConfig.serverUrl + "security/ud/" + user.id,
                method: 'put',
                headers: {
                    ruitoken: 'rui' + appConfig.token,
                    Accept: 'application/json'
                },
                data: {
                    body: user
                }
            }, callback);
        },

        login: function (userName, password, callback) {
            api.showProgress({
                title: '登录中',
                msg: '请耐心等待',
                modal: true
            });
            api.ajax({
                url: globalConfig.serverUrl + "security/auth/getToken",
                method: 'post',
                headers: {
                    "Content-Type": 'application/json',
                    "Accept": 'application/json'
                },
                data: {
                    body: {
                        username: userName,
                        password: password
                    }
                }
            }, function (ret, err) {
                if (ret) {
                    appConfig.token = ret.token;
                    userUtil.getUserDetails(ret.token, function (ud, err) {
                        api.hideProgress();
                        if (ud) {
                            appConfig.isLogin = true;
                            appConfig.loginName = ud.fullName;
                            appConfig.user = ud;
                            saveAppConfig();
                            if (typeof callback == "function") {
                                ud.status = true;
                                callback(ud);
                            }
                        } else {
                            console.log(JSON.stringify(err));
                            if (typeof callback == "function") {
                                callback(ret, err);
                            }
                        }

                    })
                } else {
                    console.log(JSON.stringify(err));
                    if (typeof callback == "function") {
                        err.msg = '用户名或者密码错误';
                        callback(ret, err);
                    }
                    api.hideProgress();
                }
            });
        },

        logout: function (callback) {
            var ret = {},
                err = {};
            appConfig.isLogin = false;
            appConfig.loginName = null;
            appConfig.user = null;
            appConfig.token = null;
            saveAppConfig();
            if (typeof callback == "function") {
                callback(ret, err);
            }
            api.ajax({
                url: globalConfig.serverUrl + "security/auth/getToken",
                method: 'delete',
                headers: {
                    Accept: 'application/json'
                }
            }, function (ret, err) {
                //callback(ret, err)
            });
        },

        getUserDetails: function (token, callback) {
            api.ajax({
                url: globalConfig.serverUrl + "security/ud/loginInfo",
                method: 'get',
                headers: {
                    ruitoken: 'rui' + token,
                    Accept: 'application/json'
                }
            }, function (ret, err) {
                callback(ret, err)
            });
        }
    }
    window.userUtil = __user;

})(window);
