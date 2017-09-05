(function () {
  'use strict';

  angular.module('swSelfService').factory('wssLogging', wssLogging);

  wssLogging.$inject = ['$q', 'XMLMCService', 'toaster'];

  function wssLogging($q, XMLMCService, toaster) {
    var self = {};

    //Log File Entry
    self.logger = function (logDesc, logType, logSource, boolConsole, boolToast, toastTitle) {
      var deferred = $q.defer();
      var logDescription = '';
      if (angular.isArray(logDesc) || angular.isObject(logDesc)) {
        angular.forEach(logDesc, function (logVal, logKey) {
          if (logDescription !== '') {
            logDescription += ', ';
          }
          logDescription += '[' + logKey + '] ' + logVal;
        });
      } else {
        logDescription = logDesc;
      }

      //Output to console
      if (boolConsole === true) {
        var objLog = {
          logSource: logSource,
          logType: logType,
          logContent: logDesc
        };
        console.log(objLog);
      }

      if (boolToast === true) {
        var toastType = '';
        switch (logType) {
          case 'WARN':
            toastType = 'warning';
            break;
          case 'ERROR':
            toastType = 'error';
            break;
          default:
            toastType = 'info';
        }
        self.sendToast(toastType, logDescription, toastTitle);
      }

      var xmlmc = new XMLMCService.MethodCall();
      var sqparams = "logclass=SYSTM";
      sqparams += "&logtype=" + logType;
      sqparams += "&logdesc=" + logDescription;
      sqparams += "&logsource=" + logSource;
      xmlmc.addParam("storedQuery", "query/wss/admin/admin.logging.insert");
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function (params) {
          deferred.resolve(params);
        },
        onFailure: function (error) {
          console.log(error);
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    self.sendToast = function (toastType, toastBody, toastTitle) {
      var toastObject = {
        type: toastType,
        body: toastBody
      };

      if (angular.isDefined(toastTitle) && toastTitle !== '') {
        toastObject.title = toastTitle;
      }
      toaster.pop(toastObject);
    };

    return self;
  }
})();
//# sourceMappingURL=wss.logging.service.js.map