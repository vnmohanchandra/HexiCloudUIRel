/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * login module
 */
define(['knockout', 'jquery', 'config/serviceConfig', 'config/sessionInfo', 'ojs/ojcore', 'ojs/ojinputtext', 'ojs/ojknockout-validation', 'ojs/ojselectcombobox'
], function (ko, $, service, sessionInfo) {
    /**
     * The view model for the main content view template
     */
    function loginContentViewModel(params) {
        var self = this;
        var router = params.ojRouter.parentRouter;
        console.log('login page');
        self.userName = ko.observable();
        self.password = ko.observable();
        self.iDomain = ko.observable("");
        self.restEndPoint = ko.observable();
        self.tracker = ko.observable();
        self.isIDomainActive = ko.observable(false);
        self.loginFailureText = ko.observable();

        self.dataCenter = ko.observable();
        self.phoneNumber = ko.observable();

        self.savedStep = ko.observable("chooseRole");

        self.returnLgXlClass = ko.computed(function () {
            var range = viewportSize();
            return (range === 'LG' || range === 'XL') ? 'margin-left-half' : '';

        });

        self.returnFlexStart = ko.computed(function () {
            var range = viewportSize();
            return (range === 'LG' || range === 'XL') ? 'oj-lg-align-items-flex-start' : '';

        });

        self.handleBindingsApplied = function () {

            $("#iDomain").on('keyup paste cut', function () {
                var iDomain = $(this).val();
                return self.isIDomainActive(iDomain.length > 0);
            });
        };

        self._showComponentValidationErrors = function (trackerObj) {
            trackerObj.showMessages();
            if (trackerObj.focusOnFirstInvalid())
                return false;

            return true;
        };

        self.handleAttached = function () {
//            slideInAnimate(500, 0);
        };

        self.login = function () {
//            router.go('chooseRoleNew/');

            console.log('login clicked');
            console.log(loggedInUser());
            console.log(self.restEndPoint());
            var trackerObj = ko.utils.unwrapObservable(self.tracker);

            // Step 1
            if (!this._showComponentValidationErrors(trackerObj))
            {
                return;
            }

            if (self.iDomain() == "") {
                var successCallBackFn = function (data, xhrStatus) {
                    console.log(data);
                    console.log(status);
                    if (xhrStatus.status == 200) {
                        isLoggedInUser(true);
                        sessionInfo.setToSession(sessionInfo.isLoggedInUser, true);
                        loggedInUser(data.userId);
                        sessionInfo.setToSession(sessionInfo.loggedInUser, data.userId);
                        loggedInUserRole(data.userRole);
                        sessionInfo.setToSession(sessionInfo.loggedInUserRole, data.userRole);
                        userFirstLastName(data.firstName);
                        sessionInfo.setToSession(sessionInfo.userFirstLastName, data.firstName);
                        userClmRegistryId(data.registryId);
                        sessionInfo.setToSession(sessionInfo.userClmRegistryId, data.registryId);
                        self.loginFailureText("");
//                        service.getUserStep(loggedInUser()).then(getUserStepSuccessCallBackFn);
                        //Hardcoding for the demo
                        $('#bgvid').remove();
                        if (self.userName().toLowerCase() === 'fred' || self.userName().toLowerCase() === 'simon') {
                            router.go('dashboard/');
                        } else {
                            router.go(self.savedStep() + '/');
                        }
//                        setTimeout(function () {
//                        }, 500);
//                        slideOutAnimate(1500, 0);
                    } else {
                        self.loginFailureText("Invalid Username or Password");
                    }
                };

                var failCallBackFn = function (xhr) {
                    console.log(xhr);
                    self.loginFailureText("Invalid Username or Password");
                };
                var getUserStepSuccessCallBackFn = function (data) {
                    console.log(data);
                    if (data) {
                        loggedInUser(data.userId);
                        loggedInUserRole(data.userRole);
                        self.savedStep(data.curStepCode);
                    }
                    $('#bgvid').remove();
                    router.go(self.savedStep() + '/');
                };

                service.authenticate({
                    "userId": self.userName().toLowerCase(),
                    "password": btoa(self.password())
                }).then(successCallBackFn, failCallBackFn);

            } else {
                loggedInUser(self.userName());
                sessionInfo.setToSession(sessionInfo.loggedInUser, self.userName());
                userFirstLastName(self.userName());
                sessionInfo.setToSession(sessionInfo.userFirstLastName, self.userName());
                containerName(self.iDomain());
                sessionInfo.setToSession(sessionInfo.containerName, self.iDomain());
                self.dataToSend = "?container=" + containerName() + "&password=" + self.password() + "&userName=" + self.userName() + "&restEndPoint=" + self.restEndPoint();
                console.log(self.dataToSend);
                var url = wrapperRestEndPoint() + self.dataToSend;
                console.log(wrapperRestEndPoint() + self.dataToSend);
                if (self.userName() != null && self.password() != null && containerName() != null && self.restEndPoint() != null) {
                    isDomainDetailsGiven(true);
                    $.ajax({
                        type: "POST",
                        url: url,
                        contentType: "text/plain",
                        dataType: "text",
                        data: {userName: self.userName(), password: self.password(), container: containerName(), restEndPoint: self.restEndPoint()},
                        crossDomain: true,
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader("Access-Control-Allow-Origin", "https://140.86.1.93/");
                            xhr.setRequestHeader("Access-Control-Allow-Headers", "Origin, options,X-Requested-With, Content-Type, Accept");
                        },
                        success: function (data) {

                            //dashBoardServices(result);
                            data = $.parseJSON(data);

                            dashboardServices(data.result);// = sArray.slice();                     
                            // console.log(dashboardServices());
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            console.log('Error retrieving details..');
                            console.log(xhr);
                            console.log(ajaxOptions);
                            console.log(thrownError);
                        }
                    });
                    isLoggedInUser(true);
                    sessionInfo.setToSession(sessionInfo.isLoggedInUser, true);
//                    setTimeout(function () {
                    router.go('chooseRole/');
//                    }, 500);
//                    slideOutAnimate(1500, 0);
                    router.go('chooseRole/');
                }
            }
        };
    }

    return loginContentViewModel;
});
