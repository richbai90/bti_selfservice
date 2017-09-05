(function () {
  'use strict';

  angular.module('swSelfService').service('RequestDetailsService', RequestDetailsService);

  RequestDetailsService.$inject = ['$q', 'XMLMCService', 'toaster', 'wssHelpers', 'store', '$http', 'wssLogging'];
  function RequestDetailsService($q, XMLMCService, toaster, wssHelpers, store, $http, wssLogging) {
    var self = {
      'assetConfig': 'table.request.assets',
      'assetSQLColumns': '',
      'callref': 0,
      'requestDetails': [],
      'requestDiary': [],
      'requestAssets': [],
      'requestAttachments': [],
      'requestComponents': [],
      'requestAuthorisation': [],
      'callClass': ''
    };

    self.getAssetsTableStructure = function () {
      var deferred = $q.defer();
      self.assetSQLColumns = '';
      wssHelpers.getTableConfig(self.assetConfig).then(function (response) {
        self.assetConfigObject = response;
        self.assetSQLColumns = response.outputSQLColumns;
        self.assetOrderBy = response.outputOrderBy;
        deferred.resolve(response);
      }, function (error) {
        wssLogging.logger(error, "ERROR", "RequestDetailsService::getAssetsTableStructure", false, false);
        deferred.reject(error);
      });
      return deferred.promise;
    };

    self.getRequestDetails = function (callref) {
      self.custDetails = store.get('custDetails');
      self.callref = wssHelpers.callrefValue(callref);
      var deferred = $q.defer();
      var sqparams = "custid=" + self.custDetails.keysearch;
      sqparams += "&callref=" + self.callref;
      var xmlmc = new XMLMCService.MethodCall();
      xmlmc.addParam("storedQuery", "query/wss/requests/request.details");
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function (params) {
          if (params.rowData.row) {
            self.requestDetails = params.rowData.row;
            deferred.resolve(self.requestDetails);
          } else {
            deferred.reject(params);
          }
        },
        onFailure: function (error) {
          wssLogging.logger(error, "ERROR", "RequestDetailsService::getRequestDetails", false, false);
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    self.getRequestDiary = function (callref) {
      self.requestDiary = [];
      self.callref = wssHelpers.callrefValue(callref);
      var deferred = $q.defer();
      var sqparams = "custid=" + self.custDetails.keysearch;
      sqparams += "&callref=" + self.callref;
      var xmlmc = new XMLMCService.MethodCall();
      xmlmc.addParam("storedQuery", "query/wss/requests/request.diary");
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function (params) {
          if (params.rowData) {
            if (Object.prototype.toString.call(params.rowData.row) === '[object Array]') {
              var intArrayLength = params.rowData.row.length;
              //obj is array
              for (var i = 0; i < intArrayLength; i++) {
                self.requestDiary.push(params.rowData.row[i]);
              }
            } else {
              self.requestDiary.push(params.rowData.row);
            }
            deferred.resolve(self.requestDiary);
          } else {
            deferred.reject(params);
          }
        },
        onFailure: function (error) {
          wssLogging.logger(error, "ERROR", "RequestDetailsService::getRequestDiary", false, false);
          //Send a toaster and change state back to Home
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    self.getRequestAttachments = function (callref) {
      self.requestAttachments = [];
      self.callref = wssHelpers.callrefValue(callref);
      var deferred = $q.defer();
      var sqparams = "custid=" + self.custDetails.keysearch;
      sqparams += "&callref=" + self.callref;
      var xmlmc = new XMLMCService.MethodCall();
      xmlmc.addParam("storedQuery", "query/wss/requests/request.attachments");
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function (params) {
          if (params.rowData) {
            if (Object.prototype.toString.call(params.rowData.row) === '[object Array]') {
              var intArrayLength = params.rowData.row.length;
              //obj is array
              for (var i = 0; i < intArrayLength; i++) {
                self.requestAttachments.push(params.rowData.row[i]);
              }
            } else {
              self.requestAttachments.push(params.rowData.row);
            }
            deferred.resolve(self.requestAttachments);
          } else {
            deferred.resolve({});
          }
        },
        onFailure: function (error) {
          wssLogging.logger(error, "ERROR", "RequestDetailsService::getRequestAttachments", false, false);
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    self.getRequestAssets = function (callref) {
      self.requestAssets = [];
      self.callref = wssHelpers.callrefValue(callref);
      self.strAddTables = wssHelpers.processAdditionalTables(self.assetConfigObject);
      var deferred = $q.defer();
      var sqparams = "callref=" + self.callref;
      sqparams += "&table=" + self.assetConfigObject.table;
      sqparams += "&columns=" + self.assetSQLColumns;
      sqparams += "&orderby=" + self.assetOrderBy;
      sqparams += "&addtables=" + self.strAddTables;
      var xmlmc = new XMLMCService.MethodCall();
      xmlmc.addParam("storedQuery", self.assetConfigObject.recordsStoredQuery);
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function (params) {
          if (params.rowData) {
            if (Object.prototype.toString.call(params.rowData.row) === '[object Array]') {
              var intArrayLength = params.rowData.row.length;
              //obj is array
              for (var i = 0; i < intArrayLength; i++) {
                self.requestAssets.push(params.rowData.row[i]);
              }
            } else {
              self.requestAssets.push(params.rowData.row);
            }
            deferred.resolve(self.requestAssets);
          } else {
            deferred.resolve([]);
          }
        },
        onFailure: function (error) {
          wssLogging.logger(error, "ERROR", "RequestDetailsService::getRequestAssets", false, false);
          deferred.reject(error);
        }
      });

      return deferred.promise;
    };

    self.getRequestComponents = function (callref) {
      self.requestComponents = [];
      self.callref = wssHelpers.callrefValue(callref);
      var deferred = $q.defer();
      var sqparams = "callref=" + self.callref;
      sqparams += "&custid=" + self.custDetails.keysearch;
      var xmlmc = new XMLMCService.MethodCall();
      xmlmc.addParam("storedQuery", "query/wss/requests/request.components");
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function (params) {
          if (params.rowData) {
            if (Object.prototype.toString.call(params.rowData.row) === '[object Array]') {
              var intArrayLength = params.rowData.row.length;
              //obj is array
              for (var i = 0; i < intArrayLength; i++) {
                self.requestComponents.push(params.rowData.row[i]);
              }
            } else {
              self.requestComponents.push(params.rowData.row);
            }
            deferred.resolve(self.requestComponents);
          } else {
            deferred.resolve({});
          }
        },
        onFailure: function (error) {
          wssLogging.logger(error, "ERROR", "RequestDetailsService::getRequestComponents", false, false);
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    self.buildProgressionBars = function (progression) {
      //Takes progression records for current workflow
      //and builds/returns stacked bar data for ui-bootstrap progress bar
      var progressData = [];
      progressData.progressBarData = [];
      progressData.progressTimelineData = [];
      progressData.progressMessages = [];
      var progType = 'warning';
      var progIcon = 'fa fa-lg fa-clock-o';
      var badgeTooltip = 'This stage is in progress.';
      var intCurrentProgress = 0;
      var useProgress = 0;
      var barProgress = 0;
      var barSeperatorSize = 2;
      var completeDescription = "";
      var workingDescription = "";
      var failureDescription = "";
      if (self.requestDetails.bpm_progress > 0) {
        progType = 'success';
        progIcon = 'fa fa-lg fa-check';
        badgeTooltip = 'This stage was completed successfully.';
      }
      angular.forEach(progression, function (progVal, progKey) {
        if (self.requestDetails.bpm_progress_fail === '1') {
          if (self.requestDetails.bpm_progress === progVal.pk_progid) {
            progType = 'danger';
            progIcon = 'fa fa-lg fa-ban';
            badgeTooltip = 'This stage has failed progression. See Diary for more information.';
            completeDescription = '';
            workingDescription = '';
            failureDescription = '';
            if (angular.isDefined(progVal.message_failure)) {
              failureDescription = progVal.message_failure;
            }
          } else if (progType === 'danger') {
            progType = 'info';
            progIcon = 'fa fa-lg fa-info';
            badgeTooltip = 'This stage has not been reached yet.';
          }
        }
        barProgress = parseInt(progVal.percentage, 10) * 10 - intCurrentProgress * 10;
        useProgress = parseInt(progVal.percentage, 10) - intCurrentProgress;
        intCurrentProgress = progVal.percentage;
        progressData.progressBarData.push({
          value: barProgress,
          type: progType,
          percent: useProgress,
          title: progVal.title,
          badgeClass: progType,
          badgeIconClass: progIcon,
          content: progVal.description,
          badgeTooltip: badgeTooltip
        });

        if (self.requestDetails.bpm_progress_fail !== '1') {
          if (self.requestDetails.bpm_progress === progVal.pk_progid) {
            progType = 'warning';
            progIcon = 'fa fa-lg fa-clock-o';
            badgeTooltip = 'This stage is in progress.';
            if (angular.isDefined(progVal.message_complete)) {
              completeDescription = progVal.message_complete;
            } else {
              completeDescription = "";
            }
          } else if (progType == 'warning') {
            progType = 'info';
            progIcon = 'fa fa-lg fa-info';
            badgeTooltip = 'This stage has not been reached yet.';
            if (angular.isDefined(progVal.message_working)) {
              workingDescription = progVal.message_working;
            } else {
              workingDescription = "";
            }
          }
        }
      });
      progressData.progressMessages.push({
        type: 'complete',
        message: completeDescription });
      progressData.progressMessages.push({
        type: 'working',
        message: workingDescription });
      progressData.progressMessages.push({
        type: 'failure',
        message: failureDescription });
      return progressData;
    };

    self.getWorkflowProgression = function () {
      var workflowProgression = [];
      var deferred = $q.defer();
      if (!angular.isDefined(self.requestDetails.bpm_workflow_id)) {
        //No workflow, return empty array
        deferred.resolve(workflowProgression);
      } else {
        //Get workflow progression stages, return as appropriate
        var sqparams = "workflow=" + self.requestDetails.bpm_workflow_id;
        var xmlmc = new XMLMCService.MethodCall();
        xmlmc.addParam("storedQuery", "query/wss/requests/bpm.progress");
        xmlmc.addParam("parameters", sqparams);
        xmlmc.invoke("data", "invokeStoredQuery", {
          onSuccess: function (params) {
            if (params.rowData) {
              if (Object.prototype.toString.call(params.rowData.row) === '[object Array]') {
                var intArrayLength = params.rowData.row.length;
                //obj is array
                for (var i = 0; i < intArrayLength; i++) {
                  workflowProgression.push(params.rowData.row[i]);
                }
              } else {
                workflowProgression.push(params.rowData.row);
              }
            }
            deferred.resolve(workflowProgression);
          },
          onFailure: function (error) {
            wssLogging.logger(error, "ERROR", "RequestDetailsService::getWorkflowProgression", false, false);
            deferred.reject(error);
          }
        });
      }
      return deferred.promise;
    };

    self.getBPMExtendedTableData = function () {
      self.extendedData = [];
      if (!angular.isDefined(self.requestDetails.bpm_workflow_id) || self.requestDetails.bpm_workflow_id === "") {
        return self.extendedData;
      }
      var xmlmc = new XMLMCService.MethodCall();
      xmlmc.addParam("table", "bpm_workflow");
      xmlmc.addParam("keyValue", self.requestDetails.bpm_workflow_id);
      xmlmc.invoke("data", "getRecord", {
        onSuccess: function (workflow) {
          if (angular.isDefined(workflow.record) && angular.isDefined(workflow.record.ext_db_table) && workflow.record.ext_db_table !== '') {
            //have extended table, now get record from it
            var xmlmc = new XMLMCService.MethodCall();
            xmlmc.addParam("table", workflow.record.ext_db_table);
            xmlmc.addParam("keyValue", self.callref);
            xmlmc.addParam("formatValues", "true");
            xmlmc.addParam("returnMeta", "true");
            xmlmc.invoke("data", "getRecord", {
              onSuccess: function (extendedRecord) {
                if (angular.isDefined(extendedRecord.record) && angular.isDefined(extendedRecord.meta)) {
                  angular.forEach(extendedRecord.record, function (recordVal, recordKey) {
                    if (recordKey !== "opencall") {
                      var extDisplayName = recordKey;
                      if (angular.isDefined(extendedRecord.meta[recordKey])) {
                        angular.forEach(extendedRecord.meta[recordKey], function (metaVal, metaKey) {
                          if (metaKey === "@displayName") {
                            extDisplayName = metaVal;
                          }
                        });
                      }
                      self.extendedData.push({
                        displayName: extDisplayName,
                        recordValue: recordVal
                      });
                    }
                  });
                }
              },
              onFailure: function (error) {
                //Extended record not found, or error in XMLMC
                //error to log ONLY if we have an actual error - ignore "record not found" as there may not be an extended table record!
                var res = error.match(/^(?=.*\bThe specified record\b)(?=.*\bin table\b)(?=.*\bwas not found\b).*$/);
                if (!angular.isArray(res)) {
                  wssLogging.logger(error, "ERROR", "RequestDetailsService::getBPMExtendedTableData", false, false);
                }
              }
            });
          }
        },
        onFailure: function (error) {
          wssLogging.logger(error, "ERROR", "RequestDetailsService::getBPMExtendedTableData", false, false);
        }
      });
      return self.extendedData;
    };

    self.getCallAttachment = function (callref, filename, dataid) {
      self.downloadingAttachment = dataid;
      var sqparams = "custid=" + self.custDetails.keysearch;
      sqparams += "&callref=" + callref;
      sqparams += "&filename=" + filename;
      sqparams += "&dataid=" + dataid;
      var xmlmc = new XMLMCService.MethodCall();
      xmlmc.addParam("storedQuery", "query/wss/requests/request.attachments.get");
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function (params) {
          if (params.rowData.row.response) {
            var oFile = params.rowData.row.response.split("||");
            var strMimeType = oFile[0];
            var oFileContent = oFile[1];
            wssHelpers.decodeBase64(oFileContent).then(function (response) {
              var file = new Blob([response], { type: strMimeType });
              //trick to download store a file having its URL
              var fileURL = URL.createObjectURL(file);
              var a = document.createElement('a');
              a.href = fileURL;
              a.target = '_blank';
              a.download = filename;
              document.body.appendChild(a);
              a.click();
              self.downloadingAttachment = 0;
            });
          } else {
            self.downloadingAttachment = 0;
          }
        },
        onFailure: function (error) {
          wssLogging.logger(error, "ERROR", "RequestDetailsService::getCallAttachment", false, false);
          self.downloadingAttachment = 0;
        }
      });
    };

    self.isRequestAuth = function () {
      self.custDetails = store.get('custDetails');
      self.instanceConfig = store.get("instanceConfig");
      var deferred = $q.defer();
      var sqparams = "custid=" + self.custDetails.keysearch;
      sqparams += "&callref=" + self.callref;
      var xmlmc = new XMLMCService.MethodCall();
      xmlmc.addParam("storedQuery", "query/wss/authorisations/request.auth.allowed");
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function (params) {
          if (!angular.isDefined(params.rowData)) {
            deferred.resolve(false);
          } else {
            if (Object.prototype.toString.call(params.rowData.row) === '[object Array]') {
              var rowArray = params.rowData.row;
              self.requestAuthorisation = params.rowData.row[0];
            } else {
              var row = params.rowData.row;
              self.requestAuthorisation = params.rowData.row;
            }
            if (angular.isDefined(self.requestAuthorisation.managerid)) {
              self.custDetails.fk_manager = self.requestAuthorisation.managerid;
            } else {
              self.custDetails.fk_manager = "";
            }
            deferred.resolve(self.requestAuthorisation);
          }

          /*if(params.rowData.row.counter === "1"){
            self.requestAuthorisation = params.rowData.row;
            if(params.rowData.row.managerid){
              self.custDetails.fk_manager = params.rowData.row.managerid;
            }
            deferred.resolve(self.requestAuthorisation);
          } else {
            deferred.resolve(false);
          }*/
        },
        onFailure: function (error) {
          wssLogging.logger(error, "ERROR", "RequestDetailsService::isRequestAuth", false, false);
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    self.getRequestAuthComponents = function () {
      self.authStandardComponents = [];
      self.authOptionalComponents = [];
      self.authUpgradeComponents = [];
      self.authComponentStrings = [];
      var deferred = $q.defer();
      if (!angular.isDefined(self.requestDetails.itsm_fk_service) || self.requestDetails.itsm_fk_service === '') {
        deferred.resolve(self.authComponentStrings);
      } else {
        var sqparams = "callref=" + self.callref;
        sqparams += "&sid=" + self.requestDetails.itsm_fk_service;
        var xmlmc = new XMLMCService.MethodCall();
        xmlmc.addParam("storedQuery", "query/wss/authorisations/request.auth.components");
        xmlmc.addParam("parameters", sqparams);
        xmlmc.invoke("data", "invokeStoredQuery", {
          onSuccess: function (compResponse) {
            if (compResponse.rowData) {
              if (Object.prototype.toString.call(compResponse.rowData.row) === '[object Array]') {
                var intArrayLength = compResponse.rowData.row.length;
                //obj is array
                for (var i = 0; i < intArrayLength; i++) {
                  if (compResponse.rowData.row[i].flg_isoptional === "0") {
                    self.authOptionalComponents.push(compResponse.rowData.row[i]);
                  } else {
                    self.authStandardComponents.push(compResponse.rowData.row[i]);
                  }
                }
              } else {
                if (compResponse.rowData.row.flg_isoptional === "0") {
                  self.authOptionalComponents.push(compResponse.rowData.row);
                } else {
                  self.authStandardComponents.push(compResponse.rowData.row);
                }
              }
              //Now get upgraded components
              var sqparams = "callref=" + self.callref;
              sqparams += "&sid=" + self.requestDetails.itsm_fk_service;
              var xmlmc = new XMLMCService.MethodCall();
              xmlmc.addParam("storedQuery", "query/wss/authorisations/request.auth.components.override");
              xmlmc.addParam("parameters", sqparams);
              xmlmc.invoke("data", "invokeStoredQuery", {
                onSuccess: function (upgradeCompResponse) {
                  if (upgradeCompResponse.rowData) {
                    if (Object.prototype.toString.call(upgradeCompResponse.rowData.row) === '[object Array]') {
                      var intArrayLength = upgradeCompResponse.rowData.row.length;
                      //obj is array
                      for (var i = 0; i < intArrayLength; i++) {
                        self.authUpgradeComponents.push(upgradeCompResponse.rowData.row[i]);
                      }
                    } else {
                      self.authUpgradeComponents.push(upgradeCompResponse.rowData.row);
                    }
                  }
                  //Now build component string list.
                  //Standard Components
                  angular.forEach(self.authStandardComponents, function (aCompVal, aCompKey) {
                    self.authComponentStrings.push(aCompVal.qty + "x '" + aCompVal.description + "' is a standard component");
                  });
                  //Upgraded Components
                  angular.forEach(self.authUpgradeComponents, function (aCompVal, aCompKey) {
                    self.authComponentStrings.push("Replacing " + aCompVal.overqty + "x '" + aCompVal.override + "' with " + aCompVal.qty + "x '" + aCompVal.description + "' at an additional cost of " + aCompVal.price_diff);
                  });
                  //Optional Components
                  angular.forEach(self.authOptionalComponents, function (aCompVal, aCompKey) {
                    self.authComponentStrings.push(aCompVal.qty + "x '" + aCompVal.description + "' is optional at a price of " + aCompVal.comp_price);
                  });
                  deferred.resolve(self.authComponentStrings);
                },
                onFailure: function (error) {
                  wssLogging.logger(error, "ERROR", "RequestDetailsService::getRequestAuthComponents", false, false);
                  //Now build component string list.
                  //Standard Components
                  angular.forEach(self.authStandardComponents, function (aCompVal, aCompKey) {
                    self.authComponentStrings.push(aCompVal.qty + "x '" + aCompVal.description + "' is a standard component");
                  });
                  //Optional Components
                  angular.forEach(self.authOptionalComponents, function (aCompVal, aCompKey) {
                    self.authComponentStrings.push(aCompVal.qty + "x '" + aCompVal.description + "' is optional at a price of " + aCompVal.comp_price);
                  });
                  deferred.resolve(self.authComponentStrings);
                }
              });
            } else {
              deferred.resolve({});
            }
          },
          onFailure: function (error) {
            wssLogging.logger(error, "ERROR", "RequestDetailsService::getRequestAuthComponents", false, false);
            deferred.reject(error);
          }
        });
      }
      return deferred.promise;
    };

    self.getFileIcon = function (fileName) {
      var fileExtension = fileName.slice((fileName.lastIndexOf(".") - 1 >>> 0) + 2);
      switch (fileExtension) {
        case "txt":
          return "fa-file-text-o";
        case "png":
        case "jpg":
        case "jpeg":
        case "gif":
        case "tif":
        case "tiff":
        case "bpm":
          return "fa-file-image-o";
        case "htm":
        case "html":
        case "mht":
        case "xml":
          return "fa-file-code-o";
        case "doc":
        case "docx":
        case "docm":
          return "fa-file-word-o";
        case "xls":
        case "xlsx":
        case "xlsm":
          return "fa-file-excel-o";
        case "pdf":
          return "fa-file-pdf-o";
        case "ppt":
        case "pptx":
          return "fa-file-powerpoint-o";
        case "mp3":
        case "wav":
        case "wma":
          return "fa-file-audio-o";
        case "zip":
        case "gz":
        case "gzi":
        case "gzip":
        case "rar":
        case "7zip":
        case "7z":
          return "fa-file-archive-o";
        default:
          return "fa-file-o";
      }
    };

    return self;
  }
})();
//# sourceMappingURL=request.details.service.js.map