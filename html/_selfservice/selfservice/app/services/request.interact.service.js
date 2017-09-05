(function () {
  'use strict';

  angular.module('swSelfService').service('RequestInteractService', RequestInteractService);

  RequestInteractService.$inject = ['$q', 'XMLMCService', 'wssHelpers', 'store', 'SWSessionService', 'wssLogging'];
  function RequestInteractService($q, XMLMCService, wssHelpers, store, SWSessionService, wssLogging) {

    var self = {};

    self.updateRating = function (strCallref, arrRating) {
      var deferred = $q.defer();
      self.custDetails = store.get("custDetails");
      var intCallref = wssHelpers.callrefValue(strCallref);
      if (angular.isDefined(arrRating)) {
        if (arrRating.origRating != arrRating.newRating || arrRating.origText != arrRating.newText) {
          var sqparams = "intrating=" + arrRating.newRating;
          sqparams += "&strrating=" + arrRating.newText;
          sqparams += "&callref=" + intCallref;
          sqparams += "&custid=" + self.custDetails.keysearch;
          var xmlmc = new XMLMCService.MethodCall();
          xmlmc.addParam("storedQuery", "query/wss/requests/request.update.rating");
          xmlmc.addParam("parameters", sqparams);
          xmlmc.invoke("data", "invokeStoredQuery", {
            onSuccess: function (params) {
              deferred.resolve("Request Rated Successfully");
            },
            onFailure: function (error) {
              wssLogging.logger(error, "ERROR", "RequestInteractService::updateRating", false, false);
              deferred.reject("Request Rating Failed:" + error);
            }
          });
        } else {
          deferred.resolve("Rating and Comments have not changed!");
        }
      }
      return deferred.promise;
    };

    self.updateRequest = function (strCallref, strUpdate, strUpdateType, objFileAttachments) {
      var deferred = $q.defer();
      self.custDetails = store.get("custDetails");

      var updateCode = "General Update";
      switch (strUpdateType) {
        case "Close":
        case "Cancel":
          updateCode = strUpdateType + " Call";
          strUpdate = "Customer has requested to " + updateCode + ": " + strUpdate;
          break;
      }

      var intCallref = wssHelpers.callrefValue(strCallref);
      var xmlmc = new XMLMCService.MethodCall();
      xmlmc.addParam("callref", intCallref);
      xmlmc.addParam("timeSpent", "1");
      xmlmc.addParam("description", strUpdate);
      xmlmc.addParam("updateSource", "Customer (" + self.custDetails.keysearch + ")");
      xmlmc.addParam("updateCode", updateCode);

      if (angular.isDefined(objFileAttachments) && typeof objFileAttachments == "object") {
        for (var k in objFileAttachments) {
          var objAttachment = {};
          if (objFileAttachments.hasOwnProperty(k)) {
            objAttachment.fileName = objFileAttachments[k].filename;
            objAttachment.fileData = objFileAttachments[k].base64;
            objAttachment.mimeType = objFileAttachments[k].filetype;
            xmlmc.addParam("fileAttachment", objAttachment);
          }
        }
      }

      xmlmc.invoke("selfservice", "customerUpdateCall", {
        onSuccess: function (params) {
          if (params.callActionStatus.success == "false") {
            var updateFailMessage = params.callActionStatus.message;
            if (updateFailMessage.indexOf("Callref") === 0) {
              updateFailMessage = "Unable to update this request as is in a status that cannot be updated.";
            }
            deferred.reject(updateFailMessage);
          } else {
            deferred.resolve("Request Updated Successfully");
          }
        },
        onFailure: function (error) {
          wssLogging.logger(error, "ERROR", "RequestInteractService::updateRequest", false, false);
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    self.authoriseRequest = function (strCallref, strUpdate, intDecision) {
      var deferred = $q.defer();
      self.custDetails = store.get("custDetails");
      var updateCode = "";
      intDecision++;
      switch (intDecision) {
        case 1:
          //Authorised
          updateCode = "Request Authorised";
          break;
        case 2:
          //Rejected
          updateCode = "Request Rejected";
          break;
        case 3:
          //Pass to manager
          updateCode = "Passed To Manager (" + self.custDetails.fk_manager + ")";
          break;
      }
      //Perform call diary update first
      var intCallref = wssHelpers.callrefValue(strCallref);
      var xmlmc = new XMLMCService.MethodCall();
      xmlmc.addParam("callref", intCallref);
      xmlmc.addParam("timeSpent", "1");
      xmlmc.addParam("description", strUpdate);
      xmlmc.addParam("updateSource", "Customer (" + self.custDetails.keysearch + ")");
      xmlmc.addParam("updateCode", updateCode);
      xmlmc.invoke("selfservice", "customerUpdateCall", {
        onSuccess: function (params) {
          if (params.callActionStatus.success == "false") {
            var updateFailMessage = params.callActionStatus.message;
            if (updateFailMessage.indexOf("Callref") === 0) {
              updateFailMessage = "Error updating request " + strCallref + ": This request is in a status that cannot be updated.";
            }
            deferred.reject(updateFailMessage);
          } else {
            //Call Diary Update was a success.
            //Now perform customerUpdateCallValues to move BPM on
            xmlmc.addParam("callref", intCallref);
            xmlmc.addParam("actionVerb", "BPM");
            var objAdditionalValues = {};
            objAdditionalValues.opencall = {};
            objAdditionalValues.opencall.bpm_laction = "AUTHORISATION";
            objAdditionalValues.opencall.bpm_lactionbytype = "CUSTOMER";
            objAdditionalValues.opencall.bpm_lactionres = intDecision;
            objAdditionalValues.opencall.bpm_lactionbyid = self.custDetails.keysearch;
            objAdditionalValues.opencall.bpm_execvpme = "1";
            xmlmc.addParam("additionalCallValues", objAdditionalValues);
            xmlmc.invoke("selfservice", "customerUpdateCallValues", {
              onSuccess: function (params) {
                SWSessionService.numAuths--;
                deferred.resolve("Authorisation Decision Applied Successfully");
              },
              onFailure: function (error) {
                wssLogging.logger(error, "ERROR", "RequestInteractService::authoriseRequest", false, false);
                deferred.reject(error);
              }
            });
          }
        },
        onFailure: function (error) {
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };
    return self;
  }
})();
//# sourceMappingURL=request.interact.service.js.map