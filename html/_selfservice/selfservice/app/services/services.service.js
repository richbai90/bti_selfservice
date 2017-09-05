(function () {
  'use strict';

  angular.module('swSelfService').factory('ServicesService', ServicesService);

  ServicesService.$inject = ['$q', 'XMLMCService', '$rootScope', '$state', 'toaster', 'store', 'wssLogging'];

  function ServicesService($q, XMLMCService, $rootScope, $state, toaster, store, wssLogging) {
    var self = {
      'servicesLoading': false,
      'servCountSQ': 'query/wss/services/services.list.count',
      'servResultsSQ': 'query/wss/services/services.list.paged',
      'custServResultsSQ': 'query/wss/services/services.list.get',
      'ownServCountSQ': 'query/wss/services/services.own.list.count',
      'ownServResultsSQ': 'query/wss/services/services.own.list.paged',
      'unsubServCountSQ': 'query/wss/services/services.unsub.list.count',
      'unsubServResultsSQ': 'query/wss/services/services.unsub.list.paged',
      'getOwnSQ': 'query/wss/services/services.own.get',
      'getFavSQ': 'query/wss/services/services.fav.get',
      'addFavSQ': 'query/wss/services/services.fav.add',
      'delFavSQ': 'query/wss/services/services.fav.del',
      'selectedService': null,
      'serviceArray': [],
      'totalServices': 0,
      'rowsPerPage': 6,
      'pageNo': 1,
      'search': '',
      'orderBy': '',
      'category': '',
      'listType': 'cust',
      'favServices': [],
      'favStr': '',
      'ownServices': [],
      'ownStr': '',
      'favSearched': false
    };

    //Could be cust, fav or unsub
    self.getPagedServices = function () {
      if (self.custDetails = store.get("custDetails")) {
        self.servicesLoading = true;
        self.selectedService = null;
        self.getCustomerFavourites().then(function () {
          self.favSearched = true;
          self.getCustomerManaged().then(function () {
            self.getServicePage();
          });
        });
      }
    };

    self.getCustServices = function () {
      var deferred = $q.defer();
      if (self.custDetails = store.get("custDetails")) {
        self.servicesLoading = true;
        self.selectedService = null;
        self.getCustomerFavourites().then(function () {
          self.favSearched = true;
          self.getCustomerManaged().then(function () {
            deferred.resolve(self.getAllServices());
          });
        });
      }
      return deferred.promise;
    };

    self.getServicePage = function () {
      self.serviceArray = [];
      self.getServiceCount().then(function (response) {
        self.totalServices = response;
        self.getServices().then(function (params) {
          self.servicesLoading = false;
          self.serviceArray = params;
        }, function (error) {
          self.servicesLoading = false;
          self.totalServices = 0;
        });
      }, function (error) {
        self.totalServices = 0;
        self.servicesLoading = false;
      });
    };
    self.getAllServices = function () {
      self.listType = 'cust';
      var deferred = $q.defer();
      self.serviceArray = [];
      self.getServiceCount().then(function (response) {
        self.totalServices = response;
        self.getAllCustServices().then(function (params) {
          self.servicesLoading = false;
          self.serviceArray = params;
          deferred.resolve(params);
        }, function (error) {
          self.servicesLoading = false;
          self.totalServices = 0;
          deferred.reject(error);
        });
      }, function (error) {
        self.totalServices = 0;
        self.servicesLoading = false;
        deferred.reject(error);
      });

      return deferred.promise;
    };

    //Call to XMLMC to get the details of a service based in his fk_cmdb_id
    self.getServiceDetails = function (my_service) {
      var XMLCResponde = {};
      var deferred = $q.defer();
      var sqparams = "sid=" + my_service;
      var xmlmc = new XMLMCService.MethodCall();
      xmlmc.addParam("storedQuery", "query/wss/services/services.details");
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function (params) {
          //XMLC was succesfull
          deferred.resolve(params);
        },

        onFailure: function (error) {
          wssLogging.logger(error, "ERROR", "ServicesService::getServiceDetails", false, false);
          //Send a toaster and change state back to Home?
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    self.activeRequest = function (servId) {
      var activeRequest = [];
      var sqparams = "custid=" + self.custDetails.keysearch;
      sqparams += "&sid=" + servId;
      var xmlmc = new XMLMCService.MethodCall();
      var deferred = $q.defer();
      xmlmc.addParam("storedQuery", "query/wss/services/services.activerequest");
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function (params) {
          //XMLC was succesfull
          if (params.rowData) {
            if (Object.prototype.toString.call(params.rowData.row) === '[object Array]') {
              var intArrayLength = params.rowData.row.length;
              //obj is array
              for (var i = 0; i < intArrayLength; i++) {
                activeRequest.push(params.rowData.row[i]);
              }
            } else {
              activeRequest.push(params.rowData.row);
            }
            deferred.resolve(activeRequest);
          } else {
            deferred.resolve(activeRequest);
          }
        },

        onFailure: function (error) {
          //Send a toaster and change state back to Home?
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    self.closeRequest = function (servId) {
      var sqparams = "custid=" + self.custDetails.keysearch;
      var closeRequest = [];
      sqparams += "&sid=" + servId;

      var xmlmc = new XMLMCService.MethodCall();
      var deferred = $q.defer();
      xmlmc.addParam("storedQuery", "query/wss/services/services.closerequest");
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function (params) {
          //XMLC was succesfull
          if (params.rowData) {
            if (Object.prototype.toString.call(params.rowData.row) === '[object Array]') {
              var intArrayLength = params.rowData.row.length;
              //obj is array
              for (var i = 0; i < intArrayLength; i++) {
                closeRequest.push(params.rowData.row[i]);
              }
            } else {
              closeRequest.push(params.rowData.row);
            }
            deferred.resolve(closeRequest);
          } else {
            deferred.resolve(closeRequest);
          }
        },

        onFailure: function (error) {
          //Send a toaster and change state back to Home?
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    self.displayRequest = function (reqFormatCallref) {
      $state.go('requestdetails', { requestID: reqFormatCallref });
    };

    self.addCustomerFavourite = function (subsId, servId) {
      var deferred = $q.defer();
      var sqparams = "custid=" + self.custDetails.keysearch;
      sqparams += "&subid=" + subsId;
      var xmlmc = new XMLMCService.MethodCall();
      xmlmc.addParam("storedQuery", self.addFavSQ);
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function (params) {
          self.favServices[servId] = true;
          deferred.resolve(params);
        },
        onFailure: function (error) {
          wssLogging.logger(error, "ERROR", "ServicesService::addCustomerFavourite", false, false);
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    self.delCustomerFavourite = function (servId) {
      var deferred = $q.defer();
      var sqparams = "custid=" + self.custDetails.keysearch;
      sqparams += "&servid=" + servId;
      var xmlmc = new XMLMCService.MethodCall();
      xmlmc.addParam("storedQuery", self.delFavSQ);
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function (params) {
          self.favServices[servId] = false;
          deferred.resolve(params);
        },
        onFailure: function (error) {
          wssLogging.logger(error, "ERROR", "ServicesService::delCustomerFavourite", false, false);
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    self.getCustomerManaged = function () {
      var deferred = $q.defer();
      self.ownServices = [];
      var sqparams = "custid=" + self.custDetails.keysearch;
      var xmlmc = new XMLMCService.MethodCall();
      xmlmc.addParam("storedQuery", self.getOwnSQ);
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function (params) {
          if (params.rowData) {
            if (Object.prototype.toString.call(params.rowData.row) === '[object Array]') {
              var intArrayLength = params.rowData.row.length;
              //obj is array
              for (var i = 0; i < intArrayLength; i++) {
                self.ownServices[params.rowData.row[i].pk_auto_id] = true;
              }
            } else {
              self.ownServices[params.rowData.row.pk_auto_id] = true;
            }
            deferred.resolve(self.ownServices);
          } else {
            deferred.resolve('No Services Returned.');
          }
        },
        onFailure: function (error) {
          wssLogging.logger(error, "ERROR", "ServicesService::getCustomerManaged", false, false);
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    self.getCustomerFavourites = function () {
      var deferred = $q.defer();
      self.favServices = [];
      var sqparams = "custid=" + self.custDetails.keysearch;
      var xmlmc = new XMLMCService.MethodCall();
      xmlmc.addParam("storedQuery", self.getFavSQ);
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function (params) {
          if (params.rowData) {
            if (Object.prototype.toString.call(params.rowData.row) === '[object Array]') {
              var intArrayLength = params.rowData.row.length;
              //obj is array
              for (var i = 0; i < intArrayLength; i++) {
                self.favServices[params.rowData.row[i].fk_service] = true;
              }
            } else {
              self.favServices[params.rowData.row.fk_service] = true;
            }
            deferred.resolve(self.favServices);
          } else {
            deferred.resolve('No Services Returned.');
          }
        },
        onFailure: function (error) {
          wssLogging.logger(error, "ERROR", "ServicesService::getCustomerFavourites", false, false);
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    self.getServiceCount = function () {
      var deferred = $q.defer();
      var totalServices = 0;
      var serviceArray = [];
      var boolProcessCount = true;
      var sqparams = "custid=" + self.custDetails.keysearch;
      sqparams += "&dynfilter=" + encodeURIComponent(self.search);
      sqparams += "&cat=" + self.category;

      switch (self.listType) {
        case 'cust':
          self.currCountSQ = self.servCountSQ;
          self.currPagedSQ = self.servResultsSQ;
          break;
        case 'fav':
          self.currCountSQ = self.servCountSQ;
          self.currPagedSQ = self.servResultsSQ;
          self.favStr = '';
          if (self.favServices.length > 0) {
            angular.forEach(self.favServices, function (value, key) {
              if (value === true) {
                if (self.favStr !== '') self.favStr += ",";
                self.favStr += key;
              }
            });
            if (self.favStr !== '') {
              sqparams += "&favstr=" + self.favStr;
              boolProcessCount = true;
            } else {
              boolProcessCount = false;
              deferred.resolve(totalServices);
            }
          } else {
            boolProcessCount = false;
            deferred.resolve(totalServices);
          }
          break;
        case "own":
          self.currCountSQ = self.ownServCountSQ;
          self.currPagedSQ = self.ownServResultsSQ;
          self.ownStr = '';
          if (self.ownServices.length > 0) {
            angular.forEach(self.ownServices, function (value, key) {
              if (value === true) {
                if (self.ownStr !== '') self.ownStr += ",";
                self.ownStr += key;
              }
            });
            if (self.ownStr !== '') {
              sqparams += "&ownstr=" + self.ownStr;
              boolProcessCount = true;
            } else {
              boolProcessCount = false;
              deferred.resolve(totalServices);
            }
          } else {
            boolProcessCount = false;
            deferred.resolve(totalServices);
          }
          break;
        case 'unsub':
          self.currCountSQ = self.unsubServCountSQ;
          self.currPagedSQ = self.unsubServResultsSQ;
          break;
      }
      if (boolProcessCount) {
        var xmlmc = new XMLMCService.MethodCall();
        xmlmc.addParam("storedQuery", self.currCountSQ);
        xmlmc.addParam("parameters", sqparams);
        xmlmc.invoke("data", "invokeStoredQuery", {
          onSuccess: function (params) {
            if (params.rowData.row.cnt) {
              totalServices = params.rowData.row.cnt;
              deferred.resolve(totalServices);
            } else {
              deferred.reject(params);
            }
          },
          onFailure: function (error) {
            wssLogging.logger(error, "ERROR", "ServicesService::getServiceCount", false, false);
            deferred.reject(error);
          }
        });
      }
      return deferred.promise;
    };

    self.getServices = function () {
      var deferred = $q.defer();
      //Work out columns.
      var currPageNum = self.pageNo;
      var serviceArray = [];
      var sqparams = "custid=" + self.custDetails.keysearch;
      sqparams += "&orderby=" + self.orderBy;
      sqparams += "&dynfilter=" + encodeURIComponent(self.search);
      sqparams += "&cat=" + self.category;

      switch (self.listType) {
        case 'fav':
          if (self.favStr !== '') {
            sqparams += "&favstr=" + self.favStr;
          }
          break;
        case "own":
          if (self.ownStr !== '') {
            sqparams += "&ownstr=" + self.ownStr;
          }
          break;
      }

      if (self.totalServices > 0) {
        var totalPages = Math.ceil(self.totalServices / self.rowsPerPage);
        if (currPageNum > totalPages) {
          currPageNum = totalPages;
        }
        sqparams += "&records=" + self.rowsPerPage;
        sqparams += "&start=" + currPageNum;
        sqparams += "&table=config_itemi";
        //Now get a page worth of data
        var xmlmc = new XMLMCService.MethodCall();
        xmlmc.addParam("storedQuery", self.currPagedSQ);
        xmlmc.addParam("parameters", sqparams);
        xmlmc.invoke("data", "invokeStoredQuery", {
          onSuccess: function (params) {
            if (params.rowData) {
              if (Object.prototype.toString.call(params.rowData.row) === '[object Array]') {
                var intArrayLength = params.rowData.row.length;
                //obj is array
                for (var i = 0; i < intArrayLength; i++) {
                  serviceArray.push(params.rowData.row[i]);
                }
              } else {
                serviceArray.push(params.rowData.row);
              }
              deferred.resolve(serviceArray);
            } else {
              deferred.resolve('No Requests Returned.');
            }
          },
          onFailure: function (error) {
            wssLogging.logger(error, "ERROR", "ServicesService::getServices(" + self.currPagedSQ + ")", false, false);
            deferred.reject(error);
          }
        });
      } else {
        deferred.resolve(serviceArray);
      }
      return deferred.promise;
    };

    self.getAllCustServices = function () {
      var deferred = $q.defer();
      //Work out columns.
      var serviceArray = [];
      var sqparams = "custid=" + self.custDetails.keysearch;
      sqparams += "&orderby=" + self.orderBy;
      sqparams += "&cat=" + self.category;

      switch (self.listType) {
        case 'fav':
          if (self.favStr !== '') {
            sqparams += "&favstr=" + self.favStr;
          }
          break;
        case "own":
          if (self.ownStr !== '') {
            sqparams += "&ownstr=" + self.ownStr;
          }
          break;
      }

      if (self.totalServices > 0) {
        sqparams += "&table=config_itemi";
        //Now get a page worth of data
        var xmlmc = new XMLMCService.MethodCall();
        xmlmc.addParam("storedQuery", self.custServResultsSQ);
        xmlmc.addParam("parameters", sqparams);
        xmlmc.invoke("data", "invokeStoredQuery", {
          onSuccess: function (params) {
            if (params.rowData) {
              if (Object.prototype.toString.call(params.rowData.row) === '[object Array]') {
                var intArrayLength = params.rowData.row.length;
                //obj is array
                for (var i = 0; i < intArrayLength; i++) {
                  serviceArray.push(params.rowData.row[i]);
                }
              } else {
                serviceArray.push(params.rowData.row);
              }
              deferred.resolve(serviceArray);
            } else {
              deferred.resolve('No Requests Returned.');
            }
          },
          onFailure: function (error) {
            wssLogging.logger(error, "ERROR", "ServicesService::getServices(" + self.currPagedSQ + ")", false, false);
            deferred.reject(error);
          }
        });
      } else {
        deferred.resolve(serviceArray);
      }
      return deferred.promise;
    };

    self.getSubscriptionRecord = function (subsId) {
      var deferred = $q.defer();
      var sqparams = "subid=" + subsId;
      var objSubs = [];
      var xmlmc = new XMLMCService.MethodCall();
      xmlmc.addParam("storedQuery", "query/wss/services/services.subscription.get");
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function (params) {
          if (params.rowData) {
            objSubs = params.rowData.row;
          }
          deferred.resolve(objSubs);
        },
        onFailure: function (error) {
          wssLogging.logger(error, "ERROR", "ServicesService::getSubscriptionRecord", false, false);
          deferred.resolve(objSubs);
        }
      });
      return deferred.promise;
    };

    self.watchFilters = function () {
      $rootScope.$watch(function () {
        return self.pageNo;
      }, function (newVal, oldVal) {
        if (angular.isDefined(newVal) && angular.isDefined(oldVal) && newVal != oldVal) {
          self.getPagedServices();
        }
      });
      $rootScope.$watch(function () {
        return self.search;
      }, function (newVal, oldVal) {
        if (angular.isDefined(newVal) && angular.isDefined(oldVal) && newVal != oldVal) {
          self.getPagedServices();
        }
      });
      $rootScope.$watch(function () {
        return self.category;
      }, function (newVal, oldVal) {
        if (angular.isDefined(newVal) && angular.isDefined(oldVal) && newVal != oldVal) {
          self.getPagedServices();
        }
      });
    };

    self.currCountSQ = self.servCountSQ;
    self.currPagedSQ = self.servResultsSQ;
    self.watchFilters();
    return self;
  }
})();
//# sourceMappingURL=services.service.js.map