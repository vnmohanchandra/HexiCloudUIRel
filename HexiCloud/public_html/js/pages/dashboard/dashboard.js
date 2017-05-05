/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * dashboard module
 */
define(['jquery', 'knockout', 'config/serviceConfig', 'config/sessionInfo', 'util/errorhandler', 'ojs/ojcore', 'ojs/ojknockout',  'ojs/ojprogressbar',
    'ojs/ojfilmstrip', 'components/techsupport/loader', 'ojs/ojmasonrylayout'
], function ($, ko, service, sessionInfo, errorHandler) {
    /**
     * The view model for the main content view template
     */
    function dashboardContentViewModel(params) {
        var self = this;
        var router = params.ojRouter.parentRouter;

        console.log('dashboard page');

        self.serviceItems = ko.observableArray([]);
        self.minimalServiceItems = ko.observableArray([]);
        self.allServiceItems = ko.observableArray([]);
        self.selectedServiceItem = ko.observable();
        self.selectedItemTitle = ko.observable();
        self.selectedItemSubTitle = ko.observable();
        self.benefitsTitle = ko.observable();
        self.pdfSrc = ko.observable();
        self.detailsContentMaxHeight = ko.observable(0);
        self.selectedItemBenefitsArray = ko.observableArray([]);
        self.noServices = ko.observable(false);
        self.hasServiceBenefits = ko.observable(false);
        self.showControlsButton = ko.observable(false);
        self.showViewAllButton = ko.observable(false);
        self.showViewLessButton = ko.observable(false);
        
        self.tailoredUseCases = ko.observableArray([]);
        self.isSelectionPhaseCompleted = ko.observable(false);
                
        self.getClass = function (serverType) {
//            if (serverType === 'COMPUTE') {
//                return 'blue';
//            } else if (serverType === 'JCS') {
//                return 'green';
//            } else {
//                return 'purple';
//            }
            return 'purple';
        };

        self.getIcon = function (serverType) {
            if (serverType.toLowerCase().indexOf("compute") >= 0) {
                return 'css/img/compute_w_72.png';
            } else if (serverType.toLowerCase().indexOf("storage") >= 0) {
                return 'css/img/storage_w_72.png';
            } else if (serverType.toLowerCase().indexOf("network") >= 0) {
                return 'css/img/network_w_72.png';
            } else if (serverType.toLowerCase().indexOf("container") >= 0) {
                return 'css/img/Container_w_72.png';
            } else if (serverType.toLowerCase().indexOf("ravello") >= 0) {
                return 'css/img/Ravello_w_72.png';
            } else if (serverType.toLowerCase().indexOf("cloud machine") >= 0) {
                return 'css/img/CloudMachine_w_72.png';
            } else {
                return 'css/img/compute_w_72.png';
            }
        };

        function populateUI(data, status) {
            console.log(data);
            console.log(status);
            var array = [];
            var length = 0;
            self.allServiceItems(data);
            if (self.allServiceItems()) {
                $.each(data, function (idx, serviceItem) {
                    if (length < serviceItem.details.length) {
                        length = serviceItem.details.length;
                    }
                    if (idx <= 3) {
                        array.push(serviceItem);
                    }
                    if (idx > 3) {
                        self.showControlsButton(true);
                        self.showViewAllButton(true);
                    }
                    console.log('idx: ' +idx);
                });
                self.detailsContentMaxHeight(length);
                self.minimalServiceItems(array);
                self.serviceItems(array);
            } else {
                self.noServices(true);
            }
            
            hidePreloader();
        };
        
        var getTailoredUseCasesSuccessCbFn = function (data, status) {
            if (data.capturePhaseCompleted) {
                isCapturePhaseCompleted(true);
            }
            
            if (data.selectionPhaseCompleted) {
                self.isSelectionPhaseCompleted(true);
                var useCases = data.useCases;
                if (useCases) {
                    for (var idx = 0; idx < useCases.length; idx++) {
                        if (useCases[idx].title.length > 35) {
                            var trimTitle = useCases[idx].title.slice(0, 35);
                            useCases[idx].trimmedTitle = trimTitle + "...";
                        }
                    }
                    self.tailoredUseCases(useCases);
                    $("#masonryUseCases").ojMasonryLayout("refresh");
                }
            }
            hidePreloader();
        };

        var getTailoredUseCasesFailCbFn = function (xhr) {
            hidePreloader();
            console.log(xhr);
            errorHandler.showAppError("ERROR_GENERIC", xhr);
        };
        
        self.openMinimalServices = function(data, event) {
            console.log('opening all service items..');
            self.serviceItems(self.minimalServiceItems());
            self.showViewLessButton(false);
            self.showViewAllButton(true);
        };
        
        self.openAllServices = function(data, event) {
            console.log('opening all service items..');
            self.serviceItems(self.allServiceItems());
            self.showViewAllButton(false);
            self.showViewLessButton(true);
        };

        self.openServiceDetail = function (data, event) {
            showPreloader();
            console.log(data);
            console.log(event);
            var serviceClicked = data.service;
            var serverType = data.service.toLowerCase();
            console.log(serverType);

            var successCbFn = function (data, status) {
                console.log(data);
                self.selectedServiceItem(serviceClicked);
                if (status !== 'nocontent') {
                    self.hasServiceBenefits(true);
                    self.selectedItemTitle(data.Service.title);
                    self.selectedItemSubTitle(data.Service.subTitle);
                    self.benefitsTitle(data.Service.Benefits.title);
                    self.pdfSrc(data.Service.FeaturesLink);
                    self.selectedItemBenefitsArray(data.Service.Benefits.benefitsList);
                    console.log(self.selectedItemTitle());
                    console.log(self.selectedItemSubTitle());
                    console.log(self.benefitsTitle());
                    console.log(self.pdfSrc());
                    console.log(self.selectedItemBenefitsArray());
                    
                    
                } else {
                    self.selectedItemTitle('Coming Soon');
                    self.selectedItemSubTitle('');
                    self.benefitsTitle('');
                    self.pdfSrc('');
                    self.hasServiceBenefits(false);
                    self.selectedItemBenefitsArray([]);
                }

                hidePreloader();
                
                // scroll the benefits conteiner to top including header
                $('html, body').animate({
                    scrollTop: $('#serviceBenfits').offset().top - 80
                }, 500);
            };

            service.getServiceDetails(serverType).then(successCbFn, FailCallBackFn);
            service.updateAudit({"stepCode" : getStateId(), "action" : "View More : " + serviceClicked});
        };

        self.onClickFeedback = function () {
            if (selectedTemplate() === "") {
                selectedTemplate('email_content');
            }
            $("#tech_support").slideToggle();
        };


        self.handleAttached = function () {
            showPreloader();
            
            sessionInfo.setToSession(sessionInfo.isOnboardingComplete, true);
            
            // service.getServiceItems().then(populateUI, FailCallBackFn);
            service.getUserClmData(loggedInUser()).then(populateUI, FailCallBackFn);
            
            service.getTailoredUseCases().then(getTailoredUseCasesSuccessCbFn, getTailoredUseCasesFailCbFn);
        };

        self.handleTransitionCompleted = function () {
            // scroll the whole window to top if it's scroll position is not on top
            $(window).scrollTop(0);
        };
    }

    return dashboardContentViewModel;
});
