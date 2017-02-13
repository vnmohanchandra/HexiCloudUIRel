/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(['knockout', 'jquery', 'ojs/ojrouter'
], function (ko, $) {
    /**
     * The view model for the managing service calls
     */
    function serviceConfig() {
        var self = this;
        self.router = router;
        
        self.serverURI = ko.observable("https://documents-gse00002841.documents.us2.oraclecloud.com/documents/link/");
        
        self.updateCurrentStep = function(payload) {
//            var defer = $.Deferred();
            var serverURL = "https://140.86.1.93/hexiCloudRest/services/rest/createUserStep/";
            $.ajax({
                type: "POST",
                url: serverURL,
                contentType: "application/json",
                data: JSON.stringify(payload),
                success: function (data) {
                    console.log('Successfully posted data at: ' + serverURL);
                    console.log('Navigating to  : ' + payload.curStepCode);
                    router.go(payload.curStepCode);
//                    defer.resolve(payload.curStepCode, {status: 200});
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log("Error posting data to the service" + serverURL);
                    FailCallBackFn(xhr);
//                    defer.reject(xhr);
                }
            });
//            return $.when(defer);
        };
        
        self.getUserStep = function(userId) {
            var defer = $.Deferred();
            var serverURL = "https://140.86.1.93/hexiCloudRest/services/rest/findUsersCurrentStep/" + userId + "/";
            $.ajax({
                type: "GET",
                url: serverURL,
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
        
        self.getFileDetails = function(stepId) {
            var defer = $.Deferred();
            var serverURL = "https://141.145.40.38/hexiCloudRestApp/services/rest/findStepDocsByStepId/" + stepId;
            $.ajax({
                type: "GET",
                url: serverURL,
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
        
        self.getLinkId = function(fileId, docType) {
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
        
        self.submitSR = function(payload) {
            var defer = $.Deferred();
            var serverURL = "https://140.86.1.93/hexiCloudRest/services/rest/saveAndSendEmail/";
            $.ajax({
                type: "POST",
                url: serverURL,
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
    };
   
   return new serviceConfig();
});
