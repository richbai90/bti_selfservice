'use strict';

(function () {
  'use strict';

  angular.module('swSelfService').service('RequestListService', RequestListService);

  RequestListService.$inject = ['$q', '$rootScope', 'RequestService', 'SWSessionService', '$state', 'wssHelpers', 'wssLogging'];
  function RequestListService($q, $rootScope, RequestService, SWSessionService, $state, wssHelpers, wssLogging) {
    var requestServ = RequestService;
    var self = {
      'loadingRequests': false,
      'outputConfigObject': {},
      'selectedRequest': null,
      'requestArray': [],
      'totalRequests': 0,
      'callClass': 'all',
      'useClass': 'all',
      'callStatus': 'active',
      'useStatus': 'active',
      'pageNo': 1,
      'search': '',
      'callStatuses': [{
        name: 'Active Requests',
        value: 'active'
      }, {
        name: 'On-Hold Requests',
        value: 'onhold'
      }, {
        name: 'Resolved Requests',
        value: 'resolved'
      }, {
        name: 'Closed Requests',
        value: 'closed'
      }, {
        name: 'Cancelled Requests',
        value: 'cancelled'
      }, {
        name: 'All Requests',
        value: 'all'
      }]
    };

    self.setOrder = function (oColumn, oIndex) {
      self.outputConfigObject[self.requestPage].sortColumn = oIndex;
      self.outputConfigObject[self.requestPage].sortOrder = !self.outputConfigObject[self.requestPage].sortOrder;
      var strSortOrder = self.outputConfigObject[self.requestPage].sortOrder ? 'ASC' : 'DESC';
      self.outputConfigObject[self.requestPage].outputOrderBy = oColumn.dbtable + '.' + oColumn.column + ' ' + strSortOrder;
      if (self.pageNo === 1) {
        self.getPagedRequests();
      } else {
        self.pageNo = 1;
      }
    };

    self.getEntityTableStructure = function () {
      var deferred = $q.defer();
      if (!angular.isDefined(self.outputConfigObject[self.requestPage]) || !angular.isDefined(self.outputConfigObject[self.requestPage].table)) {
        wssHelpers.getTableConfig(self.outputConfig).then(function (response) {
          if (angular.isDefined(response.outputSQLColumns) && response.outputSQLColumns !== '') {
            self.outputConfigObject[self.requestPage] = response;
          }
          deferred.resolve("");
        }, function (error) {
          wssLogging.logger(error, "ERROR", "RequestListService::getEntityTableStructure", false, false);
          deferred.reject(error);
        });
      } else {
        deferred.resolve("");
      }
      return deferred.promise;
    };

    self.getPagedRequests = function () {
      self.selectedRequest = null;
      self.loadingRequests = true;
      self.requestArray = [];
      self.totalRequests = 0;
      self.outputConfig = 'table.requests.' + self.requestPage;
      self.getEntityTableStructure().then(function () {
        requestServ.getRequestCount(self.outputConfigObject[self.requestPage], self.useClass, self.useStatus, self.search).then(function (response) {
          self.totalRequests = response;
          requestServ.getRequests(self.outputConfigObject[self.requestPage], self.outputConfigObject[self.requestPage].outputSQLColumns, self.useClass, self.useStatus, self.outputConfigObject[self.requestPage].outputOrderBy, self.search, self.pageNo, self.totalRequests).then(function (params) {
            self.requestArray = params;
            self.loadingRequests = false;
          }, function (error) {
            self.loadingRequests = false;
            self.totalRequests = 0;
            wssLogging.logger(error, "ERROR", "RequestListService::getPagedRequests", false, false);
          });
        }, function (error) {
          self.loadingRequests = false;
          self.totalRequests = 0;
          wssLogging.logger(error, "ERROR", "RequestListService::getPagedRequests", false, false);
        });
      }, function (error) {
        self.loadingRequests = false;
        self.totalRequests = 0;
        wssLogging.logger(error, "ERROR", "RequestListService::getPagedRequests", false, false);
      });
    };

    self.clearSearch = function () {
      self.search = "";
    };

    self.selectRequest = function (request) {
      self.selectedRequest = request;
    };

    self.getNextPage = function (pageNum) {
      SWSessionService.checkActiveSession().then(function () {
        self.selectedRequest = null;
        self.pageNo = pageNum;
      });
    };

    self.requestDetails = function (callRef) {
      self.selectedRequest = null;
      self.requestArray = [];
      self.totalRequests = 0;
      self.pageNo = 1;
      $state.go('requestdetails', { requestID: callRef });
    };

    self.watchFilters = function () {
      $rootScope.$watch(function () {
        return self.callStatus;
      }, function (newVal, oldVal) {
        if (angular.isDefined(newVal.value) && angular.isDefined(oldVal.value) && newVal.value != oldVal.value) {
          self.callStatus = newVal;
          self.useStatus = newVal.value;
          if (self.pageNo === 1) {
            self.getPagedRequests();
          } else {
            self.pageNo = 1;
          }
        }
      });
      $rootScope.$watch(function () {
        return self.callClass;
      }, function (newVal, oldVal) {
        if (angular.isDefined(newVal.value) && angular.isDefined(oldVal.value) && newVal.value != oldVal.value) {
          self.callClass = newVal;
          self.useClass = newVal.value;
          if (self.pageNo === 1) {
            self.getPagedRequests();
          } else {
            self.pageNo = 1;
          }
        }
      });
      $rootScope.$watch(function () {
        return self.pageNo;
      }, function (newVal, oldVal) {
        if (angular.isDefined(newVal)) {
          if (angular.isDefined(self.requestPage)) {
            self.getPagedRequests();
          }
        }
      });
      $rootScope.$watch(function () {
        return self.requestPage;
      }, function (newVal, oldVal) {
        if (angular.isDefined(newVal)) {
          //self.pageNo = 1;
          self.getPagedRequests();
        }
      });
      $rootScope.$watch(function () {
        return self.search;
      }, function (newVal) {
        if (angular.isDefined(self.outputConfigObject[self.requestPage])) {
          if (angular.isDefined(newVal)) {
            if (self.pageNo === 1) {
              self.getPagedRequests();
            } else {
              self.pageNo = 1;
            }
          }
        }
      });
    };

    self.watchFilters();
    self.getEntityTableStructure();
    return self;
  }
})();
//# sourceMappingURL=requests.list.service.js.map