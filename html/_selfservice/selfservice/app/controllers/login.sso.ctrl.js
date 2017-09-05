(function () {
	'use strict';

	angular.module('swSelfService').controller('LoginSSOController', LoginSSOController);

	LoginSSOController.$inject = ['$http', '$scope', '$rootScope', 'SWSessionService', '$state', 'store', 'RequestService', 'wssLogging', '$location'];

	function LoginSSOController($http, $scope, $rootScope, SWSessionService, $state, store, RequestService, wssLogging, $location) {
		//$scope.loggingIn allows the tracking of when a customer has clicked the Login button, to when the login process has finished.
		$scope.loggingIn = false;
		$scope.images = wssBranding.loginImage;
		$scope.sessServ = SWSessionService;
		$scope.loginFailed = false;

		if ($scope.sessServ.sspConfig.ssoEnabled === false) {
			$state.go('login');
		}

		$scope.login = function () {
			$http({
				url: $scope.sessServ.sspConfig.ssoAddress,
				method: 'POST',
				port: 80,
				headers: {
					"Cache-Control": 'no-cache',
					'Accept': 'text/json',
					"Accept-Language": 'en-GB',
					"Content-Type": 'text/xmlmc; charset=UTF-8'
				},
				params: {
					"wssinstance": $scope.sessServ.sspConfig.selfServiceInstance
				}
			}).then(function (quote) {

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

					//-- Display login screen
					$scope.loginFailed = true;
				} else {
					$scope.sessServ.username = quote.data.custid;
					$scope.sessServ.sessionId = quote.data.sessionId;
					$scope.sessServ.sessionConfig = quote.data;
					$scope.sessServ.bindSession($scope.sessServ.sessionId).then(function () {
						$scope.sessServ.getSelfServiceConfig($scope.sessServ.username).then(function () {
							$scope.sessServ.wssConfig = store.get("wssConfig");
							$scope.sessServ.getCustomerDetails(quote.data[1], $scope.sessServ.wssConfig.ac_id).then(function (custDetails) {
								//Get number of authorisations, stick it in rootScope
								RequestService.getAuthCount().then(function (response) {
									$scope.sessServ.numAuths = response;
									if ($rootScope.goToPath !== '/' && $rootScope.goToPath !== '/login' && $rootScope.goToPath !== '/loginsso' && $rootScope.goToPath !== '/loginmanual') {
										var newPath = $rootScope.goToPath;
										$rootScope.goToPath = '';
										$location.path(newPath);
									} else {
										$state.go('home');
									}
								}, function (error) {
									var toastType = "error";
									var toastBody = "There has been an error in retrieving your authorisations count.";
									var toastTitle = "Logon Error!";
									wssLogging.sendToast(toastType, toastBody, toastTitle);

									if ($rootScope.goToPath !== '/' && $rootScope.goToPath !== '/login' && $rootScope.goToPath !== '/loginsso' && $rootScope.goToPath !== '/loginmanual') {
										var newPath = $rootScope.goToPath;
										$rootScope.goToPath = '';
										$location.path(newPath);
									} else {
										$state.go('home');
									}
								});
							});
						});
					});
				}
			}, function (error) {
				//-- Authentication error. Possibly cancelled authentication.
				//-- console.log(error);

				var connErrorTitle = 'Authentication Error!';
				var connErrorType = "error";
				var connErrorBody = 'You are not authorized to access this system. Please contact your Service Desk to request access.';
				wssLogging.sendToast(connErrorType, connErrorBody, connErrorTitle);

				//-- Display login screen
				$scope.loginFailed = true;
			});
		};

		if ($scope.sessServ.ssoEnabled === true) {
			if ($scope.sessServ.previousLogin === false) {
				$scope.login();
			}
		}

		//Watch for logout broadcast to clean up session-specific data ready for a new user
		$scope.$on('logout', function () {
			//  SWSessionService = {};
		});
	}
})();
//# sourceMappingURL=login.sso.ctrl.js.map