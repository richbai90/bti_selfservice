(function () {
  'use strict';

  angular.module('swSelfService').service('ServiceDetailsService', ServiceDetailsService);

  ServiceDetailsService.$inject = ['$q', 'XMLMCService', 'toaster', 'wssHelpers', 'store', '$http'];
  function ServiceDetailsService($q, XMLMCService, toaster, wssHelpers, store, $http) {

    var self = {
      'assetSQLColumns': '',
      'serviceId': 0,
      'callref': 0,
      'serviceDetails': [],
      'serviceDiary': [],
      'serviceAssets': [],
      'serviceAttachments': [],
      'serviceComponents': [],
      'serviceAuthorisation': [],
      'callClass': ''
    };

    self.getXMLMCInformation = function (my_service, action) {
      var arraySolution = [];
      var XMLCResponde = {};
      var deferred = $q.defer();
      var sqparams = "sid=" + my_service + "&executable=" + action;
      var xmlmc = new XMLMCService.MethodCall();

      xmlmc.addParam("storedQuery", "query/wss/services/services.details.information");
      xmlmc.addParam("parameters", sqparams);

      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function (params) {
          //XMLC was succesfull
          if (params.rowData) {
            if (Object.prototype.toString.call(params.rowData.row) === '[object Array]') {
              var intArrayLength = params.rowData.row.length;
              //obj is array
              for (var i = 0; i < intArrayLength; i++) {
                arraySolution.push(params.rowData.row[i]);
              }
            } else {
              arraySolution.push(params.rowData.row);
            }
            deferred.resolve(arraySolution);
          } else {
            deferred.resolve(arraySolution);
          }
        },

        onFailure: function (error) {
          //Send a toaster and change state back to Home?
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    return self;
  }
})();
//# sourceMappingURL=services.details.service.js.map