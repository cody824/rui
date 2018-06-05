(function (window) {


    window.patientCache = {

        data: {},

        pool: {},

        search: function (doctorId, query) {
            var data = [];
            var doctorPatients = this.data[doctorId];
            for (var id in doctorPatients) {
                var patient = doctorPatients[id];
                if (query) {
                    if (patient.patientName.indexOf(query) >= 0) {
                        data.push(patient);
                    } else if (patient.contactInfo.indexOf(query) >= 0) {
                        data.push(patient);
                    } else if (patient.medicalNumber.indexOf(query) >= 0) {
                        data.push(patient);
                    }
                } else {
                    data.push(patient);
                }
            }
            return data;
        },

        load: function () {
            this.data = $api.getStorage('patients') || {};
        },

        save: function () {
            $api.setStorage('patients', this.data);
        },

        add: function (patient) {
            this.data[patient.doctorId] = this.data[patient.doctorId] || {};
            this.data[patient.doctorId][patient.id] = patient;
            this.save();
        },

        del: function (doctorId, id) {
            this.data[doctorId] = this.data[doctorId] || {};
            this.data[doctorId][id] == null;
            this.save();
            casesPool.delPatientCases(id);
        },

        get: function (doctorId, id) {
            var patients = this.data[doctorId];
            if (patients) {
                return patients[id];
            } else {
                return null;
            }
        },

        sync: function (doctorId, callback) {
            var me = this;
            me.data[doctorId] = {};

            patientPool.load(doctorId, null, 0, 1000, function (ret) {
                for (var i = 0; i < ret.data.length; i++) {
                    me.data[doctorId][ret.data[i].id] = ret.data[i];
                }
                me.save();
                if (typeof callback == "function") {
                    callback();
                }
            })

        }


    };

    window.patientPool = {


        load: function (doctorId, query, page, size, callback) {
            var values = {
                page: page,
                size: size
            };
            if (query) {
                values.query = query;
            }


            api.ajax({
                url: globalConfig.serverUrl + "doctor/" + doctorId + "/patient/",
                method: 'get',
                headers: {
                    // "Content-Type" : 'application/json',
                    "Accept": 'application/json',
                    "ruitoken": "rui" + appConfig.token
                },
                data: {
                    values: values
                },
            }, function (ret, err) {
                if (err) {
                    var errorMsg = {};
                    if (isJSON(err.msg)) {
                        errorMsg = JSON.parse(err.msg);
                    } else {
                        errorMsg.errorMsg = err.msg;
                    }
                    if (errorMsg.errorNum && errorMsg.errorNum == 401) {
                        userUtil.logout(function () {
                            gotoMain();
                        })
                    } else {
                        api.alert({
                            msg: errorMsg.errorMsg
                        });
                    }
                } else {
                    if (typeof callback === "function") {
                        callback(ret);
                    }
                }
            });
        },

        add: function (patient, callback) {
            api.ajax({
                url: globalConfig.serverUrl + "doctor/" + patient.doctorId + "/patient/",
                method: 'post',
                headers: {
                    "Content-Type": 'application/json',
                    "Accept": 'application/json',
                    "ruitoken": "rui" + appConfig.token
                },
                data: {
                    body: patient
                }
            }, function (ret, err) {
                if (err) {
                    var errorMsg = {};
                    if (isJSON(err.msg)) {
                        errorMsg = JSON.parse(err.msg);
                    } else {
                        errorMsg.errorMsg = err.msg;
                    }
                    console.log(JSON.stringify(errorMsg));
                    api.alert({
                        msg: errorMsg.errorMsg || errorMsg.systemError
                    });
                } else {
                    patientCache.add(patient);
                    if (typeof callback === "function") {
                        callback(ret);
                    }
                }
            });
        },

        update: function (patient, callback) {
            api.ajax({
                url: globalConfig.serverUrl + "patient/" + patient.id,
                method: 'put',
                headers: {
                    "Content-Type": 'application/json',
                    "Accept": 'application/json',
                    "ruitoken": "rui" + appConfig.token
                },
                data: {
                    body: patient
                }
            }, function (ret, err) {
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
                    patientCache.add(ret);
                    if (typeof callback === "function") {
                        callback(ret);
                    }
                }
            });
        },

        del: function (id, callback) {
            api.ajax({
                url: globalConfig.serverUrl + "patient/" + id,
                method: 'delete',
                headers: {
                    "Accept": 'application/json',
                    "ruitoken": "rui" + appConfig.token
                }
            }, function (ret, err) {
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
                    patientCache.del(appConfig.user.id, id);
                    if (typeof callback === "function") {
                        callback(ret);
                    }
                }
            });
        }

    }

    patientCache.load();


})(window);
