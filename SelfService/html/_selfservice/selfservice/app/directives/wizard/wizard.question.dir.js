'use strict';

(function () {
  'use strict';

  angular.module('swSelfService').directive('wizardQuestion', wizardQuestion);
  wizardQuestion.$inject = ['$compile', '$templateRequest', 'store', 'WizardDataService'];
  function wizardQuestion($compile, $templateRequest, store, WizardDataService) {
    var getQuestionTemplate = function getQuestionTemplate(objContent) {
      var qTemplateURL = "";
      var qTemplate = "";
      switch (objContent.type) {
        case "Textbox":
          qTemplateURL = "templates/wizard/wizard.textbox.tpl.html";
          break;
        case "Multiline":
          qTemplateURL = "templates/wizard/wizard.multiline.tpl.html";
          break;
        case "Date":
          qTemplateURL = "templates/wizard/wizard.date.tpl.html";
          break;
        case "Date Range":
          qTemplateURL = "templates/wizard/wizard.daterange.tpl.html";
          break;
        case "Selectbox":
          qTemplateURL = "templates/wizard/wizard.selectbox.tpl.html";
          break;
        case "Radiobox":
          qTemplateURL = "templates/wizard/wizard.radiobox.tpl.html";
          break;
        case "SLARadiobox":
          qTemplateURL = "templates/wizard/wizard.slaradiobox.tpl.html";
          break;
        case "Checkbox":
          qTemplateURL = "templates/wizard/wizard.checkbox.tpl.html";
          break;
        case "StandardComponentRadiobox":
          qTemplateURL = "templates/wizard/wizard.radiobox.component.standard.tpl.html";
          break;
        case "OptionalComponentCheckbox":
          qTemplateURL = "templates/wizard/wizard.checkbox.component.optional.tpl.html";
          break;
        case "Option Selector":
          qTemplateURL = "templates/wizard/wizard.optionselect.tpl.html";
          break;
        case "Option Selector - Single Select":
          qTemplateURL = "templates/wizard/wizard.optionselect.single.tpl.html";
          break;
        case "Custom Picker":
          switch (objContent.pickername) {
            case "Customer Organisations":
            case "All Organisations":
              qTemplateURL = "templates/wizard/wizard.selectbox.tpl.html";
              break;
            case "Category":
              qTemplateURL = "templates/wizard/wizard.custompicker.probcode.tpl.html";
              break;
            case "File Attachments":
              qTemplateURL = "templates/wizard/wizard.fileattach.tpl.html";
              break;
            case "Configuration Items":
              qTemplateURL = "templates/wizard/wizard.custompicker.ci.tpl.html";
              break;
            case "Customer Lookup":
              qTemplateURL = "templates/wizard/wizard.custompicker.customerlookup.tpl.html";
              break;
            default:
              qTemplateURL = "templates/wizard/wizard.textbox.tpl.html";
              break;
          }
          break;
        default:
          qTemplateURL = "templates/wizard/wizard.textbox.tpl.html";
          break;
      }
      return qTemplateURL;
    };

    var qlinker = function qlinker(scope, element, attrs) {
      scope.wssConfig = store.get("wssConfig");
      //Need to access Data Service from directive scope
      //For Modal opening & data control
      scope.wizServ = WizardDataService;
      scope.templateUrl = getQuestionTemplate(scope.question);
    };

    return {
      restrict: 'E',
      template: '<div ng-include="templateUrl"></div>',
      link: qlinker,
      replace: true,
      scope: {
        question: '=',
        ngModel: '='
      }
    };
  }
})();
//# sourceMappingURL=wizard.question.dir.js.map