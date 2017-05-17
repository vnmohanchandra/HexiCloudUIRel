/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * guidedPathLearning module
 */
define(['ojs/ojcore', 'jquery', 'knockout', 'config/serviceConfig', 'util/errorhandler', 'ojs/ojknockout', 'ojs/ojprogressbar'
], function (oj, $, ko, service, errorHandler) {
    
    /**
     * The view model for the main content view template
     */
    function guidedPathLearningViewModel(params) {
        
        var self = this;
        var router = params.ojRouter.parentRouter;
        
        self.areGuidedPathSectionsLoaded = ko.observable(false);
        self.selectedGuidedPathSection = ko.observable();
        self.selectedGuidedPathSubSection = ko.observable();
        if (params.rootData.selectedGuidedPathSection) {
            self.selectedGuidedPathSection(params.rootData.selectedGuidedPathSection);
        }

        self.getSelectedGuidedPathSection = function () {
            var sectionDocs = self.selectedGuidedPathSection().sectionDocs;
            for (var idx = 0; idx < sectionDocs.length; idx++) {
                if (sectionDocs[idx].sectionDocId === self.selectedGuidedPathSection().selectedSectionDocId) {
                    self.selectedGuidedPathSubSection(sectionDocs[idx]);
                    self.areGuidedPathSectionsLoaded(true);
                    return;
                }
            }
        };
        
        self.getTimeToCompleteByDocType = function(docType, timeToComplete) {
            if (docType === "PDF") {
                return timeToComplete + " read";
            } else if (docType === "VIDEO") {
                return timeToComplete;
            }
        };
       
        self.onClickFeedback = function() {
            if (selectedTemplate() === "") {
                selectedTemplate('email_content');
            }
            $("#tech_support").slideToggle();
        };
        
        self.handleAttached = function() {
            self.getSelectedGuidedPathSection();
        };
    }
    
    return guidedPathLearningViewModel;
});
