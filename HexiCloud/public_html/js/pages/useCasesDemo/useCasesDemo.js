/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * useCasesDemo module
 */
define(['ojs/ojcore', 'jquery', 'knockout', 'config/serviceConfig', 'ojs/ojknockout', 'ojs/ojmasonrylayout', 'ojs/ojinputtext',
    'ojs/ojcheckboxset', 'ojs/ojradioset', 'ojs/ojswitch', 'ojs/ojselectcombobox'
], function (oj, $, ko, service) {
    /**
     * The view model for the main content view template
     */
    function useCasesDemoContentViewModel(params) {
        var self = this;
        var router = params.ojRouter.parentRouter;
        var useCaseDrawerRight;//, navigationDrawerRight;

        useCaseDrawerRight = {
            "selector": "#useCaseDrawerRight",
            "edge": "end",
            "displayMode": "overlay",
            "autoDismiss": "none",
            "modality": "modal"
        };
        
        console.log('useCasesDemo page');
        
        self.tracker = ko.observable();
        
        self.isUseCaseItemsLoaded = ko.observable(false);
        self.selectedUseCaseItems = ko.observableArray([]);
        self.hasSelectedOtherUseCase = ko.observable(false);
        self.otherUseCaseServiceItems = ko.observableArray([]);
//        self.otherUseCaseBenefitsList = ko.observableArray([]);
        self.otherUseCaseBenefitsList = ko.observableArray([
            {value: 'benefits1', label: 'Benefits 1'},
            {value: 'benefits2', label: 'Benefits 2'},
            {value: 'benefits3', label: 'Benefits 3'},
            {value: 'benefits4', label: 'Benefits 4'},
            {value: 'benefits5', label: 'Benefits 5'},
            {value: 'other', label: 'Other'}
        ]);
        self.otherUseCases = ko.observableArray([]);
        self.useCasesQuestions = ko.observableArray(
            [{
                "status": "notStarted"
            }, {
                "status": null
            }, {
                "status": null
            }, {
                "status": null
            }, {
                "status": null
            }, {
                "status": null
            }, {
                "status": null
        }]);
        self.useCasesSubQuestions = ko.observableArray([]);
        self.haveImplementedUseCases = ko.observable(false);
        self.inQuestion = ko.observable(1);
        self.isSubQuestionSelected = ko.observable(false);
        self.finalSubQuestionSelected = ko.observable(false);
        self.finalSubQuestionTitle = ko.observable();
        self.selectedSubQuestion = ko.observableArray([]);
        self.areUseCaseDetailsFetched = ko.observable(false);
        self.selectedUseCaseDetails = ko.observableArray([]);
        self.switchOffUseCases = ko.observableArray([]);
        self.highlightedUseCases = ko.observableArray([]);
              
        self.otherUserCaseCount = ko.observable(0);
        
        self.useCaseItems = [];
        
        self.useCaseItemsTemplate = ko.pureComputed(function() {
            return self.haveImplementedUseCases() === true ? 'useCaseItemsNonEditable' : 'useCaseItemsEditable';
        });
        
        var useCaseItemsSuccessCbFn = function(data, status) {
            console.log(status);
            console.log(data);
            if (data.useCases) {
                var useCases = data.useCases;
                for (var idx = 0; idx < useCases.length; idx++) {
                    if (useCases[idx].title.length > 35) {
                        var trimTitle = useCases[idx].title.slice(0, 35);
                        useCases[idx].trimmedTitle = trimTitle + "...";
                    }
                }
                self.useCaseItems = useCases;
            }
            self.isUseCaseItemsLoaded(true);
        };
        
        var useCaseItemsFailCbFn = function(xhr) {
            console.log(xhr);
            hidePreloader();
        };
        
        var otherUseCaseServiceItemsSuccessCbFn = function(data, status) {
            self.otherUserCaseCount(self.otherUserCaseCount() + 1);
            console.log(status);
            console.log(data);
            self.otherUseCaseServiceItems(data.services);
            self.otherUseCases([{
                useCaseSummary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis sit amet eros a velit laoreet tristique accumsan sed libero.',
                useCaseServicesUsed: [self.otherUseCaseServiceItems()[0].label],
                useCaseBenefits: '',
                otherUserCaseCount: self.otherUserCaseCount()
            }]);
            hidePreloader();
        };
        
        var otherUseCaseServiceItemsFailCbFn = function(xhr) {
            console.log(xhr);
            hidePreloader();
        };
        
        var subQuestionsSuccessCbFn = function(data, status) {
            console.log(status);
            console.log(data);
            self.useCasesSubQuestions([]);
            var subQuestions = data.decisionTree;
            console.log(subQuestions);
            for (var idx = 0; idx < subQuestions.length; idx++) {
                if (idx === 0) {
                    self.useCasesSubQuestions.push({
                        "index": (idx + 1),
                        "id": subQuestions[idx].id,
                        "question": subQuestions[idx].question,
                        "yesQId": subQuestions[idx].yesQId,
                        "noQId": subQuestions[idx].noQId,
                        "yesSwitchOffCases": subQuestions[idx].yesSwitchOffCases,
                        "noSwitchOffCases": subQuestions[idx].noSwitchOffCases,
                        "preQId": subQuestions[idx].preQId,
                        "status": "notStarted"
                    });
                } else {
                    self.useCasesSubQuestions.push({
                        "index": (idx + 1),
                        "id": subQuestions[idx].id,
                        "question": subQuestions[idx].question,
                        "yesQId": subQuestions[idx].yesQId,
                        "noQId": subQuestions[idx].noQId,
                        "yesSwitchOffCases": subQuestions[idx].yesSwitchOffCases,
                        "noSwitchOffCases": subQuestions[idx].noSwitchOffCases,
                        "preQId": subQuestions[idx].preQId,
                        "status": null
                    });
                }
            }
            self.isSubQuestionSelected(true);
            self.selectedSubQuestion(self.useCasesSubQuestions()[0]);
        };
        
        var subQuestionsFailCbFn = function(xhr) {
            console.log(xhr);
        };
//        
//        self.updateQuestionStep = function() {
//            for ( var idx = self.inQuestion() - 1; idx < self.useCasesQuestions().length; idx++) {
//                
//            }
//        };
        
        self._showComponentValidationErrors = function (trackerObj) {
            trackerObj.showMessages();
            if (trackerObj.focusOnFirstInvalid()) {
                return false;
            }
            return true;
        };
        
        self.addOtherUseCase = function() {
            self.otherUserCaseCount(self.otherUserCaseCount() + 1);
            console.log(self.otherUseCaseServiceItems());
            console.log(self.otherUseCaseServiceItems()[0]);
//            self.otherUseCaseSummary = ko.observable('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis sit amet eros a velit laoreet tristique accumsan sed libero.');
//        self.otherUseCaseServicesUsed = ko.observableArray([]);
//        self.otherUseCaseBenefits = ko.observableArray(["   "]);
            self.otherUseCases.push({
                useCaseSummary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis sit amet eros a velit laoreet tristique accumsan sed libero.',
                useCaseServicesUsed: [self.otherUseCaseServiceItems()[0].label],
                useCaseBenefits: '',
                otherUserCaseCount: self.otherUserCaseCount()
            });
        };
        
        self.checkIfUseCaseAdded = function(id) {
            for (var idx = 0; idx < self.selectedUseCaseItems().length; idx++) {
                if (self.selectedUseCaseItems()[idx].id === id) {
                    console.log('found at ' + idx);
                    return true;
                }
            }
            console.log('not found');
            return false;
        };
        
        self.toggleUseCaseSelections = function(data, event) {
            var id = Number(event.currentTarget.id);
            console.log(id);
            console.log(self.selectedUseCaseItems());
            if (id !== 10) { // Other use case
//                var foundAt = self.checkIfUseCaseAdded(id);
                if (self.checkIfUseCaseAdded(id)) {
                    console.log('already added');
                    $("#" + id).removeClass("selected");
                    self.selectedUseCaseItems.remove( function (item) { return item.id === id; } );
//                    self.selectedUseCaseItems.splice(foundAt, 1);
                } else {
                    $("#" + id).addClass("selected");
                    
                    for(var idx = 0; idx < self.useCaseItems.length; idx++) {
                        if (id === self.useCaseItems[idx].id) {
                            self.selectedUseCaseItems().push(self.useCaseItems[idx]);
                        }
                    }
//                    self.selectedUseCaseItems().push(id);
                }
            } else {
//                var foundAt = self.checkIfUseCaseAdded(id);
                if (self.hasSelectedOtherUseCase()) {
                    self.otherUseCases([]);
                    console.log('already added');
                    $("#img10").removeClass("selected");
                    $("#" + id).removeClass("selected");
                    self.hasSelectedOtherUseCase(false);
                    self.selectedUseCaseItems.remove( function (item) { return item.id === id; } );
//                    self.selectedUseCaseItems.splice(foundAt, 1);
                } else {
                    console.log(self.otherUseCaseServiceItems());
                    self.otherUseCases([]);
                    self.otherUseCases([{
                        useCaseSummary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis sit amet eros a velit laoreet tristique accumsan sed libero.',
                        useCaseServicesUsed: [self.otherUseCaseServiceItems()[0].label],
                        useCaseBenefits: ''
                    }]);
                    $("#img10").addClass("selected");
                    $("#" + id).addClass("selected");
                    self.hasSelectedOtherUseCase(true);
                }
            }
            console.log(self.selectedUseCaseItems());
            console.log(self.otherUseCases());
        };
        
        self.moveToNextQuestion = function() {
            showPreloader();
            
            console.log(self.useCasesQuestions());
            
            var array = self.useCasesQuestions();
            self.useCasesQuestions([]);
            for (var index = 0; index < array.length; index++) {
                if ( index <= (self.inQuestion() - 1) ) {
                    console.log(index);
                    array[index].status = "completed";
                    array[index + 1].status = "notStarted";
                }
            }
            self.useCasesQuestions(array);
            if (self.inQuestion() === 3) {
                console.log(self.haveImplementedUseCases());
                console.log('making false to true of haveImplementedUseCases value');
                self.haveImplementedUseCases(true);
                self.goToStartUseCasesStep();
                console.log(self.haveImplementedUseCases());
//                service.getUseCaseDemoSubQuestions(self.inQuestion()).then(subQuestionsSuccessCbFn, subQuestionsFailCbFn);
            } else {
                self.inQuestion(self.inQuestion() + 1);
            }
            console.log(self.useCasesQuestions());
            if (self.hasSelectedOtherUseCase()) {
                // Validations
                var trackerObj = ko.utils.unwrapObservable(self.tracker);
                if (!this._showComponentValidationErrors(trackerObj)) {
                    return;
                }
            }
            
            console.log(self.selectedUseCaseItems());
            console.log(self.otherUseCases());
            hidePreloader();
        };
        
        self.goToStartUseCasesStep = function() {
            var array = self.useCasesQuestions();
            self.useCasesQuestions([]);            
            for (var index = 0; index < array.length; index++) {
                if (index < 3) {
                    array[index].status = "completed";
                    array[index + 1].status = "notStarted";
                }
            }
            self.inQuestion(4);
            self.useCasesQuestions(array);
            self.haveImplementedUseCases(true);
        };
        
        self.startTheUseCaseSelection = function(data, event) {
            for (var idx = 0; idx < self.useCasesQuestions().length; idx++) {
                if (self.useCasesQuestions()[idx].status === 'notStarted') {
                    self.inQuestion(idx + 1);
                }
            }
            if (self.inQuestion() === 4) {
                service.getUseCaseDemoSubQuestions().then(subQuestionsSuccessCbFn, subQuestionsFailCbFn);
            }
        };
        
        self.moveToNextSubQuestion = function(data, event) {            
            var id = event.currentTarget.id;            
            var useCases;
            
            // for matching with yes/no button id's
            var hasSelectedYes = id.startsWith("Y");
            id = id.substring(1);
            var foundAt;
            var array = self.useCasesSubQuestions();
            self.useCasesSubQuestions([]);
            
            // to get the id of selected sub question
            for (var index = 0; index < array.length; index++) {
                if (Number(id) === Number(array[index].id)) {
                    foundAt = index;
                }
            }
            
            // for checking whether it's last sub question or not
            if ((foundAt + 1) < array.length ) {
                array[foundAt].status = "completed";
                array[foundAt + 1].status = "notStarted";
                self.useCasesSubQuestions(array);
                self.selectedSubQuestion(self.useCasesSubQuestions()[id]);
            } else {
                array[foundAt].status = "completed";
                self.useCasesSubQuestions(array);
                self.selectedSubQuestion([]);
                self.finalSubQuestionTitle('We have tailored these use cases that would fit perfectly with your provisioned services.');
                self.finalSubQuestionSelected(true);
            }
            
            // to highlight the selected use cases for the matched sub questions
            if (hasSelectedYes) {
                useCases = array[foundAt].yesSwitchOffCases;
            } else {
                useCases = array[foundAt].noSwitchOffCases;
            }
            
            self.switchOffUseCases([]);
            if (useCases !== "") {
                useCases = useCases.split(",");
                for (var idx = 0; idx < useCases.length; idx++) {
                    self.switchOffUseCases.push(Number(useCases[idx]));
                }
                
                console.log('Use Cases to be switched off: ' + self.switchOffUseCases());
                for (var idx = 0; idx < self.useCaseItems.length; idx++) {
                    var searchStatus = $.inArray(self.useCaseItems[idx].id, self.switchOffUseCases());
                    if (searchStatus !== -1) {
                        console.log(self.useCaseItems[idx].id);
                        self.highlightedUseCases.push(self.useCaseItems[idx]);
                        $("#useCaseLayer" + self.useCaseItems[idx].id).removeClass("oj-sm-hide");
                        $("#useCase" + self.useCaseItems[idx].id).addClass("pointer-events-none");
                    } else {
                        console.log('not found');
                    }
                }
            }
        };
        
        self.getDetails = function(data, event) {
            console.log(data);
            console.log(event);
            if (data.id) {
                self.selectedUseCaseDetails(data);
                self.areUseCaseDetailsFetched(true);
                oj.OffcanvasUtils.open(useCaseDrawerRight);
            }
        };
        
        self.closeIt = function() {
            oj.OffcanvasUtils.close(useCaseDrawerRight);
        };
        
        self.finishDemo = function() {
            if (self.highlightedUseCases().length > 0) {
                useCasesSelected(true);
                selectedUseCases(self.highlightedUseCases());
            } else {
                useCasesSelected(false);
            }
            console.log('Selected use cases are: ');
            console.log(self.highlightedUseCases());
            router.go('dashboard/');
        };
        
        self.handleAttached = function() {
            showPreloader();
            oj.OffcanvasUtils.setupResponsive(useCaseDrawerRight);
            service.getDemoUseCaseItems().then(useCaseItemsSuccessCbFn, useCaseItemsFailCbFn);
            service.getotherUseCaseServiceItems().then(otherUseCaseServiceItemsSuccessCbFn, otherUseCaseServiceItemsFailCbFn);
        };
  }
    
    return useCasesDemoContentViewModel;
});
