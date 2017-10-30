'use strict';

(function () {
  'use strict';

  angular.module('swSelfService').factory('wssHelpers', wssHelpers);

  wssHelpers.$inject = ['store', '$rootScope', '$q', '$http', 'XMLMCService', 'wssLogging'];

  function wssHelpers(store, $rootScope, $q, $http, XMLMCService, wssLogging) {
    var self = {
      'sysWebFlags': {
        'OPTION_HAS_WEB_ACCESS': 1,
        'OPTION_CAN_LOG_CALLS': 2,
        'OPTION_CAN_UPDATE_CALLS': 4,
        'OPTION_CAN_VIEW_CALLS': 8,
        'OPTION_CAN_VIEW_SITECALLS': 16,
        'OPTION_CAN_VIEW_ORGCALLS': 32,
        'OPTION_CAN_CLOSE_CALLS': 64,
        'OPTION_CAN_VIEW_MULTI_ORGCALLS': 128,
        'OPTION_REMOTE_SUPPORT': 4096,
        'OPTION_ADMIN': 8192
      }
    };

    // hasWebflag - takes webflag option, checks to see if session webflag holds option bit
    // Returns true is customer has webflag option set, false if not
    self.hasWebflag = function (option) {
      if (self.sessionDetails = store.get('sessionConfig')) {
        return (self.sessionDetails.webFlags & self.sysWebFlags[option]) > 0 ? true : false;
      }
      return false;
    };

    //isManager - returns true if session customer is a manager, false if not
    self.isManager = function () {
      if (self.custDetails = store.get('custDetails')) {
        return self.custDetails.flg_manager == 1 ? true : false;
      }
      return false;
    };

    self.callrefValue = function (strCallref) {
      var callRef = strCallref.replace(/\D/g, '');
      callRef = parseInt(callRef, 10);
      return callRef;
    };

    self.setBranding = function () {
      //Get Branding from Config
      $rootScope.brandTextTitle = wssBranding.loginTitle;
      $rootScope.brandSubTitle = wssBranding.loginSubTitle;
      $rootScope.panelPrimaryHeaderColor = wssBranding.panelPrimaryHeaderBGColour;
      $rootScope.panelPrimaryTitleColor = wssBranding.panelPrimaryHeaderTitleColour;
      $rootScope.panelDefaultHeaderColor = wssBranding.panelDefaultHeaderBGColour;
      $rootScope.panelDefaultTitleColor = wssBranding.panelDefaultHeaderTitleColour;
      $rootScope.titleCircleColour = wssBranding.titleCircleColour;
      $rootScope.socialMedia = wssBranding.socialMedia;
    };

    self.unflattenTreeview = function (arr, key) {
      // Partials from http://stackoverflow.com/questions/18017869/build-tree-array-from-flat-array-in-javascript
      var treeArr = [],
          mappedArr = {},
          arrElem,
          mappedElem;

      // First map the nodes of the array to an object -> create a hash table.
      for (var i = 0, len = arr.length; i < len; i++) {
        arrElem = arr[i];
        mappedArr[arrElem[key]] = arrElem;
        mappedArr[arrElem[key]].children = [];
      }

      for (var label in mappedArr) {
        if (mappedArr.hasOwnProperty(label)) {
          mappedElem = mappedArr[label];
          // If the element is not at the root level, add it to its parent array of children.
          if (mappedElem.parentlabel) {
            mappedArr[mappedElem.parentlabel].children.push(mappedElem);
          }
          // If the element is at the root level, add it to first level elements array.
          else {
              treeArr.push(mappedElem);
            }
        }
      }
      return treeArr;
    };

    //Get and process JSON for data output
    self.getTableSettings = function (settingId, boolSchema) {
      $rootScope.adminModalNew = true;
      var deferred = $q.defer();
      var sqparams = "settingid=" + settingId;
      var xmlmc = new XMLMCService.MethodCall();
      xmlmc.addParam("storedQuery", "query/wss/admin/admin.tablesettings.get");
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function onSuccess(params) {
          if (params.rowData && !boolSchema) {
            $rootScope.adminModalNew = false;
            deferred.resolve(angular.fromJson(params.rowData.row.wss_config));
          } else {
            var objSettings = {};
            $rootScope.adminModalNew = true;
            deferred.resolve(objSettings);
          }
        },
        onFailure: function onFailure(error) {
          $rootScope.adminModalNew = true;
          wssLogging.logger(error, "ERROR", "wssHelpers::getTableSettings", false, false);
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    //Update table settings
    self.updateTableSettings = function (settingId, objSetting) {
      var deferred = $q.defer();
      var xmlmc = new XMLMCService.MethodCall();
      var sqparams = "settingid=" + settingId;
      sqparams += "&settings=" + xmlmc.encodeBase64(angular.toJson(objSetting, true));
      xmlmc.addParam("storedQuery", "query/wss/admin/admin.tablesettings.update");
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function onSuccess(params) {
          deferred.resolve(params);
        },
        onFailure: function onFailure(error) {
          wssLogging.logger(error, "ERROR", "wssHelpers::updateTableSettings", false, false);
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    //Update table settings
    self.resetTableSettings = function (settingId) {
      var deferred = $q.defer();
      var xmlmc = new XMLMCService.MethodCall();
      var sqparams = "settingid=" + settingId;
      xmlmc.addParam("storedQuery", "query/wss/admin/admin.tablesettings.reset");
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function onSuccess(params) {
          deferred.resolve(params);
        },
        onFailure: function onFailure(error) {
          wssLogging.logger(error, "ERROR", "wssHelpers::resetTableSettings", false, false);
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    //Add table settings
    self.insertTableSettings = function (settingId, objSetting) {
      var deferred = $q.defer();
      var xmlmc = new XMLMCService.MethodCall();
      var sqparams = "settingid=" + settingId;
      sqparams += "&settings=" + xmlmc.encodeBase64(angular.toJson(objSetting, true));
      xmlmc.addParam("storedQuery", "query/wss/admin/admin.tablesettings.insert");
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function onSuccess(params) {
          deferred.resolve(params);
        },
        onFailure: function onFailure(error) {
          wssLogging.logger(error, "ERROR", "wssHelpers::insertTableSettings", false, false);
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    //Get and process configuration file for table output
    self.getTableConfig = function (settingId, boolSchema) {
      var deferred = $q.defer();
      self.getTableSettings(settingId, boolSchema).then(function (settingJSON) {
        var returnResponse = settingJSON;
        returnResponse.outputSQLColumns = '';
        returnResponse.filterSQLColumns = '';
        returnResponse.outputOrderBy = '';
        angular.forEach(returnResponse.columns, function (objColumn) {
          //Build outputSQLColumns columns string
          if (returnResponse.outputSQLColumns !== '') {
            returnResponse.outputSQLColumns += ", ";
          }
          returnResponse.outputSQLColumns += objColumn.dbtable + '.' + objColumn.column;
          //Build searchInclude finter columns string
          if (angular.isDefined(objColumn.searchInclude) && objColumn.searchInclude === true) {
            if (returnResponse.filterSQLColumns !== '') {
              returnResponse.filterSQLColumns += "|";
            }
            returnResponse.filterSQLColumns += objColumn.dbtable + '.' + objColumn.column;
          }
        });
        //Process Order By
        angular.forEach(returnResponse.orderBy, function (objOrderBy) {
          //Build outputOrderBy string
          if (returnResponse.outputOrderBy !== '') {
            returnResponse.outputOrderBy += ", ";
          }
          returnResponse.outputOrderBy += objOrderBy.table + '.' + objOrderBy.column + ' ' + objOrderBy.direction;
        });
        deferred.resolve(returnResponse);
      }, function (error) {
        wssLogging.logger(error, "ERROR", "wssHelpers::getTableConfig", false);
        deferred.reject(error);
      });

      return deferred.promise;
    };

    //Table Data Stored Queries: Take a config object, pass back pipe seperated string of tables & config to join to
    self.processAdditionalTables = function (objConfig) {
      var strAddTables = '';
      if (angular.isDefined(objConfig) && angular.isDefined(objConfig.tableJoins)) {
        angular.forEach(objConfig.tableJoins, function (oValue) {
          if (strAddTables !== '') {
            strAddTables += '||';
          }
          strAddTables = strAddTables + oValue.joinTable + "|" + oValue.joinTableColumn + "|" + oValue.joinWithTable + "|" + oValue.joinWithTableColumn + "|" + oValue.joinType;
        });
      }
      return strAddTables;
    };

    self.decodeBase64 = function (strB64) {
      var deferred = $q.defer();
      //Using a 3rd party Base64 Decoder that supports Binary decoding - it's in additional-js.js
      var fileContent = Base64Binary.decode(strB64);
      deferred.resolve(fileContent);
      return deferred.promise;
    };

    return self;
  }
})();
//# sourceMappingURL=wss.helpers.service.js.map