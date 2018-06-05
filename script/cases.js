(function (window) {

    window.casesPool = {


        data: {},

        imgData: {},

        load: function () {
            this.data = $api.getStorage('cases') || {};
        },

        getLastVisit: function (patientId) {
            var ret = null;
            var patientCases = this.data[patientId] || [];
            var sortArray = patientCases.sort(function (x, y) {
                if (x.visitTime > y.visitTime) {
                    return -1;
                } else if (x.visitTime < y.visitTime) {
                    return 1;
                } else {
                    return 0;
                }
            });
            if (sortArray.length > 0) {
                ret = sortArray[0];
            }
            return ret;
        },

        save: function () {
            $api.setStorage('cases', this.data);
        },

        add: function (cases) {
            this.data[cases.patientId] = this.data[cases.patientId] || [];
            this.data[cases.patientId].push(cases);
            this.save();
        },

        del: function (patientId, id) {
            var patientCases = this.data[patientId];
            if (patientCases && patientCases.length > 0) {
                var index = -1;
                for (var i = 0; i < patientCases.length; i++) {
                    if (id == patientCases[i].id) {
                        index = i;
                        break;
                    }
                }
                if (index >= 0) {
                    var fs = api.require('fs');
                    var cases = this.data[patientId].splice(index, 1);
                    if (cases && cases.length == 1 && cases[0].images && cases[0].images.length > 0) {
                        for (var i = 0; i < cases[0].images.length; i++) {
                            var path = cases[0].images[i];
                            if (path.indexOf('fs:') != 0) {
                                var appIndex = path.indexOf(api.appId);
                                if (appIndex > 0) {
                                    path = "fs://" + path.substring(appIndex + ("" + api.appId).length + 1)
                                }
                            }
                            fs.remove({
                                path: path
                            });
                        }
                    }


                    this.save();
                }
            }
        },

        delPatientCases: function (patientId) {
            var patientCases = this.data[patientId];
            if (patientCases && patientCases.length > 0) {

                for (var j = 0; j < patientCases.length; j++) {
                    var fs = api.require('fs');
                    var cases = patientCases[j];
                    if (cases && cases.length == 1 && cases[0].images && cases[0].images.length > 0) {
                        for (var i = 0; i < cases[0].images.length; i++) {
                            var path = cases[0].images[i];
                            if (path.indexOf('fs:') != 0) {
                                var appIndex = path.indexOf(api.appId);
                                if (appIndex > 0) {
                                    path = "fs://" + path.substring(appIndex + ("" + api.appId).length + 1)
                                }
                            }
                            fs.remove({
                                path: path
                            });
                        }
                    }
                }
                this.data[patientId] = null;
                this.save();
            }
        },

        get: function (patientId, id) {
            var ret = null;
            var patientCases = this.data[patientId];
            if (patientCases && patientCases.length > 0) {
                for (var i = 0; i < patientCases.length; i++) {
                    if (id == patientCases[i].id) {
                        ret = patientCases[i];
                        break;
                    }
                }
            }
            return ret;
        },

        update: function (cases) {
            var patientCases = this.data[cases.patientId];
            if (patientCases && patientCases.length > 0) {
                var index = -1;
                for (var i = 0; i < patientCases.length; i++) {
                    if (cases.id == patientCases[i].id) {
                        index = i;
                        break;
                    }
                }
                if (index >= 0) {
                    this.data[cases.patientId].splice(index, 1);
                }
            }
            this.add(cases);
        },


        addByShareCode: function (shareCode, callback) {
            var me = this;
            api.showProgress({
                style: 'default',
                animationType: 'fade',
                title: '病例下载中',
                text: '请耐心等待',
                modal: true
            });
            api.ajax({
                url: globalConfig.serverUrl + "cases/share-code/" + shareCode,
                method: 'post',
                headers: {
                    "Content-Type": 'application/json',
                    "Accept": 'application/json',
                    "ruitoken": "rui" + appConfig.token
                }
            }, function (cases, err) {
                if (err) {
                    console.log(JSON.stringify(err));
                    var errorMsg = {};
                    if (isJSON(err.msg)) {
                        errorMsg = JSON.parse(err.msg);
                    } else {
                        errorMsg.errorMsg = err.msg;
                    }
                    api.hideProgress();
                    api.alert({
                        msg: errorMsg.errorMsg
                    });
                } else {
                    console.log(JSON.stringify(cases));
                    api.ajax({
                        url: globalConfig.serverUrl + "cases/" + cases.id + "/image/",
                        method: 'get',
                        headers: {
                            "Content-Type": 'application/json',
                            "Accept": 'application/json',
                            "ruitoken": "rui" + appConfig.token
                        }
                    }, function (images, err) {
                        if (err) {
                            var errorMsg = {};
                            if (isJSON(err.msg)) {
                                errorMsg = JSON.parse(err.msg);
                            } else {
                                errorMsg.errorMsg = err.msg;
                            }
                            api.hideProgress();
                            api.alert({
                                msg: errorMsg.errorMsg
                            });
                        } else {
                            cases.images = [];
                            if (images.length > 0) {
                                var now = new Date();
                                var n = images.length;
                                for (var i = 0; i < images.length; i++) {
                                    var image = images[i];
                                    var path = "fs://cases/" + cases.patientId + "/" + now.Format("yyyy-MM-dd") + "/" + image.name;
                                    api.download({
                                        url: image.src,
                                        savePath: path,
                                        report: false,
                                        cache: true,
                                        allowResume: false
                                    }, function (ret, err) {
                                        if (ret) {
                                            cases.images.push(ret.savePath);
                                        }
                                        n--;
                                        if (n == 0) {
                                            api.hideProgress();
                                            me.update(cases);
                                            if (typeof callback == "function") {
                                                callback();
                                            }
                                        }
                                    });
                                }
                            }

                        }
                    });
                }
            });
        },

        upload: function (cases, callback) {
            var me = this;
            api.showProgress({
                style: 'default',
                animationType: 'fade',
                title: '上传中',
                text: '请耐心等待',
                modal: true
            });
            api.ajax({
                url: globalConfig.serverUrl + "cases/",
                method: 'post',
                headers: {
                    "Content-Type": 'application/json',
                    "Accept": 'application/json',
                    "ruitoken": "rui" + appConfig.token
                },
                data: {
                    body: cases
                }
            }, function (ret, err) {
                api.hideProgress();
                if (err) {
                    var errorMsg = {};
                    if (isJSON(err.msg)) {
                        errorMsg = JSON.parse(err.msg);
                    } else {
                        errorMsg.errorMsg = err.msg;
                    }
                    api.alert({
                        msg: errorMsg.errorMsg
                    });
                } else {
                    Object.assign(cases, ret);
                    me.update(cases)
                    for (var i = 0; i < cases.images.length; i++) {
                        api.ajax({
                            url: globalConfig.serverUrl + "cases/" + cases.id + "/image/",
                            method: 'post',
                            headers: {
                                "ruitoken": "rui" + appConfig.token,
                                Accept: 'application/json'
                            },
                            method: 'post',
                            data: {
                                files: {
                                    file: cases.images[i]
                                }
                            }
                        }, function (ret, err) {
                        });
                    }
                    if (typeof callback === "function") {
                        callback(cases);
                    }
                }
            });


        }

    };

    casesPool.load();


})(window);
