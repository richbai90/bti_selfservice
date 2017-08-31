(function (){
  'use strict';
  angular
    .module('swSelfService')
    .service('WizardLogHelpersService', WizardLogHelpersService);

  WizardLogHelpersService.$inject=['$q', 'XMLMCService','wssLogging'];
  function WizardLogHelpersService($q, XMLMCService, wssLogging) {

    var self = {};

    //Take Priority, work out SLA
    self.getPrioritySLA = function(strPriority){
      var objSLA = {};
      var deferred = $q.defer();
      var xmlmc = new  XMLMCService.MethodCall();
      var sqparams = "priority="+strPriority;
      xmlmc.addParam("storedQuery", "query/wss/sla/sla.get");
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function(params){
          if(!Object.keys(params).length) {
            let error = `No priority ${strPriority} exists in sla priority relationship table`;
            wssLogging.logger(error, "ERROR", "WizardLogHelpersService::getPrioritySLA", true, true, "SLA Priority Error");
            deferred.reject(error);
          } else {
            if(angular.isDefined(params.rowData)){
              objSLA = params.rowData.row;
            }
            deferred.resolve(objSLA);
          }
        },
        onFailure: function(error){
          wssLogging.logger(error, "ERROR", "WizardLogHelpersService::getPrioritySLA", false, false);
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    self.getPriorityMatrix = function(strPriority, intSLAID){
      var deferred = $q.defer();
      var arrMatrix = [];
      arrMatrix.impact = "";
      arrMatrix.urgency = "";
      if(strPriority !== "" && intSLAID !== ""){
        var xmlmc = new  XMLMCService.MethodCall();
        var sqparams = "priority="+strPriority;
        sqparams += "&slaid="+intSLAID;
        xmlmc.addParam("storedQuery", "query/wss/sla/slamatrix.get");
        xmlmc.addParam("parameters", sqparams);
        xmlmc.invoke("data", "invokeStoredQuery", {
          onSuccess: function(params){
            if(angular.isDefined(params.rowData)){
              arrMatrix.impact = params.rowData.row.fk_impact;
              arrMatrix.urgency = params.rowData.row.fk_urgency;
            }
            deferred.resolve(arrMatrix);
          },
          onFailure: function(error){
            wssLogging.logger(error, "ERROR", "WizardLogHelpersService::getPriorityMatrix", false, false);
            deferred.reject(error);
          }
        });
      } else {
        deferred.resolve(arrMatrix);
      }
      return deferred.promise;
    };

    //Take SLAID, Impact & Urgency, return Priority
    self.getPriorityFromMatrix = function(intSLAID, strImpact, strUrgency){
      var deferred = $q.defer();
      var strPriority = "";
      var xmlmc = new  XMLMCService.MethodCall();
      var sqparams = "slaid="+intSLAID;
      sqparams += "&impact="+strImpact;
      sqparams += "&urgency="+strUrgency;
      xmlmc.addParam("storedQuery", "query/wss/sla/priority_from_matrix.get");
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function(params){
          if(angular.isDefined(params.rowData)){
            strPriority = params.rowData.row.fk_priority;
          }
          deferred.resolve(strPriority);
        },
        onFailure: function(error){
          wssLogging.logger(error, "ERROR", "WizardLogHelpersService::getPriorityFromMatrix", false, false);
          deferred.reject(strPriority);
        }
      });
      return deferred.promise;
    };

    //Take SLAID and Service ID, return Priority
    self.getPriorityFromSLAService = function(intSLAID, intServID){
      var deferred = $q.defer();
      var strPriority = "";
      var xmlmc = new  XMLMCService.MethodCall();
      var sqparams = "slaid="+intSLAID;
      sqparams += "&sid="+intServID;
      xmlmc.addParam("storedQuery", "query/wss/sla/priority_from_service_sla.get");
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function(params){
          if(angular.isDefined(params.rowData)){
            strPriority = params.rowData.row.priority;
          }
          deferred.resolve(strPriority);
        },
        onFailure: function(error){
          wssLogging.logger(error, "ERROR", "WizardLogHelpersService::getPriorityFromSLAService", false, false);
          deferred.reject(strPriority);
        }
      });
      return deferred.promise;
    };

    //Take Subscription ID, return Priority
    self.getPriorityFromSLASubscription = function(intSLAID, intSubID){
      var deferred = $q.defer();
      var strPriority = "";
      var xmlmc = new  XMLMCService.MethodCall();
      var sqparams = "sid="+intSubID;
      sqparams += "&slaid="+intSLAID;
      xmlmc.addParam("storedQuery", "query/wss/sla/priority_from_subs_sla.get");
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function(params){
          if(angular.isDefined(params.rowData)){
            if (Object.keys(params.rowData).length === 0)
               strPriority="Not configured";
            else
              strPriority = params.rowData.row.priority;

            
            if(strPriority === "[Use SLA Default Priority]"){
              self.getDefaultPriorityFromSLA(intSLAID).then(function(defaultPriority){
                strPriority = defaultPriority;
                deferred.resolve(defaultPriority);
              }, function(error){
                //No default priority
                deferred.reject(error);
              });
            } else {
              deferred.resolve(strPriority);
            }
          } else {
            deferred.resolve(strPriority);
          }
        },
        onFailure: function(error){
          wssLogging.logger(error, "ERROR", "WizardLogHelpersService::getPriorityFromSLASubscription", false, false);
          deferred.reject(strPriority);
        }
      });
      return deferred.promise;
    };

    //Take SLAID and Service ID, return Priority
    self.getDefaultPriorityFromSLA = function(intSLAID){
      var deferred = $q.defer();
      var strPriority = "";
      var xmlmc = new  XMLMCService.MethodCall();
      var sqparams = "slaid="+intSLAID;
      xmlmc.addParam("storedQuery", "query/wss/sla/priority_default_from_sla.get");
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function(params){
          if(angular.isDefined(params.rowData)){
            strPriority = params.rowData.row.priority;
          }
          deferred.resolve(strPriority);
        },
        onFailure: function(error){
          wssLogging.logger(error, "ERROR", "WizardLogHelpersService::getDefaultPriorityFromSLA", false, false);
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    return self;
  }
}());
