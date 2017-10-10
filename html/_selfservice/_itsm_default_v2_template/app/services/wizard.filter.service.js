(function (){
  'use strict';
  angular
    .module('swSelfService')
    .service('WizardFilterService', WizardFilterService);

  WizardFilterService.$inject=['$parse','store'];
  function WizardFilterService($parse, store) {

    //Create objects that customer admins can refer to from within the Wizard Question editor
    self.questionFilters = {
      custDetails: store.get("custDetails"),
      orgDetails: store.get("orgDetails"),
    };

    //Takes filter or default value from wizard question, replaces stuff between ![ and ]!
    // with evaluated content from self.questionFilters within this service
    self.processFilter = function(strFilter, boolPFS){
      self.questionFilters.lookup = store.get("lookup");
      var strReturn = strFilter;
      //Create array containing all strings from filter that are wrapped in ![]!
      var objReg = strFilter.match(/!\[(.*?)\]!/g);
      angular.forEach(objReg, function(rexVal){
        var newString = rexVal.replace("![","");
        newString = newString.replace("]!","");
        newString = $parse(newString)(self.questionFilters);
        if(boolPFS){
          newString = self.prepareForSQL(newString);
        }
        strReturn = strReturn.replace(rexVal, newString);
      });
      return strReturn;
    };

    self.prepareForSQL = function(strVal) {
      if(angular.isDefined(strVal)){
        return strVal.replace("'", "''");
      } else {
        return "";
      }
    };

    return self;
  }
}());
