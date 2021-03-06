/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(['knockout', 'jquery', 'config/sessionInfo', 'ojs/ojrouter'
], function (ko, $, sessionInfo) {

    /**
     * The view model for the managing service calls
     */
    function serviceConfig() {

        var self = this;
        // Context root for prod and test
//        var ctx = '/hexiCloudRestSecured';
        // Context root for dev
        var ctx = '/hexiCloudRestSecuredDev';
        if (location.origin.indexOf('localhost') > 0) {
            if (location.protocol === 'http:') {
                self.portalRestHost = ko.observable("http://129.152.128.105:8080".concat(ctx));
            } else {
                self.portalRestHost = ko.observable("https://129.152.128.105".concat(ctx));
            }
        } else {
            //For context root to be relative on PROD
            self.portalRestHost = ko.observable(location.origin.concat(ctx));
        }
        self.serverURI = ko.observable("https://documents-gse00002841.documents.us2.oraclecloud.com/documents/link/");

        self.updateCurrentStep = function (payload, doNotRoute) {
            console.log('payload : '+ JSON.stringify(payload));
            // var defer = $.Deferred();
            var serverURL = self.portalRestHost() + "/services/rest/createUserStep/";
            $.ajax({
                type: "POST",
                url: serverURL,
                beforeSend: function (request) {
                    request.setRequestHeader("Authorization", "Bearer " + sessionInfo.getFromSession(sessionInfo.accessToken));
                },
                contentType: "application/json",
                data: JSON.stringify(payload),
                success: function (data) {
                    console.log('Successfully posted data at: ' + serverURL);
                    if (doNotRoute === undefined) {
                        console.log('Navigating to  : ' + payload.curStepCode);
                        router.go(payload.curStepCode);
                    }
                    // defer.resolve(payload.curStepCode, {status: 200});
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log("Error posting data to the service" + serverURL);
                    FailCallBackFn(xhr);
                    // defer.reject(xhr);
                }
            });
            // return $.when(defer);
        };

        self.getUserStep = function (userId) {
            var defer = $.Deferred();
            var serverURL = self.portalRestHost() + "/services/rest/findUsersCurrentStep/" + userId + "/";
            $.ajax({
                type: "GET",
                url: serverURL,
                beforeSend: function (request) {
                    request.setRequestHeader("Authorization", "Bearer " + sessionInfo.getFromSession(sessionInfo.accessToken));
                },
                success: function (data) {
                    console.log('Successfully retrieved details at: ' + serverURL);
                    defer.resolve(data);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log("Error retrieving service details at: " + serverURL);
                    defer.reject(xhr);
                }
            });
            return $.when(defer);
        };

        // For fetching file details by stepId/stepCode
        self.getFileDetails = function (stepDetail) {
            var defer = $.Deferred();
            if (typeof stepDetail === 'number') {
                var serverURL = self.portalRestHost() + "/services/rest/findStepDocsByStepId/" + stepDetail;
            } else {
                var serverURL = self.portalRestHost() + "/services/rest/findStepDocsByCode/" + stepDetail;
            }
            $.ajax({
                type: "GET",
                url: serverURL,
                beforeSend: function (request) {
                    request.setRequestHeader("Authorization", "Bearer " + sessionInfo.getFromSession(sessionInfo.accessToken));
                },
                success: function (data, status) {
                    console.log("Successfully retrieved details at: " + serverURL);
                    defer.resolve(data, status);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log("Error retrieving service details at: " + serverURL);
                    defer.reject(xhr);
                }
            });
            return $.when(defer);
        };

        self.getLinkId = function (fileId, docType) {
            var defer = $.Deferred();
            var serverURL = "https://documents-gse00002841.documents.us2.oraclecloud.com/documents/api/1.1/publiclinks/file/" + fileId;
            $.ajax({
                type: "GET",
                url: serverURL,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'Basic YmFsYS5ndXB0YTpzdFlnSUFOQDlDaGFQ');
                },
                success: function (data) {
                    console.log('Successfully retrieved details at: ' + serverURL);
                    if (data.id === fileId) {
                        defer.resolve(data.items[0].linkID, fileId, docType);
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log("Error retrieving service details at:" + serverURL);
                    defer.reject(xhr);
                }
            });
            return $.when(defer);
        };

        self.submitSR = function (payload) {
            console.log('payload : '+ JSON.stringify(payload));
            var defer = $.Deferred();
            var serverURL = self.portalRestHost() + "/services/rest/saveAndSendEmail/";
            $.ajax({
                type: "POST",
                url: serverURL,
                beforeSend: function (request) {
                    request.setRequestHeader("Authorization", "Bearer " + sessionInfo.getFromSession(sessionInfo.accessToken));
                },
                contentType: "application/json",
                data: JSON.stringify(payload),
                success: function (data) {
                    console.log('Successfully posted data at: ' + serverURL);
                    defer.resolve(data, {status: 200});
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log("Error posting data to the service" + serverURL);
                    defer.reject(xhr);
                }
            });
            return $.when(defer);
        };

        self.authenticate = function (payload) {
            console.log('payload : '+ JSON.stringify(payload));
            var defer = $.Deferred();
            var serverURL = self.portalRestHost() + "/login";
            $.ajax({
                type: "POST",
                url: serverURL,
                dataType: "json",
                beforeSend: function (request) {
                    request.setRequestHeader("Portal-Type", "user");
                },
                transformRequest: function (obj) {
                    var str = [];
                    for (var p in obj)
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
                },
                contentType: "application/x-www-form-urlencoded",
                data: payload,
                success: function (data, textStatus, xhr) {
                    console.log('Successfully posted data at: ' + serverURL);
                    defer.resolve(data, {status: xhr.status});
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log("Error posting data to the service : " + serverURL);
                    defer.reject(xhr);
                }
            });
            return $.when(defer);
        };

        self.getUserClmData = function (userId) {
            var defer = $.Deferred();
            var serverURL = self.portalRestHost() + "/services/rest/getClmData/" + userId + "/";
            $.ajax({
                type: "GET",
                url: serverURL,
                beforeSend: function (request) {
                    request.setRequestHeader("Authorization", "Bearer " + sessionInfo.getFromSession(sessionInfo.accessToken));
                },
                success: function (data) {
                    console.log('Successfully retrieved details at: ' + serverURL);
                    defer.resolve(data);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log("Error retrieving service details at: " + serverURL);
                    defer.reject(xhr);
                }
            });
            return $.when(defer);
        };

        self.getServiceItems = function () {
            var defer = $.Deferred();
            var serverURL = "pages/servicesMini/servicesMini.json";
            $.ajax({
                type: "GET",
                url: serverURL,
                dataType: "json",
                success: function (data, status) {
                    console.log('Successfully retrieved details at: ' + serverURL);
                    defer.resolve(data, status);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log("Error retrieving service details at: " + serverURL);
                    defer.reject(xhr);
                }
            });
            return $.when(defer);
        };

        self.getServiceDetails = function (serverType) {
            var defer = $.Deferred();
            var serverURL = self.portalRestHost() + "/services/rest/serviceBenefits/" + serverType + "/";
            $.ajax({
                type: "GET",
                url: serverURL,
                beforeSend: function (request) {
                    request.setRequestHeader("Authorization", "Bearer " + sessionInfo.getFromSession(sessionInfo.accessToken));
                },
                dataType: "json",
                success: function (data, status) {
                    console.log('Successfully retrieved details at: ' + serverURL);
                    defer.resolve(data, status);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log("Error retrieving service details at: " + serverType);
                    defer.reject(xhr);
                }
            });
            return $.when(defer);
        };

        self.getUseCaseItems = function () {
            var defer = $.Deferred();
            var serverURL = self.portalRestHost() + "/services/rest/usecases/";
            $.ajax({
                type: "GET",
                url: serverURL,
                beforeSend: function (request) {
                    request.setRequestHeader("Authorization", "Bearer " + sessionInfo.getFromSession(sessionInfo.accessToken));
                },
                dataType: "json",
                success: function (data, status) {
                    console.log('Successfully retrieved details at: ' + serverURL);
                    defer.resolve(data, status);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log("Error retrieving service details at: " + serverURL);
                    defer.reject(xhr);
                }
            });
            return $.when(defer);
        };

        self.getUseCaseDetails = function (usecaseCode) {
            var defer = $.Deferred();
            var serverURL = self.portalRestHost() + "/services/rest/usecases/" + usecaseCode + "/";
            $.ajax({
                type: 'GET',
                url: serverURL,
                beforeSend: function (request) {
                    request.setRequestHeader("Authorization", "Bearer " + sessionInfo.getFromSession(sessionInfo.accessToken));
                },
                dataType: "json",
                success: function (data, status) {
                    console.log('Successfully retrieved details at: ' + serverURL);
                    defer.resolve(data, status);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log("Error retrieving service details for: " + usecaseCode);
                    defer.reject(xhr);
                }
            });
            return $.when(defer);
        };

        self.getAllUseCases = function () {
            var defer = $.Deferred();
//             var serverURL = "js/pages/useCaseSelection/use_cases.json";
            var serverURL = self.portalRestHost() + "/services/rest/getAllUseCases";
            $.ajax({
                type: 'GET',
                url: serverURL,
                beforeSend: function (request) {
                    request.setRequestHeader("Authorization", "Bearer " + sessionInfo.getFromSession(sessionInfo.accessToken));
                },
                dataType: "json",
                success: function (data, status) {
                    console.log('Successfully retrieved details at: ' + serverURL);
                    defer.resolve(data, status);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log("Error retrieving service details.");
                    defer.reject(xhr);
                }
            });
            return $.when(defer);
        };
        
        self.getUseCasesForUser = function () {
            var defer = $.Deferred();
//            var serverURL = "js/pages/useCaseSelection/use_cases.json";
            var serverURL = self.portalRestHost() + "/services/rest/getUseCasesForUser";
            $.ajax({
                type: 'GET',
                url: serverURL,
                beforeSend: function (request) {
                    request.setRequestHeader("Authorization", "Bearer " + sessionInfo.getFromSession(sessionInfo.accessToken));
                },
                dataType: "json",
                success: function (data, status) {
                    console.log('Successfully retrieved details at: ' + serverURL);
                    defer.resolve(data, status);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log("Error retrieving service details.");
                    defer.reject(xhr);
                }
            });
            return $.when(defer);
        };
        
        self.getTailoredUseCases = function () {
            var defer = $.Deferred();
            var serverURL = self.portalRestHost() + "/services/rest/getTailoredUseCases";
//            var serverURL = "js/pages/useCaseSelection/use_cases.json";
            $.ajax({
                type: 'GET',
                url: serverURL,
                beforeSend: function (request) {
                    request.setRequestHeader("Authorization", "Bearer " + sessionInfo.getFromSession(sessionInfo.accessToken));
                },
                dataType: "json",
                success: function (data, status) {
                    console.log('Successfully retrieved details at: ' + serverURL);
                    defer.resolve(data, status);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log("Error retrieving service details.");
                    defer.reject(xhr);
                }
            });
            return $.when(defer);
        };

        self.getDecisionTree = function() {
            var defer = $.Deferred();
            // var serverURL = "js/pages/useCaseSelection/decisionTree.json";
            var serverURL = self.portalRestHost() + "/services/rest/getDecisionTree";
            $.ajax({
                type: 'GET',
                url: serverURL,
                beforeSend: function (request) {
                    request.setRequestHeader("Authorization", "Bearer " + sessionInfo.getFromSession(sessionInfo.accessToken));
                },
                dataType: "json",
                success: function (data, status) {
                    console.log('Successfully retrieved details at: ' + serverURL);
                    defer.resolve(data, status);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log("Error retrieving service details.");
                    defer.reject(xhr);
                }
            });
            return $.when(defer);
        };

        self.getUseCaseDemoDetails = function (useCaseId) {
            var defer = $.Deferred();
            var serverURL = "js/pages/useCaseSelection/useCaseSelectionDetails.json";
//            var serverURL = self.portalRestHost() + "/services/rest/usecases/" + useCaseId + "/";
            $.ajax({
                type: 'GET',
                url: serverURL,
//                beforeSend: function (request) {
//                    request.setRequestHeader("Authorization", "Bearer " + sessionInfo.getFromSession(sessionInfo.accessToken));
//                },
                dataType: "json",
                success: function (data, status) {
                    console.log('Successfully retrieved details at: ' + serverURL);
                    defer.resolve(data, status);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log("Error retrieving service details.");
                    defer.reject(xhr);
                }
            });
            return $.when(defer);
        };

        self.getAllServices = function () {
            var defer = $.Deferred();
            //var serverURL = "js/pages/useCaseSelection/services.json";
            var serverURL = self.portalRestHost() + "/services/rest/getAllServices";
            $.ajax({
                type: 'GET',
                url: serverURL,
                beforeSend: function (request) {
                    request.setRequestHeader("Authorization", "Bearer " + sessionInfo.getFromSession(sessionInfo.accessToken));
                },
                dataType: "json",
                success: function (data, status) {
                    console.log('Successfully retrieved details at: ' + serverURL);
                    defer.resolve(data, status);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log("Error retrieving service details.");
                    defer.reject(xhr);
                }
            });
            return $.when(defer);
        };
        
        self.getSelectedUseCaseBenefits = function () {
            var defer = $.Deferred();
            var serverURL = "js/pages/useCaseSelection/benefits.json";
            $.ajax({
                type: 'GET',
                url: serverURL,
//                beforeSend: function (request) {
//                    request.setRequestHeader("Authorization", "Bearer " + sessionInfo.getFromSession(sessionInfo.accessToken));
//                },
                dataType: "json",
                success: function (data, status) {
                    console.log('Successfully retrieved details at: ' + serverURL);
                    defer.resolve(data, status);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log("Error retrieving service details.");
                    defer.reject(xhr);
                }
            });
            return $.when(defer);
        };
        
        self.getUseCaseBenefits = function () {
            var defer = $.Deferred();
            var serverURL = "js/pages/useCaseSelection/otherUseCaseBenefits.json";
//            var serverURL = self.portalRestHost() + "/services/rest/getUseCaseBenefits";
            $.ajax({
                type: 'GET',
                url: serverURL,
                beforeSend: function (request) {
                    request.setRequestHeader("Authorization", "Bearer " + sessionInfo.getFromSession(sessionInfo.accessToken));
                },
                dataType: "json",
                success: function (data, status) {
                    console.log('Successfully retrieved details at: ' + serverURL);
                    defer.resolve(data, status);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log("Error retrieving service details.");
                    defer.reject(xhr);
                }
            });
            return $.when(defer);
        };
        
        self.saveUserUseCases = function (payload) {
            console.log('payload : '+ JSON.stringify(payload));
            var defer = $.Deferred();
            var serverURL = self.portalRestHost() + "/services/rest/saveUserUseCases/";
            $.ajax({
                type: "POST",
                url: serverURL,
                beforeSend: function (request) {
                    request.setRequestHeader("Authorization", "Bearer " + sessionInfo.getFromSession(sessionInfo.accessToken));
                },
                contentType: "application/json",
                data: JSON.stringify(payload),
                success: function (data) {
                    console.log('Successfully posted data at: ' + serverURL);
                    defer.resolve(data, {status: 200});
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log("Error posting data to the service" + serverURL);
                    defer.reject(xhr);
                }
            });
            return $.when(defer);
        };
        
        self.markUCCaptureCompletion = function () {
            var defer = $.Deferred();
            var serverURL = self.portalRestHost() + "/services/rest/markUCCaptureCompletion/";
            $.ajax({
                type: "POST",
                url: serverURL,
                beforeSend: function (request) {
                    request.setRequestHeader("Authorization", "Bearer " + sessionInfo.getFromSession(sessionInfo.accessToken));
                },
                contentType: "application/json",
                success: function (data) {
                    console.log('Successfully posted data at: ' + serverURL);
                    defer.resolve(data, {status: 200});
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log("Error posting data to the service" + serverURL);
                    defer.reject(xhr);
                }
            });
            return $.when(defer);
        };       

        self.forgotPasswordService = function (userId) {
            var defer = $.Deferred();
            var serverURL = self.portalRestHost() + "/services/rest/forgotPasswordService/" + userId + "/";
            $.ajax({
                type: 'GET',
                url: serverURL,
                success: function (data, status) {
                    console.log('Successfully retrieved details at: ' + serverURL);
                    defer.resolve(data, status);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    defer.reject(xhr);
                }
            });
            return $.when(defer);
        };

        self.updatePasswordService = function (payload) {
            console.log('payload : '+ JSON.stringify(payload));
            var defer = $.Deferred();
            var serverURL = self.portalRestHost() + "/services/rest/resetPassword/";
            $.ajax({
                type: 'POST',
                url: serverURL,
                contentType: "application/json",
                data: payload,
                beforeSend: function (request) {
                    request.setRequestHeader("Authorization", "Bearer " + sessionInfo.getFromSession(sessionInfo.accessToken));
                },
                success: function (data, status) {
                    console.log('Successfully posted data at: ' + serverURL);
                    defer.resolve(data, status);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    defer.reject(xhr);
                }
            });
            return $.when(defer);
        };

        self.requestCallBack = function (payload) {
            console.log('payload : '+ JSON.stringify(payload));
            var defer = $.Deferred();
            var serverURL = self.portalRestHost() + "/services/rest/requestCallback/";
            $.ajax({
                type: "POST",
                url: serverURL,
                dataType: "json",
                beforeSend: function (request) {
                    request.setRequestHeader("Authorization", "Bearer " + sessionInfo.getFromSession(sessionInfo.accessToken));
                },
                contentType: "application/json",
                data: payload,
                success: function (data, textStatus, xhr) {
                    console.log('Successfully posted data at: ' + serverURL);
                    console.log('textStatus : ' + textStatus);
                    console.log('Response status code : ' + xhr.status);
                    defer.resolve(data, {status: xhr.status});
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log("Error posting data to the service : " + serverURL);
                    defer.reject(xhr);
                }
            });
            return $.when(defer);
        };

        self.logout = function () {
            var defer = $.Deferred();
            var serverURL = self.portalRestHost() + "/logout";
            $.ajax({
                type: "GET",
                url: serverURL,
                beforeSend: function (request) {
                    request.setRequestHeader("Authorization", "Bearer " + sessionInfo.getFromSession(sessionInfo.accessToken));
                    request.setRequestHeader("Portal-Type", "user");
                },
                success: function () {
                    console.log('Successfully retrieved details at: ' + serverURL);
                    defer.resolve();
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log("Error retrieving service details at: " + serverURL);
                }
            });
            return $.when(defer);
        };

        self.updateAudit = function (payload) {
            console.log('payload : '+ JSON.stringify(payload));
            var serverURL = self.portalRestHost() + "/services/rest/updateAudit/";
            $.ajax({
                type: "POST",
                url: serverURL,
                beforeSend: function (request) {
                    request.setRequestHeader("Authorization", "Bearer " + sessionInfo.getFromSession(sessionInfo.accessToken));
                },
                contentType: "application/json",
                data: JSON.stringify(payload),
                success: function (data, textStatus, xhr) {
                    console.log('Successfully posted data at: ' + serverURL);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log("Error posting data to the service : " + serverURL);
                }
            });
        };
        
        self.notifyUCSelectionIgnored = function () {
            var serverURL = self.portalRestHost() + "/services/rest/notifyUCSelectionIgnored";
            $.ajax({
                type: "GET",
                url: serverURL,
                beforeSend: function (request) {
                    request.setRequestHeader("Authorization", "Bearer " + sessionInfo.getFromSession(sessionInfo.accessToken));
                },
                success: function (data, textStatus, xhr) {
                    console.log('Successfully posted data at: ' + serverURL);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log("Error posting data to the service : " + serverURL);
                }
            });
        };
    }
    ;

    return new serviceConfig();
});
