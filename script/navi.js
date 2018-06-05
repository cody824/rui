(function (window) {

    window.gotoLogin = function () {
        console.log("gotoLogin")
        api.openWin({
            name: 'login',
            url: 'widget://html/login.html'
        });
    };

    window.gotoBack = function () {
        api.historyBack({}, function (ret, err) {
        });
    };

    window.gotoRegister = function () {
        api.openWin({
            reload: true,
            name: 'register',
            url: 'widget://html/register.html'
        });
    };

    window.gotoForgetPsd = function () {
        api.openWin({
            reload: true,
            name: 'forgetPsd',
            url: 'widget://html/password_modify.html'
        });
    };

    window.gotoSetup = function () {
        api.openWin({
            reload: true,
            name: 'setup',
            url: 'widget://html/setting.html'
        });
    };

    window.gotoPhoto = function () {
        api.openWin({
            reload: true,
            name: 'photo',
            url: 'widget://html/picture.html'
        });
    };

    window.gotoAccountInfo = function () {
        api.openWin({
            reload: true,
            name: 'forgetPsd',
            url: 'widget://html/account_info.html'
        });
    };

    window.gotoPatientEdit = function (patient, lastWin) {
        api.openWin({
            reload: true,
            name: 'patientEdit',
            url: 'widget://html/patient_info.html',
            pageParam: {
                patient: patient,
                lastWin: lastWin
            }
        });
    };

    window.gotoAddPatient = function () {
        api.openWin({
            reload: true,
            name: 'addPatient',
            url: 'widget://html/add_patient.html'
        });
    };

    window.gotoPatientCases = function (patient, lastWin, animationType) {
        animationType = animationType || "none";
        api.openWin({
            reload: true,
            animation: {
                type: animationType
            },
            name: 'patientCases',
            url: 'widget://html/patient_cases.html',
            pageParam: {
                patient: patient,
                lastWin: lastWin
            }
        });
    };

    window.gotoMain = function () {
        api.openWin({
            reload: true,
            name: 'main',
            url: 'widget://html/main.html',
            bounces: false,
            allowEdit: true,
            rect: { // 推荐使用Margin布局，用于适配屏幕的动态变化
                // marginTop: headerH, // main页面距离win顶部的高度
                // marginBottom: footerH, // main页面距离win底部的高度
                w: 'auto' // main页面的宽度 自适应屏幕宽度
            }
        });
    };

    window.closeFrame = function (name) {
        api.closeFrame({
            name: name
        });
    };

    window.gotoCamera = function (cases) {
        api.openWin({
            name: 'camera',
            url: 'widget://html/camera.html',
            pageParam: {cases: cases}
        });
    };

    window.gotoEditCases = function (patient, cases, imagePath) {
        api.openWin({
            reload: true,
            name: 'addCases',
            url: 'widget://html/edit_cases.html',
            pageParam: {patient: patient, cases: cases, imagePath: imagePath}
        });
    };


})(window);
