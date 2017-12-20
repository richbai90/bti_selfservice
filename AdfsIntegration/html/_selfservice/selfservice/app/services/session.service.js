'use strict';

(function () {
  'use strict';

  angular.module('swSelfService').service('SWSessionService', SWSessionService);

  SWSessionService.$inject = ['$ngConfirm', '$timeout', '$q', 'XMLMCService', '$cookies', 'store', '$rootScope', '$state', 'wssHelpers', '$http', 'wssLogging', 'RequestService', '$window'];

  function SWSessionService($ngConfirm, $timeout, $q, XMLMCService, $cookies, store, $rootScope, $state, wssHelpers, $http, wssLogging, RequestService, $window) {
    var self = {
      'selfServiceConfig': {},
      'custDetails': [],
      'ssoEnabled': false,
      'normalLogoff': false,
      'sessionEnded': false,
      'sessionLoggedOff': false,
      'previousLogin': false,
      'ssoConfig': {}
    };

    self.keepAlive = function (strSessionId) {
      if (self.timeout) {
        $timeout.cancel(self.timeout);
      }
      self.timeout = $timeout(function () {
        $ngConfirm({
          title: 'Are you still there?',
          content: '<strong>Your session is about to end press okay if you wish to continue.</strong>',
          autoClose: 'cancel|120000',
          buttons: {
            okay: {
              text: 'Okay',
              btnClass: 'btn-info',
              action: function action() {
                self.bindSession(strSessionId);
              }
            },
            cancel: {
              text: 'Logout',
              btnClass: 'btn-success hidden',
              action: function action(scope, button) {
                self.logoff();
              }
            }
          }
        });
      }, 480000);
    };

    self.bindSession = function (strSessionID) {
      var deferred = $q.defer();
      var xmlmc = new XMLMCService.MethodCall();
      xmlmc.addParam("sessionId", strSessionID);
      xmlmc.invoke("session", "bindSession", {
        onSuccess: function onSuccess() {
          store.set("sessionConfig", self.sessionConfig);
          $cookies.put("swSessionID", strSessionID);
          self.sessionLoggedOff = false;
          deferred.resolve('');
        },
        onFailure: function onFailure(error, status) {
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    self.login = function (ks, password) {
      var deferred = $q.defer();
      var xmlmc = new XMLMCService.MethodCall();
      xmlmc.addParam("selfServiceInstance", self.selfServiceInstance);
      xmlmc.addParam("customerId", ks);
      xmlmc.addPasswordParam("password", password);
      xmlmc.invoke("session", "selfServiceLogon", {
        onSuccess: function onSuccess(params) {
          var oSessionConf = {};
          angular.forEach(params, function (oVal, oKey) {
            if (oKey !== 'sessionId') {
              oSessionConf[oKey] = oVal;
            }
          });
          store.set("sessionConfig", oSessionConf);
          if (params.sessionId) $cookies.put("swSessionID", params.sessionId);
          self.sessionLoggedOff = false;
          deferred.resolve(params);
          self.keepAlive(params.sessionId);
        },
        onFailure: function onFailure(error, status) {
          var connErrorBody = "";
          var connErrorTitle = "";
          var connErrorType = "error";
          var strErrorText = status.error;
          var intErrorCode = status.code;

          if (strErrorText == "Customer not registered.") {
            connErrorTitle = 'Authentication Error!';
            connErrorBody = '[' + ks + '] is not registered on this system. Please contact your Service Desk to request access.';
          } else if (strErrorText === "-106 Invalid customer credentials." || strErrorText === "Unable to login user.") {
            connErrorTitle = 'Authentication Error!';
            connErrorBody = 'The credentials you have provided are incorrect. Please try again.';
          } else if (strErrorText.indexOf("You do not have the rights to access this system") !== -1) {
            connErrorTitle = 'Authentication Error!';
            connErrorBody = 'You do not have access to this system. Please contact your Service Desk to request access.';
          } else if (strErrorText.indexOf("The maximum number of login attempts") !== -1) {
            connErrorTitle = 'Authentication Error!';
            connErrorBody = 'Your account has been locked due to the maximum number of failed login attempts being achieved. Please contact your Service Desk to have this lock removed.';
          } else if (strErrorText.indexOf("This account has been suspended") !== -1) {
            connErrorTitle = 'Authentication Error!';
            connErrorBody = 'Your account has been locked for a set period of time. Please try again later, or contact your Service Desk for further information.';
          } else if (strErrorText.indexOf("This account has been locked") !== -1) {
            connErrorTitle = 'Authentication Error!';
            connErrorBody = 'Your account has been locked. Please contact your Service Desk to have this lock removed.';
          } else {
            connErrorBody = "We've been unable to create your Supportworks session. Please try again, and if this fails then contact your Service Desk, quoting the following error: ";
            connErrorBody += "<br/><br/><strong>Error [" + intErrorCode + "]: " + strErrorText + "</strong>";
            connErrorTitle = 'Connection Error!';
          }
          wssLogging.sendToast(connErrorType, connErrorBody, connErrorTitle);
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    self.ssoLogin = function (quote, config) {

      self.ssoConfig = config;

      var deferred = $q.defer();
      if (angular.isDefined(quote)) {
        if (typeof quote === 'string') {
          try {
            quote = JSON.parse(atob(quote));
          } catch (e) {
            quote = {
              data: {
                error: 'Unable to parse saml response'
              }
            };
          }
        }
        if (!angular.isDefined(quote.data)) {
          quote = {
            data: quote
          };
        }
        if (angular.isDefined(quote.data.error)) {
          //-- Authentication error. Possibly anonymous logon, incorrect cutomer password or incorrect rights
          //-- console.log(quote.data.error);

          var connErrorBody = "";
          var connErrorTitle = 'Authentication Error!';
          var connErrorType = "error";
          var strErrorText = quote.data.error;

          if (strErrorText.indexOf("You do not have the rights") !== -1) {
            connErrorBody = 'You do not have access to this system. Please contact your Service Desk to request access.';
          } else if (strErrorText.indexOf("This account has been locked") !== -1) {
            connErrorBody = 'This account has been locked. Please contact the Service Desk for assistance.';
          } else {
            connErrorBody = 'You are not authorized to access this system. Please contact your Service Desk to request access.';
          }
          wssLogging.sendToast(connErrorType, connErrorBody, connErrorTitle);

          throw connErrorBody;
        } else {
          self.username = quote.data.custid;
          self.sessionId = quote.data.sessionId;
          self.sessionConfig = quote.data;
          self.bindSession(self.sessionId).then(function () {
            self.getSelfServiceConfig(self.username).then(function () {
              self.wssConfig = store.get("wssConfig");
              self.getCustomerDetails(quote.data[1], self.wssConfig.ac_id).then(function (custDetails) {
                //Get number of authorisations, stick it in rootScope
                RequestService.getAuthCount().then(function (response) {
                  self.numAuths = response;
                  if ($rootScope.goToPath !== '/' && $rootScope.goToPath !== '/login' && $rootScope.goToPath !== '/loginsso' && $rootScope.goToPath !== '/loginmanual' && $rootScope.goToPath.indexOf('/saml') === -1) {
                    var newPath = $rootScope.goToPath;
                    $rootScope.goToPath = '';
                    deferred.resolve(newPath);
                  } else {
                    deferred.resolve(true);
                  }
                }, function (error) {
                  var toastType = "error";
                  var toastBody = "There has been an error in retrieving your authorisations count.";
                  var toastTitle = "Logon Error!";
                  wssLogging.sendToast(toastType, toastBody, toastTitle);

                  if ($rootScope.goToPath !== '/' && $rootScope.goToPath !== '/login' && $rootScope.goToPath !== '/loginsso' && $rootScope.goToPath !== '/loginmanual' && $rootScope.goToPath.indexOf('/saml') === -1) {
                    var newPath = $rootScope.goToPath;
                    $rootScope.goToPath = '';
                    deferred.resolve(newPath);
                  } else {
                    deferred.resolve(true);
                  }
                }).catch(function (e) {
                  deferred.reject(e)
                });
              }).catch(function (e) {
                deferred.reject(e);
              });
            }).catch(function (e) {
              deferred.reject(e);
            });
          }).catch(function (e) {
            deferred.reject(e);
          });
        }
      }
      return deferred.promise;
    };

    self.logoff = function (samlReady) {
      $timeout.cancel(self.timeout);
      var deferred = $q.defer();
      if (angular.isDefined(self.ssoConfig.type) && self.ssoConfig.type === 'saml' && !samlReady) {
        $window.location.href = (self.ssoConfig.serverAddress +
        '/sw/selfservice/' + self.ssoConfig.ssoAddress + '?logoff=1&returnto=' +
        encodeURIComponent(self.ssoConfig.returnAddress))
          .replace(/(http:|https:)?\/\//g, function ($0, $1) {
            return $1 ? $0 : '/';
          });
        deferred.reject('samlLogoffFirst')
      } else {
        var xmlmc = new XMLMCService.MethodCall();
        xmlmc.invoke("session", "selfServiceLogoff", {
          onSuccess: function onSuccess(params) {
            //Remove cookies & localStorage
            self.normalLogoff = true;
            self.sessionEnded = false;
            self.sessionLoggedOff = true;
            self.removeSessionStorage();
            deferred.resolve(params);
          },
          onFailure: function onFailure(error) {
            self.sessionEnded = true;
            self.removeSessionStorage();
            deferred.reject(error);
          }
        });
      }
      return deferred.promise;
    };

    self.getCustomerDetails = function (ks, idFld) {
      self.custDetails = [];
      var deferred = $q.defer();
      var xmlmc = new XMLMCService.MethodCall();
      var sqparams = "ks=" + ks;
      sqparams += "&custidfld=" + idFld;
      xmlmc.addParam("storedQuery", "query/wss/get_customer_details.select");
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function onSuccess(params) {
          if (params.rowData) {
            self.custDetails = params.rowData.row;
            store.set("custDetails", self.custDetails);
            self.getCustomerOrgDetails(self.custDetails.fk_company_id);
            deferred.resolve(self.custDetails);
          } else {
            deferred.reject('Customer Details could not be returned.');
          }
        },
        onFailure: function onFailure(error) {
          wssLogging.logger(error, "ERROR", "SWSessionService::getCustomerDetails", false, false);
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    // self.getCustFaveServices = (ks, idFld) => {
    //   const deferred = $q.defer();
    //   const xmlmc = new XMLMCService.MethodCall();
    //   const sqparams = `ks=${ks}&custidfld=${idFld}`;
    //   xmlmc.addParam("storedQuery", "query/wss/get_customer_details.select");
    //   xmlmc.addParam("parameters", sqparams);
    //   xmlmc.invoke("data", "invokeStoredQuery", {
    //     onSuccess: params => {
    //       if(params.rowData) {
    //         self.custDetails.favorites = params.rowData.row;
    //       }
    //     }
    //   })
    // }

    self.getCustomerOrgDetails = function (org) {
      self.orgDetails = [];
      var xmlmc = new XMLMCService.MethodCall();
      xmlmc.addParam("table", "company");
      xmlmc.addParam("keyValue", org);
      xmlmc.invoke("data", "getRecord", {
        onSuccess: function onSuccess(params) {
          if (params.record) {
            self.orgDetails = params.record;
            store.set("orgDetails", params.record);
          }
        },
        onFailure: function onFailure(error) {
          wssLogging.logger(error, "ERROR", "SWSessionService::getCustomerOrgDetails", false, false);
        }
      });
    };

    self.getSelfServiceConfig = function (ks) {
      self.selfServiceConfig = {};
      var deferred = $q.defer();
      var xmlmc = new XMLMCService.MethodCall();
      var sqparams = "ks=" + ks;
      sqparams += "&ssid=" + self.sspConfig.selfServiceInstance;
      xmlmc.addParam("storedQuery", "query/wss/get_wss_config.select");
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function onSuccess(params) {
          if (params.rowData) {
            var intArrayLength = params.rowData.row.length;
            //obj is array
            for (var i = 0; i < intArrayLength; i++) {
              self.selfServiceConfig[params.rowData.row[i].name] = params.rowData.row[i].value;
            }
            store.set('wssConfig', self.selfServiceConfig);
            deferred.resolve(self.selfServiceConfig);
          } else {
            deferred.reject('SelfService Configuration could not be returned.');
          }
        },
        onFailure: function onFailure(error) {
          wssLogging.logger(error, "ERROR", "SWSessionService::getSelfServiceConfig", false, false);
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    self.checkActiveSession = function (sessionId) {
      var deferred = $q.defer();
      if (!$cookies.get('swSessionID')) {
        //Haven't got a cookie - a clean up and go to login
        self.sessionEnded = true;
        self.processSessionError();
      } else {
        var xmlmc = new XMLMCService.MethodCall();
        var swSessionID = $cookies.get('swSessionID');
        xmlmc.addParam("sessionId", swSessionID);
        xmlmc.invoke("session", "isSessionValid", {
          onSuccess: function onSuccess(params) {
            //We have a valid session
            self.keepAlive(swSessionID);
            deferred.resolve(true);
          },
          onFailure: function onFailure(error) {
            //We don't have an active session, clean up and go to login
            self.sessionEnded = true;
            self.processSessionError();
            deferred.reject(false);
          }
        });
      }
      return deferred.promise;
    };

    self.processSessionError = function () {
      if (self.timeout) {
        $timeout.cancel(self.timeout);
      }
      self.normalLogoff = false;
      wssLogging.sendToast('error', 'Your session appears to have expired. Please log on again.', 'Session Error!');
      self.previousLogin = true;
      //Remove session storage (local & cookies)
      self.removeSessionStorage();
    };

    self.removeSessionStorage = function () {
      //Broadcast a logout to all controllers/services to allow app data cleansing
      $rootScope.$broadcast('logout');
      $cookies.remove("swSessionID");
      $cookies.remove("ESPSessionState");
      var now = new Date(),
        exp = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      $cookies.put('ESPSessionState', '', {
        path: '/sw',
        expires: exp
      });

      wssHelpers.custDetails = [];
      wssHelpers.sessionDetails = [];
      self.numAuths = 0;
      self.custDetails = [];
      self.sspConfig = [];
      store.remove("sessionConfig");
      store.remove("custDetails");
      store.remove("orgDetails");
      store.remove("wssConfig");
      //Change state back to login
      $state.go('login');
    };

    self.getSSPSetup = function () {
      var deferred = $q.defer();
      self.sspConfig = [];
      //Get WSSP Config from server
      $http({
        url: 'config/retrieve_config.php',
        method: 'POST',
        port: 80,
        headers: {
          'Cache-Control': 'no-cache',
          'Accept': 'text/json',
          'Accept-Language': 'en-GB',
          'Content-Type': 'text/xmlmc; charset=UTF-8'
        }
      }).then(function (returnedConfig) {
        self.sspConfig = returnedConfig.data;
        XMLMCService.serverUrl = self.sspConfig.serverAddress;
        var oSSPConfig = {};
        angular.forEach(self.sspConfig, function (oVal, oKey) {
          oSSPConfig[oKey] = oVal;
        });
        store.set("instanceConfig", oSSPConfig);
        self.ssoEnabled = self.sspConfig.ssoEnabled;
        self.selfServiceInstance = self.sspConfig.selfServiceInstance;
        wssHelpers.setBranding();
        deferred.resolve(self.sspConfig);
      }, function (error) {
        deferred.reject(error);
      });
      return deferred.promise;
    };

    self.requestResetCustomerPassword = function (ks) {
      var deferred = $q.defer();
      var xmlmc = new XMLMCService.MethodCall();
      xmlmc.addParam("selfServiceId", self.selfServiceInstance);
      xmlmc.addParam("customerId", ks);
      xmlmc.invoke("selfservice", "requestPasswordReset", {
        onSuccess: function onSuccess(params) {
          var messageTitle = "Password Reset Request Done!";
          var messageBody = "Please check your email for your password reset link, and follow the instructions contained within.";
          wssLogging.sendToast("success", messageBody, messageTitle);
          deferred.resolve(params);
        },
        onFailure: function onFailure(error) {
          var connErrorType = "error";
          var connErrorBody = "An error has occurred during your password reset request. ";
          connErrorBody += "<br/>Please contact your system administrator.";
          var connErrorTitle = "Password Reset Request Error!";
          wssLogging.sendToast(connErrorType, connErrorBody, connErrorTitle);
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    self.resetCustomer_Password = function (si, ks, ti, pwd) {
      var encodedPwd = new XMLMCService.MethodCall().encodeBase64(pwd);
      $http({
        url: 'php/resetPassword.php',
        method: 'POST',
        port: 80,
        data: {
          selfserviceId: si,
          userId: ks,
          tokenId: ti,
          password: encodedPwd
          //password: pwd
        },
        headers: {
          'Cache-Control': 'no-cache',
          'Accept': 'text/json',
          'Accept-Language': 'en-GB',
          'Content-Type': 'text/xmlmc; charset=UTF-8'
        }
      }).then(function (goodResponse) {
        //XMLMC has not been done
        if (goodResponse.data == "invalid") {
          var connErrorType = "error";
          var connErrorTitle = "Password Reset Error!";
          var connErrorBody = "We've been unable to reset your selfservice password.";
          connErrorBody += "<br/>Please re-request your password reset.";
          wssLogging.sendToast(connErrorType, connErrorBody, connErrorTitle);
        }
        //XMLMC succes
        else {
          var messageTitle = "Reset password success!";
          var messageBody = "You can now log back in to SelfService.";
          wssLogging.sendToast(messageBody, messageTitle);
        }
      }, function (error) {
        var connErrorBody = "Please report this to your system administrator.";
        var connErrorTitle = "Password Reset Request Error!";
        var connErrorType = "error";
        wssLogging.sendToast(connErrorType, connErrorBody, connErrorTitle);
      });
    };

    return self;
  }
})();
//# sourceMappingURL=session.service.js.map