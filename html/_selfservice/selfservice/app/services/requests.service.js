(function () {
  'use strict';

  angular.module('swSelfService').factory('RequestService', RequestService);

  RequestService.$inject = ['$q', 'XMLMCService', '$http', 'store', 'wssHelpers', 'wssLogging'];

  function RequestService($q, XMLMCService, $http, store, wssHelpers, wssLogging) {
    var self = {
      'authCountSQ': 'query/wss/authorisations/request.auth.count',
      'callClasses': [{
        name: 'All Request Types',
        value: 'all'
      }, {
        name: 'Incidents',
        value: 'Incident'
      }, {
        name: 'Service Requests',
        value: 'Service Request'
      }, {
        name: 'Change Requests',
        value: 'Change Request'
      }],
      'RecentRequestsLoading': false
    };

    self.getRecentRequests = function () {
      self.RecentRequestsLoading = true;
      var deferred = $q.defer();
      var requestArray = [];
      self.custDetails = store.get('custDetails');
      var sqparams = "custid=" + self.custDetails.keysearch;
      var xmlmc = new XMLMCService.MethodCall();
      xmlmc.addParam("storedQuery", "query/wss/requests/cust.recent.calls");
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function (params) {
          if (params.rowData) {
            if (Object.prototype.toString.call(params.rowData.row) === '[object Array]') {
              var intArrayLength = params.rowData.row.length;
              //obj is array
              for (var i = 0; i < intArrayLength; i++) {
                requestArray.push(params.rowData.row[i]);
              }
            } else {
              requestArray.push(params.rowData.row);
            }
            self.RecentRequestsLoading = false;
            deferred.resolve(requestArray);
          } else {
            self.RecentRequestsLoading = false;
            deferred.resolve('');
          }
        },
        onFailure: function (error) {
          self.RecentRequestsLoading = false;
          wssLogging.logger(error, "ERROR", "RequestService::getRecentRequests", false, false);
        }
      });
      return deferred.promise;
    };

    self.getRequestCount = function (objConfig, strClass, strStatus, strDynFilter) {
      self.custDetails = store.get('custDetails');
      self.strAddTables = wssHelpers.processAdditionalTables(objConfig);
      var deferred = $q.defer();
      var totalRequests = 0;
      var requestArray = [];
      var sqparams = "custid=" + self.custDetails.keysearch;
      sqparams += "&table=" + objConfig.table;
      sqparams += "&class=" + strClass;
      sqparams += "&status=" + strStatus;
      sqparams += "&appcodefilter=" + objConfig.enableAppcodeFilter;
      sqparams += "&dynfilter=" + encodeURIComponent(strDynFilter);
      sqparams += "&dynfiltercols=" + objConfig.filterSQLColumns;
      sqparams += "&addtables=" + self.strAddTables;
      var xmlmc = new XMLMCService.MethodCall();
      xmlmc.addParam("storedQuery", objConfig.countStoredQuery);
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function (params) {
          if (angular.isObject(params.rowData) && params.rowData.row.reqcnt) {
            totalRequests = params.rowData.row.reqcnt;
            deferred.resolve(totalRequests);
          } else {
            deferred.resolve('0');
          }
        },
        onFailure: function (error) {
          wssLogging.logger(error, "ERROR", "RequestService::getRequestCount", false, false);
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    self.getRequests = function (objConfig, strColumns, strClass, strStatus, strOrderBy, strDynFilter, intPageNum, intTotalRequests) {
      var deferred = $q.defer();
      //Work out columns.
      var currPageNum = intPageNum;
      var requestArray = [];
      var requestIDArray = [];
      var sqparams = "custid=" + self.custDetails.keysearch;
      sqparams += "&table=" + objConfig.table;
      sqparams += "&columns=" + strColumns;
      sqparams += "&class=" + strClass;
      sqparams += "&status=" + strStatus;
      sqparams += "&orderby=" + strOrderBy;
      sqparams += "&appcodefilter=" + objConfig.enableAppcodeFilter;
      sqparams += "&dynfilter=" + encodeURIComponent(strDynFilter);
      sqparams += "&dynfiltercols=" + objConfig.filterSQLColumns;
      sqparams += "&addtables=" + self.strAddTables;
      if (intTotalRequests > 0) {
        var totalPages = Math.ceil(intTotalRequests / objConfig.rowsPerPage);
        if (currPageNum > totalPages) {
          currPageNum = totalPages;
        }
        sqparams += "&records=" + objConfig.rowsPerPage;
        sqparams += "&start=" + currPageNum;
        //Now get a page worth of data
        var xmlmc = new XMLMCService.MethodCall();
        xmlmc.addParam("storedQuery", objConfig.recordsStoredQuery);
        xmlmc.addParam("parameters", sqparams);
        xmlmc.invoke("data", "invokeStoredQuery", {
          onSuccess: function (params) {
            if (params.rowData) {
              if (Object.prototype.toString.call(params.rowData.row) === '[object Array]') {
                var intArrayLength = params.rowData.row.length;
                //obj is array
                for (var i = 0; i < intArrayLength; i++) {
                  requestArray.push(params.rowData.row[i]);
                }
              } else {
                requestArray.push(params.rowData.row);
              }
              deferred.resolve(requestArray);
            } else {
              deferred.resolve('No Requests Returned.');
            }
          },
          onFailure: function (error) {
            wssLogging.logger(error, "ERROR", "RequestService::getRequests", false, false);
            deferred.reject(error);
          }
        });
      } else {
        deferred.resolve(requestArray);
      }
      return deferred.promise;
    };

    self.getAuthCount = function () {
      self.custDetails = store.get('custDetails');
      var deferred = $q.defer();
      var totalRequests = 0;
      var requestArray = [];
      var sqparams = "custid=" + self.custDetails.keysearch;
      var xmlmc = new XMLMCService.MethodCall();
      xmlmc.addParam("storedQuery", self.authCountSQ);
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function (params) {
          if (params.rowData.row.counter) {
            deferred.resolve(params.rowData.row.counter);
          } else {
            deferred.resolve(0);
          }
        },
        onFailure: function (error) {
          wssLogging.logger(error, "ERROR", "RequestService::getAuthCount", false, false);
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    self.callClassClass = function (callClass) {
      switch (callClass) {
        case "Incident":
          return "fa fa-exclamation-triangle call-icon-incident";
        case "Service Request":
          return "fa fa-bullhorn call-icon-srequest";
        case "Change Request":
          return "fa fa-plus-circle call-icon-crequest";
        default:
          return "fa fa-desktop pull-right";
      }
    };

    self.callStatusClass = function (callStatus) {
      switch (callStatus) {
        case "1":
        case "2":
        case "3":
        case "5":
        case "7":
        case "8":
        case "9":
        case "10":
        case "11":
          return "call-status-active";
        case "4":
          return "call-status-onhold";
        case "6":
        case "16":
        case "17":
        case "18":
          return "call-status-resolved";
        default:
          return "";
      }
    };

    return self;
  }
})();
//# sourceMappingURL=requests.service.js.map